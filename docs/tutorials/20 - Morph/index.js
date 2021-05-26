/* globals Fig */
const figure = new Fig.Figure();

// Helper functions that can create point fields
const { polylineToShapes, getPolygonCorners, pointsToShapes } = Fig.tools.morph;

// Helper function to make a range of values
const { range } = Fig.tools.math;

// Number of points - each point will define a square of six vertices
const n = 500;

// Generate a line of points along a sinc function
const sinc = (xIn, a, b) => {
  const x = xIn === 0 ? 0.00001 : xIn;
  return a * Math.sin(b * x) / (b * x);
};

// Generate sinc trace
const xValues = range(-0.8, 0.8, 0.01);
const [sincPoints] = polylineToShapes({
  polyline: xValues.map(x => [x, sinc(x, 0.6, 20)]),
  num: n,
  size: 0.04,
  shape: 15,
});

// Generate a line of points along a square
const [squarePoints] = polylineToShapes({
  polyline: [[0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5], [0.5, -0.5]],
  num: n,
  size: 0.04,
  close: true,
  shape: 15,
});

// Generate a line of points along a circle
const [circlePoints] = polylineToShapes({
  polyline: getPolygonCorners({ radius: 0.5, sides: 50, rotation: Math.PI / 4 }),
  num: n,
  size: 0.04,
  close: true,
  shape: 15,
});

const morpher = figure.add({
  make: 'morph',
  names: ['sinc', 'square', 'circle'],
  points: [sincPoints, squarePoints, circlePoints],
  color: [1, 0, 0, 1],
  position: [0, 0],
});

// Animate morph
morpher.animations.new()
  .delay(1)
  .morph({ start: 'sinc', target: 'square', duration: 5 })
  .morph({ start: 'square', target: 'circle', duration: 2 })
  .start();

figure.addFrameRate(10);
