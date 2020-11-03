// @flow
import {
  Point, Line, Transform, getPoint,
} from '../../../tools/g2';
import {
  joinObjects, joinObjectsWithOptions,
} from '../../../tools/tools';
import { getPolygonPoints, getTrisFillPolygon } from './polygon/polygon';

/**
 * Arrow heads
 *
 * `'triangle' | 'circle' | 'line' | 'barb' | 'bar' | 'polygon' | 'rectangle'`
 *
 * @see {@link OBJ_Arrow} for properties related to each arrow head
 */
export type ArrowHead = 'triangle' | 'circle' | 'line' | 'barb' | 'bar' | 'polygon' | 'rectangle';

/**
 * Arrow options object.
 *
 * Lines and polylines can be terminated with different styles of arrows. The
 * `head` parameter is used to define the style of arrow head.
 *
 * ### `head: 'triangle'`
 *
 * ![](./assets1/arrow_triangle.png)
 *
 * Use `length` and `width` to customize head shape.
 *
 * Use `reverse` to reverse the triangle:
 *
 * ![](./assets1/arrow_reversetri.png)
 *
 * ### `head: 'barb'`
 *
 * ![](./assets1/arrow_barb.png)
 *
 * Use `length`, `width` and `barb` to customize head shape.
 *
 * ### `head: 'line'`
 *
 * ![](./assets1/arrow_line.png)
 *
 * Use `length` and `width` to customize head shape.
 *
 * ### `head: 'circle'`
 *
 * ![](./assets1/arrow_circle.png)
 *
 * Use `radius` and `sides` to customize head shape.
 *
 * ### `head: 'polygon'`
 *
 * ![](./assets1/arrow_polygon.png)
 *
 * Use `radius`, `sides` and `rotation` to customize head shape.
 *
 * ### `head: 'bar'`
 *
 * ![](./assets1/arrow_bar.png)
 *
 * Use `length` and `width` to customize head shape.
 *
 * ### `head: 'rectangle'`
 *
 * ![](./assets1/arrow_rectangle.png)
 *
 * Use `length` and `width` to customize head shape.
 *
 * ### General
 *
 * For arrow heads that use `length` and `width` properties, the `length` is the
 * dimension along the line.
 *
 * All properties have default values that can be scaled with the `scale`
 * property. So a `scale` of 2 will double the size of the default arrow.
 *
 * An arrow can be defined in space with:
 * - `'start'` and `angle` - the arrow start will be moved to `position` and
 *   rotated to `angle`
 * - `'tip'` and `angle` - the arrow tip will be moved to `position` and
 *   rotated to `angle`
 * - `'mid'` and `angle` - the arrow middle will be moved to `position` and
 *   rotated to `angle`
 *
 * @property {ArrowHead} [head]
 * @property {number} [scale] scale the default dimensions of the arrow
 * @property {number} [length] dimension of the arrow head along the line
 * @property {number} [width] dimension of the arrow head along the line width
 * @property {number} [rotation] rotation of the polygon when `head = 'polygon'`
 * @property {number} [sides] number of sides in polygon or circle arrow head
 * @property {number} [radius] radius of polygon or circle arrow head
 * @property {number} [barb] barb length (along the length of the line) of the
 * barb arrow head
 * @property {number} [tailWidth] width of the line that joins the arrow - if
 * defined this will create minimum dimensions for the arrow
 * @property {boolean} [tail] `true` includes a tail in the arrow of
 * width `tailWidth`
 * @property {'tip' | 'start' | 'mid'} [align]
 * @property {TypeParsablePoint} [position]
 * @property {number} [angle]
 *
 * @example
 * // Line with triangle arrows on both ends
 * diagram.addElement({
 *   name: 'a',
 *   method: 'polyline',
 *   options: {
 *     points: [[0, 0], [1, 0]],
 *     width: 0.02,
 *     arrow: 'triangle',
 *   },
 * });
 *
 * @example
 * // Line with customized barb arrow at end only
 * diagram.addElement({
 *   name: 'a',
 *   method: 'polyline',
 *   options: {
 *     points: [[0, 0], [1, 0]],
 *     width: 0.02,
 *     arrow: {
 *       end: {
 *         head: 'barb',
 *         width: 0.15,
 *         length: 0.25,
 *         barb: 0.05,
 *       },
 *     },
 *   },
 * });
 *
 * @example
 * // Line with two different arrow ends scaled by 0.7x
 * diagram.addElement({
 *   name: 'a',
 *   method: 'polyline',
 *   options: {
 *     points: [[0, 0], [1, 0]],
 *     width: 0.02,
 *     arrow: {
 *       scale: 1.2,
 *       start: 'bar',
 *       end: {
 *         head: 'polygon',
 *         sides: 6,
 *       },
 *     },
 *   },
 * });
 */
export type OBJ_Arrow = {
  head?: ArrowHead,
  scale?: number,
  length?: number,
  width?: number,
  rotation?: number,
  // reverse?: number,
  sides?: number,
  radius?: number,
  barb?: number,
  tailWidth?: number,
  tail?: boolean,
  align?: 'tip' | 'start' | 'mid',
  angle?: number,
  position: TypeParsablePoint,
}

