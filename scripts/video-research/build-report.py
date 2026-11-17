"""
Build docs/video-research/index.html from the researchers' notes.

  python -P scripts/video-research/build-report.py

Reads docs/video-research/notes/*.json (one per video, see process.py) and
docs/video-research/synthesis.json (what to apply), writes one self-contained
local HTML page that shows how many videos were analysed, the frames behind
every insight, and at the end what Wael Academy should apply.
"""
import glob
import html
import json
import os

ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "docs", "video-research")
ROOT = os.path.abspath(ROOT)
notes = []
for p in sorted(glob.glob(os.path.join(ROOT, "notes", "*.json"))):
    try:
        notes.append(json.load(open(p, encoding="utf-8")))
    except Exception as e:
        print("skip", p, e)
syn_path = os.path.join(ROOT, "synthesis.json")
syn = json.load(open(syn_path, encoding="utf-8")) if os.path.exists(syn_path) else None

TOPIC_ORDER = ["Onboarding & first minutes", "Game feel & game UI", "Motion & smooth transitions", "Simplicity & immersion"]
notes.sort(key=lambda n: (TOPIC_ORDER.index(n.get("topic")) if n.get("topic") in TOPIC_ORDER else 9, n.get("title", "")))

e = lambda s: html.escape(str(s or ""))


def mmss(s):
    s = int(s or 0)
    return f"{s // 60}:{s % 60:02d}"


def ts_url(n, t):
    u = n.get("url") or f"https://www.youtube.com/watch?v={n.get('id')}"
    return f"{u}{'&' if '?' in u else '?'}t={int(t or 0)}s"


videos = len(notes)
minutes = round(sum((n.get("duration_s") or 0) for n in notes) / 60)
insights = sum(len(n.get("insights", [])) for n in notes)
frames = sum(1 for n in notes for i in n.get("insights", []) if i.get("frame"))
topics = [t for t in TOPIC_ORDER if any(n.get("topic") == t for n in notes)] + sorted({n.get("topic") for n in notes} - set(TOPIC_ORDER) - {None})

cards = []
for k, n in enumerate(notes, 1):
    ins = []
    for i in n.get("insights", []):
        img = f'<a class="shot" href="{e(i.get("frame"))}" target="_blank"><img loading="lazy" src="{e(i.get("frame"))}" alt="{e(i.get("visual"))}"></a>' if i.get("frame") else ""
        extra = "".join(f'<img loading="lazy" class="mini" src="{e(f)}" alt="">' for f in i.get("frames2", []) or [])
        quote = f'<blockquote>“{e(i.get("quote"))}”</blockquote>' if i.get("quote") else ""
        ins.append(
            f'<li class="ins">{img}<div class="ins-body"><a class="time" href="{e(ts_url(n, i.get("t")))}" target="_blank" rel="noopener">▶ {e(i.get("time") or mmss(i.get("t")))}</a>'
            f'<p class="lesson">{e(i.get("insight"))}</p>{quote}<p class="visual">{e(i.get("visual"))}</p>{f"<div class=minis>{extra}</div>" if extra else ""}</div></li>'
        )
    apply = "".join(f"<li>{e(a)}</li>" for a in n.get("apply_to_wael", []))
    date = n.get("upload_date") or ""
    date = f"{date[6:8]}/{date[4:6]}/{date[:4]}" if len(date) == 8 else date
    cards.append(f"""
<article class="video" data-topic="{e(n.get('topic'))}" id="v-{e(n.get('id'))}">
  <header class="vhead">
    <span class="num">{k:02d}</span>
    <div class="vmeta">
      <span class="topic">{e(n.get('topic'))}</span>
      <h3><a href="{e(n.get('url'))}" target="_blank" rel="noopener">{e(n.get('title'))}</a></h3>
      <p class="by">{e(n.get('channel'))} · {mmss(n.get('duration_s'))} · {e(date)} · <b>{len(n.get('insights', []))}</b> moments</p>
    </div>
  </header>
  <p class="summary">{e(n.get('summary'))}</p>
  <ul class="insights">{''.join(ins)}</ul>
  {f'<div class="apply"><h4>For Wael Academy</h4><ul>{apply}</ul></div>' if apply else ''}
</article>""")

