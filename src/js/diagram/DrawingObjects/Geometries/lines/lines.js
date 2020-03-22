// @flow
import { cornerLine, lineToCorners } from './corners';
import { lineToDash } from './dashes';
import {
  Line, Point, threePointAngleMin, threePointAngle,
} from '../../../../tools/g2';

/* eslint-disable yoda */

// A thick line is defined from:
//  * A reference line
//  * A width
//  * Where the reference line is relative to the width
//    ('mid', 'inside', 'outside')
//  * How to deal with the corners in the line
//

// Convert line segments that define the outer boundaries of a line into
// triangles for drawing in WebGL
//
//                        outside
// p1    ----------------------------------------------   p2
//       2, 4
//
//       1                                         3, 5
// p1    ----------------------------------------------   p2
//                        inside
//
function lineSegmentsToPoints(
  lineSegments: Array<[Line, Line, Line]>,
  positiveIndex: number,
  negativeIndex: number,
  width: number,
  linePrimitives: boolean,
  lineNum: number,
  fixTo: 'mid' | 'negative' | 'positive',
): [Array<Point>, Array<Array<Point>>, Array<Array<Point>>] {
  const tris = [];
  const border = [];
  const hole = [];
  lineSegments.forEach((lineSegment) => {
    const positive = lineSegment[positiveIndex];
    const negative = lineSegment[negativeIndex];
    border.push(lineSegment[negativeIndex].p1._dup());
    border.push(lineSegment[negativeIndex].p2._dup());
    hole.push(lineSegment[positiveIndex].p1._dup());
    hole.push(lineSegment[positiveIndex].p2._dup());
    if (linePrimitives) {
      const step = width / (lineNum - 1);
      for (let i = 0; i < lineNum; i += 1) {
        if (i === 0 && lineNum > 1) {
          tris.push(negative.p1._dup());
          tris.push(negative.p2._dup());
        } else if (i === 0 && lineNum === 1) {
          if (fixTo === 'negative') {
            tris.push(negative.p1._dup());
            tris.push(negative.p2._dup());
          } else if (fixTo === 'positive') {
            tris.push(positive.p1._dup());
            tris.push(positive.p2._dup());
          } else {
            const offset = negative.offset('positive', width / 2);
            tris.push(offset.p1._dup());
            tris.push(offset.p2._dup());
          }
        } else if (i === lineNum - 1) {
          tris.push(positive.p1._dup());
          tris.push(positive.p2._dup());
        } else {
          const offset = negative.offset('positive', step * i);
          tris.push(offset.p1._dup());
          tris.push(offset.p2._dup());
        }
      }
    } else {
      tris.push(positive.p1._dup());
      tris.push(positive.p2._dup());
      tris.push(negative.p1._dup());
      tris.push(negative.p1._dup());
      tris.push(positive.p2._dup());
      tris.push(negative.p2._dup());
    }
  });
  return [tris, [border], [hole]];
}

// Extend two lines to their intersection point
function joinLinesInPoint(line1: Line, lineNext: Line) {
  const intersect = line1.intersectsWith(lineNext);
  if (intersect.intersect != null) {
    line1.setP2(intersect.intersect._dup());
    lineNext.setP1(intersect.intersect._dup());
  }
}

//                    2       2        2
//                    N     o N        N
//                       No      N        N
//                      o   N       N        N
//                    o        N       N        N
//                   o            N       N        N
//            angle o                N       N        N
//                 o                    N       N        N        / Tangent
//                 o                       N  1    N        N  1 /
//                o                           N       N        N/
//  in   000000000o000000000000000000000000000000        N  1  /
//       1        o                            2            N /
//  mid  0000000000000000000000000000000000000000000000000000/
//       1                                                2 /
//  out  00000000000000000000000000000000000000000000000000/
//       1                                              2 /
//                                                       /
//
// Note, for simplicity, both inside and outside can intercept with tangent
// and geometry is valid.
function joinLinesInTangent(
  // inside: Line,
  // insideNext: Line,
  mid: Line,
  midNext: Line,
  outside: Line,
  outsideNext: Line,
) {
  const angle = threePointAngleMin(mid.p1, mid.p2, midNext.p2);
  const tangent = new Line(mid.p2, 1, mid.angle() + angle / 2 + Math.PI / 2);
  let intercept = tangent.intersectsWith(outside);
  if (intercept.intersect != null) {
    outside.setP2(intercept.intersect);
  }
  // intercept = tangent.intersectsWith(inside);
  // if (intercept.intersect != null) {
  //   inside.setP2(intercept.intersect);
  // }

  intercept = tangent.intersectsWith(outsideNext);
  if (intercept.intersect != null) {
    outsideNext.setP1(intercept.intersect);
  }
  // intercept = tangent.intersectsWith(insideNext);
  // if (intercept.intersect != null) {
  //   insideNext.setP1(intercept.intersect);
  // }
}

