import { SerialAnimationStep } from './SerialAnimationStep';
import TransformAnimationStep from './ElementAnimationStep/TransformAnimationStep';
import * as tools from '../../../tools/tools';
import * as math from '../../../tools/math';
import makeFigure from '../../../__mocks__/makeFigure';

tools.isTouchDevice = jest.fn();

jest.mock('../../Gesture');
jest.mock('../../webgl/webgl');
jest.mock('../../DrawContext2D');

describe('Serial Animation', () => {
  describe('Step only', () => {
    let element;
    let step1;
    let step2;
    let step3;
    let target1;
    let target2;
    let target3;
    let serial;
    let step1CallbackFlag;
    let step2CallbackFlag;
    let step3CallbackFlag;
    let serialCallbackFlag;
    const step1Callback = () => { step1CallbackFlag += 1; };
    const step2Callback = () => { step2CallbackFlag += 1; };
    const step3Callback = () => { step3CallbackFlag += 1; };
    const serialCallback = () => { serialCallbackFlag += 1; };
    beforeEach(() => {
      const figure = makeFigure();
      step1CallbackFlag = 0;
      step2CallbackFlag = 0;
      step3CallbackFlag = 0;
      serialCallbackFlag = 0;
      element = figure.collections.line();
      target1 = element.transform.constant(1);
      target2 = element.transform.constant(2);
      target3 = element.transform.constant(3);
      step1 = new TransformAnimationStep({
        element,
        duration: 1,
        progression: 'linear',
        type: 'transform',
        start: element.transform.zero(),
        target: target1,
        onFinish: step1Callback,
      });
      step2 = new TransformAnimationStep({
        element,
        duration: 1,
        progression: 'linear',
        type: 'transform',
        target: target2,
        onFinish: step2Callback,
      });
      step3 = new TransformAnimationStep({
        element,
        duration: 1,
        progression: 'linear',
        type: 'transform',
        target: target3,
        onFinish: step3Callback,
      });
      serial = new SerialAnimationStep({
        steps: [step1, step2, step3],
        onFinish: serialCallback,
      });
    });
    test('3 step animation on same element', () => {
      let remainingTime;
      expect(step1.state).toBe('idle');
      expect(step2.state).toBe('idle');
      expect(step3.state).toBe('idle');
      expect(serial.state).toBe('idle');
      serial.start();
      serial.nextFrame(100);
      expect(serial.index).toBe(0);
      expect(element.transform.round(4)).toEqual(element.transform.constant(0));
      expect(step1.state).toBe('animating');
      expect(step2.state).toBe('waitingToStart');
      expect(step3.state).toBe('waitingToStart');
      expect(serial.state).toBe('animating');

      serial.nextFrame(100.1);
      expect(serial.index).toBe(0);
      expect(element.transform.round(4)).toEqual(element.transform.constant(0.1));
      expect(step1.state).toBe('animating');
      expect(step2.state).toBe('waitingToStart');
      expect(step3.state).toBe('waitingToStart');
      expect(serial.state).toBe('animating');

      serial.nextFrame(100.9);
      expect(serial.index).toBe(0);
      expect(element.transform.round(4)).toEqual(element.transform.constant(0.9));

      serial.nextFrame(101);
      expect(serial.index).toBe(1);
      expect(element.transform.round(4)).toEqual(element.transform.constant(1));
      expect(step1.state).toBe('finished');
      expect(step2.state).toBe('animating');
      expect(step3.state).toBe('waitingToStart');
      expect(serial.state).toBe('animating');

      serial.nextFrame(101.5);
      expect(serial.index).toBe(1);
      expect(element.transform.round(4)).toEqual(element.transform.constant(1.5));

      serial.nextFrame(102.5);
      expect(serial.index).toBe(2);
      expect(element.transform.round(4)).toEqual(element.transform.constant(2.5));
      expect(step1.state).toBe('finished');
      expect(step2.state).toBe('finished');
      expect(step3.state).toBe('animating');
      expect(serial.state).toBe('animating');

      remainingTime = serial.nextFrame(103);
      expect(serial.index).toBe(2);
      expect(element.transform.round(4)).toEqual(element.transform.constant(3));
      expect(math.round(remainingTime)).toBe(0);

      remainingTime = serial.nextFrame(103.1);
      expect(serial.index).toBe(2);
      expect(element.transform.round(4)).toEqual(element.transform.constant(3));
      expect(math.round(remainingTime)).toBe(0.1);
      expect(step1.state).toBe('finished');
      expect(step2.state).toBe('finished');
      expect(step3.state).toBe('finished');
      expect(serial.state).toBe('finished');
    });
    test('Duplication', () => {
      const dup = serial._dup();
      expect(dup).toEqual(serial);
      expect(dup).not.toBe(serial);
    });
    describe('Cancelling', () => {
      test('Serial Complete on cancel = true forces all steps to cancel', () => {
        step1.completeOnCancel = false;
        step2.completeOnCancel = false;
        step3.completeOnCancel = false;
        serial.completeOnCancel = true;
        serial.start();
        serial.nextFrame(100);
        serial.nextFrame(100.1);
        serial.cancel();
        expect(element.transform.round(4)).toEqual(target3);
      });
      test('Serial Complete on cancel = false forces all steps to cancel', () => {
        step1.completeOnCancel = true;
        step2.completeOnCancel = true;
        step3.completeOnCancel = true;
        serial.completeOnCancel = false;
        serial.start();
        serial.nextFrame(100);
        serial.nextFrame(100.1);
        serial.cancel();
        expect(element.transform.round(4)).toEqual(target1.constant(0.1));
      });
      test('Serial Complete on cancel = false overridden by force', () => {
        step1.completeOnCancel = true;
        step2.completeOnCancel = true;
        step3.completeOnCancel = true;
        serial.completeOnCancel = false;
        serial.start();
        serial.nextFrame(100);
        serial.nextFrame(100.1);
        serial.cancel('complete');
        expect(element.transform.round(4)).toEqual(target3);
      });
      test('Serial Complete on cancel = true overriden by cancel', () => {
        step1.completeOnCancel = false;
        step2.completeOnCancel = false;
        step3.completeOnCancel = false;
        serial.completeOnCancel = true;
        serial.start();
        serial.nextFrame(100);
        serial.nextFrame(100.1);
        serial.cancel('freeze');
        expect(element.transform.round(4)).toEqual(target1.constant(0.1));
      });
      test('Complete on cancel = true, no forcing', () => {
        step1.completeOnCancel = true;
        step2.completeOnCancel = true;
        step3.completeOnCancel = true;
        serial.start();
        serial.nextFrame(100);
        serial.nextFrame(100.1);
        serial.finish(true);
        expect(step1CallbackFlag).toBe(1);
        expect(step2CallbackFlag).toBe(1);
        expect(step3CallbackFlag).toBe(1);
        expect(serialCallbackFlag).toBe(1);
        expect(element.transform.round(4)).toEqual(target3);
      });
      // Testing to make sure we still end at the target of step3
      test('Complete on cancel = true except middle step, no forcing', () => {
        step1.completeOnCancel = true;
        step2.completeOnCancel = false;
        step3.completeOnCancel = true;
        serial.start();
        serial.nextFrame(100);
        serial.nextFrame(100.1);
        serial.finish(true);
        expect(step1CallbackFlag).toBe(1);
        expect(step2CallbackFlag).toBe(1);
        expect(step3CallbackFlag).toBe(1);
        expect(serialCallbackFlag).toBe(1);
        expect(element.transform.round(4)).toEqual(target3);
      });
      // Testing to make sure we end at the target of step 2
      test('Complete on cancel = true except end step, no forcing', () => {
        step1.completeOnCancel = true;
        step2.completeOnCancel = true;
        step3.completeOnCancel = false;
        serial.start();
        serial.nextFrame(100);
        serial.nextFrame(100.1);
        serial.finish(true);
        expect(step1CallbackFlag).toBe(1);
        expect(step2CallbackFlag).toBe(1);
        expect(step3CallbackFlag).toBe(1);
        expect(serialCallbackFlag).toBe(1);
        expect(element.transform.round(4)).toEqual(target2);
      });
      // Testing to make sure only one callback for 1st step is called
      test('Complete on cancel = true after 1st step complete, no forcing', () => {
        step1.completeOnCancel = true;
        step2.completeOnCancel = true;
        step3.completeOnCancel = true;
        serial.start();
        serial.nextFrame(100);
        serial.nextFrame(101.1);
        serial.finish(true);
        expect(step1CallbackFlag).toBe(1);
        expect(step2CallbackFlag).toBe(1);
        expect(step3CallbackFlag).toBe(1);
        expect(serialCallbackFlag).toBe(1);
        expect(element.transform.round(4)).toEqual(target3);
      });
      // Testing to make target remains at current
      test('Complete on cancel = true, force freeze', () => {
        step1.completeOnCancel = true;
        step2.completeOnCancel = true;
        step3.completeOnCancel = true;
        serial.start();
        serial.nextFrame(100);
        serial.nextFrame(101.1);
        serial.finish(true, 'freeze');
        expect(step1CallbackFlag).toBe(1);
        expect(step2CallbackFlag).toBe(1);
        expect(step3CallbackFlag).toBe(1);
        expect(serialCallbackFlag).toBe(1);
        expect(element.transform.round(4)).toEqual(target2.constant(1.1));
      });
      // Testing to make sure non completion works
      test('Complete on cancel = false, no forcing', () => {
        step1.completeOnCancel = false;
        step2.completeOnCancel = false;
        step3.completeOnCancel = false;
        serial.start();
        serial.nextFrame(100);
        serial.nextFrame(101.1);
        serial.finish(true);
        expect(step1CallbackFlag).toBe(1);
        expect(step2CallbackFlag).toBe(1);
        expect(step3CallbackFlag).toBe(1);
        expect(serialCallbackFlag).toBe(1);
        expect(element.transform.round(4)).toEqual(target2.constant(1.1));
      });
      // Testing to make sure complete override works
      test('Complete on cancel = false, force complete', () => {
        step1.completeOnCancel = false;
        step2.completeOnCancel = false;
        step3.completeOnCancel = false;
        serial.start();
        serial.nextFrame(100);
        serial.nextFrame(101.1);
        serial.finish(true, 'complete');
        expect(step1CallbackFlag).toBe(1);
        expect(step2CallbackFlag).toBe(1);
        expect(step3CallbackFlag).toBe(1);
        expect(serialCallbackFlag).toBe(1);
        expect(element.transform.round(4)).toEqual(target3);
      });
    });
  });
  describe('From Figure', () => {
    let elem1;
    let elem2;
    let figure;
    beforeEach(() => {
      figure = makeFigure();
      elem1 = figure.collections.line();
      elem2 = figure.collections.line();
      figure.elements.add('elem1', elem1);
      figure.elements.add('elem2', elem2);
    });
    test('Zero duration, two steps, inSerial', () => {
      figure.elements.animations.new()
        .inSerial([
          elem1.animations.rotation({ target: 1, duration: 0 }),
          elem2.animations.rotation({ target: 1, duration: 0 }),
        ])
        .whenFinished(() => {})
        .start();
      const animationManager = figure.elements.animations;
      const builder = animationManager.animations[0];
      const inSerial = builder.steps[0];
      const e1 = inSerial.steps[0];
      const e2 = inSerial.steps[1];
      expect(animationManager.state).toBe('idle');
      expect(builder.state).toBe('finished');
      expect(inSerial.state).toBe('finished');
      expect(e1.state).toBe('finished');
      expect(e2.state).toBe('finished');
      expect(elem1.getRotation()).toBe(1);
    });
    test('Zero duration, one steps, builder', () => {
      elem1.animations.new()
        .rotation({ target: 1, duration: 0 })
        .start();
      const animationManager = elem1.animations;
      const builder = animationManager.animations[0];
      const e1 = builder.steps[0];
      expect(animationManager.state).toBe('idle');
      expect(builder.state).toBe('finished');
      expect(e1.state).toBe('finished');
      expect(elem1.getRotation()).toBe(1);
    });
    test('Zero duration, two steps, builder', () => {
      elem1.animations.new()
        .rotation({ target: 1, duration: 0 })
        .rotation({ target: 2, duration: 0 })
        .start();
      const animationManager = elem1.animations;
      const builder = animationManager.animations[0];
      const e1 = builder.steps[0];
      const e2 = builder.steps[1];
      expect(animationManager.state).toBe('idle');
      expect(builder.state).toBe('finished');
      expect(e1.state).toBe('finished');
      expect(e2.state).toBe('finished');
      expect(elem1.getRotation()).toBe(2);
    });
    test('Zero using one element as builder', () => {
      elem1.animations.new()
        .rotation({ target: 1, duration: 0 })
        .rotation({ element: elem2, target: 2, duration: 0 })
        .start();
      const animationManager = elem1.animations;
      const builder = animationManager.animations[0];
      const e1 = builder.steps[0];
      const e2 = builder.steps[1];
      expect(animationManager.state).toBe('idle');
      expect(builder.state).toBe('finished');
      expect(e1.state).toBe('finished');
      expect(e2.state).toBe('finished');
      expect(elem2.getRotation()).toBe(2);
    });
    test('Zero first element only', () => {
      elem2.setRotation(1);
      elem1.animations.new()
        .rotation({ target: 1, duration: 0 })
        .rotation({ element: elem2, target: 2, duration: 1 })
        .start();
      const animationManager = elem1.animations;
      const builder = animationManager.animations[0];
      const e1 = builder.steps[0];
      const e2 = builder.steps[1];
      expect(animationManager.state).toBe('idle');
      expect(builder.state).toBe('animating');
      expect(e1.state).toBe('finished');
      expect(e2.state).toBe('animating');
      expect(elem2.getRotation()).toBe(1);
      expect(elem1.getRotation()).toBe(1);
      figure.draw(0);
      expect(animationManager.state).toBe('animating');
      expect(builder.state).toBe('animating');
      expect(e1.state).toBe('finished');
      expect(e2.state).toBe('animating');
      expect(elem2.getRotation()).toBe(1);

      figure.draw(0.5);
      expect(animationManager.state).toBe('animating');
      expect(builder.state).toBe('animating');
      expect(e1.state).toBe('finished');
      expect(e2.state).toBe('animating');
      expect(math.round(elem2.getRotation(), 3)).toBe(1.5);
      figure.draw(1);
      expect(animationManager.state).toBe('idle');
      expect(animationManager.animations).toHaveLength(0);
      // expect(builder.state).toBe('finished');
      // expect(e1.state).toBe('finished');
      // expect(e2.state).toBe('finished');
      expect(elem2.getRotation()).toBe(2);
      expect(elem1.getRotation()).toBe(1);

      figure.draw(1.01);
      expect(animationManager.state).toBe('idle');
      expect(animationManager.animations).toHaveLength(0);
      expect(elem2.getRotation()).toBe(2);
    });
  });
});
