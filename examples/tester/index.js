const diagram = new Fig.Diagram({ limits: [-1, -1, 2, 2 ]});

// const f1 = {
//   family: 'Times New Roman',
//   color: [1, 0, 0, 1],
//   style: 'normal',
//   size: 0.2,
// };
// const f2 = {
//   family: 'Times New Roman',
//   color: [0, 1, 0, 1],
//   style: 'italic',
//   size: 0.2,
//   weight: 'bold',
// }
// const f3 = {
//   family: 'Times New Roman',
//   color: [0, 1, 0, 1],
//   style: 'italic',
//   size: 0.08,
//   weight: 'bold',
// }
// console.log(new Fig.Transform().scale(2, 2).translate(0.5, 0).matrix())
// console.log(new Fig.Transform().translate(0.5, 0).scale(2, 2).matrix())
// diagram.addElements([
//   {
//     name: 'tester',
//     method: 'text',
//     options: {
//       text: [
//         'hello',
//         ['MM', { font: f2 }],
//         ['2', { offset: [0, -0.02], font: f3 }],
//         ['2', { offset: [-0.02, 0.1], font: f3 }],
//         ' M',
//         ['dg', { font: { weight: 'bolder' }, location: [0, -0.2] }],
//       ],
//       font: f1,
//       position: [-0.5, -0.5],
//       xAlign: 'left',
//       yAlign: 'baseline',
//       color: [0, 0, 1, 1],
//     },
//   },
//   // {
//   //   name: 'angle',
//   //   method: 'angle',
//   //   options: {
//   //     angle: 1,
//   //     curve: {
//   //       width: 0.01,
//   //       radius: 0.5,
//   //       sides: 400,
//   //     },
//   //     label: {
//   //       // text: '60º'
//   //       text: null,
//   //       radius: 0.45,
//   //     },
//   //     sides: {
//   //       length: 1,
//   //     },
//   //     color: [0, 1, 0, 1],
//   //   },
//   // },
//   {
//     name: 'a',
//     method: 'polygon',
//     options: {
//       radius: 0.01,
//       width: 0.01,
//       sides: 10,
//       // transform: new Fig.Transform().scale(2, 2).translate(0.5, 0),
//     },
//   },
//   {
//     name: 'grid',
//     method: 'grid',
//     options: {
//       bounds: [-1, -1, 2, 2],
//       yStep: 0.1,
//       xStep: 0.1,
//       color: [0.2, 0.2, 0.2, 1],
//       width: 0.002,
//     },
//   },
//   {
//     name: 'gridMajor',
//     method: 'grid',
//     options: {
//       bounds: [-1, -1, 2, 2],
//       yStep: 0.5,
//       xStep: 0.5,
//       color: [0.5, 0.5, 0.5, 1],
//       width: 0.002,
//     },
//   },
//   {
//     name: 'eqn',
//     method: 'equation',
//     options: {
//       color: [0.95, 0.95, 0.6, 1],
//       position: [0.2, 0.2],
//       // font: { size: 0.8 },
//       // transform: [['s', 2], ['r', 1], ['t', [0, 0]]],
//       // scale: 2,
//       elements: {
//         v: { symbol: 'vinculum', color: [1, 0, 0, 1] },
//         arrow: {
//           symbol: 'arrow',
//           lineWidth: 0.01,
//           arrowWidth: 0.03,
//           arrowHeight: 0.04,
//           draw: 'dynamic',
//           direction: 'right',
//         },
//         equals: ' = ',
//         times: ' \u00D7 ', 
//         c: { color: [1, 0, 0, 1], font: { style: 'normal', size: 0.3 } },
//         _2_: { color: [0, 1, 0, 1] },
//       },

//       // Align all forms to the 'equals' diagram element
//       formDefaults: {
//         alignment: {
//           fixTo: 'equals',
//           xAlign: 'center',
//           yAlign: 'middle',
//         },
//         animation: {
//           translation: {
//             c: { style: 'curved', direction: 'up', mag: 0.5 },
//           },
//         },
//         elementMods: {
//           b: { color: [1, 0, 0, 1] }
//         },
//       },

