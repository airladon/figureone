// @flow

// import Diagram from '../Diagram';
import {
  Transform, Point,
  getPoint, getTransform,
} from '../../tools/g2';
import type { TypeParsablePoint } from '../../tools/g2';
import {
  round, range,
} from '../../tools/math';
import { joinObjects } from '../../tools/tools';
import {
  DiagramElementCollection, DiagramElementPrimitive,
} from '../Element';


export type OBJ_AxisTicks = {
  start?: number,
  step?: number,
  stop?: number,
  values?: Array<number>,
  length?: number,
  offset?: number,
} & OBJ_Line;

export type OBJ_AxisLabels = {
  font?: OBJ_Font,
  precision?: number,
  rotation?: number,
  xAlign?: 'left' | 'right' | 'center',
  yAlign?: 'bottom' | 'baseline' | 'middle' | 'top',
  offset?: TypeParsablePoint,
  text?: null | Array<string>,
  values?: null | number | Array<number>,
  hide?: Array<number>,
}

export type ADV_Axis = {
  length?: number,              // draw space length
  position?: TypeParsablePoint, // collection position
  start?: number,               // value space start at draw space start
  stop?: number,                // value space stop at draw space stop
  axis?: 'x' | 'y',
  ticks?: OBJ_AxisTicks | Array<OBJ_AxisTicks>,
  grid?: OBJ_AxisTicks | Array<OBJ_AxisTicks>,
  line?: null | ADV_Line,
  font?: OBJ_Font,              // Default font
  labels?: AxisLabels | Array<AxisLabels>,
  title?: OBJ_TextLines,
  name?: string,
  auto?: [number, number],
};

// $FlowFixMe
class AdvancedAxis extends DiagramElementCollection {
  // Diagram elements
  _line: ?DiagramElementPrimitive;
  _majorTicks: ?DiagramElementPrimitive;
  _majorGrid: ?DiagramElementPrimitive;
  _minorTicks: ?DiagramElementPrimitive;
  _minorGrid: ?DiagramElementPrimitive;
  _labels: ?DiagramElementPrimitive;
  _arrow1: ?DiagramElementPrimitive;
  _arrow2: ?DiagramElementPrimitive;
  _title: ?DiagramElementPrimitive;

  shapes: Object;
  equation: Object;

  length: number;
  angle: number;
  start: number;
  stop: number;

  ticks: ?Array<OBJ_AxisTicks>;
  grid: ?Array<OBJ_AxisTicks>;
  labels: ?Array<OBJ_AxisLabels>;

  drawToValueRatio: number;
  valueToDraw: number;
  defaultFont: OBJ_Font;
  name: string;

  /**
   * @hideconstructor
   */
  constructor(
    shapes: Object,
    equation: Object,
    optionsIn: ADV_Axis,
  ) {
    super(new Transform('Axis')
      .scale(1, 1)
      .rotate(0)
      .translate(0, 0), shapes.limits);
    this.shapes = shapes;
    this.equation = equation;

    const defaultOptions = {
      length: 1,
      angle: 0,
      start: 0,
      color: shapes.defaultColor,
      font: shapes.defaultFont,
      name: '',
      line: {},
      grid: null,
      ticks: null,
    };
    if (optionsIn.auto != null) {
      const { start, stop, step } = this.calcAuto(optionsIn.auto);
      defaultOptions.start = start;
      defaultOptions.stop = stop;
      defaultOptions.ticks = { step };
    }
    const options = joinObjects({}, defaultOptions, optionsIn);
    if (options.stop == null) {
      options.stop = options.start + 1;
    }
    // console.log(options)
    this.name = options.name;
    this.defaultFont = options.font;
    this.start = options.start;
    this.stop = options.stop;
    this.length = options.length;
    this.axis = options.axis;
    this.angle = this.axis === 'x' ? 0 : Math.PI / 2;
    this.drawToValueRatio = (options.stop - options.start) / options.length;
    this.valueToDrawRatio = 1 / this.drawToValueRatio;
    if (options.ticks != null && options.labels === undefined) {
      options.labels = {};
    }
    if (options.position != null) {
      this.transform.updateTranslation(getPoint(options.position));
    }
    if (options.transform != null) {
      this.transform = getTransform(options.transform);
    }

    this.setColor(options.color);

    if (options.line != null) {
      this.addLine(options.line);
    }
    if (options.ticks != null) {
      this.addTicks(options.ticks, 'ticks');
    }
    if (options.grid != null) {
      this.addTicks(options.grid, 'grid');
    }
    if (options.labels != null) {
      this.addLabels(options.labels);
    }
    if (options.title != null) {
      this.addTitle(options.title);
    }
  }

