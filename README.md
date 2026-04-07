<div align="center">

<img src="https://raw.githubusercontent.com/shoot-here/moltamp-visualizers/main/.github/assets/banner.svg" alt="Moltamp Visualizers — audio-reactive Canvas presets for AI terminals" width="100%"/>

<br/><br/>

# Moltamp Visualizers

**Audio-reactive Canvas 2D presets for the Moltamp cockpit shell — vibe coding visuals for Claude Code, Codex CLI, Gemini CLI, and Aider.**

[![License: MIT](https://img.shields.io/github/license/shoot-here/moltamp-visualizers?style=flat-square&color=4d9fff&labelColor=08080a)](LICENSE)
[![Presets](https://img.shields.io/badge/presets-4-a855f7?style=flat-square&labelColor=08080a)](#featured-presets)
[![Spec](https://img.shields.io/badge/spec-VISUALIZERS.md-4d9fff?style=flat-square&labelColor=08080a)](VISUALIZERS.md)
[![Gallery](https://img.shields.io/badge/gallery-moltamp.com-ff6b4d?style=flat-square&labelColor=08080a)](https://moltamp.com/community)

**[Download Moltamp](https://moltamp.com)** &nbsp;&middot;&nbsp; **[Browse the Gallery](https://moltamp.com/community)** &nbsp;&middot;&nbsp; **[Authoring Guide](VISUALIZERS.md)** &nbsp;&middot;&nbsp; **[Contributing](CONTRIBUTING.md)**

</div>

<br/>

## What's this repo?

This is the open-source visualizer library for **[Moltamp](https://moltamp.com)** — a skinnable cockpit UI for AI coding terminals like **Claude Code**, **Codex CLI**, **Gemini CLI**, and **Aider**. A Moltamp visualizer is an **audio-reactive Canvas 2D preset** that renders inside the vibes banner above your terminal — bars, waveforms, particles, geometry, anything that pulses to the music while you code.

Visualizers run as **single-file render functions**. No DOM, no libraries, no WebGL. Microphone audio is FFT-analyzed by Moltamp and handed to your renderer as a `Uint8Array` along with beat detection state and the active skin's color palette — so every preset automatically retones for every theme.

If you've ever wanted lo-fi beats with a Winamp-style visualizer pulsing above your AI pair-programmer — this is the place.

> **Keywords:** Claude Code visualizer, AI terminal visualizer, audio reactive canvas, music visualizer, Winamp visualizer, vibe coding, Codex CLI visuals, Gemini CLI visuals, Aider visuals, Moltamp.

<br/>

## Featured Presets

<table>
<tr>
<td align="center" width="25%"><b>Bars</b><br/><sub>Classic frequency bars with beat scaling</sub></td>
<td align="center" width="25%"><b>Circle</b><br/><sub>Radial frequency bars with gradient fill</sub></td>
<td align="center" width="25%"><b>Spectrum</b><br/><sub>Rainbow bars split at the midline</sub></td>
<td align="center" width="25%"><b>Wave</b><br/><sub>Dual waveform with glow on beat</sub></td>
</tr>
<tr>
<td align="center" colspan="4"><i>Your preset here</i> &rarr; <a href="#contribute-a-preset">submit a PR</a></td>
</tr>
</table>

Browse every community preset (with live previews) at **[moltamp.com/community](https://moltamp.com/community)**.

<br/>

## What's in this repo

```
moltamp-visualizers/
├── visualizers/        <- One folder per preset (drop-in installable)
│   ├── bars/
│   ├── circle/
│   ├── spectrum/
│   └── wave/
├── VISUALIZERS.md      <- Full render-function spec — read this first
├── CONTRIBUTING.md     <- PR checklist + review criteria
└── README.md
```

<br/>

## Install a preset

**Inside Moltamp** (recommended):

> Settings &rarr; Visualizers &rarr; Import &rarr; pick the preset folder or `.zip`.

**From the command line:**

```bash
git clone https://github.com/shoot-here/moltamp-visualizers.git
cp -r moltamp-visualizers/visualizers/circle ~/Moltamp/visualizers/
```

Restart Moltamp and pick the preset from the visualizer dropdown in the vibes panel.

<br/>

## Build a preset in 60 seconds

A preset is two files in a folder:

```
visualizers/my-preset/
  preset.json       <- manifest
  renderer.js       <- the render function
```

**`preset.json`**

```json
{
  "id": "my-preset",
  "name": "My Preset",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "What it looks like in one sentence.",
  "dataType": "frequency"
}
```

**`renderer.js`**

```js
module.exports = function(ctx, data, W, H, colors, beat) {
  var bars = Math.min(data.length, 48);
  var bw = W / bars;
  for (var i = 0; i < bars; i++) {
    var h = (data[i] / 255) * H * (1 + beat.decay * 0.2);
    ctx.fillStyle = data[i] > 200 ? colors.red : colors.accent;
    ctx.fillRect(i * bw + 1, H - h, bw - 2, h);
  }
};
```

That's a working preset. The full argument reference, advanced techniques, performance tips, and a ready-to-paste AI prompt block all live in **[VISUALIZERS.md](VISUALIZERS.md)**.

<br/>

## Render-function arguments

| Arg | Type | Description |
|-----|------|-------------|
| `ctx` | `CanvasRenderingContext2D` | Drawing context (Retina-scaled) |
| `data` | `Uint8Array` | Frequency bins (0-255) or waveform samples |
| `W`, `H` | `number` | Canvas size in CSS pixels |
| `colors` | `object` | Skin palette: `accent`, `dim`, `magenta`, `cyan`, `green`, `red`, `yellow`, `blue` |
| `beat` | `object` | `energy`, `peak`, `isBeat`, `decay` (0-1, smooth falloff) |
| `waveData` | `Uint8Array?` | Waveform data when `dataType` is `"both"` |

`beat.decay` is your best friend — it jumps to 1 on each beat and smoothly falls back to 0. Multiply it into sizes, alphas, and blur radii for buttery pulsing:

```js
var lineWidth = 1.5 + beat.decay * 2;       // Thickens on beat
ctx.shadowBlur  = beat.decay * 10;           // Glow pulses
var scale       = 1 + beat.decay * 0.15;    // Subtle size pulse
```

<br/>

## Generate one with AI

Point Claude, ChatGPT, Codex, or any LLM at **[VISUALIZERS.md](VISUALIZERS.md)** — it includes a complete prompt block in the *"For AI-Generated Presets"* section with the full render-function spec and the most common pitfalls AI tools hit.

<br/>

## Contribute a preset

1. **Fork** this repo
2. Create `visualizers/your-preset-id/` with `preset.json` + `renderer.js`
3. Test it against a few skins (light + dark palettes)
4. Run through the checklist in **[CONTRIBUTING.md](CONTRIBUTING.md)**
5. **[Open a PR](../../pulls)** — we review weekly

Merged presets ship in the next Moltamp release and appear in the in-app visualizer dropdown plus **[moltamp.com/community](https://moltamp.com/community)**.

<br/>

## License

[MIT](LICENSE) — use, fork, remix, ship. Attribution appreciated but not required.

<br/>

<div align="center">

<a href="https://moltamp.com">
  <img src=".github/assets/logo.png" alt="Moltamp" width="32"/>
</a>

<br/>

<sub>Made for the community by <a href="https://moltamp.com">Moltamp</a></sub>

</div>

<!-- repo topics: moltamp, claude-code, claude-code-visualizer, ai-terminal, audio-visualizer, canvas2d, music-visualizer, electron, vibe-coding, codex-cli, gemini-cli, aider, developer-tools, beat-detection -->
