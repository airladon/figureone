// Create diagram
const diagram = new Fig.Diagram();
const { Point } = Fig;
const { thickenCorner, thickenLine } = Fig.tools.g2;

const line = [
  new Point(1.5, 0),
  new Point(0.75, 0.05),
  new Point(0, 0),
];
// const thickLine = [
//   new Point(1, 0),
//   new Point(1, 0.1),
//   ...thickenCorner(line[0], line[1], line[2], 0.1),
//   new Point(0, 1),
//   new Point(0.1, 1),
// ];

// console.log(thickLine)
// Add elements to the diagram
// console.log(thickenLine(line, 0.06, false, 'mid'))
diagram.addElements([
  {
    name: 'r',
    method: 'shapes.generic',
    options: {
      points: thickenLine(line, 0.06, true, 'inside'),
      drawType: 'strip',
      position: [-0.7, -0.5],
    },
  },
  {
    name: 'pad',
    method: 'polygon',
    options: {
      radius: 0.2,
      color: [0.5, 0.5, 0.5, 0.5],
      sides: 100,
      fill: true,
    },
  },
  {
    name: 'x',
    method: 'line',
    options: {
      p1: [-1, -0.5],
      p2: [1, -0.5],
      width: 0.005,
      color: [0.5, 0.5, 0.5, 0.5],
    }
  },
  {
    name: 'x2',
    method: 'line',
    options: {
      p1: [-1, -0.44],
      p2: [1, -0.44],
      width: 0.005,
      color: [0.5, 0.5, 0.5, 0.5],
    }
  },
  {
    name: 'x3',
    method: 'line',
    options: {
      p1: [-1, -0.3],
      p2: [1, -0.3],
      width: 0.005,
      color: [0.5, 0.5, 0.5, 0.5],
    }
  }
]);

// Show the equation form
// diagram.getElement('eqn').showForm('base');
console.log(diagram.getElement('r'))
const pad = diagram.getElement('pad');
pad.setMovable();
pad.setTransformCallback = () => {
  const p = pad.getPosition().sub(-0.7, -0.5);
  line[1] = p._dup();
  const r = diagram.getElement('r');
  const thick = thickenLine(line, 0.02, true, 'mid');
  // console.log(thick)
  r.drawingObject.change(thick);
  diagram.animateNextFrame();
}
diagram.initialize();
