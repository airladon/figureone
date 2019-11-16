// @flow

import {
  // DiagramElementCollection, DiagramElement,
  DiagramElementPrimitive,
} from '../../../Element';
import DiagramPrimitives from '../../../DiagramPrimitives/DiagramPrimitives';
import polyLineTriangles3 from '../../../DrawingObjects/VertexObject/PolyLineTriangles3';
import {
  Point, Transform, // Rect, getPoint,
} from '../../../../tools/g2';

function updateStaticLinePoints(
  box: {
    _left: DiagramElementPrimitive,
    _down: DiagramElementPrimitive,
    _up: DiagramElementPrimitive,
    _top: DiagramElementPrimitive,
  },
  startWidth: number,
  startHeight: number,
  width: number,
  height: number,
  lineWidth: number,
) {
  const coords = [
    new Point(0, startHeight * height * 0.9),
    new Point(startWidth * height / 3, startHeight * height),
    new Point(startWidth * height / 3 * 2, 0),
    new Point(startWidth * height, height),
    new Point(width, height),
  ];
  // console.log(coords)
  const lineTriangles = polyLineTriangles3(
    coords,
    false,
    lineWidth,
    'never',
  );
  // console.log(lineTriangles.points)
  const points = [];
  for (let i = 0; i < lineTriangles.points.length; i += 2) {
    points.push(new Point(lineTriangles.points[i], lineTriangles.points[i + 1]));
  }
  // console.log(points)
  const left = box._left;
  const down = box._down;
  const up = box._up;
  const top = box._top;
  if (top == null || left == null || down == null || up == null) {
    return;
  }
  const getPoints = indexes => indexes.map(index => points[index]._dup());
  // $FlowFixMe
  left.drawingObject.changeVertices(getPoints([0, 1, 2, 3, 4, 5]));
  // $FlowFixMe
  down.drawingObject.changeVertices(getPoints([6, 7, 8, 9, 10, 11]));
  // $FlowFixMe
  up.drawingObject.changeVertices(getPoints([12, 13, 14, 15, 16, 17]));
  // $FlowFixMe
  top.drawingObject.changeVertices(getPoints([18, 19, 20, 21, 22, 23]));
}

const poly = (color: Array<number>) => ({
  points: [new Point(0, 0), new Point(0, 1)],
  color,
  width: 0.01,
  close: false,
});

export default function Radical(
  shapes: DiagramPrimitives,
  color: Array<number>,
  width: number,
  staticSize: ?(Point | [number, number]),
) {
  const radical = shapes.collection({ color, transform: new Transform('radical').scale(1, 1).translate(0, 0) });
  radical.add('left', shapes.polyLine(poly(color)));
  radical.add('down', shapes.polyLine(poly(color)));
  radical.add('up', shapes.polyLine(poly(color)));
  radical.add('top', shapes.polyLine(poly(color)));
  updateStaticLinePoints(radical, 0.2, 0.2, 1, 1, 0.01);

  // Defined every time a setSize event is called
  if (staticSize != null) {
    radical.custom.boxType = 'static';
  // defined everytime a setTransform event is called
  } else {
    radical.custom.scale = new Point(1, 1);
    radical.custom.startWidth = 0.2;
    radical.custom.startHeight = 0.2;
    radical.custom.lineWidth = 0.01;
    radical.internalSetTransformCallback = () => {
      const s = radical.getScale();
      if (radical.custom.scale.isNotEqualTo(s, 8)) {
        updateStaticLinePoints(
          radical, radical.custom.startWidth, radical.custom.startHeight,
          s.x, s.y, radical.custom.lineWidth,
        );
        radical.custom.scale = s;
      }
    };
    radical.getTransform = () => {
      const t = radical.transform._dup();
      t.updateScale(1, 1);
      return t;
    };
    radical.custom.boxType = 'dynamic';
  }

  // eslint-disable-next-line max-len
  radical.custom.setSize = (location: Point, startWidth: number, startHeight: number, widthIn: number, heightIn: number, lineWidth: number) => {
    // if (radical.custom.boxType === 'line') {
    //   updateStaticLinePoints(box, width, new Point(rectToUse.width, rectToUse.height));
    // }
    radical.custom.startWidth = startWidth;
    radical.custom.startHeight = startHeight;
    radical.custom.lineWidth = lineWidth;

    const t = radical.transform._dup();
    t.updateScale(
      widthIn,
      heightIn,
    );
    t.updateTranslation(
      location.x,
      location.y,
    );
    radical.setTransform(t);
  };
  return radical;
}