/**
 * Line end's arrow definition options object.
 *
 * `start` and `end` define the properties of the arrows at the start and
 * end of the line. Instead of defining {@link OBJ_Arrow} objects for the
 * start and end, a string that is the arrow's `head` property can also be
 * used and the size dimensions will be the default.
 *
 * All other properties will be used as the default for the `start` and
 * `end` objects.
 *
 * If any of the default properties are defined, then the line will have
 * both a start and end arrow.
 *
 * If only one end of the line is to have an arrow, then define only the
 * `start` or `end` properties and no others.
 *
 * @property {OBJ_Arrow | ArrowHead} [start] arrow at start of line
 * @property {OBJ_Arrow | ArrowHead} [end] arrow at end of line
 * @property {ArrowHead} [head] default head to use for start and end arrow
 * @property {number} [scale] default scale to use for start and end arrow
 * @property {number} [length] default length to use for start and end arrow
 * @property {number} [width] default width to use for start and end arrow
 * @property {number} [rotation] default rotation to use for start and end arrow
 * @property {number} [reverse] default reverse to use for start and end arrow
 * @property {number} [sides] default sides to use for start and end arrow
 * @property {number} [radius] default radius to use for start and end arrow
 * @property {number} [barb] default barb to use for start and end arrow
 * @property {number} [tailWidth] width of the line that joins the arrow - if
 * defined this will create minimum dimensions for the arrow
 * @property {boolean} [tail] `true` includes a tail in the arrow of
 * width `tailWidth`
 * @property {'tip' | 'start' | 'mid'} [align]
 * @property {number} angle
 */
export type OBJ_Arrows = {
  start: OBJ_Arrow | ArrowHead,
  end: OBJ_Arrow | ArrowHead,
  head?: ArrowHead,
  scale?: number,
  length?: number,
  width?: number,
  rotation?: number,
  reverse?: number,
  sides?: number,
  radius?: number,
  barb?: number,
  tailWidth?: number,
  align?: 'tip' | 'start' | 'mid',
};


function orientArrow(
  points: Array<Point>,
  border: Array<Point>,
  touchBorder: Array<Point>,
  tail: Array<Point>,
  length: number,
  joinLength: number,
  options: {
    drawPosition: Point,
    align: 'tip' | 'start' | 'mid' | 'tail',
    angle: number,
  },
) {
  let matrix;
  if (options.align === 'start') {
    matrix = new Transform()
      .translate(length, 0)
      .rotate(options.angle)
      .translate(options.drawPosition).matrix();
  } else if (options.align === 'tip') {
    matrix = new Transform()
      .rotate(options.angle)
      .translate(options.drawPosition).matrix();
  } else if (options.align === 'mid') {
    matrix = new Transform()
      .translate(length / 2, 0)
      .rotate(options.angle)
      .translate(options.drawPosition).matrix();
  } else {
    matrix = new Transform()
      .translate(joinLength, 0)
      .rotate(options.angle)
      .translate(options.drawPosition).matrix();
  }
  // const line = new Line(start, end);
  // const matrix = new Transform().rotate(line.angle()).translate(start).matrix();
  const newPoints = points.map(p => p.transformBy(matrix));
  const newBorder = border.map(p => p.transformBy(matrix));
  const newTouchBorder = touchBorder.map(p => p.transformBy(matrix));
  const newTail = tail.map(p => p.transformBy(matrix));
  return [
    newPoints, newBorder, newTouchBorder, newTail,
    // points.length,
  ];
}

function getTouchBorder(l, w, buffer) {
  return [
    new Point(-l -buffer, -w / 2 - buffer),
    new Point(buffer, -w / 2 - buffer),
    new Point(buffer, w / 2 + buffer),
    new Point(-l - buffer, w / 2 + buffer),
  ];
}
/*
.########.########..####....###....##....##..######...##.......########
....##....##.....##..##....##.##...###...##.##....##..##.......##......
....##....##.....##..##...##...##..####..##.##........##.......##......
....##....########...##..##.....##.##.##.##.##...####.##.......######..
....##....##...##....##..#########.##..####.##....##..##.......##......
....##....##....##...##..##.....##.##...###.##....##..##.......##......
....##....##.....##.####.##.....##.##....##..######...########.########
*/
//                    ...............
//                    A              |\
//                    :              |  \
//                    :              |    \
//                    :              |      \
//                    :              |        \
//            width   :              |          \
//                    :              |            \
//                    :              |              \  (0, 0)
//    . . . . . . . . : . . . . . . .| . . . . . . . * . . . . . . . . . . . . 
//                    :         end  |              / tip
//                    :              |            /
//                    :              |          /
//                    :              |        /
//                    :              |      /
//                    :              |    /
//                    :              |  /   length
//                    V..............|/<------------->
//
//
function getTriangleArrowTail(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean,
}) {
  let t = 0;
  if (typeof o.tail === 'number') {
    t = o.tail;
  }
  t = Math.max(0, t);
  let headX = -o.length;
  if (t > 0) {
    headX = -(o.length - t);
  }
  const tailX = -o.length;
  return [new Point(tailX, o.lineWidth / 2), headX, tailX];
}


function getTriangleArrowLength(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean,
}) {
  return [o.length, o.length];
}