function joinLinesAcuteInside(
  mid: Line,
  midNext: Line,
  inside: Line,
  insideNext: Line,
) {
  // const intercept = inside.intersectsWith(insideNext);
  // if (intercept.intersect != null) {
  //   inside.setP2(intercept.intersect);
  //   insideNext.setP1(intercept.intersect);
  // }
  let intercept = inside.intersectsWith(midNext);
  if (intercept.intersect != null) {
    inside.setP2(intercept.intersect);
  }
  intercept = insideNext.intersectsWith(mid);
  if (intercept.intersect != null) {
    insideNext.setP1(intercept.intersect);
  }
}

function joinLinesObtuseInside(
  mid: Line,
  midNext: Line,
  inside: Line,
  insideNext: Line,
) {
  let intercept = inside.intersectsWith(midNext);
  if (intercept.intersect != null && intercept.intersect.isOnLine(midNext, 8)) {
    inside.setP2(intercept.intersect);
  }
  intercept = insideNext.intersectsWith(mid);
  if (intercept.intersect != null && intercept.intersect.isOnLine(mid, 8)) {
    insideNext.setP1(intercept.intersect);
  }
}

function makeLineSegments(
  points: Array<Point>,
  offset: number,
  close: boolean,
  cornerStyle: 'auto' | 'none' | 'fill',
  widthIs: 'mid' | 'inside' | 'outside' | 'positive' | 'negative',
) {
  const mainLines = [];
  const makeLine = (p1, p2) => new Line(p1, p2);
  for (let i = 0; i < points.length - 1; i += 1) {
    mainLines.push(makeLine(points[i], points[i + 1]));
  }
  if (close) {
    mainLines.push(makeLine(points[points.length - 1], points[0]));
  }

  const lineSegments = [];
  const makeOffsets = (prev, current, next) => {
    let minNegativeOffset = offset;
    let minPositiveOffset = offset;
    if (prev != null) {
      const prevAngle = threePointAngle(prev.p1, current.p1, current.p2);
      const minPrevAngle = threePointAngleMin(prev.p1, current.p1, current.p2);
      const minPrevOffset = current.distanceToPoint(prev.p1);
      const minOffset = Math.min(
        minPrevOffset, Math.tan(Math.abs(minPrevAngle)) * current.length(),
      );
      // Negative side is inside angle
      if (prevAngle < Math.PI / 2) {
        minNegativeOffset = Math.min(minNegativeOffset, minOffset);
      } else if (prevAngle > Math.PI / 2 * 3) {
        minPositiveOffset = Math.min(minPositiveOffset, minOffset);
      }
    }
    if (next != null) {
      const nextAngle = threePointAngle(current.p1, current.p2, next.p2);
      const minNextAngle = threePointAngleMin(current.p1, current.p2, next.p2);
      const minNextOffset = current.distanceToPoint(next.p2);
      const minOffset = Math.min(
        minNextOffset, Math.tan(Math.abs(minNextAngle)) * current.length(),
      );
      if (nextAngle < Math.PI / 2) {
        minNegativeOffset = Math.min(minNegativeOffset, minOffset);
      } else if (nextAngle > Math.PI / 2 * 3) {
        minPositiveOffset = Math.min(minPositiveOffset, minOffset);
      }
    }
    let negativeLine;
    let positiveLine;
    if (cornerStyle === 'auto' && widthIs !== 'mid') {
      negativeLine = current.offset('negative', minNegativeOffset);
      positiveLine = current.offset('positive', minPositiveOffset);
    } else {
      negativeLine = current.offset('negative', offset);
      positiveLine = current.offset('positive', offset);
    }
    lineSegments.push([positiveLine, current, negativeLine]);
  };

  for (let i = 0; i < mainLines.length; i += 1) {
    let prev = i > 0 ? mainLines[i - 1] : null;
    const current = mainLines[i];
    let next = i < mainLines.length - 1 ? mainLines[i + 1] : null;
    if (close && i === 0) {
      prev = mainLines[mainLines.length - 1];
    }
    if (close && i === mainLines.length - 1) {
      // eslint-disable-next-line prefer-destructuring
      next = mainLines[0];
    }
    makeOffsets(prev, current, next);
  }

  return lineSegments;
}

