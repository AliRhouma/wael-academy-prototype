"""
Fit a cut-out (transparent PNG from Scenario) onto the artist guide's template
canvas, so the map can place it by its anchor (village-art-guide.md, section 3).

  python -I scripts/town-art/fit.py <cutout.png> <out.png> building
  python -I scripts/town-art/fit.py <cutout.png> <out.png> prop <name>

Buildings (1536 x 2048, anchor 768, 1728): the plinth's left and right corners
are found as the widest extent of the lower part of the object; the plinth is
scaled so those corners span the template's tile diamond (1024 px) and its
front corner lands on the diamond's bottom point (anchor + 256). For a w x h
footprint the diamond's box is (w + h) wide either way, so this also places
rectangular plinths correctly (the map scales by w + h).

Props (1024 x 1024, anchor 512, 832): scaled to the size the code-drawn prop
has on the map (x16 for master pixels), base centred on the anchor.

Only scales down (guide section 2). Prints a warning when it would upscale or
when the art leaves the safe area.
"""
import sys
from PIL import Image

ALPHA_SOLID = 128

# prop name -> (measure, target master px, extra drop below the anchor as a share of the target)
#   measure: "h" = visible height, "w" = visible width
#   targets mirror the code-drawn props in Props.tsx (map px x 16)
PROPS = {
    "tree": ("h", 600, 0.02),
    "pine": ("h", 690, 0.02),
    "bush": ("w", 380, 0.12),
    "flowers": ("w", 400, 0.16),
    "rocks": ("w", 430, 0.14),
    "lamp": ("h", 560, 0.01),
    "bench": ("w", 380, 0.14),
    "parasol": ("h", 560, 0.03),
    # the fountain covers 2 x 2 tiles and is drawn at 1/8, its basin 92 map px wide
    "fountain": ("w", 736, 0.25),
}


def solid_box(im):
    a = im.getchannel("A").point(lambda v: 255 if v >= ALPHA_SOLID else 0)
    return a, a.getbbox()


def row_extents(mask, y0, y1):
    """min left / max right of solid pixels over rows y0..y1."""
    w = mask.width
    px = mask.load()
    left, right = w, -1
    for y in range(y0, y1):
        for x in range(w):
            if px[x, y]:
                left = min(left, x)
                break
        for x in range(w - 1, -1, -1):
            if px[x, y]:
                right = max(right, x)
                break
    return left, right


def place(im, scale, canvas_w, canvas_h, src_x, src_y, dst_x, dst_y):
    """Scale `im` and paste it so source point (src_x, src_y) lands on (dst_x, dst_y)."""
    if scale > 1.0001:
        print(f"  WARN would upscale x{scale:.2f} - regenerate at a higher resolution")
    sw, sh = round(im.width * scale), round(im.height * scale)
    scaled = im.resize((sw, sh), Image.LANCZOS)
    ox = round(dst_x - src_x * scale)
    oy = round(dst_y - src_y * scale)
    out = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    # plain copy onto the empty canvas: pasting with itself as mask would multiply colour by alpha twice (dark edges)
    out.paste(scaled, (ox, oy))
    return out


def fit_building(im):
    mask, box = solid_box(im)
    l, t, r, b = box
    lower = t + int((b - t) * 0.45)
    left, right = row_extents(mask, lower, b)
    width = right - left + 1
    scale = 1024 / width
    cx = (left + right + 1) / 2
    out = place(im, scale, 1536, 2048, cx, b, 768, 1728 + 256)
    _, ob = solid_box(out)
    if ob[1] < 64:
        print(f"  WARN top at {ob[1]} px, above the safe area (64)")
    print(f"  plinth {width}px -> 1024, scale {scale:.3f}, box {ob}")
    return out


def fit_prop(im, name):
    measure, target, drop = PROPS[name]
    mask, box = solid_box(im)
    l, t, r, b = box
    size = (b - t) if measure == "h" else (r - l)
    scale = target / size
    # base centre: middle of the bottom 6% of rows (a trunk, a post), else the box centre
    foot0 = b - max(2, int((b - t) * 0.06))
    fl, fr = row_extents(mask, foot0, b)
    cx = (fl + fr + 1) / 2 if measure == "h" else (l + r) / 2
    out = place(im, scale, 1024, 1024, cx, b, 512, 832 + target * drop)
    _, ob = solid_box(out)
    if ob[1] < 32 or ob[3] > 992 or ob[0] < 32 or ob[2] > 992:
        print(f"  WARN leaves the safe area: {ob}")
    print(f"  {measure}={size}px -> {target}, scale {scale:.3f}, box {ob}")
    return out


if __name__ == "__main__":
    src, dst, kind = sys.argv[1], sys.argv[2], sys.argv[3]
    im = Image.open(src).convert("RGBA")
    out = fit_building(im) if kind == "building" else fit_prop(im, sys.argv[4])
    out.save(dst, optimize=True)
