import {
  Point, getBoundingRect
} from '../g2';
import { round } from '../math';
import {
  makePolyLine,
} from './lines';

describe('Tools Lines', () => {
  describe('makePolyLine', () => {
    let points;
    beforeEach(() => {
      points = [
        new Point(0, 0),
        new Point(1, 0),
        new Point(1, 1),
        new Point(0, 1),
      ];
    })
    describe('Outside', () =>{
      test('Unclosed', () => {
        const out = makePolyLine(points, 0.1, false, 'outside', 'none');
        const line1 = getBoundingRect(out.slice(0, 6));
        const line2 = getBoundingRect(out.slice(6, 12));
        const line3 = getBoundingRect(out.slice(12));
        expect(round(line1.left)).toBe(0);
        expect(round(line1.width)).toBe(1);
        expect(round(line1.bottom)).toBe(-0.1);
        expect(round(line1.height)).toBe(0.1);

        expect(round(line2.left)).toBe(1);
        expect(round(line2.width)).toBe(0.1);
        expect(round(line2.bottom)).toBe(0);
        expect(round(line2.height)).toBe(1);

        expect(round(line3.left)).toBe(0);
        expect(round(line3.width)).toBe(1);
        expect(round(line3.bottom)).toBe(1);
        expect(round(line3.height)).toBe(0.1);
      });
      test('closed', () => {
        const out = makePolyLine(points, 0.1, true, 'outside', 'none');
        const line1 = getBoundingRect(out.slice(0, 6));
        const line2 = getBoundingRect(out.slice(6, 12));
        const line3 = getBoundingRect(out.slice(12, 18));
        const line4 = getBoundingRect(out.slice(18, 24));
        expect(round(line1.left)).toBe(0);
        expect(round(line1.width)).toBe(1);
        expect(round(line1.bottom)).toBe(-0.1);
        expect(round(line1.height)).toBe(0.1);

        expect(round(line2.left)).toBe(1);
        expect(round(line2.width)).toBe(0.1);
        expect(round(line2.bottom)).toBe(0);
        expect(round(line2.height)).toBe(1);

        expect(round(line3.left)).toBe(0);
        expect(round(line3.width)).toBe(1);
        expect(round(line3.bottom)).toBe(1);
        expect(round(line3.height)).toBe(0.1);

        expect(round(line4.left)).toBe(-0.1);
        expect(round(line4.width)).toBe(0.1);
        expect(round(line4.bottom)).toBe(0);
        expect(round(line4.height)).toBe(1);
      });
      test('radius', () => {
        const out = makePolyLine(points, 0.1, true, 'outside', 'radius', 0.015, 10);
        expect(out).toMatchSnapshot();
      });
      test('fill', () => {
        const out = makePolyLine(points, 0.1, true, 'outside', 'fill');
        expect(out).toMatchSnapshot();
      });
      test('auto', () => {
        const out = makePolyLine(points, 0.1, true, 'outside', 'auto');
        expect(out).toMatchSnapshot();
      });
      test('dash', () => {
        const out = makePolyLine(points, 0.1, true, 'outside', 'auto', 0.015, 10, Math.PI / 7, [0.2, 0.08]);
        expect(out).toMatchSnapshot();
      });
    });
    describe('Inside', () =>{
      test('Unclosed', () => {
        const out = makePolyLine(points, 0.1, false, 'inside', 'none');
        const line3 = getBoundingRect(out.slice(0, 6));
        const line2 = getBoundingRect(out.slice(6, 12));
        const line1 = getBoundingRect(out.slice(12));
        expect(round(line1.left)).toBe(0);
        expect(round(line1.width)).toBe(1);
        expect(round(line1.bottom)).toBe(0);
        expect(round(line1.height)).toBe(0.1);

        expect(round(line2.left)).toBe(0.9);
        expect(round(line2.width)).toBe(0.1);
        expect(round(line2.bottom)).toBe(0);
        expect(round(line2.height)).toBe(1);

        expect(round(line3.left)).toBe(0);
        expect(round(line3.width)).toBe(1);
        expect(round(line3.bottom)).toBe(0.9);
        expect(round(line3.height)).toBe(0.1);
      });
      test('closed', () => {
        const out = makePolyLine(points, 0.1, true, 'inside', 'none');
        const line3 = getBoundingRect(out.slice(0, 6));
        const line2 = getBoundingRect(out.slice(6, 12));
        const line1 = getBoundingRect(out.slice(12, 18));
        const line4 = getBoundingRect(out.slice(18, 24));
        expect(round(line1.left)).toBe(0);
        expect(round(line1.width)).toBe(1);
        expect(round(line1.bottom)).toBe(0);
        expect(round(line1.height)).toBe(0.1);

        expect(round(line2.left)).toBe(0.9);
        expect(round(line2.width)).toBe(0.1);
        expect(round(line2.bottom)).toBe(0);
        expect(round(line2.height)).toBe(1);

        expect(round(line3.left)).toBe(0);
        expect(round(line3.width)).toBe(1);
        expect(round(line3.bottom)).toBe(0.9);
        expect(round(line3.height)).toBe(0.1);

        expect(round(line4.left)).toBe(0);
        expect(round(line4.width)).toBe(0.1);
        expect(round(line4.bottom)).toBe(0);
        expect(round(line4.height)).toBe(1);
      });
      test('radius', () => {
        const out = makePolyLine(points, 0.1, true, 'inside', 'radius', 0.015, 10);
        expect(out).toMatchSnapshot();
      });
      test('fill', () => {
        const out = makePolyLine(points, 0.1, true, 'inside', 'fill');
        expect(out).toMatchSnapshot();
      });
      test('auto', () => {
        const out = makePolyLine(points, 0.1, true, 'inside', 'auto');
        expect(out).toMatchSnapshot();
      });
      test('dash', () => {
        const out = makePolyLine(points, 0.1, true, 'inside', 'auto', 0.015, 10, Math.PI / 7, [0.2, 0.08]);
        expect(out).toMatchSnapshot();
      });
    });
    describe('Mid', () =>{
      test('Unclosed', () => {
        const out = makePolyLine(points, 0.1, false, 'mid', 'none');
        const line1 = getBoundingRect(out.slice(0, 6));
        const line2 = getBoundingRect(out.slice(6, 12));
        const line3 = getBoundingRect(out.slice(12));
        expect(round(line1.left)).toBe(0);
        expect(round(line1.width)).toBe(1);
        expect(round(line1.bottom)).toBe(-0.05);
        expect(round(line1.height)).toBe(0.1);

        expect(round(line2.left)).toBe(0.95);
        expect(round(line2.width)).toBe(0.1);
        expect(round(line2.bottom)).toBe(0);
        expect(round(line2.height)).toBe(1);

        expect(round(line3.left)).toBe(0);
        expect(round(line3.width)).toBe(1);
        expect(round(line3.bottom)).toBe(0.95);
        expect(round(line3.height)).toBe(0.1);
      });
      test('closed', () => {
        const out = makePolyLine(points, 0.1, true, 'mid', 'none');
        const line1 = getBoundingRect(out.slice(0, 6));
        const line2 = getBoundingRect(out.slice(6, 12));
        const line3 = getBoundingRect(out.slice(12, 18));
        const line4 = getBoundingRect(out.slice(18, 24));
        expect(round(line1.left)).toBe(0);
        expect(round(line1.width)).toBe(1);
        expect(round(line1.bottom)).toBe(-0.05);
        expect(round(line1.height)).toBe(0.1);

        expect(round(line2.left)).toBe(0.95);
        expect(round(line2.width)).toBe(0.1);
        expect(round(line2.bottom)).toBe(0);
        expect(round(line2.height)).toBe(1);

        expect(round(line3.left)).toBe(0);
        expect(round(line3.width)).toBe(1);
        expect(round(line3.bottom)).toBe(0.95);
        expect(round(line3.height)).toBe(0.1);

        expect(round(line4.left)).toBe(-0.05);
        expect(round(line4.width)).toBe(0.1);
        expect(round(line4.bottom)).toBe(0);
        expect(round(line4.height)).toBe(1);
      });
      test('radius', () => {
        const out = makePolyLine(points, 0.1, true, 'mid', 'radius', 0.015, 10);
        expect(out).toMatchSnapshot();
      });
      test('fill', () => {
        const out = makePolyLine(points, 0.1, true, 'mid', 'fill');
        expect(out).toMatchSnapshot();
      });
      test('auto', () => {
        const out = makePolyLine(points, 0.1, true, 'mid', 'auto');
        expect(out).toMatchSnapshot();
      });
      test('dash', () => {
        const out = makePolyLine(points, 0.1, true, 'mid', 'auto', 0.015, 10, Math.PI / 7, [0.2, 0.08]);
        expect(out).toMatchSnapshot();
      });
    });
  });
});

// Use below code to show different poly line tests replacing `out =...` with
// with the `out` line from the test
//
// const diagram = new Fig.Diagram();
// const { Point } = Fig;
// const { makePolyLine } = Fig.tools.lines;

// const line = [
//   new Point(0, 0),
//   new Point(1, 0),
//   new Point(1, 1),
//   new Point(0, 1),
// ];

// const out = makePolyLine(line, 0.01, true, 'inside', 'auto', 0.015, 10, Math.PI / 7, [0.2, 0.08]);

// diagram.addElements([
//   {
//     name: 'r',
//     method: 'shapes.generic',
//     options: {
//       points: out,
//       drawType: 'triangles',
//       position: [-0.7, -0.5],
//     },
//   },
// ]);

// diagram.initialize();