function getTriangleDefaults(o: {
  length?: number,
  width?: number,
  tailWidth?: number,
  scale?: number,
}) {
  let {
    length, width, tailWidth, scale,
  } = o;
  scale = scale == null ? 1 : scale;

  if (width == null) {
    if (tailWidth != null) {
      width = tailWidth * 6 * scale;
    } else if (length != null) {
      width = length;
    } else {
      width = 1;
    }
  }
  if (length == null) {
    length = width;
  }
  if (tailWidth == null) {
    tailWidth = width / 6 / scale;
  }
  return {
    width, length, tailWidth,
  };
}

function getTriangleArrow(options: {
  length: number,
  width: number,
  tailWidth: number,
  touchBorderBuffer: number,
  tail: boolean,
}) {
  const {
    length, touchBorderBuffer, tailWidth, width, tail,
  } = options;
  const [backIntersect, headX, tailX] = getTriangleArrowTail(options);
  let arrowBorder;
  let points;
  if (tail === false || backIntersect.x >= headX) {
    arrowBorder = [
      new Point(-length, -width / 2),
      new Point(0, 0),
      new Point(-length, width / 2),
    ];
    points = arrowBorder.map(p => p._dup());
  } else {
    arrowBorder = [
      new Point(tailX, -tailWidth / 2),
      new Point(headX, -tailWidth / 2),
      new Point(headX, -width / 2),
      new Point(0, 0),
      new Point(headX, width / 2),
      new Point(headX, tailWidth / 2),
      new Point(tailX, tailWidth / 2),
    ];
    points = [
      arrowBorder[4]._dup(), arrowBorder[2]._dup(), arrowBorder[3]._dup(),
      arrowBorder[6]._dup(), arrowBorder[0]._dup(), arrowBorder[1]._dup(),
      arrowBorder[6]._dup(), arrowBorder[1]._dup(), arrowBorder[5]._dup(),
    ];
  }
  const joinTail = [
    new Point(tailX, tailWidth / 2),
    new Point(tailX, -tailWidth / 2),
  ];
  let touchBorder = arrowBorder;
  if (touchBorderBuffer > 0) {
    touchBorder = getTouchBorder(length, width, touchBorderBuffer);
  }
  return [points, arrowBorder, touchBorder, joinTail];
}


/*
.......########..########.##.....##....########.########..####
.......##.....##.##.......##.....##.......##....##.....##..##.
.......##.....##.##.......##.....##.......##....##.....##..##.
.......########..######...##.....##.......##....########...##.
.......##...##...##........##...##........##....##...##....##.
.......##....##..##.........##.##.........##....##....##...##.
.......##.....##.########....###..........##....##.....##.####
*/
function getReverseTriTail(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean,
}) {
  const hLine = new Line([-o.length, o.tailWidth / 2], 1, 0);
  let headTop = new Line([-o.length, 0], [0, o.width / 2]);
  let i = hLine.intersectsWith(headTop).intersect;
  let t = 0;
  if (typeof o.tail === 'number') {
    t = o.tail;
  }
  t = Math.max(i.x, t);
  let headX = -o.length;
  if (t > 0) {
    headX = -(o.length - t);
    headTop = new Line([headX, 0], [0, o.width / 2]);
    i = hLine.intersectsWith(headTop).intersect;
  }
  let tailX = -o.length;
  if (t < 0) {
    if (-o.length - t >= i.x) {
      tailX = i.x;
    } else {
      tailX = -o.length - t;
    }
  }
  return [i, headX, tailX];
}

function getReverseTriLength(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean,
}) {
  const [, , tailX] = getReverseTriTail(o);
  return [o.length, -tailX];
}

function getReverseTriDefaults(o: {
  length?: number,
  width?: number,
  tailWidth?: number,
  barb?: number,
  scale?: number,
  // tail?: number,
}) {
  let {
    length, width, tailWidth, scale,
  } = o;
  scale = scale == null ? 1 : scale;

  if (width == null) {
    if (tailWidth != null) {
      width = tailWidth * 6 * scale;
    } else if (length != null) {
      width = length;
    } else {
      width = 1;
    }
  }
  if (length == null) {
    length = width;
  }
  if (tailWidth == null) {
    tailWidth = width / 6 / scale;
  }
  return {
    width, length, tailWidth,
  };
}

