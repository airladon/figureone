// @flow
import {
  Point,
} from '../../../tools/g2';
import { duplicateFromTo } from '../../../tools/tools';
import Bounds from './Bounds';
import {
  FigureElementPrimitive, FigureElementCollection,
} from '../../Element';
import { FunctionMap } from '../../../tools/FunctionMap';

export interface ElementInterface {
  ascent: number;
  descent: number;
  width: number;
  location: Point;
  height: number;
  fullSize: {
    leftOffset: number,
    width: number,
    descent: number,
    ascent: number,
    height: number,
  };
  fnMap: FunctionMap,

  calcSize(location: Point, scale: number): void;
  _dup(namedCollection?: Object): ElementInterface;
  getAllElements(): Array<ElementInterface | FigureElementPrimitive | FigureElementCollection>;
  setPositions(): void;
  offsetLocation(offset: Point): void;
  getBounds(useFullSize?: boolean): Bounds;
}

// Equation is a class that takes a set of drawing objects (TextObjects,
// FigureElementPrimitives or FigureElementCollections and HTML Objects
// and arranges their size in a )
class BlankElement {
  ascent: number;
  descent: number;
  width: number;
  height: number;

  constructor(width: number = 0.03, ascent: number = 0, descent: number = 0) {
    this.width = width;
    this.ascent = ascent;
    this.descent = descent;
    this.height = this.ascent + this.descent;
  }

  _dup() {
    return new BlankElement(this.width, this.ascent, this.descent);
  }
}

class Element implements ElementInterface {
  content: FigureElementPrimitive | FigureElementCollection | BlankElement;
  ascent: number;
  descent: number;
  width: number;
  location: Point;
  height: number;
  scale: number;
  fnMap: FunctionMap;
  fullSize: {
    leftOffset: number,
    width: number,
    height: number,
    ascent: number,
    descent: number,
  };

  constructor(content: FigureElementPrimitive | FigureElementCollection | BlankElement) {
    this.content = content;
    this.ascent = 0;
    this.descent = 0;
    this.width = 0;
    this.location = new Point(0, 0);
    this.height = 0;
    this.fullSize = {
      leftOffset: 0,
      width: this.width,
      height: this.height,
      ascent: this.ascent,
      descent: this.descent,
    };
    this.fnMap = new FunctionMap();
  }

  // execFn(fn: string | Function | null, ...args: Array<any>) {
  //   // if (fn == null) {
  //   //   return null;
  //   // }
  //   // if (typeof fn === 'string') {
  //   //   return this.fnMap.exec(fn, ...args);
  //   // }
  //   // return fn(...args);
  //   return this.fnMap.exec(fn, ...args);
  // }

  calcSize(location: Point, scale: number) {
    const { content } = this;
    if (content instanceof BlankElement) {
      this.width = content.width * scale;
      this.height = content.height * scale;
      this.ascent = content.ascent * scale;
      this.descent = content.descent * scale;
      this.location = location._dup();
      this.scale = scale;
    }
    if (content instanceof FigureElementCollection
        || content instanceof FigureElementPrimitive) {
      // Update translation and scale
      content.transform.updateTranslation(location.x, location.y);
      content.transform.updateScale(scale, scale);
      content.updateLastDrawTransform();
      if (content.internalSetTransformCallback != null) {
        this.fnMap.exec(content.internalSetTransformCallback, content.transform);
      }

      // Get the boundaries of element
      // const r = content.getRelativeVertexSpaceBoundingRect();
      const r = content.getRelativeBoundingRect('draw');
      this.location = location._dup();
      this.scale = scale;
      this.ascent = r.top * scale;
      this.descent = -r.bottom * scale;
      this.height = r.height * scale;
      this.width = r.width * scale;
    }
    this.fullSize = {
      leftOffset: 0,
      width: this.width,
      height: this.height,
      ascent: this.ascent,
      descent: this.descent,
    };
  }

  _dup(namedCollection?: Object) {
    let c;
    if (this.content instanceof BlankElement) {
      c = new Element(this.content);
    } else if (namedCollection) {
      c = new Element(namedCollection[this.content.name]);
    } else {
      c = new Element(this.content);
    }
    c.ascent = this.ascent;
    c.descent = this.descent;
    c.width = this.width;
    c.location = this.location._dup();
    c.height = this.height;
    c.scale = this.scale;
    return c;
  }

  // getFullSize() {
  //   return this.fullSize;
  // }

  getAllElements() {
    if (this.content instanceof BlankElement) {
      return [];
    }
    return [this.content];
  }

  setPositions() {
    const { content } = this;
    if (content instanceof FigureElementCollection
        || content instanceof FigureElementPrimitive) {
      content.transform.updateTranslation(this.location.x, this.location.y);
      content.transform.updateScale(this.scale, this.scale);
      content.updateLastDrawTransform();
    }
  }

  offsetLocation(offset: Point = new Point(0, 0)) {
    this.location = this.location.add(offset);
  }

  // getFullBounds() {
  //   return new Bounds({
  //     left: this.location.x + this.fullSize.leftOffset,
  //     right: this.location.x + this.fullSize.leftOffset + this.fullSize.width,
  //     top: this.location.y + this.fullSize.ascent,
  //     bottom: this.location.y - this.fullSize.descent,
  //     width: this.fullSize.width,
  //     height: this.fullSize.height,
  //     ascent: this.fullSize.ascent,
  //     descent: this.fullSize.descent,
  //   });
  // }

