import lockup from "../../../svg icons/wael-logo-draw.svg"
import lockupH from "../../../svg icons/wael-logo-draw-h.svg"

/**
 * The Wael Academy emblem — the two interlocking loops from the delivered
 * lockup (`svg icons/wael-logo-draw.svg`), on its own.
 *
 * WHY A DERIVED MARK AND NOT THE DELIVERED FILE: the lockup is emblem +
 * "Wael Academy" + the Arabic tagline on a 1471x1096 canvas. At the 36px the
 * shell's brand chip gives it, the wordmark is a smudge and the tagline is a
 * grey line. The mark that survives that size is the emblem, so it is lifted
 * out here — ONE path, copied byte for byte out of the file, with the viewBox
 * tightened to its measured bounding box (`385.4 0 702.3 496.3`, read off
 * `getBBox()` in a browser rather than guessed). Nothing was redrawn.
 *
 * It fills with `currentColor` instead of the delivered white, so one mark
 * serves the gradient chip (white), a plain light surface (ink) and any
 * palette. The delivered file keeps its own white fills and its draw-on
 * animation, and is still what renders wherever the FULL lockup belongs — see
 * `WaelLockup` below.
 *
 * To regenerate after a redelivery: copy the `.p.emblem` path's `d` and
 * re-read its bbox. Don't hand-edit the coordinates.
 */
export function WaelEmblem({ className }: { className?: string }) {
  return (
    <svg
      viewBox="385.4 0 702.3 496.3"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M917.116 390.615C930.541 380.16 944.671 369.75 956.911 357.72C967.246 347.58 981.406 326.475 992.146 319.56C997.861 315.885 1005.45 316.11 1008.78 313.155C1012.56 309.81 1024.55 288.855 1027.68 283.125C1057.59 228.435 1074.44 159.42 1036.4 104.13C1027.94 91.845 1010.22 74.88 996.346 69.345C982.441 63.795 982.741 72.285 974.086 78.465C934.831 106.5 885.451 57.66 913.981 18.375C931.351 -5.55 965.626 -6.405 983.416 17.535C987.286 22.74 989.671 32.295 992.971 35.31C996.271 38.325 1007.52 41.625 1012.58 44.49C1118.24 104.46 1096.88 226.995 1043 315.69C1040.28 320.16 1034.42 325.245 1032.86 330.015C1031.18 335.175 1032.41 338.67 1031.63 343.185C1028.45 361.53 977.191 407.835 961.246 421.035C934.186 443.445 893.011 473.04 861.736 488.46C854.116 492.21 841.666 498.585 833.521 495.435C823.891 491.7 800.026 477.255 790.066 471.255C777.046 463.41 757.216 450.27 745.441 441.06C742.471 438.735 741.451 434.835 738.871 434.55L732.436 435.48C706.696 453.285 677.251 477.015 648.961 490.155C626.896 500.4 617.956 491.67 598.996 480.99C569.986 464.64 538.621 442.89 512.926 421.71C498.946 410.175 444.916 360.735 441.961 345.885C440.986 340.965 442.291 336.195 440.971 331.05C439.531 325.5 428.326 312.015 424.651 305.64C379.741 227.64 360.436 124.065 438.091 59.19C449.911 49.32 475.681 40.29 482.041 34.065C485.341 30.825 486.721 24.165 489.406 19.845C505.141 -5.55 544.066 -6.45 560.881 18.39C586.651 56.445 544.336 103.275 503.971 81.045C487.801 72.135 494.896 59.55 472.351 71.865C418.036 101.535 407.191 165.945 420.781 221.76C425.821 242.46 447.781 295.08 462.466 309.585C468.676 315.72 477.316 314.895 484.111 321.045C493.936 329.955 504.886 346.35 515.011 356.355C537.571 378.645 570.421 403.86 597.226 420.93C604.276 425.415 621.106 436.86 627.736 439.365C629.656 440.085 631.291 440.985 633.436 440.235L693.631 402.45C698.851 395.415 689.566 393.03 686.281 389.46C679.186 381.765 653.731 355.29 652.126 347.355C650.731 340.425 652.546 336.465 649.186 328.71C646.471 322.44 641.341 318.81 638.251 313.74C593.656 240.645 570.616 137.895 636.676 69.24C654.091 51.135 682.096 43.41 695.581 27.405C699.751 22.455 702.736 14.82 707.236 10.275C722.101 -4.73999 752.641 -2.31 766.711 12.66C772.381 18.69 775.831 31.38 780.586 34.77C783.676 36.96 788.311 37.425 791.941 39.255C893.626 90.405 896.296 197.985 847.801 290.385C841.936 301.56 825.736 321.9 822.766 331.545C821.086 337.035 822.301 340.995 821.326 345.93C818.431 360.45 776.956 395.475 777.301 399.51C790.096 411.255 805.471 419.28 820.081 428.385C826.171 432.18 833.326 441.03 842.416 440.445C845.491 440.25 860.821 430.545 864.706 428.145C883.066 416.79 900.361 403.74 917.146 390.66L917.116 390.615ZM814.891 285.495C845.686 231.735 865.246 161.355 827.086 104.73C818.716 92.31 790.846 66.585 775.891 65.1C772.051 64.725 765.106 75.72 760.201 79.035C747.586 87.57 730.756 89.19 717.001 82.41C710.536 79.215 700.816 66.93 697.036 66.3C685.786 64.425 659.116 88.56 651.736 97.215C602.311 155.16 628.516 247.86 667.846 304.215C676.216 316.215 681.106 312.42 689.926 318.105C701.731 325.71 716.896 350.7 730.171 361.32C732.226 362.955 734.536 365.655 737.446 365.58C739.921 365.505 753.931 350.73 756.871 347.655C763.816 340.38 774.601 324.63 782.011 319.545C786.646 316.365 789.436 317.265 793.846 315.555C803.011 312.015 809.836 294.315 814.891 285.495Z" />
    </svg>
  )
}