function getReverseTriangleArrow(options: {
  length: number,
  width: number,
  tailWidth: number,
  touchBorderBuffer: number,
  tail: boolean | number,
}) {
  const {
    length, touchBorderBuffer, tailWidth, width, tail,
  } = options;
  const [intersect, headX, tailX] = getReverseTriTail(options);
  let arrowBorder;
  let points;
  if (tail === false || tailX >= intersect.x) {
    arrowBorder = [
      new Point(0, -width / 2),
      new Point(-length, 0),
      new Point(0, width / 2),
    ];
    points = arrowBorder.map(p => p._dup());
  } else if (tailX > headX) {
    const vLine = new Line([tailX, -tailWidth / 2], [tailX, 0]);
    const topLine = new Line([-length, 0], [0, width / 2]);
    const i = vLine.intersectsWith(topLine).intersect;
    arrowBorder = [
      new Point(0, -width / 2),
      new Point(intersect.x, -tailWidth / 2),
      new Point(tailX, -tailWidth / 2),
      new Point(i.x, -i.y),
      new Point(-length, 0),
      new Point(i.x, i.y),
      new Point(tailX, tailWidth / 2),
      new Point(intersect.x, tailWidth / 2),
      new Point(0, width / 2),
    ];
    points = [
      arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[8]._dup(),
      arrowBorder[1]._dup(), arrowBorder[7]._dup(), arrowBorder[8]._dup(),
      arrowBorder[1]._dup(), arrowBorder[6]._dup(), arrowBorder[7]._dup(),
      arrowBorder[1]._dup(), arrowBorder[2]._dup(), arrowBorder[6]._dup(),
      arrowBorder[3]._dup(), arrowBorder[4]._dup(), arrowBorder[5]._dup(),
    ];
  } else {
    arrowBorder = [
      new Point(0, -width / 2),
      new Point(intersect.x, -tailWidth / 2),
      new Point(-length, -tailWidth / 2),
      new Point(-length, tailWidth / 2),
      new Point(intersect.x, tailWidth / 2),
      new Point(0, width / 2),
    ];
    points = [
      arrowBorder[0]._dup(), arrowBorder[4]._dup(), arrowBorder[5]._dup(),
      arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[4]._dup(),
      arrowBorder[1]._dup(), arrowBorder[3]._dup(), arrowBorder[4]._dup(),
      arrowBorder[1]._dup(), arrowBorder[2]._dup(), arrowBorder[3]._dup(),
    ];
  }
  const joinTail = [
    new Point(tailX, tailWidth / 2),
    new Point(tailX, -tailWidth / 2),
  ];
  let touchBorder = arrowBorder;
  if (touchBorderBuffer > 0) {
    touchBorder = getTouchBorder(length, width, touchBorderBuffer);
  }
  return [points, arrowBorder, touchBorder, joinTail];
}

/*
.............########.....###....########..########.
.............##.....##...##.##...##.....##.##.....##
.............##.....##..##...##..##.....##.##.....##
.............########..##.....##.########..########.
.............##.....##.#########.##...##...##.....##
.............##.....##.##.....##.##....##..##.....##
.............########..##.....##.##.....##.########.
*/
function getBarbTail(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean,
}) {
  let t = 0;
  if (typeof o.tail === 'number') {
    t = o.tail;
  }
  t = Math.max(-o.barb, t);
  let headX = -o.length;
  if (t > 0) {
    headX = -(o.length - t);
  }
  let tailX = -o.length;
  if (t < 0) {
    if (-t < o.barb) {
      tailX = -o.length - t;
    } else {
      tailX = headX + o.barb;
    }
  }
  if (o.tail === false) {
    tailX = headX + o.barb;
  }
  const line1 = new Line([tailX, o.tailWidth / 2], 1, 0);
  const back = new Line([headX + o.barb, 0], [headX, o.width / 2]);
  const backIntersect = line1.intersectsWith(back);
  let i = backIntersect.intersect;
  if (backIntersect.withinLine === false) {
    i = new Point(headX + o.barb, o.tailWidth / 2);
  }
  return [i, headX, tailX];
}

function getBarbLength(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean,
}) {
  const [, , tailX] = getBarbTail(o);
  return [o.length, -tailX];
}

function getBarbDefaults(o: {
  length?: number,
  width?: number,
  tailWidth?: number,
  barb?: number,
  scale?: number,
  // tail?: number,
}) {
  let {
    length, width, tailWidth, barb, scale,
  } = o;
  scale = scale == null ? 1 : scale;

  if (width == null) {
    if (tailWidth != null) {
      width = tailWidth * 6 * scale;
    } else if (length != null) {
      width = length;
    } else if (barb != null) {
      width = barb * 6 * scale;
    } else {
      width = 1;
    }
  }
  if (length == null) {
    length = width;
  }
  if (tailWidth == null) {
    tailWidth = width / 6 / scale;
  }
  if (barb == null) {
    barb = tailWidth * scale;
  }
  return {
    width, length, barb, tailWidth,
  };
}

function getBarbArrow(options: {
  length: number,
  width: number,
  barb: number,
  touchBorderBuffer: number,
  tailWidth: number,
  tail: boolean | number,
}) {
  const {
    length, touchBorderBuffer, tailWidth, barb, width, tail,
  } = options;
  const [backIntersect, headX, tailX] = getBarbTail(options);
  let arrowBorder;
  let points;
  if (tail === false || backIntersect.x >= headX + barb) {
    arrowBorder = [
      new Point(-length + barb, 0),
      new Point(-length, -width / 2),
      new Point(0, 0),
      new Point(-length, width / 2),
    ];
    points = [
      arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[2]._dup(),
      arrowBorder[0]._dup(), arrowBorder[2]._dup(), arrowBorder[3]._dup(),
    ];
  } else {
    arrowBorder = [
      new Point(tailX, -tailWidth / 2),
      new Point(backIntersect.x, -tailWidth / 2),
      new Point(headX, -width / 2),
      new Point(0, 0),
      new Point(headX, width / 2),
      new Point(backIntersect.x, tailWidth / 2),
      new Point(tailX, tailWidth / 2),
    ];
    points = [
      arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[5]._dup(),
      arrowBorder[0]._dup(), arrowBorder[5]._dup(), arrowBorder[6]._dup(),
      arrowBorder[2]._dup(), arrowBorder[3]._dup(), arrowBorder[1]._dup(),
      arrowBorder[5]._dup(), arrowBorder[1]._dup(), arrowBorder[3]._dup(),
      arrowBorder[5]._dup(), arrowBorder[3]._dup(), arrowBorder[4]._dup(),
    ];
  }
  const joinTail = [
    new Point(tailX, tailWidth / 2),
    new Point(tailX, -tailWidth / 2),
  ];
  let touchBorder = arrowBorder;
  if (touchBorderBuffer > 0) {
    touchBorder = getTouchBorder(length, width, touchBorderBuffer);
  }
  return [points, arrowBorder, touchBorder, joinTail];
}


