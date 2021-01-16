export const getCoordBounds = (ptArray) => {
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

export const randomVectorInBoxWithMargin = (
  x,
  y,
  width,
  height,
  marginX,
  marginY
) => {
  return [
    random(x + marginX, x + marginX + width),
    random(y + marginY, y + marginY + height),
  ];
};

export function random(...args) {
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
