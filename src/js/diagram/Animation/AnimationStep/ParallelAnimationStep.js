// @flow
// import * as tools from '../../tools/math';
// import { DiagramElement } from '../Element';
import type { OBJ_AnimationStep } from '../AnimationStep';
import AnimationStep from '../AnimationStep';
import { joinObjects, duplicateFromTo } from '../../../tools/tools';
import GlobalAnimation from '../../webgl/GlobalAnimation';


/**
 * Parallel animation step options object
 * @property {Array<AnimationStep>} steps animation steps to perform in parallel
 */
export type TypeParallelAnimationStepInputOptions = {
  steps?: Array<AnimationStep>;
} & OBJ_AnimationStep;

/**
 * Parallel Animation Step
 * @extends ElementAnimationStep
 */
// Animations get started from a parent, but finish themselves
export class ParallelAnimationStep extends AnimationStep {
  steps: Array<AnimationStep>;

  constructor(
    stepsOrOptionsIn: Array<AnimationStep | null> | TypeParallelAnimationStepInputOptions = {},
    ...optionsIn: Array<TypeParallelAnimationStepInputOptions>
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
    this.steps = [];
    let steps = [];
    if (!Array.isArray(options.steps) && options.steps != null) {
      steps = [options.steps];
    } else if (options.steps != null) {
      ({ steps } = options);
    }
    this.steps = [];
    steps.forEach((step) => {
      if (step != null) {
        this.steps.push(step);
      }
    });
  }

  _getStateProperties() {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(),
      'steps',
    ];
  }

  _getStateName() {  // eslint-disable-line class-methods-use-this
    return 'parallelAnimationStep';
  }

  setTimeDelta(delta: number) {
    super.setTimeDelta(delta);
    if (this.steps != null) {
      this.steps.forEach((step) => {
        step.setTimeDelta(delta);
      });
    }
  }

  with(step: AnimationStep) {
    if (step != null) {
      this.steps.push(step);
    }
    return this;
  }

  nextFrame(now: number) {
    if (this.startTime === null) {
      this.startTime = now - this.startTimeOffset;
    }
    let remaining = null;
    if (this.beforeFrame != null) { // $FlowFixMe - as this has been confirmed
      this.beforeFrame(now - this.startTime);
    }
    this.steps.forEach((step) => {
      // console.log(step.state, step)
      if (step.state === 'animating' || step.state === 'waitingToStart') {
        const stepRemaining = step.nextFrame(now);
        // console.log(step.element.uid, stepRemaining)
        if (remaining === null) {
          remaining = stepRemaining;
        }
        if (stepRemaining < remaining) {
          remaining = stepRemaining;
        }
      }
    });
    if (this.afterFrame != null) { // $FlowFixMe - as this has been confirmed
      this.afterFrame(now - this.startTime);
    }
    if (remaining === null) {
      remaining = 0;
    }
    if (remaining >= 0) {
      this.finish();
    }
    return remaining;
  }

  finishIfZeroDuration() {
    let state = 'finished';
    this.steps.forEach((step) => {
      if (step.state !== 'finished') {
        state = 'animating';
      }
    });
    if (state === 'finished') {
      this.finish();
    }
  }

  startWaiting() {
    super.startWaiting();
    this.steps.forEach((step) => {
      step.startWaiting();
    });
  }

  start(startTime: ?number | 'next' | 'prev' | 'now' = null) {
    this.startWaiting();
    super.start(startTime);
    this.steps.forEach((step) => {
      step.start(startTime);
      step.finishIfZeroDuration();
    });
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
      const stepDuration = step.getTotalDuration();
      if (stepDuration > totalDuration) {
        totalDuration = stepDuration;
      }
    });
    return totalDuration;
  }

  getRemainingTime(now: number = new GlobalAnimation().now() / 1000) {
    const totalDuration = this.getTotalDuration();
    if (this.startTime == null) {
      if (this.state === 'animating' || this.state === 'waitingToStart') {
        return totalDuration;
      }
      return 0;
    }
    const deltaTime = now - this.startTime;
    return totalDuration - deltaTime;
  }

  _dup() {
    const step = new ParallelAnimationStep();
    duplicateFromTo(this, step);
    return step;
  }
}

export function inParallel(
  stepsOrOptionsIn: Array<AnimationStep | null> | TypeParallelAnimationStepInputOptions = {},
  ...optionsIn: Array<TypeParallelAnimationStepInputOptions>
) {
  return new ParallelAnimationStep(stepsOrOptionsIn, ...optionsIn);
}
