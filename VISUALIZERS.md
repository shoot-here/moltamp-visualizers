# Moltamp Visualizer Preset Specification v1.0

The single source of truth for building Moltamp audio visualizer presets.

## Quick Start

```bash
# 1. Copy an existing preset
cp -r ~/Moltamp/visualizers/bars ~/Moltamp/visualizers/my-viz

# 2. Edit the manifest
$EDITOR ~/Moltamp/visualizers/my-viz/preset.json

# 3. Write your renderer
$EDITOR ~/Moltamp/visualizers/my-viz/renderer.js

# 4. Open Moltamp — your preset appears in the visualizer settings
```

Click the gear icon on the Visualizer widget, select your preset, and iterate.

---

## The Rules

### 1. Pure Canvas, No DOM

Renderers get a `CanvasRenderingContext2D`. That's it. No DOM access, no `document`, no `window`. Draw with the Canvas API.

### 2. No External Dependencies

Renderers are compiled with `new Function()` in a sandboxed scope. You can't `require()` or `import` anything. Everything you need is passed as arguments.

### 3. Use Skin Colors

The `colors` object gives you the active skin's palette. Use it instead of hardcoding hex values — your preset will look right in every skin.

```js
// WRONG
ctx.fillStyle = "#d4a036";

// RIGHT
ctx.fillStyle = colors.accent;
```

Exception: computed colors using `hsla()` or `rgba()` are fine when you need dynamic hue shifts or transparency not covered by the palette.

### 4. Fail Silently

If your renderer throws, Moltamp skips the frame and moves on. No error UI, no crash. But don't rely on this — keep your code defensive.

### 5. Clean Up After Yourself

Reset `globalAlpha`, `shadowBlur`, `lineWidth`, and other context state at the end of your render function. The next frame starts with whatever state you left behind.

---

## File Structure

```
~/Moltamp/visualizers/my-viz/
├── preset.json      ← Required: manifest
└── renderer.js      ← Required: render function
```

Drop the folder into `~/Moltamp/visualizers/` and it appears. Delete it and it's gone. No registration, no config files.

### preset.json

```json
{
  "id": "my-viz",
  "name": "My Viz",
  "description": "What it looks like in one sentence.",
  "author": "Your Name",
  "dataType": "frequency"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier. Must match `^[a-zA-Z0-9_-]+$`. |
| `name` | Yes | Display name in the preset picker. |
| `description` | No | Short description (shown on hover). |
| `author` | No | Credit line. |
| `dataType` | No | Audio data type. Defaults to `"frequency"`. |

#### dataType

| Value | What you get | Best for |
|-------|-------------|----------|
| `"frequency"` | FFT frequency bins (0–255 per bin) | Bars, spectrum, radial |
| `"waveform"` | Raw audio waveform (128 = silence) | Oscilloscopes, waves |
| `"both"` | Frequency as `data`, waveform as `waveData` (7th arg) | Complex presets like Milkdrop |

---

## The Renderer Function

### renderer.js

```js
// @moltamp-visualizer: My Viz
// Short description of what it does.

module.exports = function(ctx, data, W, H, colors, beat, waveData) {
  // Draw here
};
```

The comment header (`// @moltamp-visualizer: Name`) is a convention, not enforced.

### Arguments

| Arg | Type | Description |
|-----|------|-------------|
| `ctx` | `CanvasRenderingContext2D` | The drawing context. Already scaled 2x for Retina. |
| `data` | `Uint8Array` | Audio data. Frequency bins or waveform samples depending on `dataType`. |
| `W` | `number` | Canvas width in CSS pixels. |
| `H` | `number` | Canvas height in CSS pixels. |
| `colors` | `object` | Skin palette — see below. |
| `beat` | `object` | Beat detection state — see below. |
| `waveData` | `Uint8Array \| undefined` | Waveform data. Only present when `dataType` is `"both"`. |

### The `colors` Object

Resolved from the active skin's CSS variables at render start. All values are hex strings.