  addLine(options: OBJ_Line) {
    const defaultOptions = {
      length: this.length,
      angle: this.angle,
      width: 0.01,
    };
    const o = joinObjects({}, defaultOptions, options);
    const line = this.shapes.line(o);
    this.line = o;
    this.add('line', line);
  }

  addTicks(optionsIn: OBJ_AxisTicks | Array<OBJ_AxisTicks>, name: 'ticks' | 'grid' = 'ticks') {
    const defaultOptions = {
      start: this.start,
      stop: this.stop,
      step: (this.stop - this.start) / 5,
      width: this.line != null ? this.line.width : 0.01,
      length: 0.1,
      angle: this.angle + Math.PI / 2,
    };
    let optionsToUse;
    if (Array.isArray(optionsIn)) {
      optionsToUse = optionsIn;
    } else {
      optionsToUse = [optionsIn];
    }
    this[name] = [];
    const elements = [];
    const lengthSign = this.axis === 'x' ? 1 : -1;
    optionsToUse.forEach((options) => {
      const o = joinObjects({}, defaultOptions, options);
      o.length *= lengthSign;
      if (o.offset == null) {
        o.offset = name === 'ticks' ? -o.length / 2 * lengthSign : 0;
      }
      const num = Math.floor((o.stop + o.step / 10000 - o.start) / o.step);
      o.num = num;
      if (o.values == null) {
        o.values = range(o.start, o.stop, o.step);
      }

      if (this.axis === 'x') {
        o.copy = [{ to: o.values.map(v => new Point(this.valueToDraw(v), 0)) }];
      } else {
        o.copy = [{ to: o.values.map(v => new Point(0, this.valueToDraw(v))) }];
      }

      if (o.p1 == null) {
        o.p1 = new Point(this.valueToDraw(o.values[0]), o.offset * lengthSign).rotate(this.angle);
      }

      const ticks = this.shapes.line(o);
      elements.push(ticks);
      this[name].push(o);
    });

    // Add elements in reverse to ensure first elements are drawn last and
    // will therefore overwrite later elements.
    elements.reverse();
    elements.forEach((element, index) => {
      this.add(`${name}${index}`, element);
    });
  }

  addTitle(options: OBJ_Text & { rotation: number, offset: TypeParsablePoint }) {
    const defaultOptions = {
      font: joinObjects({}, this.defaultFont, { size: this.defaultFont.size * 2 }),
      justify: 'center',
      xAlign: 'center',
      yAlign: this.axis === 'x' ? 'top' : 'bottom',
      rotation: this.axis === 'x' ? 0 : Math.PI / 2,
      offset: [0, 0],
    };
    const o = joinObjects({}, defaultOptions, options);
    o.offset = getPoint(o.offset);
    if (o.position == null) {
      if (this.axis === 'x') {
        o.position = new Point(this.length / 2, -0.3).add(o.offset);
      } else {
        o.position = new Point(-0.3, this.length / 2).add(o.offset);
      }
    }
    const title = this.shapes.textLines(o);
    title.transform.updateRotation(o.rotation);
    this.add('title', title);
  }

