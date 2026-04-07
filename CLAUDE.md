# MOLTamp Visualizers -- AI Contributor Guide

Community audio visualizer preset repository for MOLTamp. Presets are pure Canvas 2D renderers -- no DOM, no libraries, no WebGL.

## Repository Structure

```
moltamp-visualizers/
├── visualizers/        <-- Each subfolder is a preset
│   └── <preset-id>/
│       ├── preset.json <-- Manifest (required)
│       └── renderer.js <-- Render function (required)
├── VISUALIZERS.md      <-- Full specification (read this first)
├── CONTRIBUTING.md     <-- PR guidelines
└── README.md           <-- Overview + preset catalog
```

## Critical Rules -- NEVER Violate These

1. **Pure Canvas 2D only.** No DOM access, no `document`, no `window`, no `require`, no `import`.
2. **Use `colors.*` for all colors.** Never hardcode hex values. The preset must look correct in every skin.
3. **Export via `module.exports`.** `module.exports = function(ctx, data, W, H, colors, beat, waveData) { ... }`
4. **Reset canvas state.** Always reset `globalAlpha`, `shadowBlur`, `lineWidth`, and `globalCompositeOperation` at the end.
5. **Cap your loops.** `Math.min(data.length, 64)` -- never iterate all 1024+ raw bins.
6. **No unbounded state.** Don't grow arrays/objects every frame. Cap particle counts, reuse buffers.
7. **Target 60fps.** Your function runs every single frame. Keep it tight.

## Renderer Signature

```js
module.exports = function(ctx, data, W, H, colors, beat, waveData) {
  // ctx: CanvasRenderingContext2D (2x Retina scaled)
  // data: Uint8Array[128] -- frequency (0-255) or waveform (128=silence)
  // W, H: canvas dimensions in CSS pixels
  // colors: { accent, dim, magenta, cyan, green, red, yellow, blue, bg, text, border, ... }
  // beat: { energy (0-255), peak, isBeat (boolean), decay (0-1, falls at 0.92/frame) }
  // waveData: Uint8Array[128] | undefined -- only when dataType is "both"
};
```

## When Generating a New Preset

1. Read `VISUALIZERS.md` fully -- it's the single source of truth
2. Start from an existing preset (copy a `visualizers/<id>/` folder)
3. Use `beat.decay` for smooth reactivity -- multiply into sizes, alphas, blur radii
4. Use `beat.isBeat` for one-shot triggers (hue shifts, particle spawns)
5. Always test with multiple skins (light + dark palettes)
6. Persistent state goes OUTSIDE `module.exports`, drawing goes INSIDE

## Common AI Mistakes

- Using `document`, `window`, or DOM APIs -- not available in the renderer sandbox
- Hardcoding hex colors instead of using `colors.accent`, `colors.cyan`, etc.
- Forgetting to reset `globalAlpha` to 1 at the end (bleeds into next frame)
- Forgetting to reset `shadowBlur` to 0 (expensive, bleeds into next frame)
- Forgetting to reset `globalCompositeOperation` to `"source-over"`
- Iterating all `data.length` bins in a loop (can be 1024+, kills performance)
- Growing arrays unboundedly (particles, history buffers) -- always cap with MAX constant
- Using `Math.random()` every frame without purpose (creates visual noise)
- Drawing outside W/H bounds (wastes GPU cycles)
- Using `rgba()` strings when `globalAlpha` is cheaper
- Creating objects/arrays inside the render loop (GC pressure at 60fps)
- Not handling the case where data is mostly zeros (no audio playing)

## Data Shapes

- **Frequency** (`dataType: "frequency"`): 128 bins, 0-255 each. Low index = low freq.
- **Waveform** (`dataType: "waveform"`): 128 samples, 128 = silence.
- **Both** (`dataType: "both"`): frequency as `data`, waveform as `waveData`. Canvas NOT auto-cleared.

## Beat Reactivity Patterns

```js
// Smooth pulse -- best general-purpose pattern
var scale = 1 + beat.decay * 0.2;

// Glow on beat
ctx.shadowBlur = beat.decay > 0.01 ? beat.decay * 15 : 0;

// One-shot trigger
if (beat.isBeat) hueShift = (hueShift + 30) % 360;

// Size modulation
var radius = baseRadius * (1 + beat.decay * 0.3);
```

## preset.json Required Fields

```json
{
  "id": "my-preset",
  "name": "My Preset"
}
```

Optional: `version`, `description`, `author`, `dataType` (default `"frequency"`).