//       phrases: {
//         'abc': ['a', 'b', 'c', '  ', '=', '  ', 'hello'],
//         p1: ['a', 'b'],
//         p2: { frac: ['p1', 'v', 'c'] }
//       },
//       // Define two different forms of the equation
//       forms: {
//         't': ['abc', 'equals'],
//         'a': ['a', 'equals', { frac: ['b', 'v', 'c'] }],
//         'b': {
//           content: ['b', 'equals', 'a', 'times', 'c'],
//           elementMods: {
//             b: { color: [0.5, 1, 0.5, 1] },
//           },
//           // Define how the 'c' element will move to this form
//           animation: {
//             translation: {
//               c: { style: 'curved', direction: 'up', mag: 1 },
//             },
//             // duration: 0.5,
//           },
//           scale: 2,
//         },
//         'c': {
//           content: ['c', 'times', 'a', 'equals', 'b'],
//           elementMods: {
//             b: { color: [0, 1, 1, 1] },
//           },
//           // Define how the 'c' element will move to this form
//           animation: {
//             translation: {
//               c: { style: 'curved', direction: 'down', mag: 0.5 },
//             },
//             // duration: 0.5,
//           },
//           fromForm: {
//             a: {
//               animation: {
//                 translation: {
//                   c: { style: 'curved', direction: 'down', mag: 5 },
//                 },
//               },
//             },
//           },
//         },
//         d: [{ bar: ['abc', 'arrow', 'top']}],
//         e: [{ bar: [['_2', 'a', '3_4_3'], 'arrow', 'top']}],
//         f: { frac: ['a', 'v', 'b'] },
//         g: ['_2', 'x'],
//         h: { frac: ['a', { v2: { symbol: 'vinculum', color: [0, 0, 1, 1] }}, '_2'] },
//       },
//     },
//   },
// ]);
// diagram.initialize();

// // diagram.elements._tester.animations.new()
// //   .translation({ target: [-0.5, 0], duration: 1 })
// //   .start();
// const eqn = diagram.getElement('eqn');

// // Show the equation form
// eqn.showForm('d');
// eqn.goToForm({ form: 'e', duration: 2, animate: 'move', delay: 1, });
// // diagram.animateNextFrame();

// const a = diagram.getElement('eqn.a');
// const b = diagram.getElement('eqn.b');
// const c = diagram.getElement('eqn.c');
// // Animate to the next form
// const goTo = (form) => {
//   console.log(form)
//   eqn.goToForm({
//     form, delay: 0.2, duration: 1.5, animate: 'move',
//   });
//   diagram.animateNextFrame();
// }

// a.makeTouchable();
// b.makeTouchable();
// c.makeTouchable();

// a.onClick = goTo.bind(eqn, 'a');
// b.onClick = goTo.bind(eqn, 'b');
// c.onClick = goTo.bind(eqn, 'c');
// // Queue drawing on the next animation frame
// diagram.animateNextFrame();

// // diagram.elements._tester.animations.new()
// //   .translation({ target: [-0.5, -0.5 ], duration: 2 })
// //   .start();

// diagram.elements._tester.onClick = () => { console.log(1) };
// diagram.elements._tester.makeTouchable();
// // diagram.elements._tester.setColor([0, 1, 1, 1]);



// console.log(diagram.elements._a)
// ctx = diagram.draw2DLow.ctx
// // ctx.save()
// // ctx.font = 'italic 80px "Times New Roman"'
// // ctx.textBaseline = 'middle'
// // ctx.fillStyle = "#FF0000FF"
// // ctx.fillText('A',400, 400)
// // ctx.scale(2, 2);
// // ctx.font = 'italic 40px "Times New Roman"'
// // ctx.fillText('y',200, 200)
// // ctx.restore();
// // ctx.save();
// // ctx.fillStyle = "#FFFF00FF"
// // ctx.textBaseline = 'middle'
// // ctx.translate(400, 400)
// // ctx.scale(800 / 100, 800 / 100)
// // ctx.font = 'italic 10px "Times New Roman"'
// // ctx.fillText('y', 10, 0)
// // ctx.restore();

