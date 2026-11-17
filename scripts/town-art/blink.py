"""
Make a character's web pose and its blink patch from three Scenario outputs
(village-art-guide.md section 6: the eye layer only changes pixels around the eyes).

  python scripts/town-art/blink.py <base_raw.png> <blink_raw.png> <cutout.png> <out_pose.webp> <out_blink.webp>

  base_raw   the pose on its flat background (eyes open)
  blink_raw  the same image edited to "eyes closed" (same size, same framing)
  cutout     the base with its background removed (Photoroom), same size

Both outputs go on ONE shared web canvas for every pose (512 x 768, half the
guide's 1024 x 1536 presenter canvas): the figure is scaled to the same body
height (BODY px, feet to head - keep hands below the head in every pose) and
its feet centre lands on the anchor (256, 744). Every pose is therefore drawn
in the same box and a swap never jumps; the patch sits exactly on its pose. The patch is the blink's eye area only (found from the
difference between the two images, aligned by a small shift search), feathered,
and transparent everywhere else; the toggle test is then: only the eyes change.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

base_p, blink_p, cut_p, out_pose, out_blink = sys.argv[1:6]
CANVAS_W, CANVAS_H, ANCHOR_X, ANCHOR_Y, BODY = 512, 768, 256, 744, 690

base = np.asarray(Image.open(base_p).convert("RGB"), dtype=np.float32)
blink_img = Image.open(blink_p).convert("RGB")
cut = Image.open(cut_p).convert("RGBA")
assert base.shape[:2] == (cut.height, cut.width) == (blink_img.height, blink_img.width), "sizes differ"

alpha = np.asarray(cut.getchannel("A"))
ys, xs = np.nonzero(alpha > 128)
top, bottom = ys.min(), ys.max()
# the eyes are in the top quarter of the figure
y0, y1 = top, top + int((bottom - top) * 0.25)

blink = np.asarray(blink_img, dtype=np.float32)
d = np.abs(base - blink).mean(2)
zone = d[y0:y1] * (alpha[y0:y1] > 128)
mask = zone > 28
if mask.sum() < 50:
    sys.exit("no eye difference found - is the blink image really eyes-closed?")
my, mx = np.nonzero(mask)
# keep the cluster around the strongest change (the eyes), not stray noise on hands or edges
w8 = zone[my, mx] ** 2
cy, cx = (my * w8).sum() / w8.sum(), (mx * w8).sum() / w8.sum()
for r in (220, 160):
    keep = (my - cy) ** 2 + (mx - cx) ** 2 < r * r
    my, mx = my[keep], mx[keep]
    w8 = zone[my, mx] ** 2
    cy, cx = (my * w8).sum() / w8.sum(), (mx * w8).sum() / w8.sum()
pad = 24
ry0, ry1 = y0 + my.min() - pad, y0 + my.max() + pad
rx0, rx1 = mx.min() - pad, mx.max() + pad
print(f"eye box x {rx0}-{rx1} y {ry0}-{ry1}")

# small shift search: align the blink to the base around the eyes (ring outside the box)
best, shift = None, (0, 0)
ring = np.zeros_like(d, dtype=bool)
ring[ry0 - 30:ry1 + 30, rx0 - 30:rx1 + 30] = True
ring[ry0:ry1, rx0:rx1] = False
for dy in range(-6, 7):
    for dx in range(-6, 7):
        sb = np.roll(np.roll(blink, dy, 0), dx, 1)
        err = np.abs(base - sb).mean(2)[ring].mean()
        if best is None or err < best:
            best, shift = err, (dy, dx)
print(f"shift {shift}, ring error {best:.2f}")
blink = np.roll(np.roll(blink, shift[0], 0), shift[1], 1)

# the mask follows what actually changed (the lids), not the whole box: a
# rectangle carries the blink render's slightly different skin tone onto the
# forehead and shows as a pale patch. Changed pixels, grown and feathered.
d2 = np.abs(base - blink).mean(2)
changed = np.zeros_like(d2, dtype=np.uint8)
box = d2[ry0:ry1, rx0:rx1] > 14
changed[ry0:ry1, rx0:rx1] = box * 255
m = Image.fromarray(changed, "L").filter(ImageFilter.MaxFilter(15)).filter(ImageFilter.MaxFilter(9))
m = m.filter(ImageFilter.GaussianBlur(5))

# match exposure: the edit often comes back a touch brighter or warmer. Measure the
# per-channel offset on skin around the lids (inside the feathered edge, outside the
# changed pixels) and take it out of the blink, so the feather blends to nothing.
mk = np.asarray(m, dtype=np.float32) / 255
ring_px = (mk > 0.05) & (mk < 0.9) & (d2 < 14)
if ring_px.sum() > 200:
    off = (blink[ring_px] - base[ring_px]).mean(0)
    blink = (blink - off).clip(0, 255)
    print(f"exposure offset {np.round(off, 1)}")
patch_a = (np.asarray(m, dtype=np.float32) / 255) * (alpha.astype(np.float32) / 255)
patch = np.dstack([blink, patch_a * 255]).clip(0, 255).astype(np.uint8)
patch_img = Image.fromarray(patch, "RGBA")

# body height and feet centre, on the solid alpha
solid = alpha > 128
fy = np.nonzero(solid.any(1))[0]
ftop, fbot = fy.min(), fy.max()
feet = solid[fbot - max(2, int((fbot - ftop) * 0.04)) : fbot + 1]
fx = np.nonzero(feet.any(0))[0]
feet_cx = (fx.min() + fx.max()) / 2
k = BODY / (fbot - ftop)
if k > 1:
    print(f"WARN upscaling x{k:.2f}")

def web(im):
    sc = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    out = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    ox, oy = round(ANCHOR_X - feet_cx * k), round(ANCHOR_Y - fbot * k)
    out.paste(sc, (ox, oy))  # plain copy: pasting with itself as mask multiplies colour by alpha twice (dark edges)
    return out

pose_web = web(cut)
b = pose_web.getbbox()
if b[0] <= 0 or b[2] >= CANVAS_W or b[1] <= 0:
    print(f"WARN the figure touches the canvas edge: {b}")
pose_web.save(out_pose, quality=88, method=6)
web(patch_img).save(out_blink, lossless=True, exact=True, method=6)  # lossy WebP drops the colour under transparent pixels and the feather goes dark
print("pose + blink on", (CANVAS_W, CANVAS_H), "box", b)