  getBounds(useFullSize: boolean = false) {
    if (useFullSize && this.fullSize != null) {
      return new Bounds({
        left: this.location.x + this.fullSize.leftOffset,
        right: this.location.x + this.fullSize.leftOffset + this.fullSize.width,
        top: this.location.y + this.fullSize.ascent,
        bottom: this.location.y - this.fullSize.descent,
        width: this.fullSize.width,
        height: this.fullSize.height,
        ascent: this.fullSize.ascent,
        descent: this.fullSize.descent,
      });
    }
    return new Bounds({
      left: this.location.x,
      right: this.location.x + this.width,
      top: this.location.y + this.ascent,
      bottom: this.location.y - this.descent,
      width: this.width,
      height: this.height,
      ascent: this.ascent,
      descent: this.descent,
    });
  }
}

class Elements implements ElementInterface {
  content: Array<ElementInterface>;
  ascent: number;
  descent: number;
  width: number;
  location: Point;
  height: number;
  fnMap: FunctionMap;
  fullSize: {
    leftOffset: number,
    width: number,
    height: number,
    ascent: number,
    descent: number,
  };

  constructor(content: Array<ElementInterface | null>) {
    const nonNullContent: Array<ElementInterface> = [];
    content.forEach((c) => {
      if (c !== null) {
        nonNullContent.push(c);
      }
    });
    this.content = nonNullContent;
    this.ascent = 0;
    this.descent = 0;
    this.width = 0;
    this.location = new Point(0, 0);
    this.height = 0;
    this.fnMap = new FunctionMap();
  }

  // execFn(fn: string | Function | null, ...args: Array<any>) {
  //   // if (fn == null) {
  //   //   return null;
  //   // }
  //   // if (typeof fn === 'string') {
  //   //   return this.fnMap.exec(fn, ...args);
  //   // }
  //   // return fn(...args);
  //   return this.fnMap.exec(fn, ...args);
  // }

  _dup(namedCollection?: Object) {
    const contentCopy = [];
    this.content.forEach(element => contentCopy.push(element._dup(namedCollection)));
    const c = new Elements(contentCopy);
    duplicateFromTo(this, c, ['content']);
    return c;
  }

  calcSize(location: Point, scale: number) {
    let des = 0;
    let asc = 0;
    const loc = location._dup();
    let fullBounds = null;
    this.content.forEach((element) => {
      element.calcSize(loc, scale);

      loc.x += element.width;
      if (element.descent > des) {
        des = element.descent;
      }
      if (element.ascent > asc) {
        asc = element.ascent;
      }
      const fullElementBounds = element.getBounds(true);
      if (fullBounds == null) {
        fullBounds = new Bounds();
        fullBounds.copyFrom(fullElementBounds);
      }
    });
    if (fullBounds === null) {
      fullBounds = new Bounds();
      fullBounds.left = location.x;
      fullBounds.top = location.y;
      fullBounds.bottom = location.y;
    }

    this.width = loc.x - location.x;
    this.ascent = asc;
    this.descent = des;
    this.location = location._dup();
    this.height = this.descent + this.ascent;
    this.fullSize = {
      leftOffset: this.location.x - fullBounds.left,
      width: fullBounds.width,
      ascent: fullBounds.ascent,
      descent: fullBounds.descent,
      height: fullBounds.height,
    };
  }

  // getFullBounds() {
  //   // const fullSize = {
  //   //   leftOffset: 0,
  //   //   width: this.width,
  //   //   ascent: this.ascent,
  //   //   descent: this.descent,
  //   //   height: this.height,
  //   // };
  //   // const bounds = new Bounds();
  //   // bounds.width = this.width;
  //   // bounds.left = this.location.x;
  //   // bounds.right = bounds.left + bounds.right;
  //   // bounds.bottom = this.location.y - this.descent;
  //   // bounds.top = this.location.y + this.ascent;
  //   // bounds.ascent = this.ascent;
  //   // bounds.descent = this.descent;
  //   // bounds.height = this.height;
  //   const bounds = new Bounds();
  //   bounds.left = this.location.x;
  //   bounds.bottom = this.location.y;
  //   bounds.top = this.location.y;

  //   this.content.forEach((element) => {
  //     const elementBounds = element.getBounds();
  //     bounds.growWithSameBaseline(elementBounds);
  //   });
  //   return bounds;
  // }

  getAllElements() {
    let elements = [];
    this.content.forEach((e) => {
      elements = [...elements, ...e.getAllElements()];
    });
    return elements;
  }

  setPositions() {
    this.content.forEach((e) => {
      e.setPositions();
    });
  }

  offsetLocation(offset: Point = new Point(0, 0)) {
    this.location = this.location.add(offset);
    this.content.forEach((e) => {
      e.offsetLocation(offset);
    });
  }

  getBounds(useFullSize: boolean = false) {
    if (useFullSize && this.fullSize != null) {
      return new Bounds({
        left: this.location.x + this.fullSize.leftOffset,
        right: this.location.x + this.fullSize.leftOffset + this.fullSize.width,
        top: this.location.y + this.fullSize.ascent,
        bottom: this.location.y - this.fullSize.descent,
        width: this.fullSize.width,
        height: this.fullSize.height,
        ascent: this.fullSize.ascent,
        descent: this.fullSize.descent,
      });
    }
    return new Bounds({
      left: this.location.x,
      right: this.location.x + this.width,
      top: this.location.y + this.ascent,
      bottom: this.location.y - this.descent,
      width: this.width,
      height: this.height,
      ascent: this.ascent,
      descent: this.descent,
    });
  }
}

export { BlankElement, Element, Elements };