function getWidthIs(
  points: Array<Point>,
  close: boolean,
  widthIs: 'inside' | 'outside' | 'positive' | 'negative' | 'mid',
) {
  if (widthIs === 'mid' || widthIs === 'negative' || widthIs === 'positive') {
    return widthIs;
  }

  let numInsideNegativeAngles = 0;
  let totAngles = close ? points.length : points.length - 2;
  const testAngle = (p2: Point, p1: Point, p3: Point) => {
    const angle = threePointAngle(p2, p1, p3);
    if (angle < Math.PI) {
      numInsideNegativeAngles += 1;
    }
    if (angle === Math.PI) {
      totAngles -= 1;
    }
  };
  for (let i = 1; i < points.length - 1; i += 1) {
    testAngle(points[i - 1], points[i], points[i + 1]);
  }
  if (close) {
    testAngle(points[points.length - 1], points[0], points[1]);
    testAngle(points[points.length - 2], points[points.length - 1], points[0]);
  }

  if (numInsideNegativeAngles >= totAngles / 2) {
    if (widthIs === 'inside') {
      return 'negative';
    }
    return 'positive';
  }

  if (widthIs === 'inside') {
    return 'positive';
  }
  return 'negative';
}

function makeThickLine(
  points: Array<Point>,
  width: number = 0.01,
  widthIsIn: 'mid' | 'negative' | 'positive' | 'outside' | 'inside',
  close: boolean = false,
  corner: 'auto' | 'fill' | 'none',
  minAngleIn: ?number = Math.PI / 7,
  linePrimitives: boolean = false,
  lineNum: number,
): [Array<Point>, Array<Array<Point>>, Array<Array<Point>>] {
  let widthToUse = width;
  if (widthIsIn === 'mid') {
    widthToUse = width / 2;
  }
  const lineSegments = makeLineSegments(points, widthToUse, close, corner, widthIsIn);
  const widthIs = getWidthIs(points, close, widthIsIn);

  // Join line segments based on the angle between them
  const minAngle = minAngleIn == null ? 0 : minAngleIn;
  const joinLineSegments = (current, next) => {
    const [positive, mid, negative] = lineSegments[current];
    const [positiveNext, midNext, negativeNext] = lineSegments[next];
    const angle = threePointAngle(mid.p1, mid.p2, midNext.p2);
    // If the angle is less than 180, then the 'negative' line segments are
    // on the outside of the angle.
    if (0 < angle && angle < minAngle) {
      if (widthIs === 'mid') {
        joinLinesInTangent(mid, midNext, negative, negativeNext);
        joinLinesInTangent(mid, midNext, positive, positiveNext);
      } else if (widthIs === 'negative') {
        joinLinesAcuteInside(mid, midNext, negative, negativeNext);
      } else if (widthIs === 'positive') {
        joinLinesInTangent(mid, midNext, positive, positiveNext);
      }
    } else if (minAngle <= angle && angle <= Math.PI / 2) {
      if (widthIs === 'mid') {
        joinLinesInPoint(negative, negativeNext);
        joinLinesInPoint(positive, positiveNext);
      } else if (widthIs === 'negative') {
        joinLinesAcuteInside(mid, midNext, negative, negativeNext);
      } else if (widthIs === 'positive') {
        joinLinesInPoint(positive, positiveNext);
      }
    // If the angle is greater than the minAngle, then the line segments can
    // be connected directly
    } else if (Math.PI / 2 <= angle && angle < Math.PI) {
      if (widthIs === 'mid') {
        joinLinesInPoint(negative, negativeNext);
        joinLinesInPoint(positive, positiveNext);
      } else if (widthIs === 'negative') {
        joinLinesObtuseInside(mid, midNext, negative, negativeNext);
      } else if (widthIs === 'positive') {
        joinLinesInPoint(positive, positiveNext);
      }
    } else if (angle === Math.PI) {
      if (widthIs === 'negative') {
        if (widthIsIn === 'inside') {
          joinLinesObtuseInside(mid, midNext, negative, negativeNext);
        } else {
          joinLinesInPoint(negative, negativeNext);
        }
      } else if (widthIs === 'positive') {
        if (widthIsIn === 'inside') {
          joinLinesObtuseInside(mid, midNext, positive, positiveNext);
        } else {
          joinLinesInPoint(positive, positiveNext);
        }
      }
    // If the angle is greater than 180, then the positive side is on the
    // inside of the angle
    } else if (Math.PI < angle && angle < Math.PI / 2 * 3) {
      if (widthIs === 'mid') {
        joinLinesInPoint(negative, negativeNext);
        joinLinesInPoint(positive, positiveNext);
      } else if (widthIs === 'negative') {
        joinLinesInPoint(negative, negativeNext);
      } else if (widthIs === 'positive') {
        joinLinesObtuseInside(mid, midNext, positive, positiveNext);
      }
    //
    } else if (Math.PI / 2 * 3 <= angle && angle <= Math.PI * 2 - minAngle) {
      if (widthIs === 'mid') {
        joinLinesInPoint(negative, negativeNext);
        joinLinesInPoint(positive, positiveNext);
      } else if (widthIs === 'negative') {
        joinLinesInPoint(negative, negativeNext);
      } else if (widthIs === 'positive') {
        joinLinesAcuteInside(mid, midNext, positive, positiveNext);
      }
    //
    } else if (Math.PI * 2 - minAngle < angle && angle < Math.PI * 2) {
      if (widthIs === 'mid') {
        joinLinesInTangent(mid, midNext, negative, negativeNext);
        joinLinesInTangent(mid, midNext, positive, positiveNext);
      } else if (widthIs === 'negative') {
        joinLinesInTangent(mid, midNext, negative, negativeNext);
      } else if (widthIs === 'positive') {
        joinLinesAcuteInside(mid, midNext, positive, positiveNext);
      }
    } else if ((angle === Math.PI * 2 || angle === 0)) {
      if (widthIs === 'mid') {
        joinLinesInPoint(negative, negativeNext);
        joinLinesInPoint(positive, positiveNext);
      } else if (widthIs === 'negative') {
        joinLinesInPoint(negative, negativeNext);
      } else if (widthIs === 'positive') {
        joinLinesInPoint(positive, positiveNext);
      }
    }
  };

  // Create fill triangles between the positive & mid, and negative and mid lines
  const cornerFills = [];
  const createFill = (current, next) => {
    const [positive, mid, negative] = lineSegments[current];
    const [positiveNext, midNext, negativeNext] = lineSegments[next];
    const angle = threePointAngle(mid.p1, mid.p2, midNext.p2);
    if (angle < Math.PI) {
      if (widthIsIn !== 'inside') {
        cornerFills.push(positive.p2._dup());
        cornerFills.push(mid.p2._dup());
        cornerFills.push(positiveNext.p1._dup());
      }
    } else if (angle > Math.PI) {
      if (widthIsIn !== 'inside') {
        cornerFills.push(negative.p2._dup());
        cornerFills.push(mid.p2._dup());
        cornerFills.push(negativeNext.p1._dup());
      }
    }
  };

  // NB: this all assumes the GL primitive is TRIANGLES. Thus the order the
  // triangles is drawn is not important, and so fills can happen in chunks.
  if (corner !== 'none') {
    for (let i = 0; i < lineSegments.length - 1; i += 1) {
      if (corner === 'auto') {
        joinLineSegments(i, i + 1);
      } else {
        createFill(i, i + 1);
      }
    }
    if (close) {
      if (corner === 'auto') {
        joinLineSegments(lineSegments.length - 1, 0);
      } else {
        createFill(lineSegments.length - 1, 0);
      }
    }
  }

  let positiveSegmentIndex = 0;
  let negativeSegmentIndex = 2;
  if (widthIs === 'negative') {
    positiveSegmentIndex = 1;
  }
  if (widthIs === 'positive') {
    negativeSegmentIndex = 1;
  }
  const [tris, border, hole] = lineSegmentsToPoints(
    lineSegments, positiveSegmentIndex, negativeSegmentIndex,
    width, linePrimitives, lineNum, widthIs,
  );
  // const [tris, border, hole] = lineSegmentsToPoints(lineSegments, 0, 2);
  if (close === false) {
    return [[...tris, ...cornerFills], [[...border[0], ...hole[0].reverse()]], [[]]];
  }
  return [[...tris, ...cornerFills], border, hole];
  // return [...lineSegmentsToPoints(lineSegments, 0, 2), ...cornerFills];
}

