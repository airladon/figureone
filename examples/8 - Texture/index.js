const diagram = new Fig.Diagram();
const { Point, Rect } = Fig;

const line = [
    // new Point(0.5, 0),
    // new Point(0, 0.5),
    // new Point(-0.5, 0),
    // new Point(0, 1),
    new Point(-1, -1),
    new Point(-1, 1),
    new Point(1, 1),
    new Point(1, -1),
];

diagram.addElement(
  // {
  //   name: 'p',
  //   method: 'polygon',
  //   options: {
  //     sides: 8,
  //     width: 0.05,
  //     radius: 0.9,
  //     fill: true,
  //     position: [0, 0],
  //     textureLocation: 'http://localhost:8000/texture.jpg',
  //   },
  // },
  {
    name: 'p1',
    method: 'shapes.polyline',
    options: {
      points: line,
      width: 0.9,
      pointsAt: 'outside',
      close: true,
      textureLocation: 'http://localhost:8000/texture.jpg',
      textureVertexSpace: new Rect(-0.5, -0.5, 1, 1),
    },
  },
);