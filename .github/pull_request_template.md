## Preset

- **Name:**
- **ID:**
- **New preset** or **update to existing**?

## Preview

<!-- Attach a screenshot or screen recording showing the preset in MOLTamp -->

## What it does

<!-- Brief description — visual style, what data it reacts to, any special techniques -->

## Checklist

- [ ] `preset.json` has valid `id` and `name`
- [ ] `renderer.js` exports via `module.exports`
- [ ] Uses `colors.*` instead of hardcoded hex values
- [ ] Resets `globalAlpha` and `shadowBlur` at end of render
- [ ] Loops are capped (`Math.min(data.length, N)`)
- [ ] No DOM access, no `require`, no `import`
- [ ] No unbounded state (arrays/objects growing each frame)
- [ ] Runs at 60fps without jank
- [ ] Tested with multiple skins (light and dark)
