// @flow

import * as m2 from '../../../tools/m2';
import { Point, getPoint, Rect } from '../../../tools/g2';
import type { TypeParsablePoint } from '../../../tools/g2';
import DrawingObject from '../DrawingObject';
import DrawContext2D from '../../DrawContext2D';
import { duplicateFromTo, joinObjects } from '../../../tools/tools';

function colorArrayToString(color: Array<number>) {
  return `rgba(${
    Math.floor(color[0] * 255)},${
    Math.floor(color[1] * 255)},${
    Math.floor(color[2] * 255)},${
    color[3]})`;
}

type TypeDiagramFontOptions = {
  family?: string,
  style?: 'normal' | 'italic',
  size?: number,
  weight?: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
  // xAlign?: 'left' | 'center' | 'right',
  // yAlign?: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline',
  color?: Array<number> | null,
  opacity?: number,
};

// DiagramFont defines the font properties to be used in a TextObject
class DiagramFont {
  size: number;
  weight: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  style: 'normal' | 'italic';
  family: string;
  // xAlign: 'left' | 'center' | 'right';
  // yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline';
  color: Array<number> | null;
  opacity: number;

  constructor(optionsIn: TypeDiagramFontOptions = {}) {
  //   family: string = 'Helvetica Neue',
  //   style: string = '',
  //   size: number = 1,
  //   weight: string = '200',
  //   xAlign: 'left' | 'center' | 'right' = 'center',
  //   yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' = 'middle',
  //   color: Array<number> | null = null,
  // ) {
    const defaultOptions = {
      family: 'Helvetica Neue',
      style: '',
      size: 1,
      weight: '200',
      // xAlign: 'center',
      // yAlign: 'middle',
      color: null,
      opacity: 1,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    this.family = options.family;
    this.style = options.style;
    this.size = options.size;
    this.weight = options.weight;
    // this.xAlign = options.xAlign;
    // this.yAlign = options.yAlign;
    this.opacity = options.opacity;
    this.setColor(options.color);
  }

  setColor(color: Array<number> | null = null) {
    // if (Array.isArray(color)) {
    //   this.color = colorArrayToString(color);
    // } else {
    //   this.color = color;
    // }
    this.color = color;
  }

  setFontInContext(ctx: CanvasRenderingContext2D, scalingFactor: number = 1) {
    ctx.font = `${this.style} ${this.weight} ${this.size * scalingFactor}px ${this.family}`;
    // ctx.textAlign = this.xAlign;
    // if (this.yAlign === 'baseline') {
    //   ctx.textBaseline = 'alphabetic';
    // } else {
    //   ctx.textBaseline = this.yAlign;
    // }
  }

  setColorInContext(ctx: CanvasRenderingContext2D, color: Array<number> | null) {
    const thisColor = this.color;
    let { opacity } = this;
    if (color != null) {
      opacity *= color[3];
    }
    if (thisColor != null) {
      const c = [
        ...thisColor.slice(0, 3),
        thisColor[3] * opacity,
      ];
      ctx.fillStyle = colorArrayToString(c);
    } else if (color != null) {
      ctx.fillStyle = colorArrayToString(color);
    }
  }

  _dup() {
    return new DiagramFont({
      family: this.family,
      style: this.style,
      size: this.size,
      weight: this.weight,
      // xAlign: this.xAlign,
      // yAlign: this.yAlign,
      color: this.color,
      opacity: this.opacity,
    });
  }
}

// DiagramText is a single text element of the diagram that is drawn at
// once and referenced to the same location
class DiagramText {
  location: ?Point;
  text: string;
  font: DiagramFont;
  xAlign: 'left' | 'center' | 'right';
  yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline';
  scalingFactor: number;
  lastMeasure: {
    ascent: number,
    descent: number,
    width: number,
    left: number,
    right: number,
  }

  constructor(
    location: ?TypeParsablePoint = new Point(0, 0),
    text: string = '',
    font: DiagramFont | TypeDiagramFontOptions = new DiagramFont(),
    xAlign: 'left' | 'center' | 'right' = 'left',
    yAlign: 'top' | 'bottom' | 'middle' | 'alphabetic' | 'baseline' = 'baseline',
  ) {
    this.location = null;
    if (location != null) {
      this.location = getPoint(location)._dup();
    }
    // this.location = location._dup();
    this.text = text.slice();
    if (font instanceof DiagramFont) {
      this.font = font._dup();
    } else {
      this.font = new DiagramFont(font);
    }
    this.xAlign = xAlign;
    this.yAlign = yAlign;

    if (this.font.size < 20) {
      this.scalingFactor = this.font.size * 50;
    }
    if (this.font.size < 1) {
      const power = -Math.log(this.font.size) / Math.LN10 + 2;
      this.scalingFactor = 10 ** power;
    }
    // this.font = font._dup();
  }

