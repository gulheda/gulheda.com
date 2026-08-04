import { useEffect, useRef } from "react";
import * as THREE from "three";

/* =====================================================================
   ATMOSPHERE — the entire cinematic layer in one WebGL canvas.

   Layer 1 (fullscreen shader): golden-hour dusk grade, multi-octave
   volumetric fog, animated god-rays from an off-screen sun, marble
   "threshold" light that opens during the contact section, cinematic
   vignette + film grain. If a FLUX backplate exists in /assets it is
   blended underneath and the synthetic scene yields to it.

   Layer 2 (GPU particles): wind-blown rose petals with tumbling
   rotation and depth-of-field fade, plus additive gold dust motes.

   No figurative vector drawing anywhere — mood is carried by light.
   ===================================================================== */

const BG_CANDIDATES = [
  "/assets/backgrounds/BG_01_MistyGarden.webp",
  "/assets/BG_01_MistyGarden.webp",
  "/assets/backgrounds/BG_12_SunsetGarden.webp",
];

/* ------------------------------------------------ fullscreen shaders */

const QUAD_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const ATMOS_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform float uTime;
  uniform float uScroll;      // 0..1 across the whole page
  uniform float uGate;        // 0..1 threshold opening (contact section)
  uniform vec2  uRes;
  uniform vec2  uMouse;       // smoothed pointer, 0..1
  uniform float uHero;        // 1 while the hero fills the view → 0 after
  uniform float uIntro;       // page-load bloom: light opens 0 → 1
  uniform float uSec;         // 0..1 — petal-light behind the inner sections
  uniform float uHasBg;
  uniform sampler2D tBg;

  /* ---- noise ---- */
  float hash(vec2 p){
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  float fbm(vec2 p){
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++){
      v += a * vnoise(p);
      p = p * 2.03 + vec2(17.0, 9.2);
      a *= 0.5;
    }
    return v;
  }



  void main(){
    float aspect = uRes.x / uRes.y;
    vec2 uv = vUv;
    vec2 p  = vec2(uv.x * aspect, uv.y);          // aspect-true space

    /* sun sits upper-centre, drifting with scroll and leaning toward the pointer */
    vec2 mo = uMouse - 0.5;
    vec2 sun = vec2((0.5 + mo.x * 0.05) * aspect,
                    0.72 - uScroll * 0.10 + mo.y * 0.04);
    float dSun = distance(p, sun);

    /* ================= SOFT CLOUD ATMOSPHERE =====================
       A warm, slowly-breathing cloudscape built from domain-warped
       fbm — the same technique used for painted skies and marbled
       endpapers. It gives the page real tonal range (deep mauve in
       the folds, champagne in the light) instead of a flat wash. */
    float ct = uTime * 0.010;

    /* two rounds of domain warping: this is what turns noise into
       something that reads as billowing cloud rather than static fuzz */
    vec2 cp = p * 1.15 + vec2(ct * 0.7, -ct * 0.25);
    vec2 q = vec2(fbm(cp), fbm(cp + vec2(5.2, 1.3)));
    vec2 r2 = vec2(fbm(cp + 3.4 * q + vec2(1.7, 9.2) + ct * 0.5),
                   fbm(cp + 3.4 * q + vec2(8.3, 2.8) - ct * 0.4));
    float f = fbm(cp + 3.1 * r2);
    f = clamp(f * 1.32 - 0.13, 0.0, 1.0);

    /* a second, larger and slower layer for depth behind the first */
    float fBig = fbm(p * 0.55 + vec2(-ct * 0.35, ct * 0.18) + 41.0);

    /* the palette: deep mauve-brown → dusty rose → champagne → ivory */
    /* deep night — the darkness of the opening aperture, carried
       across the whole page. Warm, never flat black. */
    /* night blue with wine-dark folds — "gece mavisi, bordomsu" */
    vec3 cDeep  = vec3(0.008, 0.009, 0.018);
    vec3 cRose  = vec3(0.052, 0.016, 0.032);
    vec3 cChamp = vec3(0.030, 0.034, 0.064);
    vec3 cIvory = vec3(0.055, 0.062, 0.108);

    vec3 col = mix(cDeep, cRose, smoothstep(0.00, 0.44, f));
    col = mix(col, cChamp, smoothstep(0.38, 0.74, f));
    col = mix(col, cIvory, smoothstep(0.70, 1.00, f));
    /* the slow layer lifts and deepens broad regions */
    col = mix(col, cChamp, smoothstep(0.45, 0.95, fBig) * 0.30);
    col = mix(col, cDeep, smoothstep(0.42, 0.02, fBig) * 0.22);

    /* light scatters through the cloud toward the source */
    vec3 keyLight = vec3(0.40, 0.44, 0.64);
    col += keyLight * exp(-dSun * 1.4) * 0.26;
    /* air thins upward */
    col += vec3(0.013, 0.015, 0.028) * smoothstep(0.45, 1.0, uv.y);

    /* a luminous clearing in the middle: guarantees the type always
       has calm, bright ground beneath it */
    vec2 mid2 = vec2(0.5 * aspect, 0.52);
    float clearing = exp(-pow(distance(p, mid2) * 1.30, 2.2));
    col += vec3(0.032, 0.036, 0.060) * clearing;

    /* optional FLUX backplate underneath the atmosphere */
    if (uHasBg > 0.5) {
      vec2 buv = uv;
      buv.y = 1.0 - buv.y;
      buv = (buv - 0.5) * (1.0 + uScroll * 0.06) + 0.5;   // slow push-in
      vec3 plate = texture2D(tBg, buv).rgb;
      col = mix(col, plate, 0.92);
    }

    vec3 sunWarm = vec3(0.86, 0.87, 0.90);
    vec3 shade   = vec3(0.013, 0.014, 0.028);  // the deep fold of the night

    /* ------------------ sunlight pooling at the source ------------- */
    float halo = exp(-dSun * dSun * 2.6);
    col += vec3(0.082, 0.090, 0.138) * halo * 0.55;

    /* -------- god rays raking through the cloud ------------------- */
    vec2 dir = p - sun;
    float ang = atan(dir.y, dir.x);
    float rayN =
        vnoise(vec2(ang * 7.0 + uTime * 0.012,  uTime * 0.035)) * 0.65
      + vnoise(vec2(ang * 17.0 - uTime * 0.008, uTime * 0.02 + 5.0)) * 0.35;
    float rays = smoothstep(0.5, 0.95, rayN);
    rays *= exp(-dSun * 1.5);
    rays *= smoothstep(0.9, 0.2, uv.y) + 0.35;
    col += vec3(0.078, 0.085, 0.130) * rays * 0.6;

    /* pointer parallax on the cloud: a wisp layer that trails the mouse */
    vec2 fmo = mo * 0.09;
    float wisp = fbm((p + fmo * 2.4) * 2.6
                     + vec2(uTime * 0.024, -uTime * 0.014) + 71.0);
    col += vec3(0.022, 0.025, 0.044) * smoothstep(0.58, 0.98, wisp);
    col = mix(col, shade, smoothstep(0.40, 0.04, wisp) * 0.35);

    /* ------ section bloom: every inner section is lit by the same
       petal-shaped light as the hero and the threshold — a luminous
       centre with softly shaded corners. */
    if (uSec > 0.001) {
      vec2 sc = vec2((0.5 + mo.x * 0.04) * aspect, 0.5 + mo.y * 0.03);
      float sd = distance(p, sc);
      float sang = atan(p.y - sc.y, p.x - sc.x);
      float slobe = pow(abs(cos(sang * 4.5 + uTime * 0.018)), 0.6);
      float sn = fbm(p * 2.4 + uTime * 0.02) * 0.12;
      float sR = 0.30 + 0.16 * slobe;
      float sglow = smoothstep(sR + 0.40, sR - 0.28, sd + sn);
      /* a warm pool of light where the section sits */
      col += vec3(0.078, 0.030, 0.050) * sglow * uSec;
      /* the surround sinks further into the dark */
      col = mix(col, shade, (1.0 - sglow) * 0.30 * uSec);
      /* the gold rim */
      float srim = smoothstep(sR + 0.11, sR, sd + sn)
                 * (1.0 - smoothstep(sR - 0.17, sR, sd + sn));
      col += vec3(0.16, 0.075, 0.105) * srim * 0.4 * uSec;
    }

    /* -------- threshold: the light opens fully at the journey's end - */
    if (uGate > 0.001) {
      vec2 c = vec2(0.5 * aspect, 0.5);
      float d = distance(p, c);
      float edgeN = fbm(p * 3.0 + uTime * 0.05) * 0.16;
      float angG = atan(p.y - c.y, p.x - c.x);
      float lobeG = pow(abs(cos(angG * 4.5 + uTime * 0.02
                                + (1.0 - uGate) * 1.2)), 0.55);
      float radius = uGate * uGate * 1.9 * (0.74 + 0.26 * lobeG);
      float aperture = smoothstep(radius, radius - 0.32, d + edgeN);

      float vein = fbm(p * 6.0 + 13.0);
      vec3 marble = mix(vec3(0.985, 0.987, 0.992), vec3(0.905, 0.910, 0.922),
                        smoothstep(0.35, 0.75, vein));
      marble = mix(marble, vec3(0.995, 0.997, 1.0),
                   exp(-distance(p, c + vec2(0.0, 0.28)) * 1.8) * 0.5);

      float rim = smoothstep(radius + 0.05, radius, d + edgeN)
                * smoothstep(radius - 0.22, radius, d + edgeN);
      col = mix(col, marble, aperture);
      col = mix(col, vec3(0.82, 0.83, 0.86), rim * 0.38 * (1.0 - aperture * 0.6));
    }

    /* ------ ARRIVAL — the site opens out of darkness on load, then
       stays in the light. The same petal-scalloped aperture, used once. */
    if (uIntro < 0.999) {
      vec2 hc = vec2(0.5 * aspect, 0.5);
      float hd = distance(p, hc);
      float angH = atan(p.y - hc.y, p.x - hc.x);
      float edgeN = fbm(p * 3.0 + uTime * 0.04) * 0.15;
      float lobe = pow(abs(cos(angH * 4.5 + (1.0 - uIntro) * 1.3
                             + uTime * 0.02)), 0.55);
      float radius = uIntro * uIntro * 1.9 * (0.74 + 0.26 * lobe);
      float aperture = smoothstep(radius, radius - 0.34, hd + edgeN);

      vec3 night = vec3(0.010, 0.011, 0.020);
      col = mix(night, col, aperture);
      /* gold burning along the parting edge */
      float rim = smoothstep(radius + 0.05, radius, hd + edgeN)
                * smoothstep(radius - 0.22, radius, hd + edgeN);
      col = mix(col, vec3(0.88, 0.89, 0.92), rim * 0.5);
    }

    /* ------------------- cinematic finishing ---------------------- */
    /* keep highlights off pure white so nothing clips */
    col = min(col, vec3(0.995));
    /* gentle warm grade */
    col = pow(col, vec3(1.01, 1.0, 0.985));
    /* vignette — softly shaded corners, a printed-page feel */
    vec2 vd = uv - 0.5;
    float vig = dot(vd, vd) * (0.60 - uGate * 0.30);
    col = mix(col, shade, clamp(vig, 0.0, 1.0) * 0.85);
    /* film grain */
    float grain = hash(uv * uRes + fract(uTime) * 43.0) - 0.5;
    col += grain * 0.020;

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* --------------------------------------------------- petal shaders */

const PETAL_VERT = /* glsl */ `
  attribute float aSeed;
  attribute float aDepth;      // 0 far .. 1 near
  varying float vAngle;
  varying float vTumble;
  varying float vFade;
  varying float vSeed;
  varying float vDepth;
  uniform float uTime;
  uniform float uScale;        // px scale factor for point size
  uniform vec2  uMouse;

  float h(float n){ return fract(sin(n) * 43758.5453); }

  void main(){
    float seed = aSeed;
    vSeed = seed;

    float speed  = mix(0.16, 0.42, h(seed * 3.1));
    float spanY  = 13.0;
    float fall   = mod(seed * 7.3 + uTime * speed, spanY);
    float y      =  6.5 - fall;

    float swayA  = mix(0.4, 1.4, h(seed * 5.7));
    float x      = (h(seed * 2.3) - 0.5) * 19.0
                 + sin(uTime * mix(0.2, 0.5, h(seed)) + seed * 6.28) * swayA;

    float z      = mix(-4.0, 3.5, aDepth);

    /* the pointer stirs the air — nearby petals ease away, the near
       layer more than the far one */
    vec2 mw = vec2((uMouse.x - 0.5) * 18.0, (uMouse.y - 0.5) * 11.0);
    vec2 away = vec2(x, y) - mw;
    float ad = length(away);
    float push = smoothstep(3.2, 0.0, ad) * mix(0.3, 1.0, aDepth);
    if (ad > 0.001) {
      vec2 dirA = away / ad;
      x += dirA.x * push * 1.5;
      y += dirA.y * push * 1.5;
    }

    vAngle  = uTime * mix(-0.9, 0.9, h(seed * 9.4)) + seed * 6.28;
    vTumble = cos(uTime * mix(0.5, 1.3, h(seed * 4.2)) + seed * 3.0);
    vDepth  = aDepth;
    /* fade near the very bottom & respawn top */
    vFade   = smoothstep(-6.5, -5.2, y) * smoothstep(6.6, 5.8, y);

    vec4 mv = modelViewMatrix * vec4(x, y, z, 1.0);
    float size = mix(10.0, 30.0, h(seed * 8.8)) * mix(0.6, 1.25, aDepth);
    gl_PointSize = size * (uScale / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const PETAL_FRAG = /* glsl */ `
  precision highp float;
  varying float vAngle;
  varying float vTumble;
  varying float vFade;
  varying float vSeed;
  varying float vDepth;
  uniform sampler2D tPetal;

  void main(){
    vec2 uv = gl_PointCoord - 0.5;
    float c = cos(vAngle), s = sin(vAngle);
    uv = mat2(c, -s, s, c) * uv;
    /* tumbling: squash across one axis like a turning petal */
    float squash = mix(0.28, 1.0, abs(vTumble));
    uv.x /= squash;
    if (abs(uv.x) > 0.5 || abs(uv.y) > 0.5) discard;

    /* depth of field: petals off the focal plane blur via mip bias
       (clamped — deep mips average the whole texture into a square) */
    float blurB = min(abs(vDepth - 0.62) * 6.0, 2.4);
    vec4 tex = texture2D(tPetal, uv + 0.5, blurB);

    /* subtle per-petal tint variation */
    float tintShift = fract(vSeed * 13.7);
    vec3 tint = mix(vec3(1.0, 0.92, 0.92), vec3(0.88, 0.80, 0.86), tintShift);
    /* darker when edge-on, catching less light */
    float lightFace = mix(0.55, 1.0, abs(vTumble));

    float a = tex.a * vFade * 0.9 * mix(1.0, 0.55, min(blurB / 4.0, 1.0));
    if (a < 0.01) discard;
    gl_FragColor = vec4(tex.rgb * tint * lightFace, a);
  }
`;

const DUST_VERT = /* glsl */ `
  attribute float aSeed;
  varying float vTw;
  uniform float uTime;
  uniform float uScale;
  float h(float n){ return fract(sin(n) * 43758.5453); }
  void main(){
    float seed = aSeed;
    float rise = mod(seed * 11.0 + uTime * mix(0.02, 0.09, h(seed * 2.0)), 12.0);
    float y = -6.0 + rise;
    float x = (h(seed * 3.7) - 0.5) * 20.0
            + sin(uTime * 0.15 + seed * 9.0) * 0.8;
    float z = mix(-3.0, 3.0, h(seed * 6.1));
    vTw = 0.5 + 0.5 * sin(uTime * mix(0.6, 2.2, h(seed * 7.7)) + seed * 20.0);
    vec4 mv = modelViewMatrix * vec4(x, y, z, 1.0);
    gl_PointSize = mix(2.0, 7.0, h(seed * 5.5)) * (uScale / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const DUST_FRAG = /* glsl */ `
  precision highp float;
  varying float vTw;
  void main(){
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float a = smoothstep(0.5, 0.0, d);
    /* motes must read as warm specks ON daylight, so they are drawn
       normally in a deeper gold rather than added as glow */
    a = a * a * vTw * 0.42;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vec3(0.56, 0.60, 0.74), a);
  }
`;


/* --- code glyphs drifting among the gold dust: the engineer's mark.
       0 1 { } < > / * — quiet, golden, computed fireflies. --- */

const GLYPH_VERT = /* glsl */ `
  attribute float aSeed;
  varying float vTw;
  varying vec2 vCell;
  uniform float uTime;
  uniform float uScale;
  float h(float n){ return fract(sin(n) * 43758.5453); }
  void main(){
    float seed = aSeed;
    float rise = mod(seed * 9.1 + uTime * mix(0.025, 0.07, h(seed * 2.2)), 13.0);
    float y = -6.5 + rise;
    float x = (h(seed * 3.3) - 0.5) * 20.0
            + sin(uTime * 0.12 + seed * 7.0) * 0.5;
    float z = mix(-2.5, 2.0, h(seed * 6.3));
    vTw = 0.5 + 0.5 * sin(uTime * mix(0.4, 1.2, h(seed * 7.9)) + seed * 15.0);
    float cellIdx = floor(h(seed * 4.7) * 8.0);
    vCell = vec2(mod(cellIdx, 4.0), floor(cellIdx / 4.0));
    vec4 mv = modelViewMatrix * vec4(x, y, z, 1.0);
    gl_PointSize = mix(10.0, 17.0, h(seed * 5.1)) * (uScale / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const GLYPH_FRAG = /* glsl */ `
  precision highp float;
  varying float vTw;
  varying vec2 vCell;
  uniform sampler2D tGlyph;
  void main(){
    vec2 uv = (vCell + gl_PointCoord) * vec2(0.25, 0.5);
    vec4 tex = texture2D(tGlyph, uv);
    float a = tex.a * (0.25 + vTw * 0.5) * 0.40;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vec3(0.50, 0.54, 0.70), a);
  }
`;

function makeGlyphTexture() {
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 128;
  const ctx = cv.getContext("2d");
  ctx.clearRect(0, 0, 256, 128);
  const glyphs = ["0", "1", "{", "}", "<", ">", "/", "*"];
  ctx.font = '700 42px Consolas, "Cascadia Mono", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(210, 212, 218, 0.85)";
  ctx.shadowBlur = 7;
  ctx.fillStyle = "#dfe1e6";
  glyphs.forEach((g, i) => {
    const cx = (i % 4) * 64 + 32;
    const cy = Math.floor(i / 4) * 64 + 32;
    ctx.fillText(g, cx, cy);
  });
  const tex = new THREE.CanvasTexture(cv);
  tex.flipY = false;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* -------------------------------------------- procedural petal sprite */

function makePetalTexture() {
  const S = 128;
  const cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const ctx = cv.getContext("2d");

  ctx.clearRect(0, 0, S, S);
  ctx.save();
  ctx.translate(S / 2, S / 2);
  // keep a transparent margin so blurred mip levels never bleed to the
  // texture edge (which reads as a grey square on screen)
  ctx.scale(0.74, 0.74);

  // soft body — layered radial gradients give a velvety petal, not clipart
  const body = ctx.createRadialGradient(0, 6, 4, 0, 0, 56);
  body.addColorStop(0, "rgba(233, 176, 172, 1)");
  body.addColorStop(0.55, "rgba(206, 140, 146, 0.98)");
  body.addColorStop(0.85, "rgba(164, 100, 112, 0.9)");
  body.addColorStop(1, "rgba(140, 82, 96, 0)");

  ctx.filter = "blur(1.2px)";
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(0, -52);
  ctx.bezierCurveTo(34, -40, 40, 18, 8, 50);
  ctx.bezierCurveTo(3, 54, -3, 54, -8, 50);
  ctx.bezierCurveTo(-40, 18, -34, -40, 0, -52);
  ctx.closePath();
  ctx.fill();

  // sheen along the upper-left (matches the 35° key light)
  const sheen = ctx.createRadialGradient(-14, -22, 2, -14, -22, 42);
  sheen.addColorStop(0, "rgba(255, 235, 220, 0.55)");
  sheen.addColorStop(1, "rgba(255, 235, 220, 0)");
  ctx.fillStyle = sheen;
  ctx.fill();

  // deeper crease at the base
  const crease = ctx.createRadialGradient(0, 40, 1, 0, 40, 26);
  crease.addColorStop(0, "rgba(112, 58, 74, 0.5)");
  crease.addColorStop(1, "rgba(112, 58, 74, 0)");
  ctx.fillStyle = crease;
  ctx.fill();

  ctx.restore();

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ------------------------------------------------------- component */

export default function Atmosphere() {
  const holderRef = useRef(null);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    /* phones: fewer pixels and fewer particles — the atmosphere must
       never cost a visitor their frame rate */
    const isSmall = window.matchMedia("(max-width: 620px)").matches;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 2),
    );
    renderer.autoClear = false;
    /* the canvas must always cover the viewport exactly, whatever the
       DPR or window-resize timing — never trust attribute sizing alone */
    renderer.domElement.style.cssText =
      "width:100%;height:100%;display:block;";
    holder.appendChild(renderer.domElement);

    /* --- background quad scene --- */
    const bgScene = new THREE.Scene();
    const bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const bgUniforms = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uGate: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHero: { value: 1 },
      uIntro: { value: 0 },
      uSec: { value: 0 },
      uHasBg: { value: 0 },
      tBg: { value: null },
    };
    const bgMat = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader: ATMOS_FRAG,
      uniforms: bgUniforms,
      depthTest: false,
      depthWrite: false,
    });
    bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat));

    /* --- particle scene --- */
    const pScene = new THREE.Scene();
    const pCam = new THREE.PerspectiveCamera(55, 1, 0.1, 60);
    pCam.position.z = 10;


    const makePoints = (count, vert, frag, extraUniforms, blending) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3); // unused but required
      const seeds = new Float32Array(count);
      const depths = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        seeds[i] = Math.random() * 1000;
        depths[i] = Math.random();
      }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
      geo.setAttribute("aDepth", new THREE.BufferAttribute(depths, 1));
      const mat = new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: {
          uTime: { value: 0 },
          uScale: { value: 600 },
          ...extraUniforms,
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
        blending,
      });
      const pts = new THREE.Points(geo, mat);
      pts.frustumCulled = false;
      pScene.add(pts);
      return mat;
    };

    const petalTex = makePetalTexture();
    const petalMat = makePoints(
      0,
      PETAL_VERT,
      PETAL_FRAG,
      {
        tPetal: { value: petalTex },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      },
      THREE.NormalBlending,
    );
    const dustMat = makePoints(
      isSmall ? 55 : 140,
      DUST_VERT,
      DUST_FRAG,
      {},
      THREE.NormalBlending,
    );
    const glyphTex = makeGlyphTexture();
    const glyphMat = makePoints(
      isSmall ? 14 : 30,
      GLYPH_VERT,
      GLYPH_FRAG,
      { tGlyph: { value: glyphTex } },
      THREE.NormalBlending,
    );

    /* --- optional FLUX backplate --- */
    const loader = new THREE.TextureLoader();
    (function tryBg(i) {
      if (i >= BG_CANDIDATES.length) return;
      loader.load(
        BG_CANDIDATES[i],
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          bgUniforms.tBg.value = tex;
          bgUniforms.uHasBg.value = 1;
        },
        undefined,
        () => tryBg(i + 1),
      );
    })(0);

    /* --- sizing --- */
    const resize = () => {
      const w = holder.clientWidth;
      const h = holder.clientHeight;
      renderer.setSize(w, h, false);
      bgUniforms.uRes.value.set(
        w * renderer.getPixelRatio(),
        h * renderer.getPixelRatio(),
      );
      pCam.aspect = w / h;
      pCam.updateProjectionMatrix();
      const scale =
        (h * renderer.getPixelRatio() * 0.5) /
        Math.tan((pCam.fov * Math.PI) / 360);
      petalMat.uniforms.uScale.value = scale * 0.01;
      dustMat.uniforms.uScale.value = scale * 0.01;
      glyphMat.uniforms.uScale.value = scale * 0.01;
    };
    resize();
    window.addEventListener("resize", resize);

    /* --- pointer → parallax (heavily smoothed, weighty) --- */
    const mouseTarget = { x: 0.5, y: 0.5 };
    const mouseSmooth = { x: 0.5, y: 0.5 };
    const onPointer = (e) => {
      mouseTarget.x = e.clientX / window.innerWidth;
      mouseTarget.y = 1 - e.clientY / window.innerHeight; // GL space
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    /* --- scroll → uniforms --- */
    let scrollT = 0;
    let gateT = 0;
    let heroT = 1;
    let secT = 0;
    const readScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      scrollT = max > 0 ? window.scrollY / max : 0;
      const gate = document.getElementById("contact");
      if (gate) {
        const r = gate.getBoundingClientRect();
        const span = r.height - window.innerHeight;
        gateT = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
        /* the light opens to its sweet spot and RESTS there: petals stay
           visible, the screen never washes out to a blank white */
        gateT = Math.min(gateT, 0.62);
      }
      const hero = document.getElementById("hero");
      if (hero) {
        const r = hero.getBoundingClientRect();
        // fully lit while the hero is on screen, dissolved once passed
        heroT = 1 - Math.min(1, Math.max(0, -r.top / (r.height * 0.85)));
      }

      // how strongly an inner section owns the viewport centre
      const mid = window.innerHeight / 2;
      let best = 0;
      for (const id of ["about", "skills", "projects"]) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const centre = r.top + r.height / 2;
        const span = (r.height + window.innerHeight) / 2;
        const closeness = 1 - Math.min(1, Math.abs(centre - mid) / span);
        if (closeness > best) best = closeness;
      }
      secT = Math.pow(best, 1.4);
    };
    window.addEventListener("scroll", readScroll, { passive: true });
    readScroll();

    /* --- frame loop ---
       The clock accumulates only rendered frames, so the intro stays in
       sync with what the viewer actually sees (a backgrounded tab does
       not fast-forward the bloom). */
    let last = performance.now();
    let elapsed = 0;
    let raf = 0;
    const frozen = reduce ? 40 : 0; // reduced motion: a fixed, pretty moment

    const frame = () => {
      const now = performance.now();
      elapsed += Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = frozen || elapsed;
      bgUniforms.uTime.value = t;

      // page-load bloom: after a beat of darkness, the rose of light
      // unfolds over ~4.2s with a silk ease-out (reduced motion → 1).
      // It no longer opens all the way and vanishes: while the hero owns
      // the view it RESTS at the same sweet spot as the closing gate —
      // petals on screen — and only opens fully as the visitor scrolls on.
      const introRaw = Math.min(1, Math.max(0, (t - 0.35) / 4.2));
      const introEase = 1 - Math.pow(1 - introRaw, 3);
      const hold = 1 - 0.38 * bgUniforms.uHero.value;
      bgUniforms.uIntro.value = introEase * hold;
      // ease scroll-driven values slightly so they feel weighted
      bgUniforms.uScroll.value +=
        (scrollT - bgUniforms.uScroll.value) * 0.06;
      bgUniforms.uGate.value += (gateT - bgUniforms.uGate.value) * 0.08;
      bgUniforms.uHero.value += (heroT - bgUniforms.uHero.value) * 0.08;
      bgUniforms.uSec.value += (secT - bgUniforms.uSec.value) * 0.07;

      // pointer parallax, heavily damped
      mouseSmooth.x += (mouseTarget.x - mouseSmooth.x) * 0.035;
      mouseSmooth.y += (mouseTarget.y - mouseSmooth.y) * 0.035;
      bgUniforms.uMouse.value.set(mouseSmooth.x, mouseSmooth.y);

      petalMat.uniforms.uTime.value = t;
      petalMat.uniforms.uMouse.value.set(mouseSmooth.x, mouseSmooth.y);
      dustMat.uniforms.uTime.value = t;
      glyphMat.uniforms.uTime.value = t;

      // camera: slow breathing + parallax across particle depths
      pCam.position.x = (mouseSmooth.x - 0.5) * 0.9;
      pCam.position.y = (mouseSmooth.y - 0.5) * 0.6;
      pCam.position.z = 10 + Math.sin(t * 0.11) * 0.3;
      pCam.lookAt(0, 0, 0);

      renderer.clear();
      renderer.render(bgScene, bgCam);
      renderer.render(pScene, pCam);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("pointermove", onPointer);
      renderer.dispose();
      petalTex.dispose();
      glyphTex.dispose();
      holder.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={holderRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
      }}
      className="atmosphere"
    />
  );
}
