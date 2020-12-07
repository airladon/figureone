// @flow
import {
  Point, Line, threePointAngle,
} from '../../tools/g2';


function getBufferBorder(borderIn: Array<Point>, buffer: number) {
  if (typeof buffer !== 'number') {
    return buffer;
  }
  if (buffer === 0) {
    return borderIn;
  }
  // First remove all points that are >180º
  const border = [];
  const borderIndex = [];
  for (let i = 0; i < borderIn.length; i += 1) {
    let prevPoint;
    let nextPoint;
    if (i === 0) {
      prevPoint = borderIn[borderIn.length - 1];
    } else {
      prevPoint = borderIn[i - 1];
    }
    if (i === borderIn.length - 1) {
      [nextPoint] = borderIn;
    } else {
      nextPoint = borderIn[i + 1];
    }
    const angle = threePointAngle(nextPoint, borderIn[i], prevPoint);
    if (
      angle < Math.PI
      && (
        border.length === 0
        || borderIn[i].isNotEqualTo(border[border.length - 1])
      )
    ) {
      border.push(borderIn[i]);
      borderIndex.push(i);
    }
  }
  const drawBorderBuffer = [];
  const offsetLines = [];
  for (let i = 0; i < border.length; i += 1) {
    let line;
    if (i === 0) {
      line = new Line(border[border.length - 1], border[0]);
    } else {
      line = new Line(border[i - 1], border[i]);
    }
    offsetLines.push(line.offset('negative', buffer));
  }
  for (let i = 0; i < offsetLines.length; i += 1) {
    let prevLine;
    // let nextLine;
    if (i === 0) {
      prevLine = offsetLines[offsetLines.length - 1];
    } else {
      prevLine = offsetLines[i - 1];
    }
    const currentLine = offsetLines[i];
    const intersect = currentLine.intersectsWith(prevLine);
    if (intersect.intersect != null) {
      let borderPoint;
      if (i === 0) {
        borderPoint = border[border.length - 1];
      } else {
        borderPoint = border[i - 1];
      }
      if (intersect.intersect.distance(borderPoint) > buffer * 1.2) {
        const borderToBuffer = new Line(borderPoint, intersect.intersect);
        const perpLine = new Line(
          borderToBuffer.pointAtLength(buffer * 1.2),
          1,
          borderToBuffer.angle() + Math.PI / 2,
        );
        const prevIntersect = prevLine.intersectsWith(perpLine);
        const nextIntersect = currentLine.intersectsWith(perpLine);
        if (prevIntersect.intersect != null && nextIntersect.intersect != null) {
          drawBorderBuffer.push(prevIntersect.intersect);
          drawBorderBuffer.push(nextIntersect.intersect);
        } else {
          drawBorderBuffer.push(intersect.intersect);
        }
      } else {
        drawBorderBuffer.push(intersect.intersect);
      }
    }
  }

  return drawBorderBuffer;
}

export {
  getBufferBorder,
};