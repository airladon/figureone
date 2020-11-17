// @flow
import WebGLInstance from '../webgl/webgl';
import {
  Rect, // Point, Line,
} from '../../tools/g2';
import { joinObjects } from '../../tools/tools';
// import {
//   DiagramElementCollection,
// } from '../Element';
import DrawContext2D from '../DrawContext2D';
// import EquationNavigator from './EquationNavigator';
import AdvancedLine from './Line';
import AdvancedAngle from './Angle';
// eslint-disable-next-line import/no-cycle
import AdvancedPolyline from './PolyLine';
import AdvancedAxis from './Axis';
import AdvancedTrace from './Trace';
import type { ADV_Line } from './Line';
import type { ADV_Angle } from './Angle';
import type { TypeLabelOptions } from './EquationLabel';
import type { ADV_Polyline } from './PolyLine';
import type { ADV_Axis } from './Axis';
import type { ADV_Trace } from './Trace';
import EquationLabel from './EquationLabel';
import AdvancedPlot from './Plot';

export default class DiagramObjects {
  webgl: Array<WebGLInstance>;
  draw2D: DrawContext2D;
  limits: Rect;
  shapes: Object;
  equation: Object;
  isTouchDevice: boolean;
  animateNextFrame: void => void;

  constructor(
    shapes: Object,
    equation: Object,
    isTouchDevice: boolean,
    animateNextFrame: () => void,
  ) {
    this.webgl = shapes.webgl;
    this.draw2D = shapes.draw2D;
    this.limits = shapes.limits;
    this.shapes = shapes;
    this.isTouchDevice = isTouchDevice;
    this.animateNextFrame = animateNextFrame;
    this.equation = equation;
  }


  line(...options: Array<ADV_Line>) {
    // const optionsToUse = Object.assign({}, ...options);
    // console.log(Object.assign({}, ...options))
    const optionsToUse = joinObjects({}, ...options);
    return new AdvancedLine(
      this.shapes, this.equation, this.isTouchDevice,
      optionsToUse,
    );
  }

  angle(...options: Array<ADV_Angle>) {
    const optionsToUse = joinObjects({}, ...options);
    return new AdvancedAngle(
      this.shapes, this.equation, this.isTouchDevice, this.animateNextFrame,
      optionsToUse,
    );
  }

  label(...options: Array<TypeLabelOptions>) {
    // const optionsToUse = Object.assign({}, ...options);
    const optionsToUse = joinObjects({}, ...options);
    return new EquationLabel(
      this.equation, optionsToUse,
    );
  }

  polyline(...options: Array<ADV_Polyline>) {
    const optionsToUse = joinObjects({}, ...options);
    return new AdvancedPolyline(
      this.shapes, this.equation, this,
      this.isTouchDevice, this.animateNextFrame,
      optionsToUse,
    );
  }

  axis(...options: Array<ADV_Axis>) {
    const optionsToUse = joinObjects({}, ...options);
    return new AdvancedAxis(
      this.shapes, this.equation, optionsToUse,
    );
  }

  trace(...options: Array<ADV_Trace>) {
    const optionsToUse = joinObjects({}, ...options);
    return new AdvancedTrace(
      this.shapes, this.equation, optionsToUse,
    );
  }

  plot(...options: Array<ADV_Plot>) {
    const optionsToUse = joinObjects({}, ...options);
    return new AdvancedPlot(
      this.shapes, this.equation, this, optionsToUse,
    );
  }
}
