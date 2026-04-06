<div align="center">

<a href="https://moltamp.com">
  <img src=".github/assets/logo.png" alt="MOLTamp" width="56"/>
</a>

<br/><br/>

# Contributing to MOLTamp Visualizers

**Thanks for building a visualizer preset.** Here's how to get it into the repo.

</div>

<br/>

## Quick Version

1. Fork this repo
2. Create `visualizers/your-preset-id/` with `preset.json` and `renderer.js`
3. Open a PR

## Preset Structure

```
visualizers/your-preset/
  preset.json       <- Manifest
  renderer.js       <- Render function
```

## Guidelines

1. **`preset.json` has a valid `id`.** Alphanumeric + hyphens only.
2. **`renderer.js` exports via `module.exports`.** Single function.
3. **Use `colors.*` from the skin palette.** No hardcoded hex values.
4. **Reset canvas state.** `globalAlpha`, `shadowBlur`, `lineWidth` — clean up at end of render.
5. **Cap your loops.** `Math.min(data.length, 64)`, not raw `data.length`.
6. **No DOM access.** No `document`, no `window`, no `require`/`import`.
7. **No unbounded state.** Don't grow arrays/objects every frame at 60fps.
8. **Pure Canvas 2D.** Everything you need is in the render arguments.

## The Render Function

```js
module.exports = function(ctx, data, W, H, colors, beat, waveData) {
  // ctx       — CanvasRenderingContext2D (2x Retina scaled)
  // data      — Uint8Array: frequency bins or waveform samples
  // W, H      — canvas size in CSS pixels
  // colors    — { accent, dim, magenta, cyan, green, red, yellow, blue }
  // beat      — { energy, peak, isBeat, decay }
  // waveData  — Uint8Array (only when dataType is "both")
};
```

## Testing Your Preset

Before submitting:

- [ ] Loads in MOLTamp (Settings > Visualizers > Import or drop into `~/Moltamp/visualizers/`)
- [ ] Runs at 60fps without visible jank
- [ ] Looks correct with at least 2 different skins (one light, one dark)
- [ ] Beat reactivity works (play music, watch for pulse/glow)
- [ ] No console errors

## Using AI

You can use ChatGPT, Claude, Codex, etc. to generate presets. See the "For AI-Generated Presets" section in [VISUALIZERS.md](VISUALIZERS.md) for a ready-to-paste prompt block.

## Code of Conduct

Be respectful. Share your creativity. Help others build cool visualizers.

<br/>

<div align="center">

<sub><a href="https://moltamp.com">moltamp.com</a> &nbsp;&middot;&nbsp; <a href="VISUALIZERS.md">Authoring Guide</a> &nbsp;&middot;&nbsp; <a href="README.md">Back to README</a></sub>

</div>