/*
................########..########..######..########
................##.....##.##.......##....##....##...
................##.....##.##.......##..........##...
................########..######...##..........##...
................##...##...##.......##..........##...
................##....##..##.......##....##....##...
................##.....##.########..######.....##...
*/
function getRectTail(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean,
}) {
  let t = 0;
  if (typeof o.tail === 'number') {
    t = o.tail;
  }
  t = Math.max(0, t);
  let headX = -o.length;
  if (t > 0) {
    headX = -(o.length - t);
  }
  const tailX = -o.length;
  return [new Point(tailX, o.lineWidth / 2), headX, tailX];
}

function getRectLength(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean,
}) {
  return [o.length, o.length];
}

function getRectDefaults(o: {
  length?: number,
  width?: number,
  tailWidth?: number,
  barb?: number,
  scale?: number,
  // tail?: number,
}) {
  let {
    length, width, tailWidth, scale,
  } = o;
  scale = scale == null ? 1 : scale;

  if (width == null) {
    if (tailWidth != null) {
      width = tailWidth * 6 * scale;
    } else if (length != null) {
      width = length;
    } else if (barb != null) {
      width = barb * 6 * scale;
    } else {
      width = 1;
    }
  }
  if (length == null) {
    length = width;
  }
  if (tailWidth == null) {
    tailWidth = width / 6 / scale;
  }
  return {
    width, length, tailWidth,
  };
}

function getBarDefaults(o: {
  length?: number,
  width?: number,
  tailWidth?: number,
  barb?: number,
  scale?: number,
  // tail?: number,
}) {
  let {
    length, width, tailWidth, scale,
  } = o;
  scale = scale == null ? 1 : scale;

  if (width == null) {
    if (tailWidth != null) {
      width = tailWidth * 6 * scale;
    } else if (length != null) {
      width = length * 6;
    } else {
      width = 1;
    }
  }
  if (length == null) {
    length = width / 6;
  }
  if (tailWidth == null) {
    tailWidth = width / 6 / scale;
  }
  return {
    width, length, tailWidth,
  };
}

function getRectArrow(options: {
  length: number,
  width: number,
  start: Point,
  end: Point,
  touchBorderBuffer: number,
  tailWidth: number,
}) {
  const {
    length, touchBorderBuffer, tailWidth, width, tail,
  } = options;
  const [backIntersect, headX, tailX] = getRectTail(options);
  let arrowBorder;
  let points;
  if (tail === false || backIntersect.x >= headX) {
    arrowBorder = [
      new Point(-length, -width / 2),
      new Point(0, -width / 2),
      new Point(0, width / 2),
      new Point(-length, width / 2),
    ];
    points = [
      arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[2]._dup(),
      arrowBorder[0]._dup(), arrowBorder[2]._dup(), arrowBorder[3]._dup(),
    ];
  } else {
    arrowBorder = [
      new Point(tailX, -tailWidth / 2),
      new Point(headX, -tailWidth / 2),
      new Point(headX, -width / 2),
      new Point(0, -width / 2),
      new Point(0, width / 2),
      new Point(headX, width / 2),
      new Point(headX, tailWidth / 2),
      new Point(tailX, tailWidth / 2),
    ];
    points = [
      arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[6]._dup(),
      arrowBorder[0]._dup(), arrowBorder[6]._dup(), arrowBorder[7]._dup(),
      arrowBorder[2]._dup(), arrowBorder[3]._dup(), arrowBorder[4]._dup(),
      arrowBorder[2]._dup(), arrowBorder[4]._dup(), arrowBorder[5]._dup(),
    ];
  }
  const joinTail = [
    new Point(tailX, tailWidth / 2),
    new Point(tailX, -tailWidth / 2),
  ];
  let touchBorder = arrowBorder;
  if (touchBorderBuffer > 0) {
    touchBorder = getTouchBorder(length, width, touchBorderBuffer);
  }

  return [points, arrowBorder, touchBorder, joinTail];
}

