// @flow
import {
  joinObjects, duplicateFromTo,
} from '../../../../tools/tools';
import type {
  TypeElementAnimationStepInputOptions,
} from '../ElementAnimationStep';
import ElementAnimationStep from '../ElementAnimationStep';

export type TypePulseAnimationStepInputOptions = {
  scale: ?number;
  numLines: ?number;
  frequency: ?number;
} & TypeElementAnimationStepInputOptions;

export default class PulseAnimationStep extends ElementAnimationStep {
  scale: number;
  numLines: number;
  frequency: number;

  constructor(...optionsIn: Array<TypePulseAnimationStepInputOptions>) {
    // const ElementAnimationStepOptionsIn =
    //   joinObjects({}, { type: 'pulse' }, ...optionsIn);
    // super(ElementAnimationStepOptionsIn);
    const defaultOptions = {
      scale: 1.5,
      numLines: 1,
      type: 'pulse',
      duration: 1,
      frequency: 0,
    };
    const options = joinObjects({}, defaultOptions, ...optionsIn);
    super(options);
    this.scale = options.scale;
    this.numLines = options.numLines;
    this.duration = options.duration;
    this.frequency = options.frequency;
  }

  // On start, calculate the duration, target and delta if not already present.
  // This is done here in case the start is defined as null meaning it is
  // going to start from present transform.
  // Setting a duration to 0 will effectively skip this animation step
  start(startTime?: number) {
    super.start(startTime);
    const { element } = this;
    if (element != null) {
      if (this.numLines === 1) {
        element.pulseScaleNow(this.duration, this.scale, this.frequency);
      } else {
        element.pulseThickNow(
          this.duration, this.scale,
          this.numLines,
        );
      }
    }
  }

  // setFrame(deltaTime: number) {
  // }

  setToEnd() {
    if (this.element != null) {
      this.element.stopPulsing(true);
    }
  }

  _dup() {
    const step = new PulseAnimationStep();
    duplicateFromTo(this, step, ['element']);
    step.element = this.element;
    return step;
  }
}
