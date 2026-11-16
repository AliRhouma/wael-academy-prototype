import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import "./styles/index.css"
import { installDevice } from "./app/platform"
import { Providers } from "./app/providers"
import { router } from "./app/router"

// Which phone (if any) we are on, before anything is drawn: `data-platform`,
// `data-skin` and the system-bar insets go on <html> and the CSS reads them.
installDevice()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
)
