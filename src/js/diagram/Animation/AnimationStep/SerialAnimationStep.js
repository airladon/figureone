// @flow
// import * as tools from '../../tools/math';
// import { DiagramElement } from '../Element';
import type { TypeAnimationStepInputOptions } from '../AnimationStep';
import AnimationStep from '../AnimationStep';
import { joinObjects, duplicateFromTo } from '../../../tools/tools';
import GlobalAnimation from '../../webgl/GlobalAnimation';

export type TypeSerialAnimationStepInputOptions = {
  steps?: Array<AnimationStep>;
} & TypeAnimationStepInputOptions;

export class SerialAnimationStep extends AnimationStep {
  steps: Array<AnimationStep>;
  index: number;

  constructor(
    stepsOrOptionsIn: Array<AnimationStep> | TypeSerialAnimationStepInputOptions = {},
    ...optionsIn: Array<TypeSerialAnimationStepInputOptions>
  ) {
    const defaultOptions = { steps: [] };
    let options;
    if (Array.isArray(stepsOrOptionsIn)) {
      options = joinObjects({}, defaultOptions, ...optionsIn);
      options.steps = stepsOrOptionsIn;
    } else {
      options = joinObjects({}, defaultOptions, stepsOrOptionsIn, ...optionsIn);
    }
    super(options);
    this.index = 0;
    this.steps = [];
    if (!Array.isArray(options.steps) && options.steps != null) {
      this.steps = [options.steps];
    } else if (options.steps != null) {
      this.steps = options.steps;
    }
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'steps',
      'index',
    ];
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'serialAnimationStep';
  }

  // constructor(optionsIn: TypeSerialAnimationStepInputOptions = {}) {
  //   super(optionsIn);
  //   this.index = 0;
  //   const defaultOptions = {};
  //   const options = joinObjects({}, defaultOptions, optionsIn);
  //   this.steps = [];
  //   if (!Array.isArray(options.steps) && options.steps != null) {
  //     this.steps = [options.steps];
  //   } else if (options.steps != null) {
  //     this.steps = options.steps;
  //   }
  //   return this;
  // }

  setTimeDelta(delta: number) {
    super.setTimeDelta(delta);
    if (this.steps != null) {
      this.steps.forEach((step) => {
        step.setTimeDelta(delta);
      });
    }
  }

  then(step: ?AnimationStep) {
    if (step != null) {
      this.steps.push(step);
    }
    return this;
  }

  startWaiting() {
    super.startWaiting();
    this.steps.forEach((step) => {
      step.startWaiting();
    });
  }

  start(startTime: ?number | 'next' | 'prev' | 'now' = null) {
    if (this.state !== 'animating') {
      this.startWaiting();
      super.start(startTime);
      this.index = 0;
      if (this.steps.length > 0) {
        this.steps[0].start(startTime);
        this.steps[0].finishIfZeroDuration();
      }
    }
    this.finishIfZeroDuration();
  }

  finishIfZeroDuration() {
    let i = 0;
    let step = this.steps[0];
    while (i < this.steps.length && step.state === 'finished') {
      i += 1;
      if (i < this.steps.length) {
        this.index = i;
        step = this.steps[i];
        step.start(this.steps[i - 1].startTime);
        step.finishIfZeroDuration();
      }
    }
    if (i === this.steps.length) {
      this.finish();
    }
  }

  nextFrame(now: number) {
    if (this.startTime === null) {
      this.startTime = now - this.startTimeOffset;
    }
    let remaining = -1;
    if (this.beforeFrame != null) {
      this.beforeFrame(now - this.startTime);
    }
    if (this.index <= this.steps.length - 1) {
      remaining = this.steps[this.index].nextFrame(now);
      if (this.afterFrame != null) {
        this.afterFrame(now - this.startTime);
      }
      // console.log('serial', now, this.index, remaining)
      if (remaining >= 0) {
        if (this.index === this.steps.length - 1) {
          this.finish();
          return remaining;
        }
        this.index += 1;
        this.steps[this.index].start(now - remaining);
        return this.nextFrame(now);
      }
    }
    return remaining;
  }

  finish(cancelled: boolean = false, force: ?'complete' | 'freeze' = null) {
    if (this.state === 'idle' || this.state === 'finished') {
      return;
    }
    // super.finish(cancelled, force);
    this.state = 'finished';
    let forceToUse = null;
    if (this.completeOnCancel === true) {
      forceToUse = 'complete';
    }
    if (this.completeOnCancel === false) {
      forceToUse = 'freeze';
    }
    if (force != null) {
      forceToUse = force;
    }
    this.steps.forEach((step) => {
      if (step.state !== 'idle' && step.state !== 'finished') {
        step.finish(cancelled, forceToUse);
      }
    });
    if (this.onFinish != null) {
      this.fnExec(this.onFinish, cancelled);
    }
  }

  getTotalDuration() {
    let totalDuration = 0;
    this.steps.forEach((step) => {
      totalDuration += step.getTotalDuration();
    });
    return totalDuration;
  }

  getRemainingTime(now: number = new GlobalAnimation().now() / 1000) {
    const totalDuration = this.getTotalDuration();
    if (this.startTime == null) {
      if (this.state === 'animating' || this.state === 'waitingToStart') {
        return totalDuration;
      } else {
        return 0;
      }
    }
    const deltaTime = now - this.startTime;
    return totalDuration - deltaTime;
  }

  _dup() {
    const step = new SerialAnimationStep();
    duplicateFromTo(this, step);
    return step;
  }
}

export function inSerial(
  stepsOrOptionsIn: Array<AnimationStep> | TypeSerialAnimationStepInputOptions = {},
  ...optionsIn: Array<TypeSerialAnimationStepInputOptions>
) {
  return new SerialAnimationStep(stepsOrOptionsIn, ...optionsIn);
}

