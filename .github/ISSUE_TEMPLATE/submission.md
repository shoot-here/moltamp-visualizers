---
name: Preset Submission
about: Submit a new community visualizer preset
title: "[PRESET] "
labels: preset-submission
---

## Preset Info

- **Name:**
- **ID:** (alphanumeric + hyphens)
- **Author:**
- **dataType:** (frequency / waveform / both)
- **Description:**

## Preview

<!-- Attach a screenshot or screen recording showing the preset in action -->

## Checklist

- [ ] `preset.json` has valid `id` and `name`
- [ ] `renderer.js` exports via `module.exports`
- [ ] Uses `colors.*` from skin palette — no hardcoded hex
- [ ] Resets `globalAlpha` and `shadowBlur` at end of render
- [ ] Loops are capped (`Math.min(data.length, N)`)
- [ ] No DOM access, no `require`, no `import`
- [ ] No unbounded state accumulation
- [ ] Runs at 60fps without visible jank
- [ ] Tested with at least 2 different skins

## Notes

<!-- Anything else — inspiration, techniques used, special features, etc. -->
