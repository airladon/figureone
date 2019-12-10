// import {
//   Point,
// } from '../../../../tools/g2';
import {
  round,
} from '../../../../tools/math';
import * as tools from '../../../../tools/tools';
import makeDiagram from '../../../../__mocks__/makeDiagram';
import { EquationNew } from '../Equation';

tools.isTouchDevice = jest.fn();

jest.mock('../../../Gesture');
jest.mock('../../../webgl/webgl');
jest.mock('../../../DrawContext2D');

describe('Equation Functions - Brackets', () => {
  let diagram;
  let eqn;
  let color1;
  let elements;
  let functions;
  // let forms;
  beforeEach(() => {
    diagram = makeDiagram();
    color1 = [0.95, 0, 0, 1];
    elements = {
      a: 'a',
      bar: {
        symbol: 'barNew', side: 'left', lineWidth: 0.01, endLength: 0.03,
      },
    };
    functions = {
      single: () => {
        eqn = new EquationNew(diagram.shapes, { color: color1 });
        const e = eqn.eqn.functions;
        const bar = e.bar.bind(e);
        eqn.addElements(elements);
        eqn.addForms({
          // Full Object
          0: {
            content: {
              bar: {
                content: 'a',
                symbol: 'bar',
                side: 'left',
              },
            },
          },
          // Method Object
          1: {
            bar: {
              content: 'a',
              symbol: 'bar',
              side: 'left',
            },
          },
          // Method Array
          2: { bar: ['a', 'bar'] },
          // Function with Method Array
          3: e.bar(['a', 'bar', 'left']),
          // Function with parameters
          4: e.bar('a', 'bar', 'left'),
          // Bound Function with parameters
          5: bar('a', 'bar', 'left'),
          // Bound Function with Object
          6: bar({
            content: 'a',
            symbol: 'bar',
            side: 'left',
          }),
        });
      },
      // parameterSteps: () => {
      //   eqn = new EquationNew(diagram.shapes, { color: color1 });
      //   const e = eqn.eqn.functions;
      //   const bracNew = e.bracNew.bind(e);
      //   eqn.addElements(elements);
      //   eqn.addForms({
      //     // without
      //     //   // Method Object
      //     base: {
      //       content: [
      //         {
      //           bracNew: {
      //             content: 'a',
      //             left: 'lb',
      //             right: 'rb',
      //             insideSpace: 0.1,
      //             outsideSpace: 0.1,
      //             topSpace: 0.1,
      //             bottomSpace: 0.1,
      //             minContentHeight: null,
      //             minContentDescent: null,
      //             height: null,
      //             descent: null,
      //             inSize: null,
      //           },
      //         },
      //         'b',
      //       ],
      //       scale: 1,
      //     },
      //     insideSpace: {
      //       content: [bracNew(
      //         'a', 'lb', 'rb', 0.2, 0.1, 0.1, 0.1, null, null, null, null, null,
      //       ), 'b'],
      //       scale: 1,
      //     },
      //     outsideSpace: {
      //       content: [bracNew(
      //         'a', 'lb', 'rb', 0.1, 0.2, 0.1, 0.1, null, null, null, null, null,
      //       ), 'b'],
      //       scale: 1,
      //     },
      //     topSpace: {
      //       content: [bracNew(
      //         'a', 'lb', 'rb', 0.1, 0.1, 0.2, 0.1, null, null, null, null, null,
      //       ), 'b'],
      //       scale: 1,
      //     },
      //     bottomSpace: {
      //       content: [bracNew(
      //         'a', 'lb', 'rb', 0.1, 0.1, 0.1, 0.2, null, null, null, null, null,
      //       ), 'b'],
      //       scale: 1,
      //     },
      //     minContentHeight: {
      //       content: [bracNew(
      //         'a', 'lb', 'rb', 0.1, 0.1, 0.1, 0.1, 1, null, null, null, null,
      //       ), 'b'],
      //       scale: 1,
      //     },
      //     minContentDescent: {
      //       content: [bracNew(
      //         'a', 'lb', 'rb', 0.1, 0.1, 0.1, 0.1, null, 1, null, null, null,
      //       ), 'b'],
      //       scale: 1,
      //     },
      //     minContentDescentWithSmallMinHeight: {
      //       content: [bracNew(
      //         'a', 'lb', 'rb', 0.1, 0.1, 0.1, 0.1, 0.1, 1, null, null, null,
      //       ), 'b'],
      //       scale: 1,
      //     },
      //     minContentDescentWithLargeMinHeight: {
      //       content: [bracNew(
      //         'a', 'lb', 'rb', 0.1, 0.1, 0.1, 0.1, 2, 1, null, null, null,
      //       ), 'b'],
      //       scale: 1,
      //     },
      //     forceDecentLessThanActualDescent: {
      //       content: [bracNew(
      //         'a', 'lb', 'rb', 0.1, 0.1, 0.1, 0.1, null, null, null, 0.004, null,
      //       ), 'b'],
      //       scale: 1,
      //     },
      //     forceDecentGreaterThanActualDescent: {
      //       content: [bracNew(
      //         'a', 'lb', 'rb', 0.1, 0.1, 0.1, 0.1, null, null, null, 0.1, null,
      //       ), 'b'],
      //       scale: 1,
      //     },
      //     forceHeightLessThanActualHeight: {
      //       content: [bracNew(
      //         'a', 'lb', 'rb', 0.1, 0.1, 0.1, 0.1, null, null, 0.05, null, null,
      //       ), 'b'],
      //       scale: 1,
      //     },
      //     forceHeightGreaterThanActualHeight: {
      //       content: [bracNew(
      //         'a', 'lb', 'rb', 0.1, 0.1, 0.1, 0.1, null, null, 1, null, null,
      //       ), 'b'],
      //       scale: 1,
      //     },
      //     notInSize: {
      //       content: [bracNew(
      //         'a', 'lb', 'rb', 0.1, 0.1, 0.1, 0.1, null, null, null, null, false,
      //       ), 'b'],
      //       scale: 1,
      //     },
      //     noLeftBracket: {
      //       content: [bracNew(
      //         'a', '', 'rb', 0.1, 0.1, 0.1, 0.1, null, null, null, null,
      //       ), 'b'],
      //       scale: 1,
      //     },
      //   });
      // },
    };
  });
  // describe('Parameter Steps', () => {
  //   let baseB;
  //   let baseL;
  //   let baseR;
  //   let baseA;
  //   let baseLScale;
  //   beforeEach(() => {
  //     functions.parameterSteps();
  //     eqn.showForm('base');
  //     baseA = eqn._a.getPosition();
  //     baseB = eqn._b.getPosition();
  //     baseL = eqn._lb.getPosition();
  //     baseR = eqn._rb.getPosition();
  //     baseLScale = eqn._lb.custom.scale._dup();
  //   });
  //   // Note, the letter a has the following bounds:
  //   // width: 0.04000000000000001,
  //   // height: 0.10300000000000001,
  //   // descent: -0.008,
  //   // ascent: top: 0.095,
  //   test.only('noLeftBracket', () => {
  //     eqn.showForm('noLeftBracket');
  //     const newA = eqn._a.getPosition();
  //     const newR = eqn._rb.getPosition();
  //     // 0.04 + 0.1 = 0.14
  //     expect(round(newA.x)).toBe(0);
  //     expect(round(newR.x)).toBe(0.14);
  //   });
  //   test('notInSize', () => {
  //     eqn.showForm('notInSize');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     const newB = eqn._b.getPosition();
  //     // 0.1x2 + 0.103 = 0.303
  //     expect(round(newLScale.y)).toBe(0.303);
  //     expect(round(newL.y)).toBe(-0.108);
  //     // 0 - 0.1 - 0.04 = -0.14
  //     expect(round(newL.x)).toBe(round(-0.1 - eqn._lb.getBoundingRect('diagram').width));
  //     expect(round(newB.x)).toBe(0.04);
  //   });
  //   test('forceHeightGreaterThanActualHeight', () => {
  //     eqn.showForm('forceHeightGreaterThanActualHeight');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     // 1
  //     expect(round(newLScale.y)).toBe(1);
  //     expect(round(newL.y)).toBe(-0.108);
  //   });
  //   test('forceHeightLessThanActualHeight', () => {
  //     eqn.showForm('forceHeightLessThanActualHeight');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     // 0.005
  //     expect(round(newLScale.y)).toBe(0.05);
  //     expect(round(newL.y)).toBe(-0.108);
  //   });
  //   test('forceDecentGreaterThanActualDescent', () => {
  //     eqn.showForm('forceDecentGreaterThanActualDescent');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     // 0.1 + 0.095 + 0.1 = 0.295
  //     expect(round(newLScale.y)).toBe(0.295);
  //     expect(round(newL.y)).toBe(-0.1);
  //   });
  //   test('forceDecentLessThanActualDescent', () => {
  //     eqn.showForm('forceDecentLessThanActualDescent');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     // 0.004 + 0.095 + 0.1 = 0.199
  //     expect(round(newLScale.y)).toBe(0.199);
  //     expect(round(newL.y)).toBe(-0.004);
  //   });
  //   test('minContentDescentWithLargeMinHeight', () => {
  //     eqn.showForm('minContentDescentWithLargeMinHeight');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     // 1 + 1 + 0.1x2 = 2.2
  //     expect(round(newLScale.y)).toBe(2.2);
  //     expect(round(newL.y)).toBe(-1.1);
  //   });
  //   test('minContentDescentWithSmallLargeHeight', () => {
  //     eqn.showForm('minContentDescentWithSmallMinHeight');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     // 1 + 0.095 + 0.1x2 = 1.295 as minHeight doesn't raise above minDescent
  //     // more than old ascent does
  //     expect(round(newLScale.y)).toBe(1.295);
  //     expect(round(newL.y)).toBe(-1.1);
  //   });
  //   test('minContentDescentWithSmallMinHeight', () => {
  //     eqn.showForm('minContentDescentWithSmallMinHeight');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     // 1 + 0.095 + 0.1x2 = 1.295
  //     expect(round(newLScale.y)).toBe(1.295);
  //     expect(round(newL.y)).toBe(-1.1);
  //   });
  //   test('minContentDescent', () => {
  //     eqn.showForm('minContentDescent');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     // 1 + 0.095 + 0.1x2 = 1.295
  //     expect(round(newLScale.y)).toBe(1.295);
  //     expect(round(newL.y)).toBe(-1.1);
  //   });
  //   test('minContentHeight', () => {
  //     eqn.showForm('minContentHeight');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     // 1 + 0.1x2 = 1.2
  //     expect(round(newLScale.y)).toBe(1.2);
  //     expect(round(newL.y)).toBe(round(baseL.y));
  //   });
  //   test('bottomSpace', () => {
  //     eqn.showForm('bottomSpace');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     expect(round(newLScale.y)).toBe(round(baseLScale.y + 0.1));
  //     expect(round(newL.y)).toBe(round(baseL.y - 0.1));
  //   });
  //   test('topSpace', () => {
  //     eqn.showForm('topSpace');
  //     const newLScale = eqn._lb.custom.scale._dup();
  //     const newL = eqn._lb.getPosition();
  //     expect(round(newLScale.y)).toBe(round(baseLScale.y + 0.1));
  //     expect(round(newL.y)).toBe(round(baseL.y));
  //   });
  //   test('outsideSpace', () => {
  //     eqn.showForm('outsideSpace');
  //     const newB = eqn._b.getPosition();
  //     const newL = eqn._lb.getPosition();
  //     const newR = eqn._rb.getPosition();
  //     const newA = eqn._a.getPosition();
  //     expect(round(newL.x)).toBe(round(baseL.x + 0.1));
  //     expect(round(newA.x)).toBe(round(baseA.x + 0.1));
  //     expect(round(newR.x)).toBe(round(baseR.x + 0.1));
  //     expect(round(newB.x)).toBe(round(baseB.x + 0.2));
  //   });
  //   test('insideSpace', () => {
  //     eqn.showForm('insideSpace');
  //     const newB = eqn._b.getPosition();
  //     const newL = eqn._lb.getPosition();
  //     const newR = eqn._rb.getPosition();
  //     const newA = eqn._a.getPosition();
  //     expect(round(newL.x)).toBe(round(baseL.x));
  //     expect(round(newA.x)).toBe(round(baseA.x + 0.1));
  //     expect(round(newR.x)).toBe(round(baseR.x + 0.2));
  //     expect(round(newB.x)).toBe(round(baseB.x + 0.2));
  //   });
  // });
  test('Bar', () => {
    functions.single();
    const elems = [eqn._a, eqn._bar];
    const formsToTest = ['1', '2', '3', '4', '5', '6'];
    eqn.showForm('0');
    const positions0 = elems.map(elem => round(elem.transform.mat).slice());
    formsToTest.forEach((f) => {
      eqn.showForm(f);
      const positions = elems.map(elem => round(elem.transform.mat).slice());
      expect(positions0).toEqual(positions);
    });

    // Snapshot test on most simple layout
    eqn.showForm('0');
    tools.cleanUIDs(eqn);
    expect(round(eqn._a.transform.mat)).toMatchSnapshot();
    expect(round(eqn._lb.transform.mat)).toMatchSnapshot();
    expect(round(eqn._rb.transform.mat)).toMatchSnapshot();
  });
});