| Key | Source Variable | Typical Use |
|-----|----------------|-------------|
| `accent` | `--c-chrome-accent` | Primary highlights, peaks |
| `dim` | `--c-chrome-dim` | Muted elements, backgrounds |
| `magenta` | `--t-magenta` | Hot frequency ranges |
| `cyan` | `--t-cyan` | Cool tones, waveforms |
| `green` | `--t-green` | Secondary waveforms, fills |
| `red` | `--t-red` | Clipping, high energy |
| `yellow` | `--t-yellow` | Mid-range frequencies |
| `blue` | `--t-blue` | Low frequencies |

### The `beat` Object

Updated every frame by the beat detector (bass-weighted energy analysis).

| Key | Type | Description |
|-----|------|-------------|
| `energy` | `number` | Current bass energy (0–255). |
| `peak` | `number` | Decaying peak energy. Used internally for threshold. |
| `isBeat` | `boolean` | `true` on the frame a beat is detected. |
| `decay` | `number` | 0–1 value. Jumps to 1 on beat, decays at 0.92/frame. Use for smooth reactions. |

**`beat.decay` is your best friend.** Multiply it into sizes, alphas, blur radii, and line widths for smooth beat-reactive visuals without any state management.

```js
var lineWidth = 1.5 + beat.decay * 2;    // Thickens on beat, smoothly returns
ctx.shadowBlur = beat.decay * 10;         // Glow pulses on beat
var scale = 1 + beat.decay * 0.15;        // Subtle size pulse
```

---

## Persistent State

Variables declared outside `module.exports` survive across frames. Use this for animations that evolve over time.

```js
// This persists — it's in module scope
var phase = 0;
var hueShift = 0;

module.exports = function(ctx, data, W, H, colors, beat) {
  phase += 0.02;
  if (beat.isBeat) hueShift = (hueShift + 30) % 360;

  // Use phase and hueShift in your drawing...
};
```

**Warning:** Don't accumulate unbounded arrays or objects in persistent state. You're running at 60fps — memory adds up fast.

---

## Canvas Clearing

Moltamp clears the canvas before each frame for `"frequency"` and `"waveform"` presets. For `"both"` presets, it does **not** clear — this lets you do fade trails:

```js
// In a "both" preset — manual fade instead of clear
ctx.fillStyle = "rgba(0,0,0,0.15)";
ctx.fillRect(0, 0, W, H);
```

If your `"both"` preset wants a clean slate, clear it yourself:

```js
ctx.clearRect(0, 0, W, H);
```

---

## Cookbook: Common Patterns

### Minimal bars

```js
module.exports = function(ctx, data, W, H, colors, beat) {
  var bars = Math.min(data.length, 48);
  var bw = W / bars;
  for (var i = 0; i < bars; i++) {
    var h = (data[i] / 255) * H;
    ctx.fillStyle = colors.accent;
    ctx.fillRect(i * bw + 1, H - h, bw - 2, h);
  }
};
```

### Waveform oscilloscope

```js
module.exports = function(ctx, data, W, H, colors, beat) {
  ctx.strokeStyle = colors.cyan;
  ctx.lineWidth = 1.5 + beat.decay * 1.5;
  ctx.beginPath();
  var step = W / data.length;
  for (var i = 0; i < data.length; i++) {
    var y = (data[i] / 128.0) * (H / 2);
    if (i === 0) ctx.moveTo(0, y); else ctx.lineTo(i * step, y);
  }
  ctx.stroke();
};
```

### Beat-reactive radial

```js
module.exports = function(ctx, data, W, H, colors, beat) {
  var cx = W / 2, cy = H / 2;
  var radius = Math.min(W, H) * 0.3 + beat.decay * 8;
  var slices = Math.min(data.length, 64);

  ctx.beginPath();
  for (var i = 0; i <= slices; i++) {
    var angle = (i / slices) * Math.PI * 2;
    var val = (data[i % slices] || 0) / 255;
    var r = radius + val * radius * 0.5;
    var x = cx + Math.cos(angle) * r;
    var y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = colors.cyan;
  ctx.lineWidth = 1 + beat.decay;
  ctx.stroke();
};
```

