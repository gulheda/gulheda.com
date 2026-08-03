import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
// three.js is the heaviest dependency and is only needed for the
// decorative background, so App.jsx loads <Atmosphere> with React.lazy.
// That dynamic import already puts three into its own chunk — the page's
// text and layout paint without waiting for the renderer to download.
export default defineConfig({
  plugins: [react()],
});
