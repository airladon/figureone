import {
  Point, Rect, Transform, Line,
} from '../tools/g2';
import {
  getState, setState,
} from './state';
import parseState from './parseState';
// import { round } from '../tools/math';

describe('state', () => {
  describe('getDef', () => {
    test('number', () => {
      const value = parseState(1);
      expect(value).toBe(1);
    });
    test('string', () => {
      const value = parseState('asdf');
      expect(value).toBe('asdf');
    });
    test('boolean', () => {
      const value = parseState(false);
      expect(value).toBe(false);
    });
    test('undefined', () => {
      const value = parseState();
      expect(value).toBe(undefined);
    });
    test('null', () => {
      const value = parseState(null);
      expect(value).toBe(null);
    });
    test('array', () => {
      const ar = parseState([1, new Point(1, 1)._state()]);
      expect(ar[0]).toBe(1);
      expect(ar[1]).toEqual(new Point(1, 1));
    });
    test('obj', () => {
      const obj = parseState({
        num: 1,
        str: 'asdf',
        bool: false,
        undef: undefined,
        nul: null,
        tf: new Transform().translate(1, 1)._state(),
        p: new Point(1, 1)._state(),
        r: new Rect(0, 0, 2, 2)._state(),
        l: new Line([0, 0], [1, 1])._state(),
        obj: {
          r: new Rect(0, 0, 3, 3)._state(),
        },
        ar: [1, new Point(1, 1)._state()],
      });
      expect(obj.num).toBe(1);
      expect(obj.str).toBe('asdf');
      expect(obj.bool).toBe(false);
      expect(obj.undef).toBe(undefined);
      expect(obj.nul).toBe(null);
      expect(obj.tf).toEqual(new Transform().translate(1, 1));
      expect(obj.p).toEqual(new Point(1, 1));
      expect(obj.r).toEqual(new Rect(0, 0, 2, 2));
      expect(obj.l).toEqual(new Line([0, 0], [1, 1]));
      expect(obj.obj.r).toEqual(new Rect(0, 0, 3, 3));
      expect(obj.ar[0]).toBe(1);
      expect(obj.ar[1]).toEqual(new Point(1, 1));
    });
    test('def to undef', () => {
      const objIn = {
        num: 1,
        str: 'asdf',
        bool: false,
        undef: undefined,
        nul: null,
        tf: new Transform().translate(1, 1),
        p: new Point(1, 1),
        r: new Rect(0, 0, 2, 2),
        l: new Line([0, 0], [1, 1]),
        obj: {
          r: new Rect(0, 0, 3, 3),
        },
        ar: [1, new Point(1, 1)],
      };
      const obj = parseState(getState(objIn, [
        'num', 'str', 'bool', 'undef', 'nul', 'tf', 'p', 'r', 'l', 'obj', 'ar',
      ]));
      expect(obj.num).toBe(1);
      expect(obj.str).toBe('asdf');
      expect(obj.bool).toBe(false);
      expect(obj.undef).toBe(undefined);
      expect(obj.nul).toBe(null);
      expect(obj.tf).toEqual(new Transform().translate(1, 1));
      expect(obj.p).toEqual(new Point(1, 1));
      expect(obj.r).toEqual(new Rect(0, 0, 2, 2));
      expect(obj.l).toEqual(new Line([0, 0], [1, 1]));
      expect(obj.obj.r).toEqual(new Rect(0, 0, 3, 3));
      expect(obj.ar[0]).toBe(1);
      expect(obj.ar[1]).toEqual(new Point(1, 1));
    });
    test('get state portion of object', () => {
      const objIn = {
        a: 1,
        b: {
          c: 2,
          d: {
            e: 3,
            f: 4,
          },
        },
      };
      // g is an error that will return nothing
      const state = getState(objIn, ['a', 'b.d.e', 'g']);
      expect(state.a).toBe(1);
      expect(state.b.d.e).toBe(3);
      expect(state.b.c).toBe(undefined);
      expect(state.b.d.f).toBe(undefined);

      objIn.a = 10;
      objIn.b.d.f = 5;
      objIn.b.d.e = 1;
      expect(objIn.a).toBe(10);
      expect(objIn.b.d.e).toBe(1);
      expect(objIn.b.c).toBe(2);
      expect(objIn.b.d.f).toBe(5);

      setState(objIn, state);
      expect(objIn.a).toBe(1);
      expect(objIn.b.d.e).toBe(3);
      expect(objIn.b.c).toBe(2);
      expect(objIn.b.d.f).toBe(5);
    });
  });
});
