const canvasSketch = require("canvas-sketch");
const p5 = require("p5");
const { pathsToSVG } = require("canvas-sketch-util/penplot");
const { CPTrail } = require("./ribbon");
const { Shape } = require("./shape");
const { getCoordBounds } = require("./calc-utils");
const { drawShapeOutline, drawShapeFillLines } = require("./draw-utils");
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
      getRibbonShape(
        Math.PI * 5 * p5.noise((i / width) * 1.5, (i + 10 / width) * 1.5),
        2.2, //+ 8 * p5.noise((i / width) * 1.5, (i / width) * 1.5),
        p5
      )
    );
    z += 0.05;
  }
}

function draw(p5) {
  shapes.forEach((box) => {
    // box.drawOutline(p5);
    box.draw(p5);
    polylines.push(box.getFillLines(box.lineFillSpacing, box.angle, p5));
  });
}

function getRibbonShape(angle, lineFillSpacing, p5) {
  const cpt = new CPTrail(p5);
  const path = [];
  for (let i = 0; i < 15000; i++) {
    // console.log(i);
    cpt.update();
  }
  // cpt.display(p5);
  path.push(...cpt.getOutline());
  path.push(path[0]);
  return new FixedShape(path, angle, lineFillSpacing);
}
