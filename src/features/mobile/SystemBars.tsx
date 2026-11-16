import type { DeviceSpec } from "./devices"

/**
 * What the phone draws OVER the app: the status bar (time, signal, Wi-Fi,
 * battery), the cut-out, and the home indicator or gesture handle. Painted on
 * top of the iframe and never catching the pointer — the app underneath is
 * laid out edge to edge and keeps clear of these through `--sai-*`.
 *
 * `dir="ltr"` on purpose: the system bar follows the DEVICE's language, and a
 * Tunisian phone is set to French far more often than not — time on the left,
 * indicators on the right, whatever the app inside is reading.
 */
export function SystemBars({ device, dark }: { device: DeviceSpec; dark: boolean }) {
  const ios = device.platform === "ios"
  const { cutout } = device
  // iOS fits its indicators in the "ears" beside the notch and centres them on
  // the notch, not on the 47 pt bar; Android centres them in the bar itself.
  const barHeight = ios && cutout.kind === "notch" ? cutout.h + 4 : device.insets.top

  return (
    <div
      dir="ltr"
      aria-hidden
      className="pointer-events-none absolute inset-0 select-none"
      style={{ color: dark ? "#ffffff" : ios ? "#000000" : "#0b1220" }}
    >
      <div
        className="absolute inset-x-0 top-0 flex items-center justify-between"
        style={{ height: barHeight, paddingInline: device.statusPadX }}
      >
        <span
          className="tabular-nums"
          style={
            ios
              ? { fontFamily: '-apple-system, "SF Pro Text", Inter, system-ui, sans-serif', fontSize: 17, fontWeight: 600, letterSpacing: -0.2 }
              : { fontFamily: '"One UI Sans", Roboto, system-ui, sans-serif', fontSize: 14, fontWeight: 500 }
          }
        >
          9:41
        </span>
        <span className="flex items-center" style={{ gap: ios ? 7 : 5 }}>
          {ios ? <Cellular /> : <Wifi size={15} />}
          {ios ? <Wifi size={17} /> : <Cellular />}
          <Battery wide={ios} />
        </span>
      </div>

      {cutout.kind === "notch" ? (
        <div
          className="device-notch"
          style={{ width: cutout.w, height: cutout.h, ["--d-notch-r" as string]: `${cutout.radius}px` }}
        >
          {/* Earpiece slit and the TrueDepth lens, as the real bezel shows them. */}
          <span className="absolute left-1/2 top-[9px] h-[5px] w-[56px] -translate-x-1/2 rounded-full bg-[#1b1c21]" />
          <span className="device-lens absolute right-[26px] top-[8px] size-[11px] rounded-full" />
        </div>
      ) : (
        <span className="device-hole" style={{ width: cutout.d, height: cutout.d, top: cutout.top }} />
      )}

      <span
        className="absolute left-1/2 -translate-x-1/2 rounded-full bg-current"
        style={{ width: device.homeBar.w, height: device.homeBar.h, bottom: device.homeBar.bottom, opacity: ios ? 1 : 0.85 }}
      />
    </div>
  )
}

/** Four bars, the way both platforms draw signal strength. */
function Cellular() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden>
      <rect x="0" y="8" width="3" height="4" rx="0.8" />
      <rect x="5" y="5.5" width="3" height="6.5" rx="0.8" />
      <rect x="10" y="3" width="3" height="9" rx="0.8" />
      <rect x="15" y="0" width="3" height="12" rx="0.8" />
    </svg>
  )
}

function Wifi({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
      <path d="M2.5 8.8a14.5 14.5 0 0 1 19 0" />
      <path d="M6 12.6a9.5 9.5 0 0 1 12 0" />
      <path d="M9.5 16.4a4.5 4.5 0 0 1 5 0" />
      <circle cx="12" cy="19.6" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** A rounded cell with its nub; filled to 86 % — a phone that has been used today. */
function Battery({ wide }: { wide: boolean }) {
  const w = wide ? 27 : 22
  const h = wide ? 13 : 11
  const inner = (w - 4) * 0.86
  return (
    <svg width={w + 3} height={h} viewBox={`0 0 ${w + 3} ${h}`} fill="none" aria-hidden>
      <rect x="0.75" y="0.75" width={w - 1.5} height={h - 1.5} rx={h / 3.4} stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" />
      <rect x="2.5" y="2.5" width={inner} height={h - 5} rx={h / 6} fill="currentColor" />
      <path d={`M${w + 0.5} ${h / 2 - 2} a1.6 1.6 0 0 1 0 4`} fill="currentColor" fillOpacity="0.45" />
    </svg>
  )
}