/*
..........             ...##.......####.##....##.########
..........             ...##........##..###...##.##......
..........             ...##........##..####..##.##......
..........             ...##........##..##.##.##.######..
..........             ...##........##..##..####.##......
..........             ...##........##..##...###.##......
..........             ...########.####.##....##.########
*/
function getLineTail(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean,
}) {
  let t = 0;
  if (typeof o.tail === 'number') {
    t = o.tail;
  }
  let headX = -o.length;
  let tailX = -o.length;
  if (t > 0) {
    headX = -(o.length - t);
  }
  const topOutsideLine = new Line([headX, o.width / 2], [0, 0]);
  const topInsideLine = topOutsideLine.offset('bottom', o.tailWidth);
  const line = new Line([headX, o.tailWidth / 2], 1, 0);
  const outsideIntersect = topOutsideLine.intersectsWith(line).intersect;
  let insideIntersect = topInsideLine.intersectsWith(line).intersect;
  if (insideIntersect.x < -o.length) {
    insideIntersect = new Point(-o.length, o.tailWidth / 2);
  }
  let zeroPoint;
  const insideIntersectWithZero = topInsideLine
    .intersectsWith(new Line([-o.length, 0], 1, 0));
  if (!insideIntersectWithZero) {
    zeroPoint = -o.length;
  } else {
    zeroPoint = insideIntersectWithZero.intersect.x;
  }
  if (!insideIntersectWithZero.isWithinLine || o.tail === false) {
    tailX = -o.length;
  }
  let stubTail = false;
  if (t < 0) {
    if (-o.length - t > insideIntersect.x) {
      tailX = insideIntersect.x;
      stubTail = true;
    } else {
      tailX = -o.length - t;
    }
  }
  if (o.tail === false) {
    tailX = zeroPoint;
  }
  return [
    new Point(outsideIntersect.x, o.tailWidth / 2),
    headX, tailX, zeroPoint, topOutsideLine.p1, topInsideLine.p1,
    stubTail, insideIntersect,
  ];
}

function getLineLength(o: {
  length: number,
  width: number,
  tailWidth: number,
  tail: boolean,
}) {
  const [, , tailX] = getLineTail(o);
  return [o.length, -tailX];
}

function getLineDefaults(o: {
  length?: number,
  width?: number,
  tailWidth?: number,
  barb?: number,
  scale?: number,
  // tail?: number,
}) {
  let {
    length, width, tailWidth, scale,
  } = o;
  scale = scale == null ? 1 : scale;

  if (width == null) {
    if (tailWidth != null) {
      width = tailWidth * 6 * scale;
    } else if (length != null) {
      width = length;
    } else {
      width = 1;
    }
  }
  if (length == null) {
    length = width;
  }
  if (tailWidth == null) {
    tailWidth = width / 6 / scale;
  }
  return {
    width, length, tailWidth,
  };
}
function getLineArrow(options: {
  length: number,
  width: number,
  start: Point,
  end: Point,
  touchBorderBuffer: number,
  tailWidth: number,
}) {
  const {
    length, touchBorderBuffer, tailWidth, width, tail,
  } = options;

  const [
    frontIntersect, headX, tailX, zeroPoint, outsideTop, insideTop, stubTail,
    insideIntersect,
  ] = getLineTail(options);
  let arrowBorder;
  let points;
  console.log(frontIntersect, headX, tailX, zeroPoint, outsideTop, insideTop, stubTail, insideIntersect)
  console.log(tail)
  if (tail === false || frontIntersect.x <= tailX) {
    console.log('asdf')
    arrowBorder = [
      new Point(outsideTop.x, -outsideTop.y),
      new Point(insideTop.x, -insideTop.y),
      new Point(zeroPoint, 0),
      new Point(insideTop.x, insideTop.y),
      new Point(outsideTop.x, outsideTop.y),
      new Point(0, 0),
    ];
    points = [
      arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[5]._dup(),
      arrowBorder[1]._dup(), arrowBorder[2]._dup(), arrowBorder[5]._dup(),
      arrowBorder[2]._dup(), arrowBorder[3]._dup(), arrowBorder[4]._dup(),
      arrowBorder[2]._dup(), arrowBorder[4]._dup(), arrowBorder[5]._dup(),
    ];
  } else if (stubTail) {
    arrowBorder = [
      new Point(outsideTop.x, -outsideTop.y),
      new Point(insideTop.x, -insideTop.y),
      new Point(insideIntersect.x, -insideIntersect.y),
      new Point(insideIntersect.x, insideIntersect.y),
      new Point(insideTop.x, insideTop.y),
      new Point(outsideTop.x, outsideTop.y),
      new Point(0, 0),
    ];
    points = [
      arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[6]._dup(),
      arrowBorder[1]._dup(), arrowBorder[2]._dup(), arrowBorder[6]._dup(),
      arrowBorder[2]._dup(), arrowBorder[3]._dup(), arrowBorder[6]._dup(),
      arrowBorder[3]._dup(), arrowBorder[4]._dup(), arrowBorder[5]._dup(),
      arrowBorder[3]._dup(), arrowBorder[5]._dup(), arrowBorder[6]._dup(),
    ];
  } else {
    arrowBorder = [
      new Point(outsideTop.x, -outsideTop.y),
      new Point(insideTop.x, -insideTop.y),
      new Point(insideIntersect.x, -insideIntersect.y),
      new Point(tailX, -tailWidth / 2),
      new Point(tailX, tailWidth / 2),
      new Point(insideIntersect.x, insideIntersect.y),
      new Point(insideTop.x, insideTop.y),
      new Point(outsideTop.x, outsideTop.y),
      new Point(0, 0),
    ];
    points = [
      arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[2]._dup(),
      arrowBorder[0]._dup(), arrowBorder[2]._dup(), arrowBorder[8]._dup(),
      arrowBorder[2]._dup(), arrowBorder[5]._dup(), arrowBorder[8]._dup(),
      arrowBorder[2]._dup(), arrowBorder[3]._dup(), arrowBorder[4]._dup(),
      arrowBorder[2]._dup(), arrowBorder[4]._dup(), arrowBorder[5]._dup(),
      arrowBorder[5]._dup(), arrowBorder[6]._dup(), arrowBorder[7]._dup(),
      arrowBorder[5]._dup(), arrowBorder[7]._dup(), arrowBorder[8]._dup(),
    ];
  }
  console.log(arrowBorder)
  const joinTail = [
    new Point(tailX, tailWidth / 2),
    new Point(tailX, -tailWidth / 2),
  ];
  let touchBorder = arrowBorder;
  if (touchBorderBuffer > 0) {
    touchBorder = getTouchBorder(length, width, touchBorderBuffer);
  }
  return [points, arrowBorder, touchBorder, joinTail];



  // const {
  //   width, length, start, end, touchBorderBuffer, tailWidth,
  // } = options;
  // const line = new Line([0, -width / 2], [length, 0]);
  // const offset = line.offset('positive', tailWidth);
  // const offsetTop = new Line([offset.p1.x, -offset.p1.y], [offset.p2.x, -offset.p2.y]);
  // const horizontal = new Line([-1, -tailWidth / 2], [0, -tailWidth / 2]);
  // const i = horizontal.intersectsWith(line).intersect;
  // const i2 = offset.intersectsWith(offsetTop).intersect;

  // const arrowBorder = [
  //   new Point(-i.x, -width / 2),
  //   new Point(length - i.x, 0),
  //   new Point(-i.x, width / 2),
  //   new Point(offset.p1.x - i.x, -offset.p1.y),
  //   new Point(i2.x - i.x, 0),
  //   new Point(offset.p1.x - i.x, offset.p1.y),
  // ];
  // const points = [
  //   arrowBorder[0]._dup(), arrowBorder[1]._dup(), arrowBorder[4]._dup(),
  //   arrowBorder[5]._dup(), arrowBorder[0]._dup(), arrowBorder[4]._dup(),
  //   arrowBorder[4]._dup(), arrowBorder[1]._dup(), arrowBorder[2]._dup(),
  //   arrowBorder[4]._dup(), arrowBorder[2]._dup(), arrowBorder[3]._dup(),
  // ];
  // const borderToUse = arrowBorder;
  // let touchBorder = borderToUse;
  // if (touchBorderBuffer > 0) {
  //   touchBorder = [
  //     new Point(-touchBorderBuffer + offset.x - i.x, -width / 2 - touchBorderBuffer),
  //     new Point(length + touchBorderBuffer - i.x, -width / 2 - touchBorderBuffer),
  //     new Point(length + touchBorderBuffer - i.x, width / 2 + touchBorderBuffer),
  //     new Point(-touchBorderBuffer + offset.x - i.x, width / 2 + touchBorderBuffer),
  //   ];
  // }
  // const tail = [
  //   new Point(0, tailWidth / 2),
  //   new Point(0, -tailWidth / 2),
  // ];
  // return orientArrow(points, borderToUse, touchBorder, start, end, tail);
}