// ctx.save()
// ctx.font = 'italic 100.5px "Times New Roman"'
// ctx.textBaseline = 'middle'
// ctx.fillStyle = "#FF0000FF"
// ctx.translate(400, 400);
// ctx.fillText('A', -300, 0)
// ctx.scale(2, 2);
// ctx.fillStyle = "#FF00FFFF"
// ctx.font = 'italic 50.25px "Times New Roman"'
// ctx.fillText('A', -150, 0)
// // ctx.restore();
// // ctx.save();
// // ctx.fillStyle = "#FFFF00FF"
// // ctx.textBaseline = 'middle'
// // ctx.translate(400, 400)
// // ctx.scale(800 / 100, 800 / 100)
// // ctx.font = 'italic 10px "Times New Roman"'
// // ctx.fillText('y', 10, 0)
// // ctx.restore();

eqn = new Fig.Equation(diagram.shapes, { color: [0, 1, 0, 1] });
const e = eqn.eqn.functions;
const matrix = e.matrix.bind(e);
const elements = {
  a: 'a',
  b: 'b',
  c: 'c',
  d: 'd',
  left: {
    symbol: 'bracket', side: 'left', lineWidth: 0.012, width: 0.03,
  },
  right: {
    symbol: 'bracket', side: 'right', lineWidth: 0.012, width: 0.03,
  },
};
eqn.addElements(elements);
eqn.addForms({
  base: {
    content: ['m = ', {
      matrix: {
        content: ['asdf', 'b', 'c', { frac: ['d', 'vinculum', { frac: ['e', 'v1_vinculum', 'f', 1.2] } ] }],
        left: 'left',
        right: 'right',
        order: [2, 2],
        scale: 1,
        fit: 'max',
        space: [0.1, 0.1],
        yAlign: 'middle',
        brac: { insideSpace: 0.1 },
        scale: 0.7,
      },
    }],
    scale: 1,
    alignment: {
      xAlign: 'center',
    },
  },
  // rowVector: {
  //   content: matrix([
  //     [1, 4], 'left', ['a', 'b', 'c', 'd'], 'right',
  //     1, 'min', [0.1, 0.1], 'baseline', { insideSpace: 0.1 },
  //   ]),
  //   scale: 1,
  // },
  // columnVector: {
  //   content: matrix([
  //     [4, 1], 'left', ['a', 'b', 'c', 'd'], 'right',
  //     1, 'min', [0.1, 0.1], 'baseline', { insideSpace: 0.1 },
  //   ]),
  //   scale: 1,
  // },
  // scale: {
  //   content: matrix([
  //     [2, 2], 'left', ['a', 'b', 'c', 'd'], 'right',
  //     0.5, 'min', [0.1, 0.1], 'baseline', { insideSpace: 0.1 },
  //   ]),
  //   scale: 1,
  // },
  // fit: {
  //   content: matrix([
  //     [2, 2], 'left', ['a', 'b', 'c', { frac: ['d', 'vinculum', 'e'] }], 'right',
  //     1, 'max', [0.1, 0.1], 'baseline', { insideSpace: 0.1 },
  //   ]),
  //   scale: 1,
  // },
  // space: {
  //   content: matrix([
  //     [2, 2], 'left', ['a', 'b', 'c', 'd'], 'right',
  //     1, 'min', [0.2, 0.3], 'baseline', { insideSpace: 0.1 },
  //   ]),
  //   scale: 1,
  // },
  // yAlign: {
  //   content: matrix([
  //     [2, 2], 'left', ['a', 'b', 'c', 'd'], 'right',
  //     1, 'min', [0.1, 0.1], 'middle', { insideSpace: 0.1 },
  //   ]),
  //   scale: 1,
  // },
});
eqn.showForm('base')
diagram.elements = eqn;
diagram.setFirstTransform();