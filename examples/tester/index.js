const diagram = new Fig.Diagram({ limits: [-3, -3, 6, 6]});

 // Grid of triangles
diagram.addElement({
  name: 'r',
  method: 'rectangle',
  options: {
    width: 0.5,
    height: 0.5,
    line: {
      width: 0.03,
    },
    copy: {
      along: 'rotation',
      num: 3,
      step: Math.PI / 2 / 3
    },
  },
});

// diagram.initialize();

// diagram.elements.hasTouchableElements = true;

// const p = diagram.getElement('p')
// const rotation = new Fig.Transform().rotate(Math.PI / 2);
// const translation = new Fig.Transform().translate(0.5, 0);
// const t = translation.transformBy(rotation)
// p.transform = t;

// const translate = p.animations.position({ target: [0.5, 0], duration: 2 });
// const rotate = p.animations.rotation({ target: Math.PI, duration: 2 });
// p.animations.new()
//   .translation({ target: [0.5, 0], duration: 2 })
//   .rotation({ target: Math.PI, duration: 2 })
//   .start();

// diagram.animateNextFrame();

// diagram.addElements([
//   // {
//   //   name: 'a',
//   //   method: 'polygon',
//   //   options: {
//   //     radius: 0.01,
//   //     width: 0.01,
//   //     sides: 10,
//   //     color: [0.7, 0.7, 0.7, 1]
//   //   },
//   // },
//   {
//     name: 'grid',
//     method: 'grid',
//     options: {
//       bounds: [-1, -1, 2, 2],
//       yStep: 0.1,
//       xStep: 0.1,
//       color: [0.7, 0.7, 0.7, 1],
//       width: 0.0005,
//     },
//   },
//   {
//     name: 'gridMajor',
//     method: 'grid',
//     options: {
//       bounds: [-1, -1, 2, 2],
//       yStep: 0.5,
//       xStep: 0.5,
//       color: [0.8, 0.8, 0.8, 1],
//       width: 0.002,
//     },
//   },
//   // {
//   //   name: 'm',
//   //   method: 'polygon',
//   //   options: {
//   //     sides: 5,
//   //     radius: 0.2,
//   //     fill: true,
//   //   },
//   // },
//   // {
//   //   name: 'n',
//   //   method: 'polygon',
//   //   options: {
//   //     sides: 3,
//   //     radius: 0.2,
//   //     fill: true,
//   //   },
//   // }
// ]);
// // diagram.initialize();
// // const m = diagram.getElement('m');
// // const n = diagram.getElement('n');

// // m.animations.new()
// //   .translation({ target: [-0.5, 0.5], duration: 1 })
// //   .then(n.animations.rotation({ target: 2, duration: 1 }))
// //   .then(n.animations.builder()
// //     .translation({ target: [0.5, -0.5], duration: 1})
// //     .rotation({ target: -2, duration: 1, direction: 2 })
// //   )
// //   .start();


// diagram.animateNextFrame();