function getPolygonArrow(options: {
  // length: number,
  // width: number,
  radius: number,
  start: Point,
  end: Point,
  touchBorderBuffer: number,
  tailWidth: number,
  sides: number,
  rotation: number,
}) {
  const {
    start, end, touchBorderBuffer, tailWidth, sides, radius, rotation,
  } = options;

  const r = radius;

  const s = Math.max(sides, 3);
  const arrowBorder = getPolygonPoints({
    radius: r,
    rotation,
    offset: new Point(0, 0),
    sides: s,
    sidesToDraw: s,
    direction: 1,
  });

  const points = getTrisFillPolygon(new Point(0, 0), arrowBorder, s, s);
  const borderToUse = arrowBorder;
  let touchBorder = borderToUse;
  if (touchBorderBuffer > 0) {
    touchBorder = [
      new Point(-touchBorderBuffer, -r - touchBorderBuffer),
      new Point(r + touchBorderBuffer, -r - touchBorderBuffer),
      new Point(r + touchBorderBuffer, r + touchBorderBuffer),
      new Point(-touchBorderBuffer, r + touchBorderBuffer),
    ];
  }
  const tail = [
    new Point(0, tailWidth / 2),
    new Point(0, -tailWidth / 2),
  ];
  return orientArrow(points, borderToUse, touchBorder, start, end, tail);
}


function getArrowLength(options: {
  head: ArrowHead,
  length: number,
  tailWidth: number,
  width: number,
  radius: number,
  // reverse: boolean,
}) {
  const {
    head, width, length, tailWidth, radius, tail,
  } = options;
  if (head === 'circle' || head === 'polygon') {
    return radius;
  }
  if (head === 'line') {
    // const line = new Line([0, -width / 2], [length, 0]);
    // const horizontal = new Line([0, -tailWidth], [length, -tailWidth]);
    // const i = horizontal.intersectsWith(line).intersect;
    // return length - i.x;
    return getLineLength(options);
  }
  if (head === 'reverseTriangle') {
    return getReverseTriLength(options);
  }
  if (head === 'triangle') {
    return getTriangleArrowLength(options);
  }
  if (head === 'barb') {
    return getBarbLength(options);
  }
  if (head === 'rectangle' || head ==='bar') {
    return getRectLength(options);
  }
  // if (head === 'triangle' && reverse) {
  //   return 0;
  // }
  return length;
}