### Color helper for transparency

The `colors` object gives you hex strings. If you need alpha:

```js
function hexToRgba(hex, alpha) {
  var r = parseInt(hex.slice(1, 3), 16) || 0;
  var g = parseInt(hex.slice(3, 5), 16) || 0;
  var b = parseInt(hex.slice(5, 7), 16) || 0;
  return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
}
```

---

## Performance

- **Target 60fps.** Your function runs every frame. Keep it tight.
- **Limit iterations.** Cap loops: `Math.min(data.length, 64)` instead of iterating all 1024+ bins.
- **Avoid allocations.** Don't create objects or arrays inside the render loop. Use persistent state for buffers.
- **Use `globalAlpha` over `rgba()`.** Changing alpha via `globalAlpha` is cheaper than parsing color strings every frame.
- **Minimize path complexity.** Fewer `lineTo` calls = faster path rasterization.
- **Skip `shadowBlur` when zero.** Shadow rendering is expensive. Only set it when `beat.decay > 0.01`.

---

## Advanced Techniques

Everything below is pure Canvas 2D — no libraries, no WebGL. You'd be surprised what you can do.

### 3D Wireframes

Project 3D vertices onto 2D with perspective. Rotate with beat, displace with frequency. See the **Greek God** preset for a full example.

```js
// Persistent rotation
var rotY = 0;

function project(x, y, z, W, H, scale) {
  var fov = 2.5;
  var d = z + fov;
  if (d < 0.1) d = 0.1;
  return [(x / d) * scale + W / 2, (-y / d) * scale + H / 2, d];
}

module.exports = function(ctx, data, W, H, colors, beat) {
  rotY += 0.005 + beat.decay * 0.02;
  var scale = Math.min(W, H) * 0.8;

  // Define 3D points, rotate, project, draw edges...
  // Depth-sort edges for proper occlusion
  // Map frequency bins to vertex displacement by height
};
```

### Particle Systems

Spawn particles on beat, apply physics, fade out over time.

```js
var particles = [];
var MAX_PARTICLES = 200;

module.exports = function(ctx, data, W, H, colors, beat) {
  // Spawn on beat
  if (beat.isBeat && particles.length < MAX_PARTICLES) {
    for (var i = 0; i < 8; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 1 + Math.random() * 3;
      particles.push({
        x: W / 2, y: H / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color: [colors.cyan, colors.magenta, colors.accent][Math.floor(Math.random() * 3)]
      });
    }
  }

  // Update + draw
  for (var i = particles.length - 1; i >= 0; i--) {
    var p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.02;  // gravity
    p.life -= 0.015;
    if (p.life <= 0) { particles.splice(i, 1); continue; }

    ctx.globalAlpha = p.life * 0.8;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2 + p.life * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
};
```

### Compositing Modes

`globalCompositeOperation` is incredibly powerful for glow, blending, and light effects.

```js
// Additive glow — "lighter" adds RGB values, creating bloom
ctx.globalCompositeOperation = "lighter";
ctx.fillStyle = colors.cyan;
ctx.globalAlpha = 0.3;
ctx.beginPath();
ctx.arc(cx, cy, radius, 0, Math.PI * 2);
ctx.fill();
ctx.globalCompositeOperation = "source-over"; // always reset

// Other useful modes:
// "screen"     — bright overlay, great for light effects
// "multiply"   — darkening blend
// "difference" — psychedelic inversions
// "overlay"    — contrast boost
```

### Coordinate Transforms

Use `translate`, `rotate`, `scale` for complex layered animations. Always `save()` and `restore()`.