syn_html = ""
if syn:
    def block(items, cls):
        out = []
        for it in items:
            src = " ".join(f'<a href="#v-{e(s)}">#{e(s)}</a>' for s in it.get("sources", []))
            out.append(f'<li class="{cls}"><b>{e(it.get("title"))}</b><p>{e(it.get("detail"))}</p>{f"<span class=src>from {src}</span>" if src else ""}</li>')
        return "".join(out)
    syn_html = f"""
<section class="synthesis" id="apply">
  <h2>What to apply to Wael Academy</h2>
  <p class="lead">{e(syn.get('lead'))}</p>
  <h3>Principles</h3>
  <ol class="principles">{block(syn.get('principles', []), 'pr')}</ol>
  <h3>The flow, step by step</h3>
  <ol class="steps">{block(syn.get('flow', []), 'st')}</ol>
  <h3>Smooth transitions — the recipe</h3>
  <ul class="recipe">{block(syn.get('transitions', []), 'tr')}</ul>
  <h3>Avoid</h3>
  <ul class="avoid">{block(syn.get('avoid', []), 'av')}</ul>
</section>"""

chips = "".join(f'<button class="chip" data-f="{e(t)}">{e(t)} <span>{sum(1 for n in notes if n.get("topic") == t)}</span></button>' for t in topics)

