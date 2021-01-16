export function drawShapeOutline(p5, shape) {
  p5.fill(0, 255, 0);
  p5.beginShape(p5.FILL);
  shape.forEach((pt) => {
    p5.vertex(pt[0], pt[1]);
  });
  p5.endShape();
}

export function drawShapeFillLines(p5, lines) {
  p5.strokeWeight(1);
  lines.forEach((ln) => {
    if (ln[0] && ln[1]) p5.line(ln[0][0], ln[0][1], ln[1][0], ln[1][1]);
    // else console.log(ln);
  });
}