```js
module.exports = function(ctx, data, W, H, colors, beat) {
  var cx = W / 2, cy = H / 2;

  // Draw 6 rotated copies of a frequency arc
  for (var r = 0; r < 6; r++) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((r / 6) * Math.PI * 2 + beat.decay * 0.1);

    ctx.beginPath();
    for (var i = 0; i < 32; i++) {
      var val = (data[i] || 0) / 255;
      var x = i * 4;
      var y = -val * 40 * (1 + beat.decay * 0.3);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = colors.cyan;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
};
```

### Gradients as Data Visualizations

Dynamic gradient stops driven by frequency data.

```js
module.exports = function(ctx, data, W, H, colors, beat) {
  var grad = ctx.createLinearGradient(0, H, 0, 0);

  // Map frequency bands to gradient color stops
  var bass = data[2] / 255;
  var mid = data[16] / 255;
  var hi = data[48] / 255;

  grad.addColorStop(0, colors.blue);
  grad.addColorStop(bass * 0.4, colors.cyan);
  grad.addColorStop(0.5, colors.green);
  grad.addColorStop(0.5 + mid * 0.3, colors.yellow);
  grad.addColorStop(1, colors.red);

  ctx.fillStyle = grad;
  ctx.globalAlpha = 0.6 + beat.decay * 0.4;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
};
```

### Off-Screen Canvas for Feedback Effects

Create a second canvas for trail/feedback effects without using `dataType: "both"`.

```js
var feedbackCanvas = null;
var feedbackCtx = null;

module.exports = function(ctx, data, W, H, colors, beat) {
  // Lazy-init the feedback buffer
  if (!feedbackCanvas || feedbackCanvas.width !== W * 2) {
    feedbackCanvas = new OffscreenCanvas(W * 2, H * 2);
    feedbackCtx = feedbackCanvas.getContext("2d");
  }

  // Copy current frame to feedback, slightly zoomed + faded
  feedbackCtx.globalAlpha = 0.92;
  feedbackCtx.drawImage(feedbackCanvas, -1, -1, W * 2 + 2, H * 2 + 2);
  feedbackCtx.globalAlpha = 1;

  // Draw new content onto feedback
  // ... your drawing code on feedbackCtx ...

  // Composite feedback onto main canvas
  ctx.drawImage(feedbackCanvas, 0, 0, W, H);
};
```

### Bezier Curves for Organic Shapes

Smooth, flowing forms instead of jagged polylines.

```js
module.exports = function(ctx, data, W, H, colors, beat) {
  ctx.beginPath();
  ctx.moveTo(0, H / 2);

  var step = W / 32;
  for (var i = 0; i < 32; i++) {
    var val = (data[i] || 0) / 255;
    var x = i * step;
    var y = H / 2 - val * H * 0.4;
    var cpx = x + step / 2;
    var nextVal = (data[i + 1] || 0) / 255;
    var nextY = H / 2 - nextVal * H * 0.4;
    ctx.quadraticCurveTo(cpx, y, x + step, nextY);
  }

  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2 + beat.decay * 2;
  ctx.shadowColor = colors.accent;
  ctx.shadowBlur = beat.decay * 12;
  ctx.stroke();
  ctx.shadowBlur = 0;
};
```

### Text and Typography

Frequency-reactive text rendering.

```js
var phase = 0;

module.exports = function(ctx, data, W, H, colors, beat) {
  phase += 0.01;
  var text = "MOLTAMP";

  ctx.font = "bold " + (24 + beat.decay * 8) + "px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Draw each character with frequency-driven offset
  for (var i = 0; i < text.length; i++) {
    var freqVal = (data[i * 4] || 0) / 255;
    var x = W / 2 + (i - text.length / 2) * 28;
    var y = H / 2 + Math.sin(phase + i * 0.5) * freqVal * 20;

    ctx.globalAlpha = 0.3 + freqVal * 0.7;
    ctx.fillStyle = freqVal > 0.6 ? colors.accent : colors.dim;
    ctx.fillText(text[i], x, y);
  }
  ctx.globalAlpha = 1;
};
```

