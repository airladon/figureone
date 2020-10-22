import {
  Point, getPoints, Rect,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import * as tools from '../../tools/tools';
import makeDiagram from '../../__mocks__/makeDiagram';

// tools.isTouchDevice = jest.fn();

// jest.mock('../Gesture');
// jest.mock('../webgl/webgl');
// jest.mock('../DrawContext2D');

describe('Text', () => {
  let diagram;
  beforeEach(() => {
    diagram = makeDiagram();
    diagram.addElements([
      {
        name: 'a',
        method: 'text',
        options: {
          text: 'a',
          xAlign: 'left',
          yAlign: 'baseline',
        },
      },
      {
        name: 'c',
        method: 'text',
        options: {
          text: 'c',
          xAlign: 'left',
          yAlign: 'baseline',
          position: [1, 1],
        },
      },
      {
        name: 'container',
        method: 'collection',
        addElements: [
          {
            name: 'a',
            method: 'text',
            options: {
              text: 'a',
              xAlign: 'left',
              yAlign: 'baseline',
              position: [1, 1],
            },
          },
        ],
        options: {
          position: [2, 2],
        },
      },
    ]);
    diagram.setFirstTransform();
  });
  test('Base', () => {
    const a = diagram.elements._a.getBoundingRect('diagram');
    expect(round(a.left)).toBe(0);
    expect(round(a.bottom)).toBe(-0.008);
    expect(round(a.width)).toBe(0.1);
    expect(round(a.height)).toBe(0.103);
    expect(round(a.top)).toBe(0.095);
    expect(round(a.right)).toBe(0.1);
  });
  test('Moved', () => {
    const c = diagram.elements._c.getBoundingRect('diagram');
    expect(round(c.left)).toBe(1);
    expect(round(c.bottom)).toBe(1 - 0.008);
    expect(round(c.width)).toBe(0.1);
    expect(round(c.height)).toBe(0.103);
    expect(round(c.top)).toBe(1 + 0.095);
    expect(round(c.right)).toBe(1 + 0.1);
  });
  test('Moved in Collection', () => {
    diagram.elements._container.showAll();
    const container = diagram.elements._container.getBoundingRect('diagram');
    const a = diagram.elements._container._a.getBoundingRect('diagram');
    expect(round(a.left)).toBe(3);
    expect(round(a.bottom)).toBe(3 - 0.008);
    expect(round(a.width)).toBe(0.1);
    expect(round(a.height)).toBe(0.103);
    expect(round(a.top)).toBe(3 + 0.095);
    expect(round(a.right)).toBe(3 + 0.1);
    expect(round(container.left)).toBe(3);
    expect(round(container.bottom)).toBe(3 - 0.008);
    expect(round(container.width)).toBe(0.1);
    expect(round(container.height)).toBe(0.103);
    expect(round(container.top)).toBe(3 + 0.095);
    expect(round(container.right)).toBe(3 + 0.1);
  });
});
describe('Text Borders', () => {
  let diagram;
  let addElement;
  let t;
  let td;
  let tr;
  let a;
  let buffer;
  beforeEach(() => {
    a = new Rect(0, -0.008, 0.1, 0.148).round(3);
    buffer = 0.5;
    diagram = makeDiagram();
    const options = {
      simple: {
        text: 't',
        xAlign: 'left',
        yAlign: 'baseline',
        // border: 'text',      // default
        // touchBorder: 'text'  // default
      },
      drawingObjectBuffer: {
        text: 't',
        xAlign: 'left',
        yAlign: 'baseline',
        // border: 'text',      // default
        touchBorder: buffer,
      },
      textBuffer: {
        text: {
          text: 't',
          touchBorder: 0.5,
        },
        xAlign: 'left',
        yAlign: 'baseline',
      },
      textAndDrawingObjectBuffer: {
        text: {
          text: 't',
          touchBorder: 0.5,
        },
        xAlign: 'left',
        yAlign: 'baseline',
        touchBorder: buffer,
      },
      textCustomBorderDrawingObjectTouchBuffer: {
        text: {
          text: 't',
          border: [[-1, -1], [-1, 1], [1, 1], [-1, 1]],
        },
        xAlign: 'left',
        yAlign: 'baseline',
        touchBorder: buffer,
      },
      textCustomTouchBorderDrawingObjectCustomBorder: {
        text: {
          text: 't',
          touchBorder: [[-1, -1], [1, -1], [1, 1], [-1, 1]],
        },
        xAlign: 'left',
        yAlign: 'baseline',
        border: [[[-2, -2], [2, -2], [2, 2], [-2, 2]]],
      },
    };
    addElement = (option) => {
      diagram.addElement({
        name: 't',
        method: 'text',
        options: options[option],
      });
      diagram.initialize();
      t = diagram.elements._t;
      td = t.drawingObject;
      tr = t.getBoundingRect('diagram');
    };
  });
  test('Simple', () => {
    addElement('simple');
    expect(round(tr.left, 3)).toBe(0);
    expect(round(tr.bottom, 3)).toBe(a.bottom);
    expect(round(tr.right, 3)).toBe(a.right);
    expect(round(tr.top, 3)).toBe(a.top);
    expect(td.border).toEqual([getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ])]);
    expect(td.touchBorder).toEqual([getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ])]);
  });
  test('DrawingObject Buffer', () => {
    addElement('drawingObjectBuffer');
    expect(round(tr.left, 3)).toBe(0);
    expect(round(tr.bottom, 3)).toBe(a.bottom);
    expect(round(tr.right, 3)).toBe(a.right);
    expect(round(tr.top, 3)).toBe(a.top);

    // DiagramText borders
    expect(td.text[0].border).toEqual(getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ]));
    expect(td.text[0].touchBorder).toEqual(getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ]));

    // DrawingObject borders - buffer is applied to drawingObject only
    expect(td.border).toEqual([getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ])]);
    expect(td.touchBorder).toEqual([getPoints([
      [-buffer, a.bottom - buffer],
      [a.width + buffer, a.bottom - buffer],
      [a.width + buffer, a.top + buffer],
      [-buffer, a.top + buffer],
    ])]);
  });
  test('Text Buffer', () => {
    addElement('textBuffer');
    expect(round(tr.left, 3)).toBe(0);
    expect(round(tr.bottom, 3)).toBe(a.bottom);
    expect(round(tr.right, 3)).toBe(a.right);
    expect(round(tr.top, 3)).toBe(a.top);

    // DiagramText borders
    expect(td.text[0].border).toEqual(getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ]));
    expect(td.text[0].touchBorder).toEqual(getPoints([
      [-buffer, a.bottom - buffer],
      [a.width + buffer, a.bottom - buffer],
      [a.width + buffer, a.top + buffer],
      [-buffer, a.top + buffer],
    ]));

    // DrawingObject borders
    expect(td.border).toEqual([getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ])]);
    expect(td.touchBorder).toEqual([getPoints([
      [-buffer, a.bottom - buffer],
      [a.width + buffer, a.bottom - buffer],
      [a.width + buffer, a.top + buffer],
      [-buffer, a.top + buffer],
    ])]);
  });
  test('Text and DrawingObject Buffer', () => {
    addElement('textAndDrawingObjectBuffer');
    // DiagramText borders
    expect(td.text[0].border).toEqual(getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ]));
    expect(td.text[0].touchBorder).toEqual(getPoints([
      [-buffer, a.bottom - buffer],
      [a.width + buffer, a.bottom - buffer],
      [a.width + buffer, a.top + buffer],
      [-buffer, a.top + buffer],
    ]));

    // DrawingObject borders - buffer is applied to drawingObject AND text
    expect(td.border).toEqual([getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ])]);
    expect(td.touchBorder).toEqual([getPoints([
      [-buffer * 2, a.bottom - buffer * 2],
      [a.width + buffer * 2, a.bottom - buffer * 2],
      [a.width + buffer * 2, a.top + buffer * 2],
      [-buffer * 2, a.top + buffer * 2],
    ])]);
  });
  test('Text custom border, DrawingObject touch buffer', () => {
    addElement('textCustomBorderDrawingObjectTouchBuffer');
    // DiagramText borders
    expect(td.text[0].border).toEqual(getPoints([
      [-1, -1], [-1, 1], [1, 1], [-1, 1],
    ]));
    expect(td.text[0].touchBorder).toEqual(getPoints([
      [-1, -1], [-1, 1], [1, 1], [-1, 1],
    ]));

    // DrawingObject borders - buffer is applied to drawingObject AND text
    expect(td.border).toEqual([getPoints([
      [-1, -1], [-1, 1], [1, 1], [-1, 1],
    ])]);
    expect(td.touchBorder).toEqual([getPoints([
      [-1 - buffer, -1 - buffer],
      [1 + buffer, -1 - buffer],
      [1 + buffer, 1 + buffer],
      [-1 - buffer, 1 + buffer],
    ])]);
  });
  test('Text custom touch border, DrawingObject custom border', () => {
    addElement('textCustomTouchBorderDrawingObjectCustomBorder');
    // DiagramText borders
    expect(td.text[0].border).toEqual(getPoints([
      [0, a.bottom], [a.width, a.bottom], [a.width, a.top], [0, a.top],
    ]));
    expect(td.text[0].touchBorder).toEqual(getPoints([
      [-1, -1], [1, -1], [1, 1], [-1, 1],
    ]));

    // DrawingObject borders - buffer is applied to drawingObject AND text
    expect(td.border).toEqual([getPoints([
      [-2, -2], [2, -2], [2, 2], [-2, 2],
    ])]);
    expect(td.touchBorder).toEqual([getPoints([
      [-1, -1], [1, -1], [1, 1], [-1, 1],
    ])]);
  });
});
