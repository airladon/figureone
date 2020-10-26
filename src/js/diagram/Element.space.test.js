import {
  Point, Transform, Rect,
} from '../tools/g2';
import {
  round,
} from '../tools/math';
import * as tools from '../tools/tools';
import makeDiagram from '../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('./recorder.worker');

describe('Element Space Transforms', () => {
  let diagram;
  let a;
  let c;
  let create;
  let get;
  let getP;
  beforeEach(() => {
    const diagramOptions = {
      simple: () => {
        diagram = makeDiagram(
          new Rect(0, 0, 1000, 1000),
          new Rect(-3, -3, 6, 6),
        );
        diagram.addElements([
          {
            name: 'c',
            method: 'collection',
            addElements: [
              {
                name: 'a',
                method: 'polygon',
                options: {
                  radius: 1,
                  sides: 4,
                  transform: [['t', 1, 0]],
                },
              },
            ],
            options: {
              transform: [['t', 1, 0]],
            },
          },
        ]);
      },
      rectangleOffZero: () => {
        diagram = makeDiagram(
          new Rect(100, 200, 1000, 500),
          new Rect(1, 1, 4, 2),
        );
        diagram.addElements([
          {
            name: 'c',
            method: 'collection',
            addElements: [
              {
                name: 'a',
                method: 'polygon',
                options: {
                  radius: 1,
                  sides: 4,
                  transform: [['t', 1, 0]],
                },
              },
            ],
            options: {
              transform: [['s', 0.5, 0.5], ['t', 2, 0], ['r', Math.PI / 4]],
            },
          },
        ]);
      },
    };
    create = (option) => {
      diagramOptions[option]();
      diagram.initialize();
      c = diagram.getElement('c');
      a = diagram.getElement('c.a');
    };
    get = (element, p, from, to) => element.pointFromSpaceToSpace(p, from, to).round(3);
    getP = (x, y) => new Point(x, y).round(3);
  });
  describe('Simple', () => {
    beforeEach(() => {
      create('simple');
    });
    test('Vertex to Local', () => {
      expect(get(a, [0, 0], 'vertex', 'local')).toEqual(getP(1, 0));
    });
    test('Local to Vertex', () => {
      expect(get(a, [0, 0], 'local', 'vertex')).toEqual(getP(-1, 0));
    });
    test('Vertex to Diagram', () => {
      expect(get(a, [0, 0], 'vertex', 'diagram')).toEqual(getP(2, 0));
    });
    test('Diagram to Vertex', () => {
      expect(get(a, [0, 0], 'diagram', 'vertex')).toEqual(getP(-2, 0));
    });
    test('Vertex to GL', () => {
      expect(get(a, [0, 0], 'vertex', 'gl')).toEqual(getP(0.667, 0));
    });
    test('GL to Vertex', () => {
      expect(get(a, [0, 0], 'gl', 'vertex')).toEqual(getP(-2, 0));
    });
    test('Vertex to Pixel', () => {
      expect(get(a, [0, 0], 'vertex', 'pixel')).toEqual(getP(833.333, 500));
    });
    test('Pixel to Vertex', () => {
      expect(get(a, [0, 0], 'pixel', 'vertex')).toEqual(getP(-5, 3));
    });
    // Remaining Local
    test('Local to Diagram', () => {
      expect(get(a, [0, 0], 'local', 'diagram')).toEqual(getP(1, 0));
    });
    test('Diagram to Local', () => {
      expect(get(a, [0, 0], 'diagram', 'local')).toEqual(getP(-1, 0));
    });
    test('Local to GL', () => {
      expect(get(a, [0, 0], 'local', 'gl')).toEqual(getP(0.333, 0));
    });
    test('GL to Local', () => {
      expect(get(a, [0, 0], 'gl', 'local')).toEqual(getP(-1, 0));
    });
    test('Local to Pixel', () => {
      expect(get(a, [0, 0], 'local', 'pixel')).toEqual(getP(666.667, 500));
    });
    test('Pixel to Local', () => {
      expect(get(a, [0, 0], 'pixel', 'local')).toEqual(getP(-4, 3));
    });

    // Remaining diagram
    test('Diagram to GL', () => {
      expect(get(a, [0, 0], 'diagram', 'gl')).toEqual(getP(0, 0));
    });
    test('GL to Diagram', () => {
      expect(get(a, [0, 0], 'gl', 'diagram')).toEqual(getP(0, 0));
    });
    test('Diagram to Pixel', () => {
      expect(get(a, [0, 0], 'diagram', 'pixel')).toEqual(getP(500, 500));
    });
    test('Pixel to Diagram', () => {
      expect(get(a, [0, 0], 'pixel', 'diagram')).toEqual(getP(-3, 3));
    });

    // Remaining GL
    test('GL to Pixel', () => {
      expect(get(a, [0, 0], 'gl', 'pixel')).toEqual(getP(500, 500));
    });
    test('Pixel to GL', () => {
      expect(get(a, [0, 0], 'pixel', 'gl')).toEqual(getP(-1, 1));
    });
  });
  describe('Rectangle off zero', () => {
    beforeEach(() => {
      create('rectangleOffZero');
    });
    test('Vertex to Diagram', () => {
      expect(get(a, [0, 0], 'vertex', 'diagram')).toEqual(getP(1.768, 1.768));
    });
    test('Diagram to Vertex', () => {
      expect(get(a, [0, 0], 'diagram', 'vertex')).toEqual(getP(-5, 0));
    });
    test('Vertex to Pixel', () => {
      expect(get(a, [0, 0], 'vertex', 'pixel')).toEqual(getP(191.942, 308.058));
    });
    test('Pixel to Vertex', () => {
      expect(get(a, [0, 0], 'pixel', 'vertex')).toEqual(getP(0.657, 2.828));
    });
  });
});