---

## Sharing & Distribution

**Export:** Open Settings > Visualizers, select a preset, click Export — saves as a `.zip`.

**Import:** Settings > Visualizers > Import — select any `.zip` containing `preset.json` + `renderer.js`. The preset is available immediately in the Visualizer widget — no restart needed.

**Manual install:** Drop a folder into `~/Moltamp/visualizers/` and restart. Or use "Show in Finder" from the settings tab.

**Zip format:** The `.zip` contains just two files:
```
my-preset.zip
├── preset.json
└── renderer.js
```

---

## Built-in Presets

| Preset | dataType | Description |
|--------|----------|-------------|
| **Bars** | frequency | Classic frequency bars with beat scaling and accent peaks |
| **Circle** | frequency | Radial frequency bars from center with gradient fill and beat wobble |
| **Spectrum** | frequency | Rainbow frequency bars split at midline |
| **Wave** | waveform | Dual waveform display with glow on beat |

Clone any of these as a starting point.

---

## For AI-Generated Presets

If you're using ChatGPT, Claude, Codex, or another AI to generate a preset, **paste this block** with your prompt:

```
MOLTAMP VISUALIZER PRESET RULES — follow these exactly:

FILE STRUCTURE:
- preset.json (manifest) + renderer.js (render function)
- preset.json requires: id, name. Optional: description, author, dataType.
- dataType: "frequency" (FFT), "waveform" (raw audio), or "both" (frequency + waveform as 7th arg)

RENDERER SIGNATURE:
  module.exports = function(ctx, data, W, H, colors, beat, waveData) { ... }
  - ctx: CanvasRenderingContext2D (2x scaled for Retina)
  - data: Uint8Array — frequency bins (0-255) or waveform samples (128 = silence)
  - W, H: canvas size in CSS pixels
  - colors: { accent, dim, magenta, cyan, green, red, yellow, blue } — hex strings from skin
  - beat: { energy, peak, isBeat, decay } — decay is 0-1, smoothly falls after each beat
  - waveData: Uint8Array | undefined — only when dataType is "both"

RULES:
- Pure Canvas 2D API only. No DOM, no document, no window, no require/import.
- Use colors.* instead of hardcoded hex (so it works with every skin)
- Reset globalAlpha, shadowBlur at end of function
- Cap loops: Math.min(data.length, 64) — don't iterate all bins
- Persistent state: declare vars outside module.exports
- For "both" dataType: canvas is NOT auto-cleared — draw your own fade or clearRect

BEAT REACTIVITY:
- beat.decay is your primary tool: 0-1 value, jumps to 1 on beat, decays at 0.92/frame
- Multiply into sizes, alphas, blur radii for smooth pulsing
- beat.isBeat is true for one frame on each beat — use for triggers (hue shifts, spawns)

EXAMPLE:
  module.exports = function(ctx, data, W, H, colors, beat) {
    var bars = Math.min(data.length, 48);
    var bw = W / bars;
    var scale = 1 + beat.decay * 0.2;
    for (var i = 0; i < bars; i++) {
      var h = (data[i] / 255) * H * scale;
      ctx.fillStyle = data[i] > 200 ? colors.red : colors.accent;
      ctx.fillRect(i * bw + 1, H - h, bw - 2, h);
    }
  };
```

---

## Checklist

Before sharing your preset:

- [ ] `preset.json` has a valid `id` (alphanumeric + hyphens only)
- [ ] `renderer.js` exports a function via `module.exports`
- [ ] Uses `colors.*` instead of hardcoded hex values
- [ ] Resets `globalAlpha` and `shadowBlur` at end of render
- [ ] Loops are capped (`Math.min(data.length, N)`)
- [ ] No DOM access, no `require`, no `import`
- [ ] No unbounded state accumulation (arrays, objects growing each frame)
- [ ] Tested with multiple skins (light and dark palettes)
- [ ] Runs at 60fps without visible jank
