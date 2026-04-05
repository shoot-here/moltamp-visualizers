// @moltamp-visualizer: Wave
// Dual waveform — cyan top, green bottom with glow on beat.

module.exports = function(ctx, data, W, H, colors, beat) {
  var lineWidth = 1.5 + beat.decay * 1.5;
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = colors.cyan;
  ctx.shadowColor = colors.cyan;
  ctx.shadowBlur = beat.decay * 8;
  ctx.beginPath();
  var step = W / data.length;
  for (var i = 0; i < data.length; i++) {
    var val = data[i] / 128.0;
    var y = (val * H) / 2;
    if (i === 0) ctx.moveTo(0, y); else ctx.lineTo(i * step, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = colors.green;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (var i = 0; i < data.length; i++) {
    var val = data[i] / 128.0;
    var y = H - (val * H) / 2;
    if (i === 0) ctx.moveTo(0, y); else ctx.lineTo(i * step, y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
};
