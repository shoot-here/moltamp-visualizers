// @moltamp-visualizer: Bars
// Classic frequency bars with beat scaling and accent peaks.

module.exports = function(ctx, data, W, H, colors, beat) {
  var barCount = Math.min(data.length, 64);
  var barWidth = W / barCount;
  var gap = 1;
  var beatScale = 1 + beat.decay * 0.15;

  for (var i = 0; i < barCount; i++) {
    var val = data[i] / 255;
    var barH = val * H * beatScale;
    var x = i * barWidth;
    if (val > 0.8) ctx.fillStyle = colors.red;
    else if (val > 0.5) ctx.fillStyle = colors.magenta;
    else ctx.fillStyle = colors.accent;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(x + gap / 2, H - Math.min(barH, H), barWidth - gap, Math.min(barH, H));
    if (val > 0.1) {
      ctx.fillStyle = colors.accent;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(x + gap / 2, H - Math.min(barH, H) - 2, barWidth - gap, 2);
    }
  }
  ctx.globalAlpha = 1;
};