  _dup() {
    return new DiagramText(this.location, this.text, this.font._dup(), this.xAlign, this.yAlign);
  }

  // This method is used instead of the actual ctx.measureText because
  // Firefox and Chrome don't yet support it's advanced features.
  // Estimates are made for height based on width.
  // eslint-disable-next-line class-methods-use-this
  measureText(
    ctx: CanvasRenderingContext2D,
    scalingFactor: number = this.scalingFactor,
  ) {
    // const location = getPoint(locationIn);
    this.font.setFontInContext(ctx, scalingFactor);

    const fontHeight = ctx.font.match(/[^ ]*px/);
    let aWidth;
    if (fontHeight != null) {
      aWidth = parseFloat(fontHeight[0]) / 2;
    } else {
      aWidth = ctx.measureText('a').width;
    }

    // Estimations of FONT ascent and descent for a baseline of "alphabetic"
    let ascent = aWidth * 1.4;
    let descent = aWidth * 0.08;

    // Uncomment below and change above consts to lets if more resolution on
    // actual text boundaries is needed

    // const maxAscentRe =
    //   /[ABCDEFGHIJKLMNOPRSTUVWXYZ1234567890!#%^&()@$Qbdtfhiklj]/g;
    const midAscentRe = /[acemnorsuvwxz*gyqp]/g;
    const midDecentRe = /[;,$]/g;
    const maxDescentRe = /[gjyqp@Q(){}[\]|]/g;

    const midAscentMatches = this.text.match(midAscentRe);
    if (Array.isArray(midAscentMatches)) {
      if (midAscentMatches.length === this.text.length) {
        ascent = aWidth * 0.95;
      }
    }

    const midDescentMatches = this.text.match(midDecentRe);
    if (Array.isArray(midDescentMatches)) {
      if (midDescentMatches.length > 0) {
        descent = aWidth * 0.2;
      }
    }

    const maxDescentMatches = this.text.match(maxDescentRe);
    if (Array.isArray(maxDescentMatches)) {
      if (maxDescentMatches.length > 0) {
        descent = aWidth * 0.5;
      }
    }

    const height = ascent + descent;

    const { width } = ctx.measureText(this.text);
    let asc = 0;
    let des = 0;
    let left = 0;
    let right = 0;

    if (this.xAlign === 'left') {
      right = width;
    }
    if (this.xAlign === 'center') {
      left = width / 2;
      right = width / 2;
    }
    if (this.xAlign === 'right') {
      left = width;
    }
    if (this.yAlign === 'alphabetic' || this.yAlign === 'baseline') {
      asc = ascent;
      des = descent;
    }
    if (this.yAlign === 'top') {
      asc = 0;
      des = height;
    }
    if (this.yAlign === 'bottom') {
      asc = height;
      des = 0;
    }
    if (this.yAlign === 'middle') {
      asc = height / 2;
      des = height / 2;
    }
    left /= this.scalingFactor;
    right /= this.scalingFactor;
    asc /= this.scalingFactor;
    des /= this.scalingFactor;

    // return new Rect(
    //   location.x - left,
    //   location.y - des,
    //   left + right,
    //   des + asc,
    // );

    this.lastMeasure = {
      left,
      right,
      ascent: asc,
      descent: des,
      width: right + left,
      height: asc + des,
    };

    return this.lastMeasure;

    // return {
    //   actualBoundingBoxLeft: left / this.scalingFactor,
    //   actualBoundingBoxRight: right / this.scalingFactor,
    //   fontBoundingBoxAscent: asc / this.scalingFactor,
    //   fontBoundingBoxDescent: des / this.scalingFactor,
    // };
  }
}

// TextObject is the DrawingObject used in the DiagramElementPrimitive.
// TextObject will draw an array of DiagramText objects.
class TextObject extends DrawingObject {
  drawContext2D: Array<DrawContext2D>;
  border: Array<Array<Point>>;
  text: Array<DiagramText>;
  scalingFactor: number;
  lastDrawTransform: Array<number>;
  lastDraw: Array<{
    x: number,
    y: number,
    width: number,
    height: number,
  }>;

