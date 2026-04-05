// @moltamp-visualizer: Spectrum
// Rainbow frequency bars split at midline.

module.exports = function(ctx, data, W, H, colors, beat) {
  var barCount = Math.min(data.length, 80);
  var barWidth = W / barCount;
  var gap = 1;
  var midY = H / 2;
  var beatScale = 1 + beat.decay * 0.1;
  for (var i = 0; i < barCount; i++) {
    var val = (data[i] / 255) * beatScale;
    var barH = Math.min(val * midY, midY);
    var x = i * barWidth;
    var ratio = i / barCount;
    if (ratio < 0.2) ctx.fillStyle = colors.blue;
    else if (ratio < 0.4) ctx.fillStyle = colors.cyan;
    else if (ratio < 0.6) ctx.fillStyle = colors.green;
    else if (ratio < 0.8) ctx.fillStyle = colors.yellow;
    else ctx.fillStyle = colors.red;
    ctx.globalAlpha = 0.75;
    ctx.fillRect(x + gap / 2, midY - barH, barWidth - gap, barH);
    ctx.globalAlpha = 0.35;
    ctx.fillRect(x + gap / 2, midY, barWidth - gap, barH);
  }
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = colors.accent;
  ctx.fillRect(0, midY - 0.5, W, 1);
  ctx.globalAlpha = 1;
};
