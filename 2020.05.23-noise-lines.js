const canvasSketch = require("canvas-sketch");
const p5 = require("p5");
const { pathsToSVG } = require("canvas-sketch-util/penplot");
const { CPTrail } = require("./ribbon");
const { Shape, FixedShape } = require("./shape");
const { getCoordBounds, random } = require("./calc-utils");
const { drawShapeOutline, drawShapeFillLines } = require("./draw-utils");
const { curlNoise, vecFromNoise } = require("../utils/noise-utils");
const vec = require("@thi.ng/vectors");
const isec = require("@thi.ng/geom-isec");
const {
  gridCallback,
  sqGridPaddingCallback,
} = require("./formatting-callbacks.js");

Vector = null;
const preload = (p) => {
  // You can use p5.loadImage() here, etc...
  Vector = p5.Vector;
};
sin = Math.sin;
cos = Math.cos;
let polylines = [];

const settings = {
  // Pass the p5 instance, and preload function if necessary
  p5: { p5, preload },
  pixelsPerInch: 300,
  // Turn on a render loop
  dimensions: "Letter",
  bleed: 25,
  animate: false,
};
width = 0;
height = 0;
let shapes = [];

canvasSketch(({ p5, width: w, height: h }) => {
  // Return a renderer, which is like p5.js 'draw' function
  width = w;
  height = h;
  setup(p5);
  return ({ p5, time }) => {
    // Draw with p5.js things
    polylines = [];
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
const numShapes = 1;

function setup(p5) {
  p5.background(255);
  let z = 0;
  for (let i = 0; i < numShapes; i++) {
    shapes.push(
      ...noiseLinesShapesInBox(
        p5,
        p5.createVector(width * 0.5 - 800, height * 0.5 - 800),
        p5.createVector(width * 0.5 + 800, height * 0.5 + 800),
        100
      )
    );
    z += 0.05;
  }
}

const getNoiseLineAcross = ({
  yPos,
  xStart,
  xEnd,
  numPoints = 600,
  noiseVecFunc = (_, x, y) => [x, y],
}) => {
  const polyline = [];
  const ptSpacing = (xEnd - xStart) / (numPoints * 1.0);
  for (let i = 0; i < numPoints; i++) {
    let origX = xStart + ptSpacing * i;
    let origY = yPos;
    polyline.push(noiseVecFunc(i, origX, origY));
  }
  return polyline;
};

function spaceBetweenNoiseLines(p5, yPos = height / 2, spacing = 200) {
  const polyline = [];
  const numPoints = 500;
  const xStart = 100;
  const xEnd = width - 100;
  polyline.push(
    ...getNoiseLineAcross({
      yPos: yPos + spacing * 0.5,
      xStart,
      xEnd,
      numPoints,
      noiseVecFunc: (i, x, y) => {
        let loc = p5.createVector(x, y);
        for (let j = 0; j < 50; j++) {
          loc.add(vecFromNoise(loc.x, loc.y, p5));
        }
        for (let j = 0; j < 10; j++) {
          loc.add(curlNoise(loc.x, loc.y, p5));
        }
        return [
          x +
            (loc.x - x) *
              (0.5 +
                0.5 *
                  sin(p5.map(i, 0, numPoints, -Math.PI / 2, 1.5 * Math.PI))),
          loc.y,
        ];
      },
    })
  );
  polyline.push(
    ...getNoiseLineAcross({
      yPos: yPos - spacing * 0.5,
      xStart,
      xEnd,
      numPoints,
      noiseVecFunc: (i, x, y) => {
        let loc = p5.createVector(x, y);
        for (let j = 0; j < 50; j++) {
          loc.add(vecFromNoise(loc.x, loc.y, p5));
        }
        for (let j = 0; j < 10; j++) {
          loc.add(curlNoise(loc.x, loc.y, p5));
        }
        return [
          x +
            (loc.x - x) *
              (0.5 +
                0.5 *
                  sin(p5.map(i, 0, numPoints, -Math.PI / 2, 1.5 * Math.PI))),
          loc.y,
        ];
      },
    }).reverse()
  );
  return new FixedShape(polyline, random(360), 5);
}

const noiseLinesShapesInBox = (p5, startLoc, endLoc, spacing = 50) => {
  const lines = [];
  const h = endLoc.y - startLoc.y;
  const numLines = h / spacing;
  console.log(numLines, h, spacing);
  const numPoints = 1000;
  for (let row = 1; row < numLines; row++) {
    const yPos = startLoc.y + row * spacing;
    lines.push(
      getNoiseLineAcross({
        yPos,
        xStart: startLoc.x,
        xEnd: endLoc.x,
        numPoints,
        noiseVecFunc: (i, x, y) => {
          let loc = p5.createVector(x, y + row * 0.3);
          for (let j = 0; j < 60; j++) {
            loc.add(vecFromNoise(loc.x, loc.y, p5));
          }
          for (let j = 0; j < 15; j++) {
            loc.add(curlNoise(loc.x, loc.y, p5, 500));
          }
          return [
            x +
              (loc.x - x) *
                (0.5 +
                  0.5 *
                    Math.sin(
                      p5.map(i, 0, numPoints, -Math.PI / 2, 1.5 * Math.PI)
                    )),
            Math.min(Math.max(loc.y, startLoc.y), endLoc.y),
          ];
        },
      })
    );
  }
  const shapes = [];
  for (let i = 0; i < lines.length - 1; i++) {
    const shapeOutline = [];
    const l1 = lines[i];
    shapeOutline.push(...l1);
    const l2 = lines[i + 1];
    shapeOutline.push(...[...l2].reverse());
    shapes.push(new FixedShape(shapeOutline, random(360), 6));
  }
  return shapes;
};

function draw(p5) {
  shapes.forEach((box) => {
    box.draw(p5);
    polylines.push(box.getFillLines(box.lineFillSpacing, box.angle, p5));
  });
}