  constructor(
    drawContext2D: Array<DrawContext2D> | DrawContext2D,
    text: Array<DiagramText> = [],
  ) {
    super();
    if (Array.isArray(drawContext2D)) {
      this.drawContext2D = drawContext2D;
    } else {
      this.drawContext2D = [drawContext2D];
    }
    this.text = text;
    this.scalingFactor = 1;
    this.lastDraw = [];
    this.lastDrawTransform = [];
    // this.glRect = new Rect(-1, -1, 2, 2);
    if (text.length > 0) {
      let minSize = this.text[0].font.size;
      this.text.forEach((t) => {
        if (t.font.size > 0 && t.font.size < minSize) {
          minSize = t.font.size;
        }
      });
      if (minSize < 20) {
        this.scalingFactor = minSize * 50;
      }
      if (minSize < 1) {
        const power = -Math.log(minSize) / Math.LN10 + 2;
        this.scalingFactor = 10 ** power;
      }
    }
    this.setBorder();
    this.state = 'loaded';
  }

  setText(text: string, index: number = 0) {
    this.text[index].text = text;
    this.setBorder();
  }

  _dup() {
    const c = new TextObject(this.drawContext2D, this.text);
    duplicateFromTo(this, c);
    c.scalingFactor = this.scalingFactor;
    c.border = this.border.map(b => b.map(p => p._dup()));
    return c;
  }

  setFont(fontSize: number) {
    for (let i = 0; i < this.text.length; i += 1) {
      this.text[i].font.size = fontSize;
    }
    this.setBorder();
  }

  setOpacity(opacity: number) {
    for (let i = 0; i < this.text.length; i += 1) {
      this.text[i].font.opacity = opacity;
    }
  }

  setColor(color: Array<number>) {
    // const c = colorArrayToString(color);

    for (let i = 0; i < this.text.length; i += 1) {
      this.text[i].font.color = color;
    }
  }

  draw(
    translation: Point,
    rotation: number,
    scale: Point,
    count: number,
    color: Array<number>,
  ) {
    let transformation = m2.identity();
    transformation = m2.translate(transformation, translation.x, translation.y);
    transformation = m2.rotate(transformation, rotation);
    transformation = m2.scale(transformation, scale.x, scale.y);
    this.drawWithTransformMatrix(m2.t(transformation), color);
  }

