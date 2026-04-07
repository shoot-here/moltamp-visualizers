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
3. Open a PR using the preset submission template

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
4. **Reset canvas state.** `globalAlpha`, `shadowBlur`, `lineWidth`, `globalCompositeOperation` -- clean up at end of render.
5. **Cap your loops.** `Math.min(data.length, 64)`, not raw `data.length`.
6. **No DOM access.** No `document`, no `window`, no `require`/`import`.
7. **No unbounded state.** Don't grow arrays/objects every frame at 60fps.
8. **Pure Canvas 2D.** Everything you need is in the render arguments.

## The Render Function

```js
module.exports = function(ctx, data, W, H, colors, beat, waveData) {
  // ctx       -- CanvasRenderingContext2D (2x Retina scaled)
  // data      -- Uint8Array: frequency bins or waveform samples
  // W, H      -- canvas size in CSS pixels
  // colors    -- { accent, dim, magenta, cyan, green, red, yellow, blue }
  // beat      -- { energy, peak, isBeat, decay }
  // waveData  -- Uint8Array (only when dataType is "both")
};
```

## Testing Your Preset

Before submitting:

- [ ] Loads in MOLTamp (Settings > Visualizers > Import or drop into `~/Moltamp/visualizers/`)
- [ ] Runs at 60fps without visible jank
- [ ] Looks correct with at least 2 different skins (one light, one dark)
- [ ] Beat reactivity works (play music, watch for pulse/glow)
- [ ] No console errors (check with Cmd+Shift+I in MOLTamp)
- [ ] Handles silent input gracefully (no errors when no audio playing)

## AI-Generated Presets Welcome

Presets generated with ChatGPT, Claude, Codex, or any other AI tool are accepted and encouraged. The same quality bar applies: your preset must pass all the guidelines above and render at 60fps.

See the "For AI-Generated Presets" section in [VISUALIZERS.md](VISUALIZERS.md) for a ready-to-paste prompt block that gives the AI everything it needs to produce a valid preset.

If you used AI, you're welcome to credit it in the `author` field (e.g., `"author": "Your Name + Claude"`), but it's not required.

## Visual Quality Standards

A preset should be visually interesting and reactive to audio. The bar is not perfection -- it's engagement. Some things that make a preset worth sharing:

- **Beat reactivity.** The visualization should visibly respond to rhythm. Use `beat.decay` for smooth pulsing, `beat.isBeat` for one-shot triggers. A static display that ignores the music is not a visualizer.
- **Color harmony.** Use the skin palette (`colors.*`) thoughtfully. Vary colors by frequency range, energy level, or position.
- **Motion.** Movement keeps the eye engaged. Phase shifts, rotation, particle physics, fade trails -- anything that evolves over time.
- **Polish.** Small touches matter: anti-aliased lines, smooth transitions, glow that fades rather than snaps off.

A simple preset done well is better than a complex one that stutters.

## Performance is Non-Negotiable

Your renderer runs 60 times per second. If it can't keep up, it creates visible jank for the user. This is the one area where there's no compromise.

Before submitting, test with the Chrome DevTools Performance tab (Cmd+Shift+I in MOLTamp):

1. Open the **Performance** tab
2. Click Record
3. Play music and let the visualizer run for 10-15 seconds
4. Stop recording
5. Check that frame times stay under 16ms consistently

Common performance killers:
- Iterating all `data.length` bins (cap with `Math.min`)
- `shadowBlur` left on when not needed (check `beat.decay > 0.01` first)
- Creating objects/arrays inside the render loop (GC pressure)
- Growing arrays without bounds (particles, history buffers)
- Complex path operations with hundreds of `lineTo` calls

## Review Criteria

When reviewers evaluate your PR, they check:

| Criteria | What we look for |
|----------|-----------------|
| **60fps performance** | No dropped frames during normal playback. Frame times under 16ms. |
| **Skin color compliance** | All colors come from `colors.*`. No hardcoded hex values. Looks good in both light and dark skins. |
| **Canvas state cleanup** | `globalAlpha`, `shadowBlur`, `globalCompositeOperation` reset at end of render. |
| **No unbounded state** | Arrays and objects don't grow every frame. Particle counts are capped. |
| **Beat reactivity** | Visible response to audio rhythm. Uses `beat.decay` and/or `beat.isBeat`. |
| **Visual appeal** | Interesting to watch. Has motion, color variation, or structural complexity. |
| **Code quality** | Readable, no dead code, no `console.log` left in, defensive against edge cases. |

## Code of Conduct

Be respectful. Share your creativity. Help others build cool visualizers.

<br/>

<div align="center">

<sub><a href="https://moltamp.com">moltamp.com</a> &nbsp;&middot;&nbsp; <a href="VISUALIZERS.md">Authoring Guide</a> &nbsp;&middot;&nbsp; <a href="README.md">Back to README</a></sub>

</div>
