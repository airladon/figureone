// @flow
import * as tools from '../../../tools/math';
// import { DiagramElement } from '../../Element';
import type { TypeAnimationStepInputOptions } from '../AnimationStep';
import AnimationStep from '../AnimationStep';
import { joinObjects } from '../../../tools/tools';

export type TypeElementAnimationStepInputOptions = {
  element?: Object; // Can't use DiagramElement as importing it makes a loop
  type?: 'transform' | 'color' | 'custom' | 'position' | 'rotation' | 'scale';
  progression?: 'linear' | 'easeinout' | 'easein' | 'easeout' | (number) => number; // default is easeinout except color and custom which is linear
} & TypeAnimationStepInputOptions;

export default class ElementAnimationStep extends AnimationStep {
  element: ?Object;
  type: 'transform' | 'color' | 'custom';
  duration: number;
  progression: (number) => number;

  constructor(optionsIn: TypeElementAnimationStepInputOptions) {
    super(optionsIn);
    let defaultProgression = 'easeinout';
    if (optionsIn.type === 'color' || optionsIn.type === 'custom') {
      defaultProgression = 'linear';
    }
    const defaultOptions = {
      element: null,
      type: 'custom',
      progression: defaultProgression,
      duration: 0,
    };

    const options = joinObjects({}, defaultOptions, optionsIn);
    this.element = options.element;
    this.type = options.type;
    this.onFinish = options.onFinish;
    this.duration = options.duration;
    if (options.progression === 'linear') {
      this.progression = tools.linear;
    } else if (options.progression === 'easein') {
      this.progression = tools.easein;
    } else if (options.progression === 'easeout') {
      this.progression = tools.easeout;
    } else if (options.progression === 'easeinout') {
      this.progression = tools.easeinout;
    } else {
      this.progression = options.progression;
    }
  }
}
