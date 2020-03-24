import * as tools from './tools';

describe('Test Classify method', () => {
  // CLassify method tests
  test('Empty inputs case', () => {
    expect(tools.classify('', '')).toBe('');
  });

  test('Empty value case', () => {
    expect(tools.classify('btn', '')).toBe('btn');
  });

  test('Empty key case', () => {
    expect(tools.classify('', '-test')).toBe(' -test');
  });

  test('btn, btn -> btn', () => {
    expect(tools.classify('btn', 'btn')).toBe('btn');
  });

  test('btn, -test -> btn btn-test', () => {
    expect(tools.classify('btn', '-test')).toBe('btn btn-test');
  });

  test('Do nothing case: btn, btn-test -> btn btn-test', () => {
    expect(tools.classify('btn', 'btn-test')).toBe('btn btn-test');
  });

  test('btn, btn -test -> btn btn-test', () => {
    expect(tools.classify('btn', 'btn -test')).toBe('btn btn-test');
  });

  test('btn, -test -test2 -> btn btn-test btn-test2', () => {
    expect(tools.classify('btn', '-test -test2')).toBe('btn btn-test btn-test2');
  });
});

describe('Extract From Object', () => {
  let o;
  beforeEach(() => {
    o = {
      a: 1,
      b: {
        b1: 2,
        b2: 3,
        b3: {
          b31: 4,
          b32: (i, j) => i + j, // eslint-disable-next-line camelcase
          b_33: 5,
        },
      },
      c: i => i + 1,
      d: (i, j) => i + j,  // eslint-disable-next-line camelcase
      e_1: 6,
    };
  });
  describe('Object Property Pointer', () => {
    test('string exists', () => {
      const p = new tools.ObjectKeyPointer(o, 'a');
      expect(p.object).toBe(o);
      expect(p.key).toBe('a');
      expect(p.value()).toBe(1);
    });
    test('string does not exist', () => {
      const p = new tools.ObjectKeyPointer(o, 'z');
      expect(p.object).toBe(o);
      expect(p.key).toBe('');
      expect(p.value()).toBe(undefined);
    });
    test('setting value of key that exists', () => {
      const p = new tools.ObjectKeyPointer(o, 'a');
      p.setValue(100);
      expect(o.a).toBe(100);
    });
    test('setting value of key that does not exist', () => {
      const p = new tools.ObjectKeyPointer(o, 'z');
      expect(p.value()).toBe(undefined);
      expect('z' in o).toBe(false);
    });
    test('execute method with one argument', () => {
      const p = new tools.ObjectKeyPointer(o, 'c');
      const r = p.execute(1);
      expect(r).toBe(2);
    });
    test('execute method with two arguments', () => {
      const p = new tools.ObjectKeyPointer(o, 'd');
      const r = p.execute(1, 2);
      expect(r).toBe(3);
    });
    test('execute method don key that does not exist', () => {
      const p = new tools.ObjectKeyPointer(o, 'z');
      const r = p.execute(1);
      expect(r).toBe(undefined);
      expect('z' in o).toBe(false);
    });
  });
  describe('Extract', () => {
    describe('String input', () => {
      test('string exists', () => {
        const q = tools.extractFrom(o, 'a');
        expect(q).toEqual(new tools.ObjectKeyPointer(o, 'a'));
      });
      test('string does not exist', () => {
        const q = tools.extractFrom(o, 'z');
        expect(q).toEqual(undefined);
      });
      test('2 level string that exists', () => {
        const q = tools.extractFrom(o, 'b_b1');
        expect(q.value()).toBe(2);
      });
      test('3 level string that exists', () => {
        const q = tools.extractFrom(o, 'b_b3_b32');
        expect(q.execute(1, 2)).toBe(3);
      });
      test('3 level string that does not exist', () => {
        const q = tools.extractFrom(o, 'b_b3_z');
        expect(q).toEqual(undefined);
      });
      test('1 level string with underscores', () => {
        const q = tools.extractFrom(o, 'e_1');
        expect(q.value()).toBe(6);
      });
      test('3 level string with underscores', () => {
        const q = tools.extractFrom(o, 'b_b3_b_33');
        expect(q.value()).toBe(5);
      });
    });
    describe('Array input', () => {
      test('Array all exists', () => {
        const q = tools.extractFrom(o, ['a', 'b', 'c']);
        expect(q[0]).toEqual(new tools.ObjectKeyPointer(o, 'a'));
        expect(q[1]).toEqual(new tools.ObjectKeyPointer(o, 'b'));
        expect(q[2].execute(100)).toBe(101);
      });
      test('Array - some exist', () => {
        const q = tools.extractFrom(o, ['a', 'b', 'z', 'c']);
        expect(q[0]).toEqual(new tools.ObjectKeyPointer(o, 'a'));
        expect(q[1]).toEqual(new tools.ObjectKeyPointer(o, 'b'));
        expect(q[2].execute(100)).toBe(101);
      });
      test('Array - none exist', () => {
        const q = tools.extractFrom(o, ['z', 'x', 'y']);
        expect(q).toHaveLength(0);
      });
    });
    describe('Object Input', () => {
      test('All object keys exist', () => {
        const q = tools.extractFrom(
          o,
          {
            a: 10,
            b: 20,
            c: 'test',
          },
        );
        expect(q[0].obj.value()).toEqual(1);
        expect(q[0].value).toEqual(10);
        expect(q[2].obj.execute(100)).toBe(101);
        expect(q[2].value).toBe('test');
        expect(q).toHaveLength(3);
      });
      test('Some object keys exist', () => {
        const q = tools.extractFrom(
          o,
          {
            a: 10,
            z: 20,
            c: 'test',
          },
        );
        expect(q[0].obj.value()).toEqual(1);
        expect(q[0].value).toEqual(10);
        expect(q[1].obj.execute(100)).toBe(101);
        expect(q[1].value).toBe('test');
        expect(q).toHaveLength(2);
      });
    });
  });
});
describe('Extract From Collection', () => {
  let o;
  beforeEach(() => {
    o = {
      _a: 1,
      _b: {
        _b1: 2,
        _b2: 3,
        _b3: {
          _b31: 4,
          _b32: (i, j) => i + j,  // eslint-disable-next-line camelcase
          _b_33: 5,
        },
      },
      _c: i => i + 1,
      _d: (i, j) => i + j,  // eslint-disable-next-line camelcase
      _e_1: 6,
    };
  });
  test('string', () => {
    const p = tools.getElement(o, '_a');
    expect(p.value()).toBe(1);
  });
  test('string without dunder', () => {
    const p = tools.getElement(o, 'a');
    expect(p.value()).toBe(1);
  });
  test('3 level string', () => {
    const p = tools.getElement(o, '_b_b3_b_33');
    expect(p.value()).toBe(5);
  });
  test('3 level string without dunder', () => {
    const p = tools.getElement(o, 'b_b3_b_33');
    expect(p.value()).toBe(5);
  });
  test('list extract', () => {
    const p = tools.getElement(
      o,
      [
        'a',
        '_b',
        'e_1',
        'b_b2',
      ],
    );
    expect(p[0].value()).toBe(1);
    expect(p[1].value()._b1).toBe(2);
    expect(p[2].value()).toBe(6);
    expect(p[3].value()).toBe(3);
  });
  describe('add to object', () => {
    test('simple from scrach', () => {
      const obj = {};
      tools.addToObject(obj, 'a-b-c', 1, '-');
      expect(obj.a.b.c).toBe(1);
    });
    test('simple adding', () => {
      const obj = { a: { d: 3 } };
      tools.addToObject(obj, 'a-b-c', 1, '-');
      expect(obj.a.b.c).toBe(1);
    });
    test('simple adding 2', () => {
      const obj = { c: { d: 3 } };
      tools.addToObject(obj, 'a-b-c', 1, '-');
      expect(obj.a.b.c).toBe(1);
    });
  });
});
describe('Duplicate Values', () => {
  test('number', () => {
    const dup = tools.duplicate(3);
    expect(dup).toBe(3);
  });
  test('string', () => {
    const dup = tools.duplicate('test');
    expect(dup).toBe('test');
  });
  test('null', () => {
    const dup = tools.duplicate(null);
    expect(dup).toBe(null);
  });
  test('Array', () => {
    const initial = [1, 2, 3];
    const dup = tools.duplicate(initial);
    expect(dup).not.toBe(initial);
    expect(dup).toEqual(initial);
  });
  test('function', () => {
    const initial = i => i + 10;
    const dup = tools.duplicate(initial);
    expect(dup).toBe(initial);
    expect(dup(10)).toBe(initial(10));
  });
  test('Object with Arrays', () => {
    const initial = {
      a: [1, 2, 3],
      b: {
        c: [4, 5, 6],
      },
    };
    const dup = tools.duplicate(initial);
    expect(dup).not.toBe(initial);
    expect(Object.keys(dup)).toEqual(Object.keys(initial));
    expect(dup.a).not.toBe(initial.a);
    expect(dup.a).toEqual(initial.a);
    expect(dup.b.c).not.toBe(initial.b.c);
    expect(dup.b.c).toEqual(initial.b.c);
  });
  test('Object with _dup function', () => {
    const initial = {
      a: [1, 2, 3],
      b: {
        c: [4, 5, 6],
      },
      _dup: () => 10,
    };
    const dup = tools.duplicate(initial);
    expect(dup).toBe(10);
  });
  test('Object with Arrays with Objects with Arrays', () => {
    const initial = {
      a: [1, 2, 3],
      b: {
        c: [4, 5, 6],
        d: [
          {
            e: [7, 8, 9],
            f: 'hello',
          },
          10,
          11,
        ],
      },
    };
    const dup = tools.duplicate(initial);
    expect(dup).not.toBe(initial);
    expect(Object.keys(dup)).toEqual(Object.keys(initial));
    expect(dup.a).not.toBe(initial.a);
    expect(dup.a).toEqual(initial.a);
    expect(dup.b.c).not.toBe(initial.b.c);
    expect(dup.b.c).toEqual(initial.b.c);

    expect(dup.b.d[0].e).not.toBe(initial.b.d[0].e);
    expect(dup.b.d[0].e).toEqual(initial.b.d[0].e);

    expect(dup.b.d[0].f).toBe('hello');
    expect(dup.b.d).not.toBe(initial.b.d);
    expect(dup.b.d).toEqual(initial.b.d);
  });
});
describe('AssignObjectFromTo', () => {
  test('Simple', () => {
    const to = { a: 1, b: 2 };
    const from = { a: 2, c: 2 };
    tools.assignObjectFromTo(from, to);
    expect(Object.keys(to)).toEqual(['a', 'b', 'c']);
    expect(to.a).toBe(from.a);
    expect(to.b).toBe(2);
    expect(to.c).toBe(from.c);
  });
  test('Simple with exception', () => {
    const to = { a: 1, b: 2 };
    const from = { a: 2, c: 2 };
    tools.assignObjectFromTo(from, to, 'a');
    expect(Object.keys(to)).toEqual(['a', 'b', 'c']);
    expect(to.a).toBe(1);
    expect(to.b).toBe(2);
    expect(to.c).toBe(from.c);
  });
  test('Multi level exception', () => {
    const to = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
        },
      },
    };
    const from = {
      a: 10,
      b: {
        c: 20,
        d: {
          e: 30,
          f: 40,
          g: 50,
        },
      },
    };
    tools.assignObjectFromTo(from, to, ['a', 'b.d.e', 'b.d.g']);
    expect(to.a).toBe(1);
    expect(to.b.c).toBe(from.b.c);
    expect(to.b.d.e).toBe(3);
    expect(to.b.d.f).toBe(from.b.d.f);
    expect(to.b.d.g).toBe(undefined);
  });
  test('DuplicateValues True', () => {
    const to = { a: 1 };
    const from = { a: 2, b: [1, 2, 3] };
    tools.assignObjectFromTo(from, to, [], true);
    expect(to.b).not.toBe(from.b);
    expect(to.b).toEqual(from.b);
  });
  test('DuplicateValues False', () => {
    const to = { a: 1 };
    const from = { a: 2, b: [1, 2, 3] };
    tools.assignObjectFromTo(from, to, [], false);
    expect(to.b).toBe(from.b);
  });
});
describe('Join Objects with Options', () => {
  test('With exceptions and no duplication', () => {
    const to = {
      a: 1,
      b: {
        c: 2,
        d: 3,
      },
    };
    const from1 = {
      a: 10,
      b: {
        c: 20,
        d: 30,
        e: [1, 2, 3],
      },
    };
    const from2 = {
      a: 100,
      g: 600,
    };
    tools.joinObjectsWithOptions({
      except: 'b.d',
      duplicate: false,
    }, to, from1, from2);
    expect(to.a).toBe(100);
    expect(to.b.c).toBe(20);
    expect(to.b.d).toBe(3);
    expect(to.b.e).toBe(from1.b.e);
    expect(to.g).toBe(600);
  });
  test('With exceptions and duplication', () => {
    const to = {
      a: 1,
      b: {
        c: 2,
        d: 3,
      },
    };
    const from1 = {
      a: 10,
      b: {
        c: 20,
        d: 30,
        e: [1, 2, 3],
      },
    };
    const from2 = {
      a: 100,
      g: 600,
    };
    tools.joinObjectsWithOptions({
      except: 'b.d',
      duplicate: true,
    }, to, from1, from2);
    expect(to.a).toBe(100);
    expect(to.b.c).toBe(20);
    expect(to.b.d).toBe(3);
    expect(to.b.e).not.toBe(from1.b.e);
    expect(to.b.e).toEqual(from1.b.e);
    expect(to.g).toBe(600);
  });
});
describe('Join Objects', () => {
  test('Empty object first', () => {
    const result = tools.joinObjects({ a: 1, b: 2 }, {});
    expect(result).toEqual({ a: 1, b: 2 });
  });
  test('Empty object second', () => {
    const result = tools.joinObjects({}, { a: 1, b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });
  test('Overwrite', () => {
    const result = tools.joinObjects({ a: 3, b: 4 }, { a: 1, b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });
  test('Overwrite with levels', () => {
    const result = tools.joinObjects(
      {},
      {
        a: 3, b: 4, c: 5, d: { d1: 1, d2: 2, d3: 3 },
      },
      {
        a: 1, b: 2, d: { d1: 3, d2: 4 },
      },
    );
    expect(result).toEqual({
      a: 1, b: 2, c: 5, d: { d1: 3, d2: 4, d3: 3 },
    });
  });
  test('Single Object', () => {
    const result = tools.joinObjects({ a: 1, b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });
  test('Array Object', () => {
    const result = tools.joinObjects({ a: 1, b: 2 }, { b: [1, 2] });
    expect(result).toEqual({ a: 1, b: [1, 2] });
  });
  test('Three Layers object over number', () => {
    const result = tools.joinObjects(
      {},
      {
        a: 1,
        b: {
          b1: 2,
          b2: 3,
        },
      },
      {
        a: 1,
        b: {
          b1: 2,
          b2: {
            b21: 3,
            b22: 5,
          },
        },
      },
    );
    expect(result).toEqual({
      a: 1,
      b: {
        b1: 2,
        b2: {
          b21: 3,
          b22: 5,
        },
      },
    });
  });
  test('Do not modify existing objects', () => {
    const o1 = { a: 1, b: { x: 1, z: 1 } };
    const o2 = { a: 2, b: { x: 2, y: 2 } };
    const result = tools.joinObjects({}, o1, o2);
    expect(result).toEqual({ a: 2, b: { x: 2, y: 2, z: 1 } });
    expect(o1).toEqual({ a: 1, b: { x: 1, z: 1 } });
    expect(o2).toEqual({ a: 2, b: { x: 2, y: 2 } });
  });
  test('Do not overwrite undefined', () => {
    const o1 = { a: 1, b: { x: 1, z: 1 } };
    const o2 = { a: 2, b: { x: 2, y: undefined, z: undefined } };
    const result = tools.joinObjects({}, o1, o2);
    expect(result).toEqual({ a: 2, b: { x: 2, y: undefined, z: 1 } });
  });
});
