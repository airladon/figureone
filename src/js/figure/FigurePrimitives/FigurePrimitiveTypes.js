// @flow
import {
  Transform,
} from '../../tools/g2';
import type {
  TypeParsablePoint,
} from '../../tools/g2';

export type TypeCopyPoint = {
  point: TypeParsablePoint,
  points: Array<TypeParsablePoint>,
  cum: 'first' | ''
}

export type TypeCopyLinear = {
  num: number,
  step?: number,
  angle?: number,
  axis?: 'x' | 'y',
}

export type TypeCopyAngle = {
  numAngle: number,
  step?: number,
  center?: TypeParsablePoint,
  skipFirst?: boolean,
}

export type TypeCopyOffset = {
  offset: TypeParsablePoint | Transform,
};

export type OBJ_Copy = Array<Transform> | Array<TypeParsablePoint>
                       | TypeCopyAngle | TypeCopyLinear | TypeParsablePoint
                       | Transform | TypeCopyOffset;
