"""
One YouTube video -> local transcript + frames at the moments the speaker talks
about something visual. Used by the UX video research (docs/video-research/).

  python -P scripts/video-research/process.py <youtube_url> <work_dir>

work_dir (outside the repo, e.g. the scratchpad) receives:
  video.mp4            the video, 480p max (downloaded with yt-dlp)
  info.json            title, channel, duration, upload date
  audio.wav            16 kHz mono for the transcriber
  transcript.json      [{start, end, text}] - transcribed LOCALLY with faster-whisper
  transcript.txt       "[mm:ss] text" lines, easy to read
  cues.json            candidate visual moments [{t, text, frame}]
  frames/t0123.jpg     one frame per candidate moment (640 px wide)
  contact.jpg          all candidate frames on one sheet with their timestamps

Visual moments = segments whose words point at the screen ("look", "see",
"here", "this screen", "animation", "button", "transition"...) plus one frame a
minute as a safety net. The analyst then picks the frames that really show the
point being made.
"""
import json
import os
import re
import subprocess
import sys

URL, WORK = sys.argv[1], sys.argv[2]
MAX_MIN = 45
os.makedirs(os.path.join(WORK, "frames"), exist_ok=True)


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


def mmss(t):
    return f"{int(t // 60):02d}:{int(t % 60):02d}"


# 1. info + video ------------------------------------------------------------
info_path = os.path.join(WORK, "info.json")
if not os.path.exists(info_path):
    out = run([sys.executable, "-m", "yt_dlp", "--no-playlist", "--dump-json", URL]).stdout
    info = json.loads(out)
    keep = {k: info.get(k) for k in ("id", "title", "channel", "uploader", "duration", "upload_date", "webpage_url", "view_count", "language")}
    json.dump(keep, open(info_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
info = json.load(open(info_path, encoding="utf-8"))
if (info.get("duration") or 0) > MAX_MIN * 60:
    sys.exit(f"too long: {info['duration'] // 60} min > {MAX_MIN}")
print("video:", info["title"], "|", info.get("channel"), "|", mmss(info.get("duration") or 0))

video = os.path.join(WORK, "video.mp4")
if not os.path.exists(video):
    run([
        sys.executable, "-m", "yt_dlp", "--no-playlist",
        "-f", "bv*[height<=480][ext=mp4]+ba[ext=m4a]/b[height<=480][ext=mp4]/b[height<=480]/b",
        "--merge-output-format", "mp4", "-o", video, URL,
    ])

# 2. audio -------------------------------------------------------------------
audio = os.path.join(WORK, "audio.wav")
if not os.path.exists(audio):
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", video, "-vn", "-ac", "1", "-ar", "16000", audio])

# 3. local transcription -----------------------------------------------------
tj = os.path.join(WORK, "transcript.json")
if not os.path.exists(tj):
    # the GPU needs NVIDIA's cuBLAS / cuDNN DLLs (pip wheels nvidia-cublas-cu12, nvidia-cudnn-cu12)
    try:
        import nvidia.cublas, nvidia.cudnn  # noqa: E401

        for mod in (nvidia.cublas, nvidia.cudnn):
            b = os.path.join(list(mod.__path__)[0], "bin")
            if os.path.isdir(b):
                os.add_dll_directory(b)
                os.environ["PATH"] = b + os.pathsep + os.environ["PATH"]
    except Exception:
        pass
    from faster_whisper import WhisperModel

    try:
        model = WhisperModel("small", device="cuda", compute_type="int8_float16")
        segs, meta = model.transcribe(audio, vad_filter=True, beam_size=1)
        segs = list(segs)
    except Exception as e:  # no GPU libraries / out of memory -> CPU, same (cached) model
        print("cuda failed, CPU:", str(e)[:120])
        model = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=4)
        segs, meta = model.transcribe(audio, vad_filter=True, beam_size=1)
        segs = list(segs)
    data = [{"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip()} for s in segs]
    json.dump(data, open(tj, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    with open(os.path.join(WORK, "transcript.txt"), "w", encoding="utf-8") as f:
        for s in data:
            f.write(f"[{mmss(s['start'])}] {s['text']}\n")
    print("language:", meta.language, "segments:", len(data))
data = json.load(open(tj, encoding="utf-8"))

# 4. visual cues -------------------------------------------------------------
VISUAL = re.compile(
    r"\b(look|looks|see|seeing|here|this screen|on screen|notice|watch|shows?|showing|example|button|animation|animate|transition|"
    r"fade|slide|zoom|color|colour|layout|icon|character|mascot|illustration|progress|bar|card|screen|onboarding|tap|swipe|"
    r"moves?|motion|bounce|feedback|reward|confetti|sound|highlight|arrow|before|after)\b",
    re.I,
)
dur = info.get("duration") or (data[-1]["end"] if data else 0)
cand = []
for s in data:
    hits = VISUAL.findall(s["text"])
    if len(hits) >= 1:
        cand.append((s["start"] + min(1.5, (s["end"] - s["start"]) / 2), s["text"], len(hits)))
# keep the strongest, spread out (at least 12 s apart)
cand.sort(key=lambda c: -c[2])
picked = []
for t, text, n in cand:
    if all(abs(t - p[0]) > 12 for p in picked):
        picked.append((t, text))
    if len(picked) >= 28:
        break
# one frame a minute as a safety net
for m in range(30, int(dur), 60):
    if all(abs(m - p[0]) > 20 for p in picked):
        picked.append((float(m), "(sample)"))
picked.sort()

cues = []
for t, text in picked:
    name = f"t{int(t):04d}.jpg"
    path = os.path.join(WORK, "frames", name)
    if not os.path.exists(path):
        try:
            run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{t:.2f}", "-i", video, "-frames:v", "1", "-vf", "scale=640:-2", "-q:v", "4", path])
        except subprocess.CalledProcessError:
            continue
    cues.append({"t": round(t, 1), "time": mmss(t), "text": text, "frame": f"frames/{name}"})
json.dump(cues, open(os.path.join(WORK, "cues.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# 5. contact sheet -----------------------------------------------------------
from PIL import Image, ImageDraw

thumbs = []
for c in cues:
    p = os.path.join(WORK, c["frame"])
    if os.path.exists(p):
        im = Image.open(p).convert("RGB")
        im.thumbnail((320, 180))
        thumbs.append((c["time"], im))
cols = 6
rows = (len(thumbs) + cols - 1) // cols or 1
sheet = Image.new("RGB", (cols * 324, rows * 200), "white")
d = ImageDraw.Draw(sheet)
for i, (tm, im) in enumerate(thumbs):
    x, y = (i % cols) * 324, (i // cols) * 200
    sheet.paste(im, (x + 2, y + 2))
    d.rectangle([x + 2, y + 2, x + 58, y + 18], fill="black")
    d.text((x + 6, y + 4), tm, fill="white")
sheet.save(os.path.join(WORK, "contact.jpg"), quality=80)
print(f"cues: {len(cues)} frames -> {os.path.join(WORK, 'contact.jpg')}")
