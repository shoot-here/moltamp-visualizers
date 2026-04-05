// @moltamp-visualizer: Circle
// Radial bars from center with gradient fill and beat wobble.

function hexToRgba(hex, alpha) {
  if (hex.startsWith("var(") || hex.startsWith("color-mix")) return hex;
  var r = parseInt(hex.slice(1, 3), 16) || 0;
  var g = parseInt(hex.slice(3, 5), 16) || 0;
  var b = parseInt(hex.slice(5, 7), 16) || 0;
  return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
}

module.exports = function(ctx, data, W, H, colors, beat) {
  var cx = W / 2;
  var cy = H / 2;
  var baseRadius = Math.min(W, H) * 0.2 + beat.decay * 4;
  var maxSpike = Math.min(W, H) * 0.22;
  ctx.beginPath();
  ctx.arc(cx, cy, baseRadius * 0.35, 0, Math.PI * 2);
  var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 0.35);
  grad.addColorStop(0, hexToRgba(colors.accent, 0.3 + beat.decay * 0.2));
  grad.addColorStop(1, hexToRgba(colors.accent, 0));
  ctx.fillStyle = grad;
  ctx.fill();
  var slices = Math.min(data.length, 64);
  ctx.beginPath();
  for (var i = 0; i <= slices; i++) {
    var angle = (i / slices) * Math.PI * 2 - Math.PI / 2;
    var val = (data[i % slices] || 0) / 255;
    var r = baseRadius + val * maxSpike;
    var x = cx + Math.cos(angle) * r;
    var y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = colors.cyan;
  ctx.lineWidth = 1;
  ctx.shadowColor = colors.cyan;
  ctx.shadowBlur = beat.decay * 6;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = colors.magenta;
  ctx.globalAlpha = 0.08;
  ctx.fill();
  ctx.globalAlpha = 1;
};