page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Immersive UX from videos</title>
<style>
:root{{--bg:#f3f8f6;--panel:#fff;--ink:#172e5b;--ink2:#586989;--line:#dce7e4;--brand:#0491a5;--lime:#8aff6b;--limeEdge:#5bcd3f;--deep:#08434b;--shadow:0 1px 2px rgb(23 46 91/.06),0 8px 24px rgb(23 46 91/.06)}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#071a1d;--panel:#0d2a2f;--ink:#e8f3f1;--ink2:#9fb7b8;--line:#1d3e43;--brand:#4fc3d3;--deep:#031012;--shadow:none}}}}
:root[data-theme="dark"]{{--bg:#071a1d;--panel:#0d2a2f;--ink:#e8f3f1;--ink2:#9fb7b8;--line:#1d3e43;--brand:#4fc3d3;--deep:#031012;--shadow:none}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}}
a{{color:var(--brand)}}.wrap{{max-width:1180px;margin:0 auto;padding:0 16px 80px}}
.hero{{background:linear-gradient(135deg,#0491a5,#08434b);color:#fff;padding:48px 16px 40px;margin-bottom:28px}}
.hero .wrap{{padding-bottom:0}}.hero h1{{margin:0 0 8px;font-size:clamp(28px,4vw,44px);line-height:1.1}}.hero p{{max-width:70ch;opacity:.9;margin:0}}
.stats{{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}}.stat{{background:rgb(255 255 255/.12);border:1px solid rgb(255 255 255/.25);border-radius:16px;padding:12px 16px;min-width:130px}}
.stat b{{display:block;font-size:30px;line-height:1}}.stat span{{font-size:13px;opacity:.85}}
.howto{{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:16px 20px;box-shadow:var(--shadow);margin-bottom:20px;color:var(--ink2);font-size:14px}}
.chips{{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 24px}}.chip{{border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:999px;padding:8px 14px;font:inherit;font-size:14px;cursor:pointer}}
.chip span{{color:var(--ink2)}}.chip[aria-pressed="true"]{{background:var(--lime);border-color:var(--limeEdge);color:#172e5b}}
.video{{background:var(--panel);border:1px solid var(--line);border-radius:22px;padding:22px;margin-bottom:22px;box-shadow:var(--shadow)}}
.vhead{{display:flex;gap:16px;align-items:flex-start}}.num{{font-weight:800;font-size:22px;color:var(--brand);min-width:36px}}
.topic{{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--brand)}}
.video h3{{margin:2px 0 4px;font-size:20px;line-height:1.25}}.video h3 a{{color:var(--ink);text-decoration:none}}.video h3 a:hover{{text-decoration:underline}}
.by{{margin:0;color:var(--ink2);font-size:14px}}.summary{{margin:14px 0 18px;max-width:80ch}}
.insights{{list-style:none;margin:0;padding:0;display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}}
.ins{{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--bg);display:flex;flex-direction:column}}
.shot img{{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;background:#000}}.ins-body{{padding:12px 14px 14px}}
.time{{display:inline-block;font-size:12px;font-weight:700;text-decoration:none;background:var(--deep);color:#fff;border-radius:999px;padding:3px 10px}}
.lesson{{margin:8px 0 6px;font-weight:600}}blockquote{{margin:6px 0;padding-left:10px;border-left:3px solid var(--lime);color:var(--ink2);font-style:italic;font-size:14px}}
.visual{{margin:6px 0 0;color:var(--ink2);font-size:13px}}.minis{{display:flex;gap:6px;margin-top:8px}}.mini{{width:31%;border-radius:8px}}
.apply{{margin-top:18px;background:color-mix(in oklab,var(--lime) 18%,var(--panel));border:1px solid var(--limeEdge);border-radius:16px;padding:12px 18px}}
.apply h4{{margin:0 0 6px}}.apply ul{{margin:0;padding-left:20px}}
.synthesis{{margin-top:40px;background:var(--panel);border:2px solid var(--brand);border-radius:26px;padding:28px;box-shadow:var(--shadow)}}
.synthesis h2{{margin:0 0 8px;font-size:30px}}.synthesis h3{{margin:26px 0 10px;color:var(--brand)}}.lead{{font-size:18px;max-width:80ch}}
.synthesis li{{margin-bottom:12px}}.synthesis li p{{margin:4px 0;color:var(--ink2)}}.src{{font-size:12px;color:var(--ink2)}}
.avoid li b{{color:#c0392b}}
.toggle{{position:fixed;top:12px;right:12px;border:1px solid rgb(255 255 255/.4);background:rgb(0 0 0/.2);color:#fff;border-radius:999px;padding:6px 12px;cursor:pointer}}
@media (max-width:600px){{.video{{padding:16px}}.vhead{{gap:10px}}.insights{{grid-template-columns:1fr}}}}
</style></head>
<body>
<button class="toggle" onclick="var r=document.documentElement;r.dataset.theme=r.dataset.theme==='dark'?'light':'dark'">◐</button>
<section class="hero"><div class="wrap">
<h1>Immersive, effortless UX — what {videos} YouTube videos teach</h1>
<p>Each video was downloaded, transcribed locally (faster-whisper), and its captions scanned for the moments where the speaker talks about something on screen. The frames below are those moments; each card says what it teaches and how it applies to the Wael Academy game flow.</p>
<div class="stats">
<div class="stat"><b>{videos}</b><span>videos analysed</span></div>
<div class="stat"><b>{minutes}</b><span>minutes transcribed</span></div>
<div class="stat"><b>{insights}</b><span>insights</span></div>
<div class="stat"><b>{frames}</b><span>frames</span></div>
</div></div></section>
<main class="wrap">
<p class="howto">▶ The time badge opens the video at that moment. Click a frame to see it full size. Filter by topic below; the synthesis — what to apply — is at the end (<a href="#apply">jump</a>).</p>
<div class="chips"><button class="chip" data-f="" aria-pressed="true">All <span>{videos}</span></button>{chips}</div>
{''.join(cards) if cards else '<p>No notes yet.</p>'}
{syn_html}
</main>
<script>
document.querySelectorAll('.chip').forEach(function(b){{b.addEventListener('click',function(){{
  document.querySelectorAll('.chip').forEach(function(x){{x.setAttribute('aria-pressed',x===b)}});
  var f=b.dataset.f;document.querySelectorAll('.video').forEach(function(v){{v.style.display=!f||v.dataset.topic===f?'':'none'}});
}})}});
</script>
</body></html>"""
open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8").write(page)
print(f"index.html: {videos} videos, {minutes} min, {insights} insights, {frames} frames, synthesis={'yes' if syn else 'no'}")
