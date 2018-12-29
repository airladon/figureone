// @flow

// import Diagram from '../Diagram';
import {
  Transform, Point,
  // threePointAngle,
} from '../../tools/g2';
// import {
//   roundNum,
// } from '../../tools/math';
import { joinObjects } from '../../tools/tools';
import {
  DiagramElementCollection, DiagramElementPrimative,
} from '../Element';
// import EquationLabel from './EquationLabel';
// import type { TypeLabelEquationOptions } from './EquationLabel';
// import { Equation } from '../DiagramElements/Equation/GLEquation';
import type {
  TypePolyLineBorderToPoint,
} from '../DiagramElements/PolyLine';
import type {
  TypeLineLabelOptions, TypeLineOptions,
} from './Line';
import type {
  TypeAngleOptions, TypeAngleLabelOptions,
} from './Angle';
import DiagramPrimatives from '../DiagramPrimatives/DiagramPrimatives';
import DiagramObjects from './DiagramObjects';
import DiagramEquation from '../DiagramEquation/DiagramEquation';

export type TypePadOptions = {
  color?: Array<number>,
  radius?: number,
  sides?: number,
  fill?: boolean,
};
export type TypePolyLineOptions = {
  position?: Point,
  points?: Array<Point>,
  close?: boolean,
  showLine?: boolean,
  color?: Array<number>,
  borderToPoint?: TypePolyLineBorderToPoint,
  width?: number,
  angle?: TypeAngleOptions | Array<TypeAngleOptions>,
  side?: TypeLineOptions | Array<TypeLineOptions>,
  pad?: TypePadOptions | Array<TypePadOptions>,
};

function makeArray<T>(
  possibleArray: T | Array<T>,
  count: number,
): Array<T> {
  if (Array.isArray(possibleArray)) {
    if (count === possibleArray.length) {
      return possibleArray;
    }
    const outArray = [];
    for (let i = 0; i < count; i += 1) {
      outArray.push(possibleArray[i % possibleArray.length]);
    }
    return outArray;
  }
  const outArray = [];
  for (let i = 0; i < count; i += 1) {
    outArray.push(possibleArray);
  }
  return outArray;
}

// function makeColorArray(
//   possibleArray: Array<Array<number> | number>,
//   count: number,
// ): Array<Array<number>> {
//   if (Array.isArray(possibleArray[0])) {
//     if (count === possibleArray.length) {                   // $FlowFixMe
//       return possibleArray;
//     }
//     const outArray = [];
//     for (let i = 0; i < count; i += 1) {                    // $FlowFixMe
//       outArray.push(possibleArray[i % possibleArray.length].slice());
//     }
//     return outArray;
//   }
//   const outArray = [];
//   for (let i = 0; i < count; i += 1) {
//     outArray.push(possibleArray.slice());
//   }                                                         // $FlowFixMe
//   return outArray;
// }

export default class DiagramObjectPolyLine extends DiagramElementCollection {
  shapes: DiagramPrimatives;
  equation: DiagramEquation;
  objects: DiagramObjects;
  animateNextFrame: void => void;
  isTouchDevice: boolean;
  largerTouchBorder: boolean;
  position: Point;
  points: Array<Point>;
  close: boolean;
  _line: ?DiagramElementPrimative;
  options: ?TypePolyLineOptions;

