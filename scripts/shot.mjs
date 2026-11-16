// Screenshot (and measure) a page of the running app in headless Chrome, with
// no dependencies — the DevTools protocol over Node's own WebSocket.
//
//   npm run shot -- <url> [width] [height] [out.png] [js-expression] [waitMs]
//
//   npm run shot -- http://localhost:5173/mobile 1440 900 shot.png
//   npm run shot -- "http://localhost:5173/student-v2?platform=ios&insets=47,34" 428 926 ios.png
//   npm run shot -- http://localhost:5173/mobile 420 900 narrow.png \
//     "document.documentElement.scrollWidth"
//
// The viewport is set through device-metrics emulation, so `width × height`
// are CSS px whatever the monitor's scale factor (plain `--screenshot` with
// `--window-size` is NOT — on a 125 % display it renders a narrower page).
// The expression, if given, is evaluated in the page after `waitMs` and its
// JSON result printed — handy for checking layout (scrollWidth, a rect…).
import { spawn } from "node:child_process"
import { existsSync, writeFileSync } from "node:fs"

const [url, w = "1440", h = "900", out = "shot.png", expr = "null", waitMs = "2500"] = process.argv.slice(2)
if (!url) {
  console.error("usage: npm run shot -- <url> [width] [height] [out.png] [js-expression] [waitMs]")
  process.exit(2)
}

const CANDIDATES = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean)
const CHROME = CANDIDATES.find((p) => existsSync(p))
if (!CHROME) {
  console.error("No Chrome/Edge found — set CHROME=<path to the executable>.")
  process.exit(2)
}

const port = 9300 + Math.floor(Math.random() * 500)
const chrome = spawn(
  CHROME,
  ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", `--remote-debugging-port=${port}`, `--window-size=${w},${h}`, "about:blank"],
  { stdio: "ignore" },
)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function firstPage() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json()
      const page = list.find((t) => t.type === "page")
      if (page) return page
    } catch {
      /* not up yet */
    }
    await sleep(150)
  }
  throw new Error("Chrome did not start")
}

try {
  const page = await firstPage()
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((r) => (ws.onopen = r))
  let id = 0
  const pending = new Map()
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m)
      pending.delete(m.id)
    }
  }
  const send = (method, params = {}) =>
    new Promise((r) => {
      const i = ++id
      pending.set(i, r)
      ws.send(JSON.stringify({ id: i, method, params }))
    })

  await send("Page.enable")
  await send("Runtime.enable")
  await send("Emulation.setDeviceMetricsOverride", { width: +w, height: +h, deviceScaleFactor: 1, mobile: false })
  // SHOT_STORAGE='{"wael-theme":"dark"}' seeds localStorage before the real
  // load — each run is a fresh profile, so a theme saved by an expression
  // would otherwise only apply to a page that has already rendered.
  if (process.env.SHOT_STORAGE) {
    await send("Page.navigate", { url })
    await sleep(800)
    await send("Runtime.evaluate", {
      expression: `Object.entries(${process.env.SHOT_STORAGE}).forEach(([k, v]) => localStorage.setItem(k, v))`,
    })
  }
  await send("Page.navigate", { url })
  await sleep(+waitMs)
  if (expr !== "null") {
    // Await first, stringify after — a promise-valued expression (a click
    // followed by a `new Promise(r => setTimeout(r, 400))`) is otherwise
    // serialised as `{}` before it settles.
    const res = await send("Runtime.evaluate", {
      expression: `(async () => JSON.stringify(await (${expr})))()`,
      returnByValue: true,
      awaitPromise: true,
    })
    console.log(res.result?.result?.value ?? JSON.stringify(res.result))
  }
  const shot = await send("Page.captureScreenshot", { format: "png" })
  if (!shot.result) {
    // A navigation inside the expression (location.reload(), a link) tears
    // the context down; say so rather than dying on `undefined`.
    console.error("screenshot failed:", JSON.stringify(shot.error ?? shot))
    ws.close()
    process.exitCode = 1
  } else {
    writeFileSync(out, Buffer.from(shot.result.data, "base64"))
    console.log("wrote", out)
    ws.close()
  }
} finally {
  chrome.kill()
}
process.exit(0)