function makePolyLine(
  pointsIn: Array<Point>,
  width: number = 0.01,
  close: boolean = false,
  widthIs: 'mid' | 'outside' | 'inside' | 'positive' | 'negative' = 'mid',
  cornerStyle: 'auto' | 'none' | 'radius' | 'fill',
  cornerSize: number,
  cornerSides: number,
  minAutoCornerAngle: number = Math.PI / 7,
  dash: Array<number> = [],
  linePrimitives: boolean = false,
  lineNum: number = 1,
): [Array<Point>, Array<Array<Point>>, Array<Array<Point>>] {
  let points = [];
  let cornerStyleToUse;
  const orderedPoints = pointsIn;
  // const orderedPoints = setPointOrder(pointsIn, close, widthIs);
  // Convert line to line with corners
  if (cornerStyle === 'auto') {
    points = orderedPoints.map(p => p._dup());
    cornerStyleToUse = 'auto';
  } else if (cornerStyle === 'radius') {
    points = cornerLine(orderedPoints, close, 'fromVertex', cornerSides, cornerSize);
    cornerStyleToUse = 'fill';
    // console.log(points)
  } else {
    // autoCorners = 'none';
    cornerStyleToUse = cornerStyle;
    points = orderedPoints.map(p => p._dup());
  }

  // Convert line to dashed line
  if (dash.length > 1) {
    const dashes = lineToDash(points, dash, close, 0);
    let closeDashes = false;
    if (dashes.length === 1) {
      closeDashes = close;
    }
    let dashedTris = [];
    let dashedBorder = [[]];
    let dashedHole = [[]];
    dashes.forEach((d) => {
      const [tris, border, hole] = makeThickLine(
        d, width, widthIs, closeDashes, cornerStyleToUse, minAutoCornerAngle,
        linePrimitives, lineNum,
      );
      dashedTris = [...dashedTris, ...tris];
      dashedBorder = [[...dashedBorder[0], ...border[0]]];
      dashedHole = [[...dashedHole[0], ...hole[0]]];
    });
    return [dashedTris, dashedBorder, dashedHole];
  }

  return makeThickLine(
    points, width, widthIs, close, cornerStyleToUse, minAutoCornerAngle,
    linePrimitives, lineNum,
  );
}

