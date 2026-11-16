import type { CSSProperties } from "react"
import type { Skin } from "@/app/platform"
import { deviceName, deviceSrc, outerSize, type DeviceSpec } from "./devices"
import { SystemBars } from "./SystemBars"

/**
 * One phone, with the app alive inside it.
 *
 * The body is laid out at its TRUE size (so the app's px are the phone's pt/dp)
 * and scaled as a whole with `transform`; the wrapper takes the scaled box so
 * the caption below lands where the eye expects. `dir="ltr"` on the wrapper
 * because a fixed-width box that overflows an RTL container hugs its RIGHT
 * edge, and the scale would then run off the wrong side.
 *
 * `reloadKey` remounts the iframe — the gallery's reload, and its theme switch
 * (the app reads the theme once, at boot).
 */
export function DeviceFrame({
  device,
  path,
  skin,
  scale,
  dark,
  reloadKey,
}: {
  device: DeviceSpec
  path: string
  skin: Skin
  scale: number
  dark: boolean
  reloadKey: number
}) {
  const { w, h } = outerSize(device)
  const vars = {
    "--dw": `${w}px`,
    "--dh": `${h}px`,
    "--dr": `${device.bodyRadius}px`,
    "--d-body": device.colors.glass,
    "--d-edge": device.colors.band,
    "--d-ring": `${device.band}px`,
    "--d-bezel-top": `${device.bezel.top}px`,
    "--d-bezel-side": `${device.bezel.side}px`,
    "--d-bezel-bottom": `${device.bezel.bottom}px`,
    "--d-screen-r": `${device.screen.radius}px`,
    transform: `scale(${scale})`,
    transformOrigin: "top left",
  } as CSSProperties

  return (
    <div dir="ltr" style={{ width: w * scale, height: h * scale }}>
      <div className="device" style={vars} data-device={device.id}>
        {device.island && <span className="device-island" style={{ top: device.island.top, height: device.island.h }} />}
        {device.keys.map((k, i) => (
          <span
            key={i}
            className="device-key"
            data-side={k.side}
            data-kind={k.kind}
            style={{ top: k.top, height: k.h }}
          />
        ))}
        <div className="device-screen">
          <iframe
            key={reloadKey}
            title={`${device.name} — أكاديمية وائل`}
            name={deviceName(device, skin)}
            src={deviceSrc(device, path, skin)}
            allow="autoplay; fullscreen; clipboard-write"
          />
          <SystemBars device={device} dark={dark} />
        </div>
      </div>
    </div>
  )
}