  constructor(
    shapes: DiagramPrimatives,
    equation: DiagramEquation,
    objects: DiagramObjects,
    isTouchDevice: boolean,
    animateNextFrame: void => void,
    options: TypePolyLineOptions = {},
  ) {
    const defaultOptions: TypePolyLineOptions = {
      position: new Point(0, 0),
      color: [0, 1, 0, 1],
      points: [new Point(1, 0), new Point(0, 0), new Point(0, 1)],
      close: false,
      showLine: true,
      borderToPoint: 'never',
      width: 0.01,
    };
    const defaultSideOptions: TypeLineOptions = {
      showLine: false,
      offset: 0,
      width: 0.01,
      color: options.color == null ? [0, 1, 0, 1] : options.color,
    };
    const defaultSideLabelOptions: TypeLineLabelOptions = {
      offset: 0.1,
      text: null,
      location: 'outside',
      subLocation: 'top',
      orientation: 'horizontal',
      linePosition: 0.5,
      scale: 0.7,
    };
    const defaultAngleOptions: TypeAngleOptions = {
      color: options.color == null ? [0, 1, 0, 1] : options.color,
      curve: {},
      autoRightAngle: true,
    };
    const defaultAngleLabelOptions: TypeAngleLabelOptions = {
      text: null,
    };
    const defaultPadOptions: TypePadOptions = {
      sides: 20,
      radius: 0.1,
      color: options.color == null ? [0, 1, 0, 1] : options.color,
      fill: true,
    };

    if (options.side != null) {
      defaultOptions.side = defaultSideOptions;
      // $FlowFixMe
      if (options.side.label != null) {
        defaultOptions.side.label = defaultSideLabelOptions;
      }
    }

    if (options.angle != null) {
      defaultOptions.angle = defaultAngleOptions;
      // $FlowFixMe
      if (options.angle.label != null) {
        defaultOptions.angle.label = defaultAngleLabelOptions;
      }
    }

    if (options.pad != null) {
      defaultOptions.pad = defaultPadOptions;
    }

    const optionsToUse = joinObjects({}, defaultOptions, options);

    if (Array.isArray(options.side)) {
      optionsToUse.side = options.side.map(side => joinObjects({}, defaultOptions.side, side));
    }

    if (Array.isArray(options.angle)) {
      optionsToUse.angle = options.angle.map(angle => joinObjects({}, defaultOptions.angle, angle));
    }

    super(new Transform('PolyLine')
      .scale(1, 1)
      .rotate(0)
      .translate(0, 0), shapes.limits);
    this.setColor(optionsToUse.color);

    this.shapes = shapes;
    this.equation = equation;
    this.objects = objects;
    this.largerTouchBorder = optionsToUse.largerTouchBorder;
    this.isTouchDevice = isTouchDevice;
    this.animateNextFrame = animateNextFrame;

    this.position = optionsToUse.position;
    this.transform.updateTranslation(this.position);
    this.close = optionsToUse.close;
    this.options = optionsToUse;

    this.points = optionsToUse.points;

    // Add Pads
    if (optionsToUse.pad) {
      const { pad } = optionsToUse;
      const pCount = optionsToUse.points.length;
      const padArray = makeArray(pad, pCount);
      for (let i = 0; i < pCount; i += 1) {
        const name = `pad${i}`;
        const padOptions = joinObjects({}, {
          transform: new Transform().translate(optionsToUse.points[i]),
        }, padArray[i]);
        const padShape = this.shapes.polygon(padOptions);
        this.add(name, padShape);
      }
    }

    // Add Line
    if (optionsToUse.showLine) {
      const line = this.shapes.polyLine({
        points: optionsToUse.points,
        color: optionsToUse.color,
        close: optionsToUse.close,
        borderToPoint: optionsToUse.borderToPoint,
        width: optionsToUse.width,
      });
      this.add('line', line);
    }

    // Add Sides
    if (optionsToUse.side) {
      const { side } = optionsToUse;
      let pCount = optionsToUse.points.length - 1;
      if (optionsToUse.close) {
        pCount += 1;
      }
      const sideArray = makeArray(side, pCount);
      for (let i = 0; i < pCount; i += 1) {
        let j = i + 1;
        if (i === pCount - 1 && optionsToUse.close) {
          j = 0;
        }
        const name = `side${i}${j}`;
        const sideOptions = joinObjects({}, {
          p1: optionsToUse.points[i],
          p2: optionsToUse.points[j],
        }, sideArray[i]);
        const sideLine = this.objects.line(sideOptions);
        this.add(name, sideLine);
      }
    }

    // Add Angles
    if (optionsToUse.angle) {
      const { angle } = optionsToUse;
      let pCount = optionsToUse.points.length;
      if (optionsToUse.close === false) {
        pCount -= 2;
      }
      const angleArray = makeArray(angle, pCount);
      let firstIndex = 0;
      if (optionsToUse.close === false) {
        firstIndex = 1;
      }
      for (let i = firstIndex; i < pCount + firstIndex; i += 1) {
        let j = i + 1;
        let k = i - 1;
        if (i === pCount - 1 && optionsToUse.close) {
          j = 0;
        }
        if (i === 0 && optionsToUse.close) {
          k = pCount - 1;
        }
        const name = `angle${i}`;
        const angleOptions = joinObjects({}, {
          p1: optionsToUse.points[k],
          p2: optionsToUse.points[i],
          p3: optionsToUse.points[j],
        }, angleArray[i]);
        const angleAnnotation = this.objects.angle(angleOptions);
        this.add(name, angleAnnotation);
      }
    }
  }

  updatePoints(newPoints: Array<Point>) {
    if (this._line != null) {
      this._line.drawingObject.change(newPoints);
    }

    // Add Pads
    let pCount = this.points.length;
    if (this.options.pad) {
      for (let i = 0; i < pCount; i += 1) {
        const name = `pad${i}`;
        if (this.elements[name]) {
          this.elements[name].setPosition(newPoints[i]);
        }
      }
    }
    if (this.options.side != null) {
      pCount = this.points.length - 1;
      if (this.close) {
        pCount += 1;
      }
      for (let i = 0; i < pCount; i += 1) {
        let j = i + 1;
        if (i === pCount - 1 && this.close) {
          j = 0;
        }
        const name = `side${i}${j}`;
        if (this.elements[name] != null) {
          this.elements[name].setEndPoints(newPoints[i], newPoints[j]);
        }
      }
    }

    if (this.options.angle != null) {
      pCount = this.points.length;
      if (this.close === false) {
        pCount -= 2;
      }
      let firstIndex = 0;
      if (this.close === false) {
        firstIndex = 1;
      }
      for (let i = firstIndex; i < pCount + firstIndex; i += 1) {
        let j = i + 1;
        let k = i - 1;
        if (i === pCount - 1 && this.close) {
          j = 0;
        }
        if (i === 0 && this.close) {
          k = pCount - 1;
        }
        const name = `angle${i}`;
        if (this.elements[name] != null) {
          this.elements[name].setAngle({
            p1: newPoints[k],
            p2: newPoints[i],
            p3: newPoints[j],
          });
        }
      }
    }
  }
}
