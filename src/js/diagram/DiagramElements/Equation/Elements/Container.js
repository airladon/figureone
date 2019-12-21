
// @flow
import {
  Point,
} from '../../../../tools/g2';
import Bounds from './Bounds';
import BaseEquationFunction from './BaseEquationFunction';


export default class Container extends BaseEquationFunction {
  calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const loc = location._dup();
    const {
      width, descent, ascent, alignX, alignY, fit, scaleModifier,
    } = this.options;
    const [mainContent] = this.contents;
    const contentBounds = new Bounds();
    const containerBounds = new Bounds();
    if (mainContent != null) {
      mainContent.calcSize(loc._dup(), scale * scaleModifier);
      contentBounds.copyFrom(mainContent);
      containerBounds.copyFrom(contentBounds);
    }

    if (width != null) {
      containerBounds.width = width;
    }

    if (descent != null) {
      containerBounds.descent = descent;
    }

    if (ascent != null) {
      containerBounds.ascent = ascent;
    }

    containerBounds.height = containerBounds.descent + containerBounds.ascent;

    if (mainContent != null) {
      if (fit === 'width') {
        mainContent.calcSize(loc._dup(), containerBounds.width / contentBounds.width);
      } else if (fit === 'height') {
        mainContent.calcSize(loc._dup(), containerBounds.height / contentBounds.height);
      } else if (fit === 'contain') {
        const newScale = Math.min(
          containerBounds.width / contentBounds.width,
          containerBounds.height / contentBounds.height,
        );
        mainContent.calcSize(loc._dup(), newScale);
      }
      contentBounds.copyFrom(mainContent);
    }

    const contentLoc = loc._dup();
    if (alignX === 'center') {
      contentLoc.x = loc.x + containerBounds.width / 2 - contentBounds.width / 2;
    } else if (alignX === 'right') {
      contentLoc.x = loc.x + containerBounds.width - contentBounds.width;
    } else if (typeof alignX === 'number') {
      contentLoc.x = loc.x + containerBounds.width * alignX;
    }

    if (alignY === 'bottom') {
      contentLoc.y = loc.y - containerBounds.descent + contentBounds.descent;
    } else if (alignY === 'middle') {
      contentLoc.y = loc.y - containerBounds.descent
                     + containerBounds.height / 2 - contentBounds.height / 2 + contentBounds.descent;
    } else if (alignY === 'top') {
      contentLoc.y = loc.y + containerBounds.ascent
                     - contentBounds.height + contentBounds.descent;
    } else if (typeof alignY === 'number') {
      contentLoc.y = loc.y - containerBounds.descent
                     + containerBounds.height * alignY + contentBounds.descent;
    }
    if (mainContent != null) {
      mainContent.offsetLocation(contentLoc.sub(mainContent.location));
    }

    this.width = containerBounds.width;
    this.height = containerBounds.height;
    this.descent = containerBounds.descent;
    this.ascent = containerBounds.ascent;
  }
}
