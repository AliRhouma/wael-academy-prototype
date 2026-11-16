"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { Dialog as SheetPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500",
          // "right"/"left" are read as inline-END / inline-START so they mirror
          // under dir="rtl": the end sheet sits on the visual left and slides in
          // from there. (tw-animate-css slide-* keyframes are physical-only.)
          side === "right" &&
            "inset-y-0 end-0 h-full w-3/4 border-s data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
          side === "left" &&
            "inset-y-0 start-0 h-full w-3/4 border-e data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
          side === "top" &&
            "inset-x-0 top-0 h-auto border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
          side === "bottom" &&
            "inset-x-0 bottom-0 h-auto border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          // 44 × 44 hit area around the 16 px glyph (it was the glyph alone,
          // 16 × 16); the spoken name is Arabic, like the space around it.
          <SheetPrimitive.Close
            data-uisfx="close"
            className="absolute top-2 end-2 grid size-11 place-items-center rounded-full opacity-70 ring-offset-background transition hover:bg-current/5 hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
          >
            <XIcon className="size-4" />
            <span className="sr-only">سكّر</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

/**
 * The pull handle of a bottom sheet. One element, platform-sized by CSS:
 * iOS draws a 36 × 5 grabber, Material a 32 × 4 drag handle
 * (src/styles/platform/*.css); on the web it is the kit's own 48 × 6.
 */
function SheetGrabber({ className, ...props }: React.ComponentProps<"span">) {
  return (
    // The handle is also how a sheet is pulled away: a 44 pt-tall band the
    // finger can catch, the sheet following it down, closing past 90 px —
    // through Escape, which the dialog already answers. Short of that it
    // springs back. The visible bar inside stays platform-sized (ios/android.css).
    <span
      aria-hidden
      onPointerDown={startSheetDrag}
      className="-mx-4 -mt-4 mb-0 flex h-11 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
    >
      <span
        data-slot="sheet-grabber"
        className={cn("block h-1.5 w-12 rounded-full bg-current opacity-15", className)}
        {...props}
      />
    </span>
  )
}

function startSheetDrag(e: React.PointerEvent<HTMLElement>) {
  const sheet = e.currentTarget.closest<HTMLElement>("[data-slot='sheet-content']")
  if (!sheet) return
  const startY = e.clientY
  let dy = 0
  sheet.style.transition = "none"
  const move = (ev: PointerEvent) => {
    dy = Math.max(0, ev.clientY - startY)
    sheet.style.transform = `translateY(${dy}px)`
  }
  const end = () => {
    window.removeEventListener("pointermove", move)
    window.removeEventListener("pointerup", end)
    window.removeEventListener("pointercancel", end)
    sheet.style.transition = "transform 250ms cubic-bezier(.2,.8,.2,1)"
    if (dy > 90) {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
    } else {
      sheet.style.transform = ""
    }
  }
  window.addEventListener("pointermove", move)
  window.addEventListener("pointerup", end)
  window.addEventListener("pointercancel", end)
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetGrabber,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
