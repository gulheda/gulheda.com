import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Fonts (self-hosted via @fontsource — no external requests)
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/cormorant/400.css";
import "@fontsource/cormorant/500.css";
import "@fontsource-variable/jost";

import "./index.css";
import App from "./App.jsx";

/* A refresh must always open on the hero. Browsers otherwise restore
   the previous scroll offset, which dropped visitors into the middle
   of the page instead of the front door. */
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.addEventListener("load", () => {
  if (!window.location.hash) window.scrollTo(0, 0);
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
