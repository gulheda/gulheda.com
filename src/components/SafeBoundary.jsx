import { Component } from "react";

/* The WebGL atmosphere is decoration. If it ever throws — a shader that
   won't compile, a browser without WebGL, a driver quirk — the visitor
   should still get the whole portfolio, just without the background.
   Without this, one error in that layer blanked the entire page. */

export default class SafeBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) {
      console.error("[SafeBoundary] decorative layer failed:", error);
    }
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