  // Text is drawn in pixel space which is 0, 0 in the left hand top corner on
  // a canvas of size canvas.offsetWidth x canvas.offsetHeight.
  //
  // Font size and text location is therefore defined in pixels in Context2D.
  //
  // However, in a Diagram, the text canvas is overlaid on the diagram GL
  // canvas and we want to think about the size and location of text in
  // Diagram Space or Element Space (if the element has a specific transform).
  //
  // For example, if we have a diagram with limits: min: (0, 0), max(2, 1)
  // with a canvas of 1000 x 500 then:
  //    1) Transform pixel space (1000 x 500) to be GL Space (2 x 2). i.e.
  //         - Magnify pixel space by 500 so one unit in the 2D drawing
  //           context is equivalent to 1 unit in GL Space.
  //         - Translate pixel space so 0, 0 is in the middle of the canvas
  //    2) Transform GL Space to Element Space
  //         - The transform matrix in the input parameters includes the
  //           transform to Diagram Space and then Element Space.
  //         - Now one unit in the 2D drawing context is equivalent to 1 unit
  //           in Element Space - i.e. the canvas will have limits of min(0, 0)
  //           and max(2, 1).
  //    3) Plot out all text
  //
  // However, when font size is defined in Element Space, and ends up being
  // <1 Element Space units, we have a problem. This is because font size is
  // still in pixels (just now it's super scaled up). Therefore, a scaling
  // factor is needed to make sure the font size can stay well above 1. This
  // scaling factor scales the final space, so a larger font size can be used.
  // Then all locations defined in Element Space also need to be scaled by
  // this scaling factor.
  //
  // The scaling factor can be number that is large enough to make it so the
  // font size is >>1. In the TextObject constructor, the scaling factor is
  // designed to ensure drawn text always is >20px.
  //
  // Therefore the different spaces are:
  //   - pixelSpace - original space of the 2D canvas
  //   - elementSpace - space of the DiagramElementPrimitive that holds text
  //   - scaledPixelSpace
  //
  drawWithTransformMatrix(
    transformMatrix: Array<number>,
    color: Array<number> = [1, 1, 1, 1],
    contextIndex: number = 0,
  ) {
    const drawContext2D = this.drawContext2D[contextIndex];
    const { ctx } = this.drawContext2D[contextIndex];
    ctx.save();

    // Scaling factor used to ensure font size is >> 1 pixel
    const { scalingFactor } = this;

    // First convert pixel space to a zoomed in pixel space with the same
    // dimensions as gl clip space (-1 to 1 for x, y), but inverted y
    // like to pixel space.
    // When zoomed: 1 pixel = 1 GL unit.
    // Zoom in so limits betcome 0 to 2:
    const sx = drawContext2D.canvas.offsetWidth / 2 / scalingFactor;
    const sy = drawContext2D.canvas.offsetHeight / 2 / scalingFactor;
    // Translate so limits become -1 to 1
    const tx = drawContext2D.canvas.offsetWidth / 2;
    const ty = drawContext2D.canvas.offsetHeight / 2;

    // Translate pixel space so 0,0 is in center of canvas, then scale it up
    // by the scalingFactor
    // const pixelToGLSpaceMatrix = [
    //   sx, 0, tx,
    //   0, sy, ty,
    //   0, 0, 1,
    // ];

    // Modify the incoming transformMatrix to be compatible with zoomed
    // pixel space
    //   - Scale translation by the scaling factor
    //   - Flip the y translation
    //   - Reverse rotation
    const tm = transformMatrix;
    const t = [
      tm[0], -tm[1], tm[2] * scalingFactor,
      -tm[3], tm[4], tm[5] * -scalingFactor,
      0, 0, 1,
    ];

    // Combine the zoomed pixel space with the incoming transform matrix
    // and apply it to the drawing context.
    const totalT = m2.mul([sx, 0, tx, 0, sy, ty, 0, 0, 1], t);
    ctx.transform(totalT[0], totalT[3], totalT[1], totalT[4], totalT[2], totalT[5]);
    this.lastDrawTransform = totalT.slice();

    // // Calculate the size of all the text
    // const textBounds = [];
    // let currentX;
    // let currentY;
    // this.text.forEach((text, index) => {
    //   let { location } = text;
    //   let locationPixelSpace;
    //   if (index === 0 && location == null) {
    //     locationPixelSpace = new Point(0, 0);
    //   } else if (location == null) {
    //     locationPixelSpace = new Point(currentX, currentY);
    //   } else {
    //     locationPixelSpace = new Point(
    //       location.x * scalingFactor,
    //       -location.y * scalingFactor,
    //     )
    //   }
    //   // Measure the text in scaled pixel space
    //   const measure = text.measureText(ctx, scalingFactor);
    // });
    // Fill in all the text
    this.text.forEach((diagramText) => {
      diagramText.font.setFontInContext(ctx, scalingFactor);
      diagramText.font.setColorInContext(ctx, color);
      // if (diagramText.font.color != null) {
      //   const c = [
      //     ...diagramText.font.color.slice(0, 3),  // $FlowFixMe
      //     diagramText.font.color[3] * diagramText.font.opacity * color[3],
      //   ];
      //   ctx.fillStyle = colorArrayToString(c);
      // } else {
      //   ctx.fillStyle = parentColor;
      // }
      // const w = ctx.measureText(diagramText.text).width;
      // this.lastDraw.push({
      //   width: w * 2,
      //   height: w * 2,
      //   x: diagramText.location.x * scalingFactor - w,
      //   y: diagramText.location.y * -scalingFactor - w,
      // });
      let { location } = diagramText;
      if (location == null && this.lastDraw.length === 0) {
        location = new Point(0, 0);
      } else if (location == null && this.lastDraw.length > 0) {
        const lastIndex = this.lastDraw.length - 1;
        const lastDraw = this.lastDraw[lastIndex];
        location = new Point(lastDraw.xActual + lastDraw.widthActual, lastDraw.yActual);
        console.log(lastDraw)
      } else {
      // if (location != null) {
        location.x *= scalingFactor;
        location.y *= -scalingFactor;
      }
      console.log(diagramText, location)
      this.recordLastDraw(
        ctx,
        diagramText,
        scalingFactor,
        location.x,
        location.y,
        // diagramText.location.x * scalingFactor,
        // diagramText.location.y * -scalingFactor,
      );
      ctx.fillText(
        diagramText.text,
        location.x,
        location.y,
        // diagramText.location.x * scalingFactor,
        // diagramText.location.y * -scalingFactor,
      );
    });
    ctx.restore();
  }

