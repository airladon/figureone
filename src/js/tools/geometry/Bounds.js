// @flow
/* eslint-disable no-use-before-define */
import { Point, getPoint } from './Point';
import { Rect } from './Rect';
import { Plane } from './Plane';
import { joinObjects } from '../tools';
import { getPrecision } from './common';
import { clipAngle } from './angle';
import { Line, getLine } from './Line';
import { Transform } from './Transform';
import { roundNum, round, clipValue } from '../math';
import { polarToRect } from './coordinates';
import type { TypeParsablePoint } from './Point';
import type { OBJ_LineDefinition } from './Line';


export type TypeTransformBounds = Array<Bounds | null>;

class Bounds {
  boundary: Object;
  precision: number;
  // bounds: 'inside' | 'outside';

  constructor(
    boundary: Object,
    // bounds: 'inside' | 'outside' = 'inside',
    precision: number = 8,
  ) {
    this.boundary = boundary;
    // this.bounds = bounds;
    this.precision = precision;
  }

  // eslint-disable-next-line class-methods-use-this
  _dup() {
    return new Bounds();
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  _state(options: { precision: number }) {
    return {
      f1Type: 'bounds',
      state: [
      ],
    };
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  contains(position: number | TypeParsablePoint) {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  intersect(position: number | TypeParsablePoint, direction: number = 0) {
    if (typeof position === 'number') {
      return {
        intersect: position,
        distance: 0,
        reflection: direction + Math.PI,
      };
    }
    return {
      intersect: getPoint(position),
      distance: 0,
      reflection: direction + Math.PI,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  clip(position: number | TypeParsablePoint) {
    if (typeof position === 'number') {
      return position;
    }
    return getPoint(position);
  }

  // eslint-disable-next-line class-methods-use-this
  isDefined() {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  // clipVelocity(velocity: TypeParsablePoint | number) {
  //   if (typeof velocity === 'number') {
  //     return velocity;
  //   }
  //   return getPoint(velocity);
  // }
}

// class ValueBounds extends Bounds {
//   boundary: ?number;
// }
export type TypeRangeBoundsDefinition = {
  min?: number | null,
  max?: number | null,
  precision?: number,
};

type TypeF1DefRangeBounds = {
  f1Type: 'rangeBounds',
  state: [number, number | null, number | null],
};

class RangeBounds extends Bounds {
  boundary: { min: number | null, max: number | null };

  constructor(optionsIn: TypeRangeBoundsDefinition) {
    const defaultOptions = {
      precision: 8,
      min: null,
      max: null,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    const boundary = {
      min: options.min,
      max: options.max,
    };
    super(boundary, options.precision);
  }

  isDefined() {
    if (this.boundary.min == null && this.boundary.max == null) {
      return false;
    }
    return true;
  }

  _dup() {
    return new RangeBounds({
      precision: this.precision,
      min: this.boundary.min,
      max: this.boundary.max,
    });
  }

  _state(options: { precision: number }) {
    // const { precision } = options;
    const precision = getPrecision(options);
    return {
      f1Type: 'rangeBounds',
      state: [
        this.precision,
        this.boundary.min != null ? roundNum(this.boundary.min, precision) : null,
        this.boundary.max != null ? roundNum(this.boundary.max, precision) : null,
      ],
    };
  }

  contains(position: number | TypeParsablePoint) {
    if (typeof position === 'number') {
      const p = roundNum(position, this.precision);
      if (
        (
          this.boundary.min == null
          || p >= roundNum(this.boundary.min, this.precision)
        )
        && (
          this.boundary.max == null
          || p <= roundNum(this.boundary.max, this.precision)
        )
      ) {
        return true;
      }
      return false;
    }
    const p = getPoint(position);
    if (this.contains(p.x) && this.contains(p.y) && this.contains(p.z)) {
      return true;
    }
    return false;
  }

  intersect(
    position: number | TypeParsablePoint,
    direction: number = 1,
  ) {
    const reflection = direction * -1;
    const { min, max } = this.boundary;
    if (typeof position !== 'number') {
      throw new Error(`FigureOne RangeBounds.intersect only accepts 'number' parameter for value. Provide: ${position}`);
    }
    // if (!(typeof position === 'number')) {
    //   return {
    //     intersect: null,
    //     distance: 0,
    //     reflection: direction,
    //   };
    // }

    if (this.contains(position)) {
      if (
        max != null
        && round(position, this.precision) === round(max, this.precision)
        && this.bounds === 'outside'
      ) {
        if (direction === -1) {
          return { intersect: max, distance: 0, reflection: 1 };
        }
        return { intersect: null, distance: 0, reflection: 1 };
      }
      if (
        min != null
        && round(position, this.precision) === round(min, this.precision)
        && this.bounds === 'outside'
      ) {
        if (direction === 1) {
          return { intersect: min, distance: 0, reflection: -1 };
        }
        return { intersect: null, distance: 0, reflection: -1 };
      }
      if (direction === 1) {
        if (max == null) {
          return { intersect: null, distance: 0, reflection: direction };
        }
        return {
          intersect: max,
          distance: Math.abs(position - max),
          reflection: -1,
        };
      }
      if (min == null) {
        return { intersect: null, distance: 0, reflection: direction };
      }
      return {
        intersect: min,
        distance: Math.abs(position - min),
        reflection: 1,
      };
    }
    if (
      min != null
      && position < min
      && direction === 1
    ) {
      return {
        intersect: min,
        distance: Math.abs(position - min),
        reflection,
      };
    }
    if (
      max != null
      && position > max
      && direction === -1
    ) {
      return {
        intersect: max,
        distance: Math.abs(position - max),
        reflection,
      };
    }
    return {
      intersect: null,
      distance: 0,
      reflection: direction,
    };
  }

  clip(position: number | TypeParsablePoint) {
    if (typeof position === 'number') {
      return clipValue(position, this.boundary.min, this.boundary.max);
    }
    const p = getPoint(position);
    const clipped = p._dup();
    clipped.x = clipValue(p.x, this.boundary.min, this.boundary.max);
    clipped.y = clipValue(p.y, this.boundary.min, this.boundary.max);
    clipped.z = clipValue(p.z, this.boundary.min, this.boundary.max);
    return clipped;
  }
}


/*
  A RectBounds is a rectangle around a point in a plane.

  It is defined by:
  - a position in plane around which rectangle is formed
  - topDirection/rightDirection vectors that orient the rectangle
  - left/right magnitudes that define the width of the rectangle
  - bottom/top magnitudes that define the height of the rectangle

  **********************************************     A
  *                                            *     |
  *        Top Vector                          *     |
  *             A                              *     | top
  *             |                              *     |
  *             |                              *     |
  *    position *----->                        *   ---
  *                   Right Vector             *     |
  *                                            *     | bottom
  *                                            *     |
  **********************************************     V
                |
                |
  <-------------|----------------------------->
      left                right

  A rectangle can be defined in one of several ways:
  - position, plane normal, one direction vecvtor (top or right)
  - position, top and right direction vectors

  The left, right, up, and down values must all be >= 0.

  By default the rectangle will be in the XY plane (+z normal) with a
  rightDirection vector along the +x axis.
  */
export type TypeRectBoundsDefinition = {
  position?: TypeParsablePoint,
  normal?: TypeParsablePoint,
  rightDirection?: TypeParsablePoint,
  topDirection?: TypeParsablePoint,
  left?: number,
  right?: number,
  up?: number,
  down?: number,
};

class RectBounds extends Bounds {
  plane: Plane;
  rightDirection: Point;
  topDirection: Point;
  left: number;
  right: number;
  bottom: number;
  top: number;
  boundary: {
    left: Line;
    right: Line;
    bottom: Line;
    top: Line;
  };

  constructor(optionsOrRect: TypeRectBoundsDefinition) {
    const defaultOptions = {
      position: [0, 0, 0],
      normal: [0, 0, 1],
      left: 1,
      right: 1,
      top: 1,
      bottom: 1,
      bounds: 'inside',
      precision: 8,
    };
    const options = joinObjects({}, defaultOptions, optionsOrRect);
    const position = getPoint(options.position);

    // Calculate plane, topDirection and rightDirection of the rectangle
    let plane;
    let rightDirection;
    let topDirection;
    if (options.rightDirection != null && options.topDirection != null) {
      rightDirection = getPoint(options.rightDirection).normalize();
      topDirection = getPoint(options.topDirection).normalize();
      plane = new Plane(position, rightDirection.crossProduct(topDirection));
    } else if (options.rightDirection != null) {
      rightDirection = getPoint(options.rightDirection).normalize();
      plane = new Plane(position, options.normal);
      topDirection = plane.n.crossProduct(rightDirection).normalize();
    } else if (options.topDirection != null) {
      topDirection = getPoint(options.topDirection).normalize();
      plane = new Plane(position, options.normal);
      rightDirection = topDirection.crossProduct(plane.n).normalize();
    } else {
      rightDirection = getPoint([1, 0, 0]);
      plane = new Plane(position, options.normal);
      topDirection = plane.n.crossProduct(rightDirection).normalize();
    }

    // Calculate the corner points of the rectangle
    let {
      left, right, top, bottom,
    } = options;
    let topLeft = null;
    let bottomLeft = null;
    let topRight = null;
    let bottomRight = null;
    let centerLeft = null;
    let centerRight = null;

    centerLeft = position.add(rightDirection.scale(-1 * options.left));
    centerRight = position.add(rightDirection.scale(options.right));
    topLeft = centerLeft.add(topDirection.scale(options.top));
    bottomLeft = centerLeft.add(topDirection.scale(-1 * options.bottom));
    topRight = centerRight.add(topDirection.scale(options.top));
    bottomRight = centerRight.add(topDirection.scale(-1 * options.bottom));
    right = new Line(bottomRight, topRight);
    left = new Line(bottomLeft, topLeft);
    top = new Line(topLeft, topRight);
    bottom = new Line(bottomLeft, bottomRight);

    const boundary = {
      left,
      right,
      top,
      bottom,
    };
    super(boundary, options.precision);
    this.plane = plane;
    this.position = position;
    this.topDirection = topDirection;
    this.rightDirection = rightDirection;
    this.left = options.left;
    this.right = options.right;
    this.bottom = options.bottom;
    this.top = options.top;
  }

  isDefined() {
    if (
      this.boundary.left == null
      && this.boundary.right == null
      && this.boundary.top == null
      && this.boundary.bottom == null
    ) {
      return false;
    }
    return true;
  }

  _dup() {
    return new RectBounds({
      bounds: this.bounds,
      precision: this.precision,
      left: this.left,
      right: this.right,
      bottom: this.bottom,
      top: this.top,
      position: this.position,
      topDirection: this.topDirection,
      rightDirection: this.rightDirection,
    });
  }

  round(precision: number = 8) {
    const d = this._dup();
    d.left = round(d.left, precision);
    d.right = round(d.left, precision);
    d.bottom = round(d.left, precision);
    d.top = round(d.left, precision);
    d.boundary.left = d.boundary.left.round(precision);
    d.boundary.right = d.boundary.right.round(precision);
    d.boundary.top = d.boundary.top.round(precision);
    d.boundary.bottom = d.boundary.bottom.round(precision);
    d.plane = d.plane.round(precision);
    d.rightDirection = d.rightDirection.round(precision);
    d.topDirection = d.topDirection.round(precision);
  }

  _state(options: { precision: number }) {
    // const { precision } = options;
    const precision = getPrecision(options);
    return {
      f1Type: 'rectBounds',
      state: [
        this.precision,
        roundNum(this.left, precision),
        roundNum(this.right, precision),
        roundNum(this.bottom, precision),
        roundNum(this.top, precision),
        this.position.toArray(),
        this.topDirection.toArray(),
        this.rightDirection.toArray(),
      ],
    };
  }

  /*
  We wish to see if some point p is within (or on) a rectangle bounds defined
  by a main position, a rightVector (scaled by left or right) and a topVector
  (scaled by bottom or top).

  **********************************************     A
  *                                            *     |
  *        Top Vector              p           *     |
  *             A                 *            *     | top
  *             |                              *     |
  *             |                              *     |
  *    position *----->                        *   ---
  *                   Right Vector             *     |
  *                                            *     | bottom
  *                                            *     |
  **********************************************     V
                |
                |
  <-------------|----------------------------->
      left                right

  - Create a vector posP and project it onto RightVector
  - If the scalar projection is positive, then it is in the same direciton as
    right vector, and the bound to check will be the right bound
  - The abs value of the scalar projection must be less than or equal to the
    bound to be contained in that direction.
  - Repeat the same for the topDirection.
  */
  contains(position: TypeParsablePoint, projectToPlane: boolean = true) {
    if (projectToPlane === false && !this.plane.hasPointOn(position)) {
      return false;
    }
    const p = this.plane.pointProjection(position).round(this.precision);
    const posP = p.sub(this.plane.p);
    const rightProjection = posP.projectOn(this.rightDirection);
    const topProjection = posP.projectOn(this.topDirection);
    if (topProjection > this.top || -topProjection > this.bottom) {
      return false;
    }
    if (rightProjection > this.right || -rightProjection > this.left) {
      return false;
    }
    return true;
  }

  /*
  We wish to clip a point p, in bounds rectangle is defined by a main position,
  a rightVector (scaled by left or right) and topVector (scaled by bottom or
  top).

  **********************************************     A
  *                                            *     |
  *        Top Vector              p           *     |
  *             A                 *            *     | top
  *             |                              *     |
  *             |                              *     |
  *    position *----->                        *   ---
  *                   Right Vector             *     |
  *                                            *     | bottom
  *                                            *     |
  **********************************************     V
                |
                |
  <-------------|----------------------------->
      left                right

  - Create a vector posP
  - Project it onto rightDirection
  - If the projection is > 0 and the projection > right, then clip to right
  - If the projection is < 0 and the abs(projection) > left, then clip to left
  - Find clipped topDirection projection
  - Scale unitVector of posP by clipped projections and add to position

  To do so, first calculate the angle (theta) between right vector and p vector
  (both relative to position).

  |p|cos(theta) will give current right/left magnitude of p
  |p|sin(theta) will give current bottom/top magnitude of p

  To clip, take the minimum of these magnitudes vs right/left or bottom/top
  */
  clip(position: TypeParsablePoint) {
    // First project point onto plane
    const p = this.plane.pointProjection(getPoint(position)).round(this.precision);

    // If the point is equal to the plane position, then it is inside (as left,
    // right, top, and bottom cannot be negative)
    if (p.isEqualTo(this.position)) {
      return p._dup();
    }

    const posP = p.sub(this.plane.p);

    let rightProjection = posP.projectOn(this.rightDirection);
    if (rightProjection > this.right) {
      rightProjection = this.right;
    } else if (rightProjection < -this.left) {
      rightProjection = -this.left;
    }
    let topProjection = posP.projectOn(this.topDirection);
    if (topProjection > this.top) {
      topProjection = this.top;
    } else if (topProjection < -this.bottom) {
      topProjection = -this.bottom;
    }

    return this.position
      .add(this.rightDirection.scale(rightProjection))
      .add(this.topDirection.scale(topProjection));
  }


  getBoundIntersect(
    position: Point,
    direction: Point,
    posBound: Line,
    negBound: Line,
    posDirection: Point,
  ) {
    const dMag = direction.length();
    const theta = Math.acos(
      direction.dotProduct(posDirection) / dMag / posDirection.length(),
    );

    const projection = dMag * Math.cos(theta);
    let bound;
    let boundNormal;
    if (projection < 0) {
      bound = negBound;
      boundNormal = posDirection;
    }
    if (projection > 0) {
      bound = posBound;
      boundNormal = posDirection.scale(-1);
    }
    if (bound == null) {
      return null;
    }

    const l = new Line({ p1: position, p2: position.add(direction), ends: 1 });
    const i = bound.intersectsWith(l);
    if (
      i.intersect == null
      || i.collinear
      || !bound.hasPointOn(i.intersect, this.precision)
    ) {
      return null;
    }

    return {
      intersect: i.intersect,
      distance: i.intersect.distance(position),
      normal: boundNormal,
    };
  }

  intersect(
    position: TypeParsablePoint,
    direction: TypeParsablePoint,
  ) {
    const p = this.clip(getPoint(position)).round(this.precision);
    const d = this.plane
      .pointProjection(this.plane.p.add(getPoint(direction).normalize()))
      .sub(this.plane.p);

    const {
      left, right, top, bottom,
    } = this.boundary;

    // Get the right direction intersect and top direction intersects.
    // If the intersects don't exist, a null will be returned.
    const rI = this.getBoundIntersect(p, d, right, left, this.rightDirection);
    const tI = this.getBoundIntersect(p, d, top, bottom, this.topDirection);

    if (rI == null && tI == null) {
      return { intersect: null, distance: 0, reflection: d };
    }
    let intersect;
    let distance;
    let normal;
    // If only the right intersect exists, then it is our intersect
    if (rI != null && tI == null) {
      ({ intersect, distance, normal } = rI);
    // If only the top intersect exists, then it is our intersect
    } else if (tI != null && rI == null) {
      ({ intersect, distance, normal } = tI);
    // If both intersects exist, then take the one with the smallest distance
    } else if (rI.distance > tI.distance) {
      ({ intersect, distance, normal } = tI);
    } else if (tI.distance > rI.distance) {
      ({ intersect, distance, normal } = rI);
    // If the distances (and thus intersect points) are equal, then reflect
    // the direction fully
    } else {
      return {
        intersect: rI.intersect,
        distance: rI.distance,
        reflection: d.scale(-1),
      };
    }

    // Perform a reflection off the boundary.
    // `this.getBoundIntersect` returns a normal vector that defines the
    // boundary as a plane perpendicular to the plane of motion.
    // This perpendicular boundary plane is used to calculate the reflection.
    // From: https://www.3dkingdoms.com/weekly/weekly.php?a=2
    const V = d;
    const N = normal;
    const R = N.scale(-2 * (N.dotProduct(V))).add(V).normalize();
    return {
      distance,
      intersect,
      reflection: R,
    };
  }
}

export type TypeRectBoundsDefinitionLegacy = {
  left?: number | null,
  bottom?: number | null,
  right?: number | null,
  top?: number | null,
  bounds?: 'inside' | 'outside',
  precision?: number,
} | Rect;


export type TypeF1DefRectBoundsLegacy = {
  f1Type: 'rectBounds',
  state: ['outside' | 'inside', number, number | null, number | null, number | null, number | null],
};

// class RectBoundsLegacy extends Bounds {
//   boundary: {
//     left: null | number,
//     right: null | number,
//     bottom: null | number,
//     top: null | number,
//   };

//   constructor(optionsOrRect: TypeRectBoundsDefinitionLegacy) {
//     const defaultOptions = {
//       left: null,
//       right: null,
//       top: null,
//       bottom: null,
//       bounds: 'inside',
//       precision: 8,
//     };

//     const options = joinObjects({}, defaultOptions, optionsOrRect);

//     const boundary = {
//       left: options.left,
//       right: options.right,
//       top: options.top,
//       bottom: options.bottom,
//     };
//     super(boundary, options.bounds, options.precision);
//   }

//   isDefined() {
//     if (
//       this.boundary.left == null
//       && this.boundary.right == null
//       && this.boundary.top == null
//       && this.boundary.bottom == null
//     ) {
//       return false;
//     }
//     return true;
//   }

//   _dup() {
//     return new RectBounds({
//       bounds: this.bounds,
//       precision: this.precision,
//       left: this.boundary.left,
//       right: this.boundary.right,
//       top: this.boundary.top,
//       bottom: this.boundary.bottom,
//     });
//   }

//   _state(options: { precision: number }) {
//     // const { precision } = options;
//     const precision = getPrecision(options);
//     return {
//       f1Type: 'rectBounds',
//       state: [
//         this.bounds,
//         this.precision,
//         this.boundary.left != null ? roundNum(this.boundary.left, precision) : null,
//         this.boundary.bottom != null ? roundNum(this.boundary.bottom, precision) : null,
//         this.boundary.right != null ? roundNum(this.boundary.right, precision) : null,
//         this.boundary.top != null ? roundNum(this.boundary.top, precision) : null,
//       ],
//     };
//   }

//   contains(position: number | TypeParsablePoint) {
//     if (typeof position === 'number') {
//       return false;
//     }
//     const p = getPoint(position).round(this.precision);
//     if (this.boundary.left != null && p.x < roundNum(this.boundary.left, this.precision)) {
//       return false;
//     }
//     if (this.boundary.right != null && p.x > roundNum(this.boundary.right, this.precision)) {
//       return false;
//     }
//     if (this.boundary.bottom != null && p.y < roundNum(this.boundary.bottom, this.precision)) {
//       return false;
//     }
//     if (this.boundary.top != null && p.y > roundNum(this.boundary.top, this.precision)) {
//       return false;
//     }
//     return true;
//   }

//   clip(position: number | TypeParsablePoint) {
//     if (typeof position === 'number') {
//       return position;
//     }
//     const clipped = getPoint(position);
//     if (this.boundary.left != null && clipped.x < this.boundary.left) {
//       clipped.x = this.boundary.left;
//     }
//     if (this.boundary.right != null && clipped.x > this.boundary.right) {
//       clipped.x = this.boundary.right;
//     }
//     if (this.boundary.bottom != null && clipped.y < this.boundary.bottom) {
//       clipped.y = this.boundary.bottom;
//     }
//     if (this.boundary.top != null && clipped.y > this.boundary.top) {
//       clipped.y = this.boundary.top;
//     }
//     return clipped;
//   }

//   intersect(position: number | TypeParsablePoint, direction: number = 0) {
//     if (typeof position === 'number') {
//       return {
//         intersect: null,
//         distance: 0,
//         reflection: direction,
//       };
//     }
//     const a = roundNum(clipAngle(direction, '0to360'), this.precision);
//     const pi = roundNum(Math.PI, this.precision);
//     const threePiOnTwo = roundNum(3 * Math.PI / 2, this.precision);
//     const piOnTwo = roundNum(Math.PI / 2, this.precision);
//     const p = getPoint(position);
//     const {
//       top, bottom, left, right,
//     } = this.boundary;

//     // let zeroHeight = false;
//     // if (
//     //   top != null && bottom != null
//     //   && roundNum(top, this.precision) === roundNum(bottom, this.precision)
//     // ) {
//     //   zeroHeight = true;
//     // }
//     // let zeroWdith = false;
//     // if (
//     //   left != null && right != null
//     //   && roundNum(left, this.precision) === roundNum(right, this.precision)
//     // ) {
//     //   zeroWdith = true;
//     // }
//     const calcHBound = (h) => {
//       if (h != null) {
//         if (bottom != null && top != null) {
//           return new Line([h, bottom], [h, top]);
//         }
//         if (bottom == null && top != null) {
//           return new Line({
//             p1: [h, top], length: 1, angle: -Math.PI / 2, ends: 1,
//           });
//         }
//         if (bottom != null && top == null) {
//           return new Line({
//             p1: [h, bottom], length: 1, angle: Math.PI / 2, ends: 1,
//           });
//         }
//         if (bottom == null && top == null) {
//           return new Line({
//             p1: [h, 0], length: 1, angle: Math.PI / 2, ends: 0,
//           });
//         }
//       }
//       return null;
//     };
//     const calcVBound = (v) => {
//       if (v != null) {
//         if (left != null && right != null) {
//           return new Line([left, v], [right, v]);
//         }
//         if (left == null && right != null) {
//           return new Line({
//             p1: [right, v], length: 1, angle: -Math.PI, ends: 1,
//           });
//         }
//         if (left != null && right == null) {
//           return new Line({
//             p1: [left, v], length: 1, angle: 0, ends: 1,
//           });
//         }
//         if (left == null && right == null) {
//           return new Line({
//             p1: [0, v], length: 1, angle: Math.PI, ends: 0,
//           });
//         }
//       }
//       return null;
//     };

//     // Get the lines for each bound
//     const boundBottom = calcVBound(bottom);
//     const boundTop = calcVBound(top);
//     const boundLeft = calcHBound(left);
//     const boundRight = calcHBound(right);

//     // Get the closest boundary intersect
//     const trajectory = new Line({
//       p1: p, length: 1, angle: direction, ends: 1,
//     });
//     const getIntersect = (boundLine: Line | null, id) => {
//       if (boundLine == null) {
//         return null;
//       }
//       if (boundLine.hasPointOn(p, this.precision)) {
//         return {
//           intersect: p._dup(),
//           distance: 0,
//           id,
//         };
//       }
//       const result = trajectory.intersectsWith(boundLine, this.precision);
//       if (result.onLines && result.intersect != null) {
//         return {
//           intersect: result.intersect,
//           distance: round(p.distance(result.intersect), this.precision),
//           id,
//         };
//       }
//       return null;
//     };

//     const bottomIntersect = getIntersect(boundBottom, 'bottom');
//     const topIntersect = getIntersect(boundTop, 'top');
//     const leftIntersect = getIntersect(boundLeft, 'left');
//     const rightIntersect = getIntersect(boundRight, 'right');

//     const getClosestIntersect = (intersect1, intersect2) => {
//       let closestIntersect = null;
//       if (intersect1 != null && intersect2 != null) {
//         if (intersect1.distance === 0 && this.bounds === 'inside') {
//           closestIntersect = intersect2;
//         } else if (intersect2.distance === 0 && this.bounds === 'inside') {
//           closestIntersect = intersect1;
//         } else if (intersect1.distance < intersect2.distance) {
//           closestIntersect = intersect1;
//         } else {
//           closestIntersect = intersect2;
//         }
//       } else if (intersect1 != null) {
//         closestIntersect = intersect1;
//       } else if (intersect2 != null) {
//         closestIntersect = intersect2;
//       }
//       return closestIntersect;
//     };

//     const vIntersect = getClosestIntersect(bottomIntersect, topIntersect);
//     const hIntersect = getClosestIntersect(leftIntersect, rightIntersect);

//     let intersects = [];
//     if (
//       vIntersect != null
//       && hIntersect != null
//       && vIntersect.distance === hIntersect.distance
//     ) {
//       intersects = [vIntersect, hIntersect];
//     } else {
//       const result = getClosestIntersect(vIntersect, hIntersect);
//       if (result != null) {
//         intersects = [result];
//       }
//     }

//     if (intersects.length === 0) {
//       return { intersect: null, distance: 0, reflection: direction };
//     }

//     let i;
//     let d = 0;
//     let xMirror = 1;
//     let yMirror = 1;
//     intersects.forEach((intersect) => {
//       if (intersect.id === 'left' || intersect.id === 'right') {
//         xMirror = -1;
//       } else {
//         yMirror = -1;
//       }
//       i = intersect.intersect;
//       d = intersect.distance;
//     });
//     const reflection = polarToRect(1, direction);
//     if (xMirror === -1) {
//       reflection.x *= -1;
//     }
//     if (yMirror === -1) {
//       reflection.y *= -1;
//     }

//     if (d === 0) {
//       i = p;
//     }

//     let r = rectToPolar(reflection).angle;
//     let noIntersect = false;

//     // Test for if the point is on the border, trajectory is along the border
//     // and the cross bound is null
//     if (d === 0 && this.bounds === 'inside' && intersects.length === 1) {
//       if (
//         (intersects[0].id === 'bottom' || intersects[0].id === 'top')
//         && (this.boundary.left == null || this.boundary.right == null)
//         && (a === 0 || a === pi)
//       ) {
//         noIntersect = true;
//       }
//       if (
//         (intersects[0].id === 'right' || intersects[0].id === 'left')
//         && (this.boundary.top == null || this.boundary.bottom == null)
//         && (a === piOnTwo || a === threePiOnTwo)
//       ) {
//         noIntersect = true;
//       }
//       if (
//         intersects[0].id === 'right'
//         && (this.boundary.left == null)
//         && (a === pi)
//       ) {
//         noIntersect = true;
//       }
//       if (
//         intersects[0].id === 'left'
//         && (this.boundary.right == null)
//         && (a === 0)
//       ) {
//         noIntersect = true;
//       }
//       if (
//         intersects[0].id === 'top'
//         && (this.boundary.bottom == null)
//         && (a === threePiOnTwo)
//       ) {
//         noIntersect = true;
//       }
//       if (
//         intersects[0].id === 'bottom'
//         && (this.boundary.top == null)
//         && (a === piOnTwo)
//       ) {
//         noIntersect = true;
//       }
//     }

//     if (d === 0 && this.bounds === 'inside' && intersects.length === 2) {
//       if (
//         intersects[0].id === 'bottom'
//         && intersects[1].id === 'left'
//         && this.boundary.right == null
//         && a === 0
//       ) {
//         noIntersect = true;
//       }
//       if (
//         intersects[0].id === 'bottom'
//         && intersects[1].id === 'left'
//         && this.boundary.top == null
//         && a === piOnTwo
//       ) {
//         noIntersect = true;
//       }
//       if (
//         intersects[0].id === 'top'
//         && intersects[1].id === 'left'
//         && this.boundary.right == null
//         && a === 0
//       ) {
//         noIntersect = true;
//       }
//       if (
//         intersects[0].id === 'top'
//         && intersects[1].id === 'left'
//         && this.boundary.bottom == null
//         && a === threePiOnTwo
//       ) {
//         noIntersect = true;
//       }
//       if (
//         intersects[0].id === 'top'
//         && intersects[1].id === 'right'
//         && this.boundary.left == null
//         && a === pi
//       ) {
//         noIntersect = true;
//       }
//       if (
//         intersects[0].id === 'top'
//         && intersects[1].id === 'right'
//         && this.boundary.bottom == null
//         && a === threePiOnTwo
//       ) {
//         noIntersect = true;
//       }
//       if (
//         intersects[0].id === 'bottom'
//         && intersects[1].id === 'right'
//         && this.boundary.left == null
//         && a === pi
//       ) {
//         noIntersect = true;
//       }
//       if (
//         intersects[0].id === 'bottom'
//         && intersects[1].id === 'right'
//         && this.boundary.top == null
//         && a === piOnTwo
//       ) {
//         noIntersect = true;
//       }
//     }

//     // Test for if the point is on the border, bounds is outside, and the
//     // trajectory is away from the border
//     if (d === 0 && this.bounds === 'outside' && intersects.length === 2) {
//       if (
//         intersects[0].id === 'bottom'
//         && intersects[1].id === 'left'
//         && (a >= piOnTwo || a === 0)
//       ) {
//         noIntersect = true;
//       }
//       if (
//         intersects[0].id === 'top'
//         && intersects[1].id === 'left'
//         && a >= 0 && a <= threePiOnTwo
//       ) {
//         noIntersect = true;
//       }

//       if (
//         intersects[0].id === 'top'
//         && intersects[1].id === 'right'
//         && (a <= pi || a >= threePiOnTwo)
//       ) {
//         noIntersect = true;
//       }
//       if (
//         intersects[0].id === 'bottom'
//         && intersects[1].id === 'right'
//         && (a <= piOnTwo || a >= pi)
//       ) {
//         noIntersect = true;
//       }
//     }
//     if (d === 0 && this.bounds === 'outside' && intersects.length === 1) {
//       const [intersect] = intersects;
//       if (
//         intersect.id === 'left'
//         && a >= piOnTwo && a <= threePiOnTwo
//       ) {
//         noIntersect = true;
//       }
//       if (
//         intersect.id === 'right'
//         && (a <= piOnTwo || a >= threePiOnTwo)
//       ) {
//         noIntersect = true;
//       }
//       if (
//         intersect.id === 'bottom'
//         && (a >= pi || a === 0)
//       ) {
//         noIntersect = true;
//       }
//       if (
//         intersect.id === 'top'
//         && a <= pi
//       ) {
//         noIntersect = true;
//       }
//     }
//     if (noIntersect) {
//       i = null;
//       r = direction;
//     }

//     return {
//       intersect: i,
//       distance: d,
//       reflection: r,
//     };
//   }
// }

export type TypeLineBoundsDefinition = OBJ_LineDefinition
  & {
    precision?: number,
    line?: TypeParsableLine,
  };

export type TypeF1DefLineBounds = {
  f1Type: 'lineBounds',
  state: [number, [number, number, number], [number, number, number], 2 | 1 | 0],
};

class LineBounds extends Bounds {
  boundary: Line;

  constructor(optionsIn: TypeLineBoundsDefinition) {
    let boundary;
    const defaultOptions = {
      precision: 8,
    };
    const options = joinObjects({}, defaultOptions, optionsIn);
    if (options.line != null) {
      boundary = getLine(options.line);
    } else {
      boundary = getLine(options);
    }

    super(boundary, options.precision);
  }

  // eslint-disable-next-line class-methods-use-this
  isDefined() {
    return true;
  }

  _dup() {
    return new LineBounds({
      precision: this.precision,
      line: this.boundary,
    });
  }

  _state(options: { precision: number }) {
    // const { precision } = options;
    const precision = getPrecision(options);
    return {
      f1Type: 'lineBounds',
      state: [
        this.precision,
        [
          roundNum(this.boundary.p1.x, precision),
          roundNum(this.boundary.p1.y, precision),
          roundNum(this.boundary.p1.z, precision),
        ],
        [
          roundNum(this.boundary.p2.x, precision),
          roundNum(this.boundary.p2.y, precision),
          roundNum(this.boundary.p2.z, precision),
        ],
        this.ends,
      ],
    };
  }

  contains(position: number | TypeParsablePoint) {
    if (typeof position === 'number') {
      throw new Error(`LineBounds.contains only accepts a point: ${position}`);
    }
    const p = getPoint(position);
    return this.boundary.hasPointOn(p, this.precision);
  }

  clip(position: number | TypeParsablePoint) {
    if (typeof position === 'number') {
      throw new Error(`LineBounds.clip only accepts a point: ${position}`);
    }
    const p = getPoint(position);
    return this.boundary.clipPoint(p, this.precision);
  }

  // The intersect of a Line Boundary can be its finite end points
  //  - p1 only if 1 ended
  //  - p1 or p2 if 2 ended
  intersect(position: number | TypeParsablePoint, direction: TypeParsablePoint) {
    // First project the point and velocity onto the boundary line
    const p = this.boundary.clipPoint(position);
    const boundaryDir = this.boundary.unitVector();
    const dir = getPoint(direction).componentAlong(boundaryDir).normalize();

    // If the line is unbounded, then there is no intersect
    if (
      typeof position === 'number'
      || this.boundary.ends === 0   // Unbounded line will have no intersect
    ) {
      return {
        intersect: null,
        distance: 0,
        reflection: dir,
      };
    }

    const b = this.boundary;
    const p1 = this.boundary.p1._dup();
    const p2 = this.boundary.p2._dup();
    const dProjection = dir.projectOn(boundaryDir);

    // Positive dProjection means direction is along p1->p2
    // A one ended line is only bounded at p1, therefore if dProjecttion
    // is positive, there can only be an intersect if there are two lines.
    if (dProjection > 0) {
      if (b.ends === 2) {
        return {
          intersect: p2,
          distance: p.distance(p2),
          reflection: dir.scale(-1),
        };
      }
      return {
        intersect: null,
        distance: 0,
        reflection: dir,
      };
    }

    // Negative dProjection means the dirction is p2->p1
    if (dProjection < 0) {
      return {
        intersect: p1,
        distance: p.distance(p1),
        reflection: dir.scale(-1),
      };
    }

    throw new Error('LineBounds.intersect error - could not find intersect');

    // // if (bDir.dotProduct(dir))

    // // const angleDelta = round(Math.abs(clipAngle(direction, '0to360') - clipAngle(b.angle(), '0to360')), this.precision);

    // const d1 = p.distance(p1);
    // const d2 = p.distance(p2);

    // // If the point is on p1, unless it is inside and going towards p2 the
    // // result can be given immediately
    // if (p.isEqualTo(p1, this.precision)) {
    //   if (this.bounds === 'inside' && angleDelta !== 0) {
    //     return { intersect: p1, distance: 0, reflection: b.angle() };
    //   }
    //   if (this.bounds === 'outside' && angleDelta !== 0) {
    //     return { intersect: null, distance: 0, reflection: direction };
    //   }
    //   if (this.bounds === 'outside' && angleDelta === 0) {
    //     return { intersect: p1, distance: 0, reflection: b.angle() + Math.PI };
    //   }
    // }

    // // If it is a one ended line, then only p1 is an intersect
    // if (b.ends === 1) {
    //   if (
    //     (onLine === true && angleDelta === 0)
    //     || (onLine === false && angleDelta !== 0)
    //   ) {
    //     return { intersect: null, distance: 0, reflection: direction };
    //   }
    //   return { intersect: p1, distance: d1, reflection: direction + Math.PI };
    // }

    // // We are now left with a two ended line
    // // So if the point is on p2, then unless it is inside and going toward
    // // p1, the answer can be given now
    // if (p.isEqualTo(p2, this.precision)) {
    //   if (this.bounds === 'inside' && angleDelta === 0) {
    //     return { intersect: p2, distance: 0, reflection: b.angle() + Math.PI };
    //   }
    //   if (this.bounds === 'outside' && angleDelta === 0) {
    //     return { intersect: null, distance: 0, reflection: direction };
    //   }
    //   if (this.bounds === 'outside' && angleDelta !== 0) {
    //     return { intersect: p2, distance: 0, reflection: b.angle() };
    //   }
    //   // return { intersect: p2, distance: 0, reflection };
    // }

    // if (onLine && angleDelta === 0) {
    //   return { intersect: p2, distance: d2, reflection: direction + Math.PI };
    // }

    // if (onLine) {
    //   return { intersect: p1, distance: d1, reflection: direction + Math.PI };
    // }

    // // We now know the point is off a 2 ended line
    // let i;
    // let d;
    // if (d1 < d2 && angleDelta === 0) {
    //   i = p1;
    //   d = d1;
    // } else if (d2 < d1 && angleDelta !== 0) {
    //   i = p2;
    //   d = d2;
    // } else {
    //   return { intersect: null, distance: 0, reflection: direction };
    // }
    // return { intersect: i, distance: d, reflection: direction + Math.PI };
  }

  // clipVelocity(velocity: number | TypeParsablePoint) {
  //   if (typeof velocity === 'number') {
  //     return velocity;
  //   }
  //   if (this.boundary == null) {
  //     return velocity;
  //   }
  //   const v = getPoint(velocity); // $FlowFixMe
  //   const unitVector = this.boundary.unitVector();
  //   let projection = unitVector.dotProduct(v);
  //   let ang = this.boundary.angle();
  //   if (projection < -1) {
  //     ang += Math.PI;
  //     projection = -projection;
  //   }
  //   return polarToRect(projection, ang);
  // }
}

export type TypeBoundsDefinition = Bounds | null | TypeRectBoundsDefinition
  | TypeLineBoundsDefinition | TypeRangeBoundsDefinition
  | { type: 'rect', bounds: TypeRectBoundsDefinition }
  | { type: 'range', bounds: TypeRangeBoundsDefinition }
  | { type: 'line', bounds: TypeLineBoundsDefinition }
  | TypeTransformBoundsDefinition
  | { type: 'transform', bounds: TypeTransformBoundsDefinition }
  | TypeF1DefRangeBounds | TypeF1DefRectBounds | TypeF1DefLineBounds;

function getBounds(
  bounds: TypeBoundsDefinition,
  type: 'rect' | 'range' | 'line' | 'transform' | null = null,
  // transform: Transform = new Transform(),
) {
  if (bounds == null) {
    return new Bounds();
  }
  if (bounds instanceof Bounds) {
    return bounds;
  }
  if (bounds.type != null) {  // $FlowFixMe
    return getBounds(bounds.bounds, bounds.type);
  }
  if (type === 'rect') {  // $FlowFixMe
    return new RectBounds(bounds);
  }
  if (type === 'range') {  // $FlowFixMe
    return new RangeBounds(bounds);
  }
  if (type === 'line') {  // $FlowFixMe
    return new LineBounds(bounds);
  }
  // if (type === 'transform') {  // $FlowFixMe
  //   return new TransformBounds(transform, bounds);
  // }
  if (bounds.min !== undefined || bounds.max !== undefined) {
    return getBounds(bounds, 'range');
  }
  if (bounds instanceof Rect) {
    return new RectBounds(bounds);
  }
  if (bounds instanceof Line) {
    return new LineBounds({ line: bounds });
  }
  if (
    bounds.left !== undefined
    || bounds.right !== undefined
    || bounds.top !== undefined
    || bounds.bottom !== undefined
  ) {
    return getBounds(bounds, 'rect');
  }
  if (
    bounds.line !== undefined
    || bounds.p1 !== undefined
    || bounds.p2 !== undefined
    || bounds.angle !== undefined
    || bounds.mag !== undefined
    || bounds.ends !== undefined
  ) {
    return getBounds(bounds, 'line');
  }
  if (
    bounds.translation !== undefined
    || bounds.scale !== undefined
    || bounds.rotation !== undefined
  ) {
    return getBounds(bounds, 'transform', transform);
  }

  if (bounds.f1Type !== undefined && bounds.state != null) {
    const { f1Type, state } = bounds;
    if (f1Type != null
      && f1Type === 'rangeBounds'
      && state != null
      && Array.isArray([state])
      && state.length === 3
    ) { // $FlowFixMe
      const [precision, min, max] = state;
      return new RangeBounds({
        precision, min, max,
      });
    }

    if (f1Type != null
      && f1Type === 'rectBounds'
      && state != null
      && Array.isArray([state])
      && state.length === 8
    ) { // $FlowFixMe
      const [
        precision, left, right, bottom, top, position, topDirection, rightDirection,
      ] = state;
      return new RectBounds({
        precision, left, bottom, right, top, position, topDirection, rightDirection,
      });
    }
    if (f1Type != null
      && f1Type === 'lineBounds'
      && state != null
      && Array.isArray([state])
      && state.length === 4
    ) { // $FlowFixMe
      const [precision, p1, p2, ends] = state;
      return new LineBounds({
        precision,
        p1,
        p2,
        ends,
      });
    }

    // if (f1Type != null
    //   && f1Type === 'transformBounds'
    //   && state != null
    //   && Array.isArray([state])
    //   && state.length === 3
    // ) { // $FlowFixMe
    //   const [precision, def, boundsArray] = state;
    //   const t = new TransformBounds(new Transform(), {}, precision);
    //   t.def = def.slice();
    //   const boundary = [];
    //   boundsArray.forEach((b) => {
    //     if (b == null) {
    //       boundary.push(null);
    //     } else {
    //       boundary.push(getBounds(b));
    //     }
    //   });
    //   t.boundary = boundary;
    //   return t;
    // }
  }
  return null;
}


// type TypeTranslationBoundsDefinition = Bounds
//                                        | TypeRectBoundsDefinition
//                                        | TypeLineBoundsDefinition
//                                        | TypeRangeBoundsDefinition;
// type TypeRotationBoundsDefinition = Bounds | TypeRangeBoundsDefinition;
// type TypeScaleBoundsDefinition = Bounds | TypeRangeBoundsDefinition | TypeRectBoundsDefinition;

// export type TypeTransformBoundsDefinition = Array<Bounds | null> | {
//   position?: TypeTranslationBoundsDefinition;
//   translation?: TypeTranslationBoundsDefinition;
//   rotation?: TypeRotationBoundsDefinition;
//   scale?: TypeScaleBoundsDefinition;
// };

// export type TypeF1DefTransformBounds = {
//   f1Type: 'transformBounds',
//   state: [number, Array<'s' | 'r' | 'r'>, Array<TypeF1DefLineBounds | TypeF1DefRectBounds | TypeF1DefRangeBounds>],
// };

// class TransformBounds extends Bounds {
//   boundary: Array<Bounds | null>;
//   def: Array<'t' | 'r' | 's'>;

//   constructor(
//     transform: Transform,
//     bounds: TypeTransformBoundsDefinition = {},
//     precision: number = 8,
//   ) {
//     const def = transform.def.map(d => d[0]);
//     super([], 'inside', precision); // $FlowFixMe
//     this.def = def;
//     this.createBounds(bounds);
//   }

//   isUnbounded() {
//     for (let i = 0; i < this.boundary.length; i += 1) {
//       if (this.boundary[i] !== null) {
//         return false;
//       }
//     }
//     return true;
//   }

//   _dup() {
//     const t = new TransformBounds(new Transform(), {}, this.precision);
//     t.def = this.def.slice();
//     t.boundary = [];
//     this.boundary.forEach((b) => {
//       if (b == null) {
//         t.boundary.push(null);
//       } else {
//         t.boundary.push(b._dup());
//       }
//     });
//     return t;
//   }

//   _state(options: { precision: number }) {
//     // const { precision } = options;
//     const precision = getPrecision(options);
//     const bounds = [];
//     this.boundary.forEach((b) => {
//       if (b == null) {
//         bounds.push(null);
//       } else {
//         bounds.push(b._state({ precision }));
//       }
//     });
//     return {
//       f1Type: 'transformBounds',
//       state: [
//         this.precision, // $FlowFixMe
//         this.def.slice(),
//         bounds,
//       ],
//     };
//   }

//   createBounds(
//     bounds: TypeTransformBoundsDefinition | Bounds | null,
//     index: number = 0,
//   ) {
//     if (bounds == null || bounds instanceof Bounds) {
//       this.boundary[index] = bounds;
//       return;
//     }
//     if (Array.isArray(bounds)) {
//       this.boundary = bounds;
//       return;
//     }
//     const boundary = [];
//     this.def.forEach((o) => {
//       let bound = null;
//       if (o === 't' && bounds.position != null) {
//         bound = getBounds(bounds.position);
//       }
//       if (o === 't' && bounds.translation != null) {
//         bound = getBounds(bounds.translation);
//       }
//       if (o === 'r' && bounds.rotation != null) {
//         bound = getBounds(bounds.rotation);
//       }
//       if (o === 's' && bounds.scale != null) {
//         bound = getBounds(bounds.scale);
//       }
//       boundary.push(bound);
//     });
//     this.boundary = boundary;
//   }

//   update(
//     type: 'r' | 's' | 't',
//     bound: TypeBoundsDefinition,
//     typeIndex: ?number = 0,
//   ) {
//     let index = 0;
//     for (let i = 0; i < this.def.length; i += 1) {
//       const o = this.def[i];
//       if (o === type) {
//         if (typeIndex == null || typeIndex === index) {
//           this.boundary[i] = getBounds(bound);
//         }
//         index += 1;
//       }
//       // if (o === type && (typeIndex == null || typeIndex === index)) {
//       //   this.boundary[i] = getBounds(bound);
//       //   index += 1;
//       // }
//     }
//   }

//   updateTranslation(
//     bound: Bounds | TypeTranslationBoundsDefinition,
//     translationIndex: ?number = 0,
//   ) {
//     let b = getBounds(bound);
//     if (b instanceof RangeBounds) {
//       b = new RectBounds({
//         left: b.boundary.min,
//         bottom: b.boundary.min,
//         top: b.boundary.max,
//         right: b.boundary.max,
//       });
//     }
//     this.update('t', b, translationIndex);
//   }

//   updateRotation(
//     bound: Bounds | TypeRotationBoundsDefinition,
//     translationIndex: ?number = 0,
//   ) {
//     this.update('r', bound, translationIndex);
//   }

//   updateScale(
//     bound: Bounds | TypeScaleBoundsDefinition,
//     translationIndex: ?number = 0,
//   ) {
//     this.update('s', bound, translationIndex);
//   }

//   getBound(type: 'r' | 's' | 't', index: number = 0) {
//     let typeIndex = 0;
//     for (let i = 0; i < this.def.length; i += 1) {
//       const o = this.def[i];
//       if (o === type) {
//         if (typeIndex === index) {
//           return this.boundary[i];
//         }
//         typeIndex += 1;
//       }
//     }
//     return null;
//   }

//   getTranslation(index: number = 0) {
//     return this.getBound('t', index);
//   }

//   getScale(index: number = 0) {
//     return this.getBound('s', index);
//   }

//   getRotation(index: number = 0) {
//     return this.getBound('r', index);
//   }

//   // $FlowFixMe
//   contains(t: Transform) {
//     for (let i = 0; i < t.def.length; i += 1) {
//       const transformElement = t.def[i];
//       const [type] = transformElement;
//       const b = this.boundary[i];                       // $FlowFixMe
//       if (b != null) {
//         if (
//           (type === 'rc' || type === 't' || type === 's' || type === 'rd')
//           && !b.contains(new Point(
//             transformElement[1], transformElement[2], transformElement[3],
//           ))
//         ) {
//           return false;
//         }
//         if (
//           type === 'r'
//           && !b.contains(transformElement[1])
//         ) {
//           return false;
//         }
//       }
//     }
//     return true;
//   }

//   // $FlowFixMe
//   clip(t: Transform) {
//     const def = [];
//     for (let i = 0; i < t.def.length; i += 1) {
//       const transformElement = t.def[i];
//       const b = this.boundary[i];
//       if (b != null) {
//         const clipped = b.clip(new Point(
//           transformElement[1], transformElement[2], transformElement[3],
//         ));
//         const newElement = [transformElement[0], clipped.x, clipped.y, clipped.z];  // $FlowFixMe
//         def.push(newElement);
//       } else {
//         def.push(transformElement.slice());
//       }
//     }  // $FlowFixMe
//     return new Transform(def, t.name);
//   }
// }

export {
  // TransformBounds,
  RangeBounds,
  Bounds,
  LineBounds,
  RectBounds,
  getBounds,
};