function getArrow(options: {
  head: ArrowHead,
  length: number,
  width: number,
  barb: number,
  start: Point,
  end: Point,
  touchBorderBuffer: number,
  tailWidth: number,
  radius: number,
  rotation: number,
  sides: number,
  reverse: boolean,
}) {
  let points;
  let border;
  let touchBorder;
  let tail;
  if (options.tailWidth > 0 && options.width < options.tailWidth) {
    options.width = options.tailWidth * 0.001;
  }
  if (options.head === 'barb') {
    [points, border, touchBorder, tail] = getBarbArrow(options);
  } else if (options.head === 'rectangle' || options.head === 'bar') {
    [points, border, touchBorder, tail] = getRectArrow(options);
  } else if (options.head === 'line') {
    [points, border, touchBorder, tail] = getLineArrow(options);
  } else if (options.head === 'polygon' || options.head === 'circle') {
    [points, border, touchBorder, tail] = getPolygonArrow(options);
  } else if (options.head === 'reverseTriangle') {
    [points, border, touchBorder, tail] = getReverseTriangleArrow(options);
  } else {
    [points, border, touchBorder, tail] = getTriangleArrow(options);
  }
  const [length, joinLength] = getArrowLength(options);
  return orientArrow(
    points, border, touchBorder, tail, length, joinLength, options,
  );
}

function defaultArrowOptions(
  // head: ArrowHead,
  // tailWidth: number,
  // scaleIn: number = 1,
  o: Object,
) {
  const scale = 6 * o.scale;
  const defaults = {
    align: 'tip',
    tail: false,
    angle: 0,
    position: new Point(0, 0),
    // tailWidth,
  };
  if (o.head === 'triangle' || o.head == null) {
    // return getTriangleDefaults(o);
    return joinObjects({}, getTriangleDefaults(o), {
      head: 'triangle',
      // width: o.tailWidth * scale,
      // length: o.tailWidth * scale,
      // reverse: false,
    });
  }
  if (o.head === 'polygon') {
    return joinObjects({}, defaults, {
      radius: o.tailWidth * scale / 2,
      sides: 4,
      rotation: 0,
    });
  }
  if (o.head === 'circle') {
    return joinObjects({}, defaults, {
      radius: o.tailWidth * scale / 2,
      sides: 30,
      rotation: 0,
    });
  }
  if (o.head === 'barb') {
    return getBarbDefaults(o);
  }
  if (o.head === 'reverseTriangle') {
    return getReverseTriDefaults(o);
  }
  if (o.head === 'bar') {
    return getBarDefaults(o);
  }
  if (o.head === 'bar') {
    return joinObjects({}, defaults, {
      width: o.tailWidth * scale,
      length: o.tailWidth,
    });
  }
  if (o.head === 'line') {
    return getLineDefaults(o);
    // return joinObjects({}, defaults, {
    //   width: o.tailWidth * scale,
    //   length: o.tailWidth * scale,
    // });
  }
  // if (o.head === 'rectangle') {
  // otherwise head = 'rectangle'
  return getRectDefaults(o);
  // }
  // return joinObjects({}, defaults, {
  //   head: 'triangle',
  //   width: tailWidth * scale,
  //   length: tailWidth * scale,
  //   reverse: false,
  // });
}

function simplifyArrowOptions(
  arrowIn: ?{
    start: OBJ_Arrow | ArrowHead,
    end: OBJ_Arrow | ArrowHead,
  } & OBJ_Arrow | ArrowHead,
  tailWidth: number | null,
) {
  if (arrowIn == null) {
    return undefined;
  }
  let arrow = arrowIn;
  if (typeof arrowIn === 'string') {
    arrow = {
      start: arrowIn,
      end: arrowIn,
    };
  }
  const optionsForBoth = joinObjectsWithOptions({ except: ['end', 'start'] }, {}, arrow);

  const out = {};
  const processEnd = (startOrEnd) => {
    if (typeof arrow[startOrEnd] === 'string') {
      arrow[startOrEnd] = {
        head: arrow[startOrEnd],
      };
    }
    if (Object.keys(optionsForBoth).length > 0) {
      if (arrow[startOrEnd] == null) {
        arrow[startOrEnd] = joinObjects({}, optionsForBoth);
      } else {
        arrow[startOrEnd] = joinObjects({}, optionsForBoth, arrow[startOrEnd]);
      }
    }
    if (
      arrow[startOrEnd] != null
      || (arrow.start == null && arrow.end == null)
    ) {
      let defaultTailWidth = {};
      if (tailWidth != null) {
        defaultTailWidth = { tailWidth };
      }
      const o = joinObjectsWithOptions(
        { except: ['end', 'start'] }, defaultTailWidth, arrow[startOrEnd],
      );
      out[startOrEnd] = joinObjects(
        defaultArrowOptions(o),
        o,
      );
    }
    out[startOrEnd].drawPosition = getPoint(out[startOrEnd].drawPosition);
  };
  processEnd('start');
  processEnd('end');

  if (Object.keys(out).length > 0) {
    return out;
  }
  return undefined;
}

export {
  getTriangleArrow,
  getBarbArrow,
  getArrow,
  getArrowLength,
  simplifyArrowOptions,
  defaultArrowOptions,
};