  recordLastDraw(
    ctx: CanvasRenderingContext2D,
    diagramText: DiagramText,
    scalingFactor: number,
    x: number,
    y: number,
  ) {
    const width = ctx.measureText(diagramText.text).width * 1.2;
    const height = diagramText.font.size * scalingFactor * 1.2;
    let bottom = y + height * 0.1;
    let left = x - width * 0.1;
    if (diagramText.font.yAlign === 'baseline' || diagramText.font.yAlign === 'alphabetic') {
      bottom = y + height * 0.2;
    } else if (diagramText.font.yAlign === 'top') {
      bottom = y + height;
    } else if (diagramText.font.yAlign === 'middle') {
      bottom = y + height / 2;
    }

    if (diagramText.font.xAlign === 'center') {
      left -= width / 2;
    } else if (diagramText.font.xAlign === 'right') {
      left -= width;
    }

    this.lastDraw.push({
      width,
      height: -height,
      x: left,
      y: bottom,
      xActual: x,
      yActual: y,
      widthActual: width / 1.2,
    });
    // console.log(this.lastDraw)
  }

  clear(contextIndex: number = 0) {
    const { lastDraw } = this;
    if (lastDraw.length > 0) {
      const { ctx } = this.drawContext2D[contextIndex];
      const t = this.lastDrawTransform;
      ctx.save();
      ctx.transform(t[0], t[3], t[1], t[4], t[2], t[5]);
      lastDraw.forEach((draw) => {
        // const x = Math.max(0, draw.x - draw.width * 0.5);
        // const y = Math.max(0, draw.y - draw.height * 0.5);
        const x = draw.x - draw.width;
        const y = draw.y - draw.height;
        ctx.clearRect(
          x,
          y,
          draw.width * 3,
          draw.height * 3,
        );
      });
      ctx.restore();
    }
    this.lastDraw = [];
  }

  getGLBoundaries(lastDrawTransformMatrix: Array<number>): Array<Array<Point>> {
    const glBoundaries = [];
    this.text.forEach((t) => {
      glBoundaries.push(this.getGLBoundaryOfText(t, lastDrawTransformMatrix));
    });
    return glBoundaries;
  }

  setBorder() {
    this.border = [];
    this.text.forEach((t) => {
      this.border.push(this.getBoundaryOfText(t));
    });
    // return glBoundaries;
  }

  // This method is used instead of the actual ctx.measureText because
  // Firefox and Chrome don't yet support it's advanced features.
  // Estimates are made for height based on width.
  // eslint-disable-next-line class-methods-use-this
  measureText(ctx: CanvasRenderingContext2D, text: DiagramText) {
    // const aWidth = ctx.measureText('a').width;
    const fontHeight = ctx.font.match(/[^ ]*px/);
    let aWidth;
    if (fontHeight != null) {
      aWidth = parseFloat(fontHeight[0]) / 2;
    } else {
      aWidth = ctx.measureText('a').width;
    }
    // const aWidth = parseFloat(ctx.font.match(/[^ ]*px/)[0]) / 2;

    // Estimations of FONT ascent and descent for a baseline of "alphabetic"
    let ascent = aWidth * 1.4;
    let descent = aWidth * 0.08;

    // Uncomment below and change above consts to lets if more resolution on
    // actual text boundaries is needed

    // const maxAscentRe =
    //   /[ABCDEFGHIJKLMNOPRSTUVWXYZ1234567890!#%^&()@$Qbdtfhiklj]/g;
    const midAscentRe = /[acemnorsuvwxz*gyqp]/g;
    const midDecentRe = /[;,$]/g;
    const maxDescentRe = /[gjyqp@Q(){}[\]|]/g;

    const midAscentMatches = text.text.match(midAscentRe);
    if (Array.isArray(midAscentMatches)) {
      if (midAscentMatches.length === text.text.length) {
        ascent = aWidth * 0.95;
      }
    }

    const midDescentMatches = text.text.match(midDecentRe);
    if (Array.isArray(midDescentMatches)) {
      if (midDescentMatches.length > 0) {
        descent = aWidth * 0.2;
      }
    }

    const maxDescentMatches = text.text.match(maxDescentRe);
    if (Array.isArray(maxDescentMatches)) {
      if (maxDescentMatches.length > 0) {
        descent = aWidth * 0.5;
      }
    }

    const height = ascent + descent;

    const { width } = ctx.measureText(text.text);
    let asc = 0;
    let des = 0;
    let left = 0;
    let right = 0;

    if (text.xAlign === 'left') {
      right = width;
    }
    if (text.xAlign === 'center') {
      left = width / 2;
      right = width / 2;
    }
    if (text.xAlign === 'right') {
      left = width;
    }
    if (text.yAlign === 'alphabetic' || text.yAlign === 'baseline') {
      asc = ascent;
      des = descent;
    }
    if (text.yAlign === 'top') {
      asc = 0;
      des = height;
    }
    if (text.yAlign === 'bottom') {
      asc = height;
      des = 0;
    }
    if (text.yAlign === 'middle') {
      asc = height / 2;
      des = height / 2;
    }
    return {
      actualBoundingBoxLeft: left,
      actualBoundingBoxRight: right,
      fontBoundingBoxAscent: asc,
      fontBoundingBoxDescent: des,
    };
  }

