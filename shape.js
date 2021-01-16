const vec = require("@thi.ng/vectors");
const { centroid: centroidFunc } = require("@thi.ng/geom-poly-utils");
const { drawShapeFillLines, drawShapeOutline } = require("./draw-utils");
const { getCoordBounds } = require("./calc-utils");
const isec = require("@thi.ng/geom-isec");

export class Shape {
  constructor(customPath, angle = 0, spacing = 10) {
    this.path = customPath;
    this.centroid = this.calcCentroid();
    this.angle = angle;
    this.lineFillSpacing = spacing;
  }

  calcCentroid() {
    let centroid = [];
    if (this.path[0] === this.path[this.path.length - 1]) {
      centroid = centroidFunc(this.path.slice(0, -1));
    } else {
      centroid = centroidFunc(this.path);
    }
    return centroid;
  }

  updatePath(newPath) {
    this.path = [...newPath];
    this.centroid = this.calcCentroid();
  }

  getTransformedShape(angle) {
    return this.path.map((pt) => {
      let finPt = [];
      vec.sub(finPt, pt, this.centroid);
      vec.rotate(finPt, finPt, angle);
      return finPt;
    });
  }
  getRevertedLines(lines, angle, rotCenter) {
    return lines.map((pts) => {
      return pts.map((pt) => {
        let finPt = [0, 0];
        vec.rotate(finPt, pt, -angle);
        vec.add(finPt, this.centroid, finPt);
        return finPt;
      });
    });
  }

  getFillLines(spacing = 12, angle = 0, p5) {
    const lines = [];
    const transformedShape = this.getTransformedShape(angle);
    const shapeBounds = getCoordBounds(transformedShape);
    let dir = [1, 0];
    let rpos = [shapeBounds.min.x, shapeBounds.min.y];
    for (let i = rpos[1]; i < shapeBounds.max.y + spacing; i += spacing) {
      const intersection = isec.intersectRayPolylineAll(
        rpos,
        dir,
        transformedShape,
        true
      );
      if (!intersection.isec) continue;
      // for (let j = 0; j < intersection.isec.length; j += 2) {
      // console.log(intersection.isec);
      lines.push(intersection.isec.slice(0, 2));
      // }
      rpos[1] = i;
    }
    // drawShapeOutline(p5, transformedShape);
    // drawShapeFillLines(p5, lines);
    return this.getRevertedLines(lines, angle);
  }

  drawOutline(p5) {
    p5.stroke(0);
    p5.strokeWeight(0.5);
    drawShapeOutline(p5, this.path);
  }

  drawFill(p5) {
    const lines = this.getFillLines(this.lineFillSpacing, this.angle, p5);
    p5.strokeWeight(1);
    drawShapeFillLines(p5, lines);
  }

  draw(p5, showOutline = false) {
    if (showOutline) this.drawOutline(p5);
    this.drawFill(p5);
  }
}

export class FixedShape extends Shape {
  getFillLines(spacing = 12, angle = 0, p5) {
    const lines = [];
    const transformedShape = this.getTransformedShape(angle);
    const shapeBounds = getCoordBounds(transformedShape);
    let dir = [1, 0];
    let rpos = [shapeBounds.min.x, shapeBounds.min.y];
    for (let i = rpos[1]; i < shapeBounds.max.y + spacing; i += spacing) {
      const intersection = isec.intersectRayPolylineAll(
        rpos,
        dir,
        transformedShape,
        true
      );
      if (!intersection.isec) continue;
      for (let j = 0; j < intersection.isec.length; j += 2) {
        lines.push(intersection.isec.slice(j, j + 2));
      }
      rpos[1] = i;
    }
    return this.getRevertedLines(lines, angle);
  }
}