/**
 * The FULL lockup, exactly as delivered: emblem, wordmark and the Arabic
 * tagline "في قرايتك.. خطوة بخطوة", with the file's own draw-on animation
 * intact — it draws each stroke then fills, settling in about four seconds,
 * and the file carries its own `prefers-reduced-motion` branch so it simply
 * appears finished for anyone who asked for less motion.
 *
 * Rendered as an <img>, like every other delivered drawing in this app: the
 * file carries a `<style>` block whose class names (`.p`, `.word`, `.script`)
 * are unscoped, so inlining it would leak those rules into the document and
 * repaint anything else that happened to use them.
 *
 * It is WHITE ART with no theme awareness — give it a dark or gradient ground.
 */
export function WaelLockup({ className }: { className?: string }) {
  return <img src={lockup} alt="Wael Academy" draggable={false} className={className} />
}

/**
 * The same lockup laid out HORIZONTALLY — the arrangement every brand uses in a
 * bar: the mark, then the wordmark with the tagline tucked under it.
 *
 * Why a generated file and not three components composed in TSX: the three
 * pieces have to keep the proportions and the vertical rhythm they were drawn
 * with, and the delivered draw-on animation has to stay in sync across them. A
 * flex row would put all of that at the mercy of whatever gap and max-width
 * each caller happens to pass. So `scripts/make-h-lockup.mjs` regroups the
 * SAME paths under three `<g transform>` wrappers — nothing is redrawn, the
 * `.p` animation rides along untouched — and callers get one image with one
 * aspect ratio (~4.79:1) to size.
 *
 * The mark sits on the RIGHT: the app is `dir="rtl"`, so that's the start edge.
 *
 * Like `WaelLockup` it is WHITE ART with no theme awareness — give it a dark or
 * gradient ground. Rerun the generator after any redelivery of the source file;
 * don't hand-edit the transforms.
 */
export function WaelLockupH({ className }: { className?: string }) {
  return <img src={lockupH} alt="Wael Academy" draggable={false} className={className} />
}