  getBoundaryOfText(text: DiagramText, contextIndex: number = 0): Array<Point> {
    const boundary = [];

    const { scalingFactor } = this;

    // Measure the text
    text.font.setFontInContext(this.drawContext2D[contextIndex].ctx, scalingFactor);
    // const textMetrics = this.drawContext2D.ctx.measureText(text.text);
    const textMetrics = this.measureText(this.drawContext2D[contextIndex].ctx, text);
    // Create a box around the text
    const { location } = text;
    const box = [
      new Point(
        -textMetrics.actualBoundingBoxLeft / scalingFactor,
        textMetrics.fontBoundingBoxAscent / scalingFactor,
      ).add(location),
      new Point(
        textMetrics.actualBoundingBoxRight / scalingFactor,
        textMetrics.fontBoundingBoxAscent / scalingFactor,
      ).add(location),
      new Point(
        textMetrics.actualBoundingBoxRight / scalingFactor,
        -textMetrics.fontBoundingBoxDescent / scalingFactor,
      ).add(location),
      new Point(
        -textMetrics.actualBoundingBoxLeft / scalingFactor,
        -textMetrics.fontBoundingBoxDescent / scalingFactor,
      ).add(location),
    ];
    // const textRect = text.measureText(this.drawContext2D[contextIndex].ctx, location);
    // const box = [
    //   new Point(textRect.left, textRect.top),
    //   new Point(textRect.right, textRect.top),
    //   new Point(textRect.right, textRect.bottom),
    //   new Point(textRect.left, textRect.bottom),
    // ];
    box.forEach((p) => {
      boundary.push(p);
    });
    // console.log('boundary', boundary.width, text.text)
    return boundary;
  }

  getGLBoundaryOfText(
    text: DiagramText,
    lastDrawTransformMatrix: Array<number>,
    contextIndex: number = 0,
  ): Array<Point> {
    const glBoundary = [];

    // const { scalingFactor } = this;

    // // Measure the text
    // text.font.set(this.drawContext2D.ctx, scalingFactor);
    // // const textMetrics = this.drawContext2D.ctx.measureText(text.text);
    // const textMetrics = this.measureText(this.drawContext2D.ctx, text);
    // // Create a box around the text
    // const { location } = text;
    // const box = [
    //   new Point(
    //     -textMetrics.actualBoundingBoxLeft / scalingFactor,
    //     textMetrics.fontBoundingBoxAscent / scalingFactor,
    //   ).add(location),
    //   new Point(
    //     textMetrics.actualBoundingBoxRight / scalingFactor,
    //     textMetrics.fontBoundingBoxAscent / scalingFactor,
    //   ).add(location),
    //   new Point(
    //     textMetrics.actualBoundingBoxRight / scalingFactor,
    //     -textMetrics.fontBoundingBoxDescent / scalingFactor,
    //   ).add(location),
    //   new Point(
    //     -textMetrics.actualBoundingBoxLeft / scalingFactor,
    //     -textMetrics.fontBoundingBoxDescent / scalingFactor,
    //   ).add(location),
    // ];
    const box = this.getBoundaryOfText(text, contextIndex);
    box.forEach((p) => {
      glBoundary.push(p.transformBy(lastDrawTransformMatrix));
    });
    return glBoundary;
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [
      ...super._getStateProperties(),
    ];
  }
}

export { TextObject, DiagramText, DiagramFont };
