import type { Platform, Skin } from "@/app/platform"

/**
 * The two phones of the mobile gallery, in CSS px (= iOS pt = Android dp).
 *
 * Geometry is derived from the published hardware — Apple's own dimensional
 * drawing for the iPhone, Samsung's panel and body figures for the Galaxy —
 * at the screen's px/mm, with the uncertain Galaxy numbers marked in
 * docs/mobile/device-specs.md. Nothing here is decoration: the frame has to
 * be the right size for the app inside it to be the right size, which is the
 * whole point of looking at it on a phone.
 *
 * `insets` are the system bars the app must keep clear of (status bar above,
 * home indicator / gesture bar below); they are handed to the iframe as
 * `--sai-top/--sai-bottom` (src/app/platform.ts) and drawn over it by
 * `<SystemBars>`.
 */

export interface DeviceKey {
  side: "left" | "right"
  /** Offset from the body's top edge and the key's length, in px. */
  top: number
  h: number
  /** The mute switch is shorter and thicker than a volume key. */
  kind?: "switch"
}

export interface DeviceSpec {
  id: "iphone-13-pro-max" | "galaxy-a55"
  name: string
  os: string
  platform: Exclude<Platform, "web">
  /** The display, logical px. */
  screen: { w: number; h: number; radius: number }
  /** Housing edge → active display: the metal band plus the black glass border. */
  bezel: { top: number; side: number; bottom: number }
  /** How much of that bezel is the metal band seen edge-on. */
  band: number
  bodyRadius: number
  insets: { top: number; bottom: number }
  cutout:
    | { kind: "notch"; w: number; h: number; radius: number }
    | { kind: "hole"; d: number; top: number }
  /** The status bar's side padding and the home/gesture bar's size. */
  statusPadX: number
  homeBar: { w: number; h: number; bottom: number }
  keys: DeviceKey[]
  /** The raised strip Samsung mounts its keys on (Galaxy A55 « Key Island »). */
  island?: { top: number; h: number }
  /** `glass` is the front — black on every finish; `band` the metal round it. */
  colors: { glass: string; band: string }
}

/**
 * iPhone 13 Pro Max — 6.7″, 428 × 926 pt @3x (2778 × 1284), 160.84 × 78.07 mm.
 * From Apple's drawing: the active area is 153.90 × 71.13 mm, so 1 mm = 6.02 pt
 * and the 3.47 mm bezel is 21 pt all round (body ≈ 470 × 968 pt); 1.05 mm of
 * that is the stainless band. Display corners 53.33 pt; the 13-series notch is
 * 26.93 × 5.60 mm = 162 × 34 pt with 23 pt bottom corners. Status bar 47 pt,
 * home-indicator area 34 pt (bar ≈ 148 × 5, 8 pt up). Keys, centre / length
 * from the top: ring switch 194 / 35, volume 274 / 70 and 352 / 70 (left),
 * side button 316 / 109 (right). Finish: Silver — black glass, bright band.
 */
export const IPHONE_13_PRO_MAX: DeviceSpec = {
  id: "iphone-13-pro-max",
  name: "iPhone 13 Pro Max",
  os: "iOS",
  platform: "ios",
  screen: { w: 428, h: 926, radius: 53 },
  bezel: { top: 21, side: 21, bottom: 21 },
  band: 6,
  bodyRadius: 78,
  insets: { top: 47, bottom: 34 },
  cutout: { kind: "notch", w: 162, h: 34, radius: 23 },
  statusPadX: 30,
  homeBar: { w: 148, h: 5, bottom: 8 },
  keys: [
    { side: "left", top: 177, h: 35, kind: "switch" },
    { side: "left", top: 239, h: 70 },
    { side: "left", top: 317, h: 70 },
    { side: "right", top: 262, h: 109 },
  ],
  colors: {
    glass: "#0b0b0f",
    band: "linear-gradient(160deg, #f1f1f4 0%, #a3a3ab 28%, #e6e6ea 52%, #7a7a83 78%, #d2d2d8 100%)",
  },
}

/**
 * Samsung Galaxy A55 5G — 6.6″ 1080 × 2340 (19.5:9), 161.1 × 77.4 × 8.2 mm.
 * Samsung ships the A5x at 450 dpi, so Chrome lays it out at 2.8125 dp/px:
 * a 384 × 832 dp viewport (DeviceAtlas, browser-measured — the 412 × 892 the
 * aggregator sites quote is the "Screen zoom" one step down). Active area
 * 70.3 × 152.4 mm → 1 mm = 5.46 dp: side bezels 3.5 mm ≈ 19, top 3.6 ≈ 20,
 * the thicker 5.1 mm chin ≈ 28 (body ≈ 422 × 880). Display corners ≈ 22 dp;
 * centred Infinity-O hole ≈ 21 dp with its centre 18 dp down. One UI's status
 * bar clears the hole at ≈ 36 dp; gesture navigation keeps 24 dp below (handle
 * ≈ 160 × 3). Keys stand on the raised « Key Island » on the right: volume
 * rocker centre 48 mm / 22 long, power 70 mm / 11. Finish: Awesome Iceblue —
 * black glass, pale-blue aluminium.
 */
export const GALAXY_A55: DeviceSpec = {
  id: "galaxy-a55",
  name: "Galaxy A55 5G",
  os: "Android · One UI",
  platform: "android",
  screen: { w: 384, h: 832, radius: 22 },
  bezel: { top: 20, side: 19, bottom: 28 },
  band: 5,
  bodyRadius: 41,
  insets: { top: 36, bottom: 24 },
  cutout: { kind: "hole", d: 21, top: 8 },
  statusPadX: 18,
  homeBar: { w: 160, h: 3, bottom: 8 },
  keys: [
    { side: "right", top: 202, h: 120 },
    { side: "right", top: 352, h: 60 },
  ],
  island: { top: 186, h: 240 },
  colors: {
    glass: "#0b0d12",
    band: "linear-gradient(160deg, #e9f3fb 0%, #b8cee0 32%, #dbe9f4 58%, #9db5c9 84%, #cfe3f5 100%)",
  },
}

export const DEVICES: DeviceSpec[] = [IPHONE_13_PRO_MAX, GALAXY_A55]

/** The body's outer box, px. */
export function outerSize(d: DeviceSpec): { w: number; h: number } {
  return { w: d.screen.w + 2 * d.bezel.side, h: d.screen.h + d.bezel.top + d.bezel.bottom }
}

/** The iframe URL for a device: the path, plus the platform, its bars and the skin. */
export function deviceSrc(d: DeviceSpec, path: string, skin: Skin = "play"): string {
  const join = path.includes("?") ? "&" : "?"
  return `${path}${join}platform=${d.platform}&insets=${d.insets.top},${d.insets.bottom}&skin=${skin}`
}

/** The frame's `name` — how the platform survives navigation inside it (src/app/platform.ts). */
export function deviceName(d: DeviceSpec, skin: Skin = "play"): string {
  return `wael-device:platform=${d.platform};skin=${skin};top=${d.insets.top};bottom=${d.insets.bottom}`
}
