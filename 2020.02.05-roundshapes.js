const canvasSketch = require("canvas-sketch");
const p5 = require("p5");
const isec = require("@thi.ng/geom-isec");
const { pathsToSVG } = require("canvas-sketch-util/penplot");
const { centroid: centroidFunc } = require("@thi.ng/geom-poly-utils");
const vec = require("@thi.ng/vectors");
const {
  gridCallback,
  sqGridPaddingCallback,
} = require("./formatting-callbacks.js");

const preload = (p5) => {
  // You can use p5.loadImage() here, etc...
};
const sin = Math.sin;
const cos = Math.cos;
const polylines = [];

const settings = {
  // Pass the p5 instance, and preload function if necessary
  p5: { p5, preload },
  pixelsPerInch: 300,
  // Turn on a render loop
  dimensions: "Letter",
  bleed: 25,
  animate: false,
};
let width = 0;
let height = 0;
let boxes = [];

canvasSketch(({ p5, width: w, height: h }) => {
  // Return a renderer, which is like p5.js 'draw' function
  width = w;
  height = h;
  setup(p5);
  return ({ p5, time }) => {
    // Draw with p5.js things
    draw(p5);
    return [
      p5.canvas,
      {
        data: pathsToSVG(polylines, {
          width,
          height,
          units: "px",
        }),
        extension: ".svg",
      },
    ];
  };
}, settings);

const bounds = (ptArray) => {
  const min = {
    x: Number.MAX_SAFE_INTEGER,
    y: Number.MAX_SAFE_INTEGER,
  };
  const max = {
    x: -1 * Number.MAX_SAFE_INTEGER,
    y: -1 * Number.MAX_SAFE_INTEGER,
  };
  ptArray.forEach((pt) => {
    if (pt[0] < min.x) min.x = pt[0];
    if (pt[0] > max.x) max.x = pt[0];
    if (pt[1] < min.y) min.y = pt[1];
    if (pt[1] > max.y) max.y = pt[1];
  });
  return {
    min,
    max,
  };
};

function random(...args) {
  let lower, upper;
  if (args.length >= 2) {
    lower = args[0];
    upper = args[1];
  } else if (args.length === 0) {
    lower = 0;
    upper = args[0];
  } else {
    lower = 0;
    upper = 1;
  }
  return lower + (upper - lower) * Math.random();
}

function randomVectorInBoxWithMargin(x, y, width, height, marginX, marginY) {
  return [
    random(x + marginX, x + marginX + width),
    random(y + marginY, y + marginY + height),
  ];
}

const numBoxes = 20;

function setup(p5) {
  p5.background(255);
  let z = 0;
  sqGridPaddingCallback(
    200,
    (height - width) * 0.5,
    width - 200,
    15,
    0
  )((gx, gy, xSize, ySize) => {
    boxes.push(
      getBlobShape(
        gx,
        gy,
        xSize / 2.0,
        ySize / 2.0,
        4,
        Math.PI * 5 * p5.noise((gx / width) * 1.5, (gy / width) * 1.5),
        10 * p5.noise((gx / width) * 1.5, (gy / width) * 1.5),
        p5.noise
      )
    );
    z += 0.05;
  });
}
function draw(p5) {
  boxes.forEach((box) => {
    box.draw(p5);
    polylines.push(box.getFillLines(box.lineFillSpacing, box.angle, p5));
  });
}

function drawShapeOutline(p5, shape) {
  p5.beginShape();
  shape.forEach((pt) => {
    p5.vertex(pt[0], pt[1]);
  });
  p5.endShape();
}

function drawShapeFillLines(p5, lines) {
  p5.strokeWeight(1);
  lines.forEach((ln) => {
    if (ln[0] && ln[1]) p5.line(ln[0][0], ln[0][1], ln[1][0], ln[1][1]);
    else console.log(ln);
  });
}
class Shape {
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
    const shapeBounds = bounds(transformedShape);
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
      lines.push(intersection.isec);
      // }
      rpos[1] = i;
    }
    // drawShapeOutline(p5, transformedShape);
    // drawShapeFillLines(p5, lines);
    return this.getRevertedLines(lines, angle);
  }

  drawOutline(p5) {
    p5.stroke(0);
    p5.strokeWeight(2);
    drawShapeOutline(p5, this.path);
  }

  drawFill(p5) {
    const lines = this.getFillLines(this.lineFillSpacing, this.angle, p5);
    p5.strokeWeight(1);
    drawShapeFillLines(p5, lines);
  }

  draw(p5) {
    // this.drawOutline(p5);
    this.drawFill(p5);
  }
}

function getEllipsoidShape(
  centerX,
  centerY,
  radiusX,
  radiusY,
  numPoints,
  angle,
  lineFillSpacing
) {
  const path = [];
  const angleStep = (Math.PI * 2) / numPoints;
  for (let i = 0; i < numPoints; i++) {
    path.push([
      centerX + Math.cos(angleStep * i) * radiusX,
      centerY + Math.sin(angleStep * i) * radiusY,
    ]);
  }
  return new Shape(path, angle, lineFillSpacing);
}

function getBlobShape(
  centerX,
  centerY,
  radiusX,
  radiusY,
  numPoints,
  angle,
  lineFillSpacing,
  noise
) {
  const path = [];
  const angleStep = (Math.PI * 2) / numPoints;
  const sizeMult = 3;
  for (let i = 0; i < numPoints; i++) {
    let currAngle = angleStep * i;
    path.push([
      centerX +
        Math.cos(currAngle) *
          radiusX *
          sizeMult *
          noise(cos(currAngle) + centerX, sin(currAngle) + centerY),
      centerY +
        Math.sin(currAngle) *
          radiusY *
          sizeMult *
          noise(cos(currAngle) + centerX, sin(currAngle) + centerY),
    ]);
  }
  return new Shape(path, angle, lineFillSpacing);
}
