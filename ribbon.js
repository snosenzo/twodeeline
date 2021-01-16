export function connectCPs(cp1, cp2, p5) {
  p5.stroke(0);
  p5.strokeWeight(2);
  cp1.pts.forEach((pt1, index) => {
    var pt2 = cp2.pts[index];
    p5.line(pt1.x, pt1.y, pt2.x, pt2.y);
  });
}
export function getOuterMostConnections(cp1, cp2) {
  return [
    [
      [cp1.pts[0].x, cp1.pts[0].y],
      [cp2.pts[0].x, cp2.pts[0].y],
    ],
    [
      [cp1.pts[cp1.pts.length - 1].x, cp1.pts[cp1.pts.length - 1].y],
      [cp2.pts[cp2.pts.length - 1].x, cp2.pts[cp2.pts.length - 1].y],
    ],
  ];
}
export function getOutsidePoints(cp1) {
  return [
    [cp1.pts[0].x, cp1.pts[0].y],
    [cp1.pts[cp1.pts.length - 1].x, cp1.pts[cp1.pts.length - 1].y],
  ];
}

export function initCPs(p5, numCps = 30) {
  var cps = [];
  for (let i = 0; i < numCps; i++) {
    var cp = new ConnectPoint(
      p5.random(100, width - 100),
      p5.random(100, height - 100),
      0,
      p5
    );
    cps.push(cp);
  }
  return cps;
}

export class CPTrail {
  constructor(p5) {
    this.p5 = p5;
    this.cps = initCPs(p5);
    // this.cps.push(initCPs());
    this.target = this.newTarget();
    // this.maxLength = 10;
  }
  newTarget() {
    return this.p5.createVector(
      this.p5.random(100, width - 100),
      this.p5.random(100, height - 100)
    );
  }
  update() {
    var { cps } = this;
    this.steerTrails();
    // if (p5.Vector.sub(cps[cps.length - 1].loc, this.target).mag() < 3) {
    //   this.target = this.newTarget();
    // }
    this.target.x = width / 2;
    this.target.y = height / 2;
  }

  steerTrails() {
    var { cps, target } = this;
    for (let i = 0; i < cps.length; i++) {
      var cp = cps[i];
      if (i == cps.length - 1) {
        cp.seek(target);
      } else {
        cp.seek(cps[i + 1].loc);
        cp.rotTug(cps[i + 1]);
      }
      cp.update();
    }
  }
  getOutline() {
    const { cps } = this;
    const side1Path = [];
    const side2Path = [];
    for (let i = 0; i < cps.length; i++) {
      const [side1Point, side2Point] = getOutsidePoints(cps[i]);
      side1Path.push(side1Point);
      side2Path.push(side2Point);
    }
    side2Path.reverse();
    const allLines = [...side1Path, ...side2Path];
    // console.log(allLines);
    return allLines;
  }

  display(p5) {
    const { cps } = this;
    // cps.forEach(cp => {
    //   cp.display();
    // });
    for (let i = 1; i < cps.length; i++) {
      connectCPs(cps[i - 1], cps[i], p5);
    }
  }
}

export class ConnectPoint {
  constructor(x, y, dir, p5) {
    this.p5 = p5;
    this.loc = p5.createVector(x, y);
    this.vel = p5.createVector(0, 0);
    this.acc = p5.createVector(0, 0);
    this.maxForce = 0.2;
    this.maxSpeed = 5.0;
    this.dir = dir;
    this.spacing = 80; //Math.floor(random(1, 4));
    this.rotVel = p5.random(0.005, 0.013);
    this.pts = this.getPtsAroundCenter(x, y, dir, this.spacing);
  }
  getPtsAroundCenter(x, y, dir, spacing, numPtsPerConnect = 3) {
    var ptArray = [];
    ptArray.push(this.p5.createVector(x, y));
    for (let i = 1; i < numPtsPerConnect; i++) {
      ptArray.push(
        this.p5.createVector(
          x + Math.floor((i + 1) / 2) * spacing * cos(dir + Math.PI * (-1 * i)),
          y + Math.floor((i + 1) / 2) * spacing * sin(dir + Math.PI * (-1 * i))
        )
      );
    }
    return ptArray;
  }

  update() {
    var { loc, vel, acc, maxSpeed, spacing, rotVel } = this;
    vel.add(acc);
    vel.limit(maxSpeed);
    loc.add(vel);
    acc.mult(0);
    this.pts = this.getPtsAroundCenter(
      loc.x,
      loc.y,
      (this.dir += rotVel),
      spacing
    );
  }

  seek(target) {
    var { loc, vel, acc, maxSpeed, maxForce, p5 } = this;
    var desired = Vector.sub(target, loc);
    desired.normalize();
    desired.mult(maxSpeed);
    var steer = Vector.sub(desired, vel);
    steer.limit(maxForce);
    acc.add(steer);
  }

  rotTug(cp1) {
    var dirDiff = cp1.dir - this.dir;
    dirDiff = this.p5.map(dirDiff, -Math.PI * 2, Math.PI * 2, -0.001, 0.001);
    // dirDiff *= 0.004;
    this.rotVel += dirDiff;
    this.rotVel = Math.abs(this.rotVel) > 0.01 ? 0.01 : this.rotVel;
  }

  display() {
    // stroke(0, 20);
    // strokeWeight(0.3);
    // noFill();
    // ellipseMode(CENTER);
    // this.pts.forEach(pt => {
    //   this.p5.ellipse(pt.x, pt.y, 4, 4);
    // });
  }
}