function makePolyLineCorners(
  pointsIn: Array<Point>,
  width: number = 0.01,
  close: boolean = false,
  cornerLength: number,
  // forceCornerLength: boolean,
  widthIs: 'mid' | 'outside' | 'inside' | 'positive' | 'negative' = 'mid',
  cornerStyle: 'auto' | 'none' | 'radius' | 'fill',
  cornerSize: number,
  cornerSides: number,
  minAutoCornerAngle: number = Math.PI / 7,
  linePrimitives: boolean = false,
  lineNum: number = 1,
) {
  // split line into corners
  const corners = lineToCorners(pointsIn, close, cornerLength, false);

  let tris = [];
  let borders = [];
  let holes = [];
  corners.forEach((corner) => {
    const [t, b, h] = makePolyLine(
      corner, width, false, widthIs, cornerStyle, cornerSize,
      cornerSides, minAutoCornerAngle, [], linePrimitives, lineNum,
    );
    tris = [...tris, ...t];
    borders = [...borders, ...b];
    holes = [...holes, ...h];
  });
  return [tris, borders, holes];
}

export {
  joinLinesInPoint,
  lineSegmentsToPoints,
  joinLinesInTangent,
  // makeThickLineMid,
  // makeThickLineInsideOutside,
  makePolyLine,
  makePolyLineCorners,
};


// TODO
// inside and dash
// inside and radius


// Inside and radius
// const diagram = new Fig.Diagram();
// const { Point } = Fig;

// const line = [
//     new Point(0.5, 0),
//     new Point(0, 0.024286),
//     new Point(-0.5, 0),
//     // new Point(0, 1),
// ];

// diagram.addElements([
//   {
//     name: 'pad',
//     method: 'polygon',
//     options: {
//       radius: 0.2,
//       color: [0.5, 0.5, 0.5, 0.5],
//       sides: 100,
//       fill: true,
//     },
//   },
//   {
//     name: 'r',
//     method: 'polyline',
//     options: {
//       points: line,
//       width: 0.03,
//       close: true,
//       pointsAt: 'inside',
//       cornerStyle: 'radius',
//       cornerSize: 0.05,
//       cornerSides: 10,
//     },
//   },
//   {
//     name: 'x2',
//     method: 'line',
//     options: {
//       p1: [-1, 0],
//       p2: [1, 0],
//       width: 0.005,
//       color: [0.5, 0.5, 0.5, 0.5],
//     }
//   },
// ]);

// const pad = diagram.getElement('pad');
// pad.setMovable();
// pad.setTransformCallback = () => {
//   line[1] = pad.getPosition();
//   const r = diagram.getElement('r');
//   r.updatePoints(line);
//   diagram.animateNextFrame();
// }
// diagram.initialize();
// pad.setPosition(0, 0.1);


// Inside and dash
// {
//   name: 'r',
//   method: 'polyline',
//   options: {
//     points: line,
//     width: 0.03,
//     close: true,
//     pointsAt: 'inside',
//     dash: [0.1, 0.03],
//   },
// },
