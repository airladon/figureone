// @flow
import {
  Point,
} from '../../../../tools/g2';
// import {
//   DiagramElementPrimitive, DiagramElementCollection,
// } from '../../../Element';
// import { duplicateFromTo } from '../../../../tools/tools';
import { Elements } from './Element';
import Bounds from './Bounds';
import BaseEquationFunction from './BaseEquationFunction';

export default class Bar extends BaseEquationFunction {
  calcSize(location: Point, scale: number) {
    this.location = location._dup();
    const [glyph] = this.glyphs;
    const [mainContent] = this.contents;
    const {
      side, space, overhang, length,
      left, right, top, bottom, inSize, useFullSizeContent,
    } = this.options;
    const loc = location._dup();
    const contentLoc = loc._dup();
    const glyphLoc = loc._dup();
    const contentBounds = new Bounds();
    // const originalContentBounds = new Bounds();
    const bounds = new Bounds();
    const fullBounds = new Bounds();

    // const { mainContent } = this;
    if (mainContent instanceof Elements) {
      mainContent.calcSize(loc._dup(), scale);
      contentBounds.copyFrom(mainContent);
      bounds.copyFrom(contentBounds);
      // contentBounds.width = mainContent.width;
      // contentBounds.height = mainContent.ascent + mainContent.descent;
      // contentBounds.ascent = mainContent.ascent;
      // contentBounds.descent = mainContent.descent;
      // bounds.width = mainContent.width;
      // bounds.height = mainContent.height;
      // bounds.ascent = mainContent.ascent;
      // bounds.descent = mainContent.descent;
      fullBounds.copyFrom(bounds);
    }
    let glyphLength = 0;
    let glyphWidth = 0;
    if (side === 'top' || side === 'bottom') {
      // Length
      // By default the length is the same width as the content
      glyphLength = contentBounds.width;

      // Overhand overrides the length
      if (overhang != null) {
        glyphLength = contentBounds.width + 2 * overhang;
      }

      // Bar length overrides the length
      if (length != null) {
        glyphLength = length;
      }

      // left or right have the highest priority for length
      if (left != null || right != null) {
        glyphLength = (left || 0) + contentBounds.width + (right || 0);
      }

      if (glyph != null) {
        glyphWidth = glyph.custom.getWidth(
          glyph.custom.options, glyphLength,
        );
      }
      this.glyphWidths[0] = glyphWidth;
      this.glyphHeights[0] = glyphLength;

      // y Location
      if (side === 'bottom') {
        glyphLoc.y = loc.y - contentBounds.descent - space - glyphWidth;
      } else {
        glyphLoc.y = loc.y + contentBounds.ascent + space;
      }

      // x Location moves content if overhang is > 0, glyph if overhang < 0
      if (overhang != null) {
        if (overhang > 0) {
          if (inSize) {
            contentLoc.x = loc.x + overhang;
          } else {
            glyphLoc.x = loc.x - overhang;
          }
        } else if (overhang < 0) {
          glyphLoc.x = loc.x - overhang;
        }
      }

      // x Location moves content if length > content width, glyph if smaller
      if (length != null) {
        if (length > contentBounds.width) {
          if (inSize) {
            contentLoc.x = loc.x + (length - contentBounds.width) / 2;
          } else {
            glyphLoc.x = loc.x - (length - contentBounds.width) / 2;
          }
        } else if (length < contentBounds.width) {
          glyphLoc.x = loc.x + (contentBounds.width - length) / 2;
        }
      }

      // If left > 0, then content moves, otherwise glyph does
      if (left) {
        if (left > 0) {
          if (inSize) {
            contentLoc.x = loc.x + left;
          } else {
            glyphLoc.x = loc.x - left;
          }
        } else if (left < 0) {
          glyphLoc.x = loc.x - left;
        }
      }

      fullBounds.width = Math.max(
        contentLoc.x + contentBounds.width - loc.x,
        glyphLoc.x + glyphLength - loc.x,
      );
      if (side === 'top') {
        fullBounds.ascent = contentBounds.ascent + space + glyphWidth;
        fullBounds.descent = contentBounds.descent;
      } else {
        fullBounds.ascent = contentBounds.ascent;
        fullBounds.descent = contentBounds.descent + space + glyphWidth;
      }
      fullBounds.height = fullBounds.ascent + fullBounds.descent;
      // if (inSize) {
      //   bounds.width = Math.max(
      //     contentLoc.x + contentBounds.width - loc.x,
      //     glyphLoc.x + glyphLength - loc.x,
      //   );
      //   if (side === 'top') {
      //     bounds.ascent = contentBounds.ascent + space + glyphWidth;
      //     bounds.descent = contentBounds.descent;
      //   }
      //   if (side === 'bottom') {
      //     bounds.ascent = contentBounds.ascent;
      //     bounds.descent = contentBounds.descent + space + glyphWidth;
      //   }
      //   bounds.height = bounds.ascent + bounds.descent;
      //   if (mainContent instanceof Elements) {
      //     mainContent.offsetLocation(contentLoc.sub(mainContent.location));
      //   }
      // }
    } else {
      // Length is the content height by default
      glyphLength = contentBounds.height;

      // Positive overhang makes the glyph longer, negative shorter
      if (overhang != null) {
        glyphLength = contentBounds.height + 2 * overhang;
      }

      // bar length sets the length directly
      if (length != null) {
        glyphLength = length;
      }

      if (top != null || bottom != null) {
        glyphLength = (top || 0) + contentBounds.height + (bottom || 0);
      }

      if (glyph != null) {
        glyphWidth = glyph.custom.getWidth(
          glyph.custom.options, glyphLength,
        );
      }
      this.glyphWidths[0] = glyphWidth;
      this.glyphHeights[0] = glyphLength;

      // Location
      if (side === 'left') {
        contentLoc.x = loc.x + glyphWidth + space;
        if (inSize === false) {
          glyphLoc.x = loc.x - space - glyphWidth;
        }
      } else {
        glyphLoc.x = loc.x + contentBounds.width + space;
      }
      glyphLoc.y = loc.y - contentBounds.descent;

      if (overhang) {
        glyphLoc.y = loc.y - contentBounds.descent - overhang;
      }
      if (length) {
        glyphLoc.y = loc.y - contentBounds.descent - (length - contentBounds.height) / 2;
      }

      if (bottom) {
        glyphLoc.y = loc.y - contentBounds.descent - bottom;
      }

      fullBounds.width = contentBounds.width + space + glyphWidth;
      fullBounds.descent = Math.max(loc.y - glyphLoc.y, contentBounds.descent);
      fullBounds.ascent = Math.max(
        glyphLength - (loc.y - glyphLoc.y),
        contentBounds.ascent,
      );
      fullBounds.height = bounds.ascent + bounds.descent;
      // if (inSize) {
      //   bounds.width = contentBounds.width + space + glyphWidth;
      //   bounds.descent = Math.max(loc.y - glyphLoc.y, contentBounds.descent);
      //   bounds.ascent = Math.max(
      //     glyphLength - (loc.y - glyphLoc.y),
      //     contentBounds.ascent,
      //   );
      //   bounds.height = bounds.ascent + bounds.descent;
      //   if (mainContent instanceof Elements) {
      //     mainContent.offsetLocation(contentLoc.sub(mainContent.location));
      //   }
      // }
    }
    if (inSize) {
      bounds.copyFrom(fullBounds);
      if (mainContent instanceof Elements) {
        mainContent.offsetLocation(contentLoc.sub(mainContent.location));
      }
      this.fullSize = null;
    } else {
      this.fullSize = fullBounds;
    }
    this.width = bounds.width;
    this.height = bounds.height;
    this.ascent = bounds.ascent;
    this.descent = bounds.descent;
    this.glyphLocations[0] = glyphLoc;
    // this.glyphHeights[0] = glyphLength;
    if (glyph != null) {
      glyph.custom.setSize(glyphLoc, this.glyphWidths[0], this.glyphHeights[0]);
    }
    if (glyph != null && glyph.custom.options.draw === 'static'
        && (side === 'top' || side === 'bottom')
    ) {
      const [w] = this.glyphWidths;
      const [h] = this.glyphHeights;
      this.glyphWidths[0] = h;
      this.glyphHeights[0] = w;
    }
  }
}