  addLabels(optionsIn: Object) {
    const defaultOptions = {
      text: null,
      precision: 1,
      values: null,
      format: 'decimal',  // or 'exponent'
      font: this.defaultFont,
      xAlign: this.axis === 'x' ? 'center' : 'right',
      yAlign: this.axis === 'x' ? 'baseline' : 'middle',
      rotation: 0,
    };
    let optionsToUse;
    if (Array.isArray(optionsIn)) {
      optionsToUse = optionsIn;
    } else {
      optionsToUse = [optionsIn];
    }
    this.labels = [];
    optionsToUse.forEach((options, index) => {
      const o = joinObjects({}, defaultOptions, options);
      if (typeof o.hide === 'number') {
        o.hide = [o.hide];
      }
      if (typeof o.values === 'number') {
        o.values = [o.values];
      }

      // Calculate auto offset
      if (o.offset == null) {
        let offset = -o.font.size - 0.05;
        if (this.ticks != null) {
          offset += this.ticks[index].p1.y;
        }
        o.offset = this.axis === 'x' ? new Point(0, offset) : new Point(offset, 0);
      } else {
        o.offset = getPoint(o.offset);
      }

      // Values where to put the labels - null is auto which is same as ticks
      let values;
      if (o.values == null && this.ticks != null) {
        values = this.ticks[index].values;
      } else {
        values = o.values;
      }

      // Text for labels at each value - null is actual value
      if (o.text == null) {
        o.text = [];
        for (let i = 0; i < values.length; i += 1) {
          if (o.format === 'decimal') {
            o.text.push(`${round(values[i], o.precision).toFixed(o.precision)}`);
          } else {
            o.text.push(`${values[i].toExponential(o.precision)}`);
          }
        }
      }

      // Generate the text objects
      const text = [];
      for (let i = 0; i < values.length; i += 1) {
        let location;
        const draw = this.valueToDraw(values[i]);
        if (this.axis === 'x') {
          location = new Point(draw + o.offset.x, o.offset.y).rotate(-o.rotation);
        } else {
          location = new Point(o.offset.x, draw + o.offset.y).rotate(-o.rotation);
        }
        if (
          o.hide == null
          || (o.hide != null && o.hide.indexOf(i) === -1)
        ) {
          text.push({
            text: o.text[i],
            location,
          });
        }
      }
      o.text = text;
      const labels = this.shapes.text(o);
      labels.transform.updateRotation(o.rotation);
      this.add(`${labels}${index}`, labels);
      this.labels.push(o);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  calcAuto(auto: [number, number]) {
    const [min, max] = auto;
    const r = max - min;
    let order = r >= 1 ? Math.ceil(Math.log10(r)) : Math.floor(Math.log10(r));
    if (order === 0) {
      order = 1;
    }
    const factor = 10 ** (order - 1);
    const newRange = Math.ceil(r / order) + 1;
    const newStart = Math.floor(min / factor) * factor;
    const newEnd = newStart + newRange;
    let step;
    switch (newRange) {
      case 3:
      case 6:
        step = newRange / 3;
        break;
      case 4:
      case 8:
        step = newRange / 4;
        break;
      case 7:
        step = newRange / 7;
        break;
      case 9:
        step = newRange / 3;
        break;
      default:
        step = newRange / 5;
    }
    console.log(min, max, order, newStart, newEnd, step)
    return {
      start: round(newStart),
      stop: round(newEnd),
      step: round(step),
    };
    // return {
    //   start: min,
    //   stop: max,
    //   step: (max - min) / 5,
    // };
  }

  _getStateProperties(options: Object) {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(options),
      'length', 'angle', 'start', 'stop',
      'ticks', 'grid', 'labels', 'drawToValueRatio', 'valueToDraw',
    ];
  }

  // _fromState(state: Object) {
  //   joinObjects(this, state);
  //   // this.setAngle({
  //   //   angle: this.angle,
  //   //   rotationOffset: this.lastLabelRotationOffset,
  //   // });
  //   return this;
  // }

  valueToDraw(value: number) {
    return (value - this.start) * this.valueToDrawRatio;
  }

  valuesToDraw(values: Array<number>) {
    return values.map(v => this.valueToDraw(v));
  }

  inAxis(value: number) {
    if (value < this.start || value > this.stop) {
      return false;
    }
    return true;
  }
  // isInAxis(value: number) {
  //   if (value )
  // }
}

export default AdvancedAxis;
