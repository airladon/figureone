import {
  TransformAnimationUnit,
  AnimationSerial,
  AnimationParallel,
} from './AnimationPhase';
// import {
//   Transform,
// } from '../tools/g2';
import * as tools from '../tools/tools';
import * as math from '../tools/math';
import makeDiagram from '../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('./Gesture');
jest.mock('./webgl/webgl');
jest.mock('./DrawContext2D');


describe('Transfrom Animation Unit', () => {
  let element;
  beforeEach(() => {
    const diagram = makeDiagram();
    element = diagram.objects.line();
  });
  test('Instantiation', () => {
    const onFinish = () => {};
    const finishOnCancel = false;
    const type = 'transform';
    const progression = 'easeinout';
    const start = element.transform.zero();
    const target = element.transform.constant(1);
    const duration = 2;
    const unit = new TransformAnimationUnit({
      onFinish,
      finishOnCancel,
      type,
      progression,
      duration,
      transform: {
        start,
        target,
      },
      element,
    });
    expect(unit.onFinish).toBe(onFinish);
    expect(unit.type).toBe(type);
    expect(unit.progression).toBe(math.easeinout);
    expect(unit.transform.start).toBe(start);
    expect(unit.transform.target).toBe(target);
    expect(unit.transform.delta).toBe(null);
    expect(unit.duration).toBe(duration);
  });
  test('Delta calculation with start transform defined', () => {
    const start = element.transform.zero();
    const target = element.transform.constant(1);
    const unit = new TransformAnimationUnit({
      element,
      type: 'transform',
      transform: {
        start,
        target,
      },
    });
    expect(unit.transform.delta).toBe(null);
    unit.start();
    expect(unit.transform.delta).toEqual(target);
    expect(unit.startTime).toBe(-1);
  });
  test('Target calculation with start transform not defined', () => {
    const delta = element.transform.constant(1);
    const unit = new TransformAnimationUnit({
      element,
      type: 'transform',
      transform: {
        delta,
      },
    });
    expect(unit.transform.start).toBe(null);
    expect(unit.transform.target).toBe(null);

    const start = element.transform.zero();
    element.transform = start;
    unit.start();
    expect(unit.transform.target).toEqual(delta);
    expect(unit.transform.start).toEqual(start);
  });
  test('Velocity calculation', () => {
    const start = element.transform.zero();
    const target = element.transform.constant(3);
    const velocity = element.transform.constant(0.5);
    const unit = new TransformAnimationUnit({
      element,
      type: 'transform',
      transform: {
        start, target, velocity,
      },
    });
    unit.start();
    expect(unit.duration).toBe(6);
  });
  test('Animation flow', () => {
    const start = element.transform.zero();
    const target = element.transform.constant(1);
    const unit = new TransformAnimationUnit({
      element,
      duration: 1,
      progression: 'linear',
      type: 'transform',
      transform: { start, target },
    });
    unit.start();
    expect(unit.startTime).toBe(-1);

    unit.nextFrame(100);
    expect(unit.startTime).toBe(100);
    expect(unit.element.transform).toEqual(start);

    let remainingTime;
    remainingTime = unit.nextFrame(100.1);
    expect(unit.element.transform.round()).toEqual(start.constant(0.1));
    expect(remainingTime).toBe(0);

    remainingTime = unit.nextFrame(100.55);
    expect(unit.element.transform.round()).toEqual(start.constant(0.55));
    expect(remainingTime).toBe(0);

    remainingTime = unit.nextFrame(100.9);
    expect(unit.element.transform.round()).toEqual(start.constant(0.9));
    expect(remainingTime).toBe(0);

    remainingTime = unit.nextFrame(101.1);
    expect(unit.element.transform.round()).toEqual(target);
    expect(math.round(remainingTime)).toBe(0.1);
  });
  test('Finish on Cancel', () => {
    const start = element.transform.zero();
    const target = element.transform.constant(1);
    let finishFlag = 0;
    const step = new TransformAnimationUnit({
      element,
      duration: 1,
      progression: 'linear',
      type: 'transform',
      transform: { start, target },
      finishOnCancel: true,
      onFinish: () => { finishFlag = 1; },
    });
    step.start();
    step.nextFrame(0);
    step.nextFrame(0.5);
    expect(element.transform.round()).toEqual(start.constant(0.5));

    step.finish(true);
    expect(element.transform.round()).toEqual(target);
    expect(finishFlag).toBe(1);
  });
});
describe('Serial Animation', () => {
  let element;
  beforeEach(() => {
    const diagram = makeDiagram();
    element = diagram.objects.line();
  });
  test('3 step animation on same element', () => {
    const target1 = element.transform.constant(1);
    const target2 = element.transform.constant(2);
    const target3 = element.transform.constant(3);
    const step1 = new TransformAnimationUnit({
      element,
      duration: 1,
      progression: 'linear',
      type: 'transform',
      transform: {
        start: element.transform.zero(),
        target: target1,
      },
    });
    const step2 = new TransformAnimationUnit({
      element,
      duration: 1,
      progression: 'linear',
      type: 'transform',
      transform: { target: target2 },
    });
    const step3 = new TransformAnimationUnit({
      element,
      duration: 1,
      progression: 'linear',
      type: 'transform',
      transform: { target: target3 },
    });
    const serial = new AnimationSerial({
      animations: [step1, step2, step3],
    });

    let remainingTime;

    serial.start();
    serial.nextFrame(100);
    expect(serial.index).toBe(0);
    expect(element.transform.round()).toEqual(element.transform.constant(0));

    serial.nextFrame(100.1);
    expect(serial.index).toBe(0);
    expect(element.transform.round()).toEqual(element.transform.constant(0.1));

    serial.nextFrame(100.9);
    expect(serial.index).toBe(0);
    expect(element.transform.round()).toEqual(element.transform.constant(0.9));

    serial.nextFrame(101);
    expect(serial.index).toBe(0);
    expect(element.transform.round()).toEqual(element.transform.constant(1));

    serial.nextFrame(101.01);
    expect(serial.index).toBe(1);
    expect(element.transform.round()).toEqual(element.transform.constant(1.01));

    serial.nextFrame(101.5);
    expect(serial.index).toBe(1);
    expect(element.transform.round()).toEqual(element.transform.constant(1.5));

    serial.nextFrame(102.5);
    expect(serial.index).toBe(2);
    expect(element.transform.round()).toEqual(element.transform.constant(2.5));

    remainingTime = serial.nextFrame(103);
    expect(serial.index).toBe(2);
    expect(element.transform.round()).toEqual(element.transform.constant(3));
    expect(math.round(remainingTime)).toBe(0);

    remainingTime = serial.nextFrame(103.1);
    expect(serial.index).toBe(2);
    expect(element.transform.round()).toEqual(element.transform.constant(3));
    expect(math.round(remainingTime)).toBe(0.1);
  });
});
describe('Parallel Animation', () => {
  let element1;
  let element2;
  let element3;
  beforeEach(() => {
    const diagram = makeDiagram();
    element1 = diagram.objects.line();
    element2 = diagram.objects.line();
    element3 = diagram.objects.line();
  });
  test('3 element animation', () => {
    const target1 = element1.transform.constant(1);
    const target2 = element2.transform.constant(2);
    const target3 = element3.transform.constant(3);
    const duration1 = 1;
    const duration2 = 2;
    const duration3 = 3;
    const step1 = new TransformAnimationUnit({
      element: element1,
      duration: duration1,
      progression: 'linear',
      type: 'transform',
      transform: { target: target1 },
    });
    const step2 = new TransformAnimationUnit({
      element: element2,
      duration: duration2,
      progression: 'linear',
      type: 'transform',
      transform: { target: target2 },
    });
    const step3 = new TransformAnimationUnit({
      element: element3,
      duration: duration3,
      progression: 'linear',
      type: 'transform',
      transform: { target: target3 },
    });

    const parallel = new AnimationParallel({
      animations: [step1, step2, step3],
    });

    let remainingTime;
    element1.transform = element1.transform.zero();
    element2.transform = element2.transform.zero();
    element3.transform = element3.transform.zero();
    const t1 = element1.transform;
    const t2 = element2.transform;
    const t3 = element3.transform;

    parallel.start();
    remainingTime = parallel.nextFrame(100);
    expect(element1.transform.round()).toEqual(element1.transform.constant(0));
    expect(element2.transform.round()).toEqual(element2.transform.constant(0));
    expect(element3.transform.round()).toEqual(element3.transform.constant(0));
    expect(math.round(remainingTime)).toBe(0);

    remainingTime = parallel.nextFrame(100.5);
    expect(element1.transform.round()).toEqual(t1.constant(0.5));
    expect(element2.transform).toEqual(t2.constant(0.5));
    expect(element3.transform).toEqual(t3.constant(0.5));
    expect(math.round(remainingTime)).toBe(0);

    remainingTime = parallel.nextFrame(101.5);
    expect(element1.transform.round()).toEqual(t1.constant(1));
    expect(element2.transform).toEqual(t2.constant(1.5));
    expect(element3.transform).toEqual(t3.constant(1.5));
    expect(math.round(remainingTime)).toBe(0);

    remainingTime = parallel.nextFrame(102.5);
    expect(element1.transform.round()).toEqual(t1.constant(1));
    expect(element2.transform).toEqual(t2.constant(2));
    expect(element3.transform).toEqual(t3.constant(2.5));
    expect(math.round(remainingTime)).toBe(0);

    remainingTime = parallel.nextFrame(103);
    expect(element1.transform.round()).toEqual(t1.constant(1));
    expect(element2.transform).toEqual(t2.constant(2));
    expect(element3.transform).toEqual(t3.constant(3));
    expect(math.round(remainingTime)).toBe(0);

    remainingTime = parallel.nextFrame(103.1);
    expect(element1.transform.round()).toEqual(t1.constant(1));
    expect(element2.transform).toEqual(t2.constant(2));
    expect(element3.transform).toEqual(t3.constant(3));
    expect(math.round(remainingTime)).toBe(0.1);

    // parallel.nextFrame(100.1);
    // expect(element.transform.round()).toEqual(element.transform.constant(0.1));

    // parallel.nextFrame(100.9);
    // expect(element.transform.round()).toEqual(element.transform.constant(0.9));

    // parallel.nextFrame(101);
    // expect(element.transform.round()).toEqual(element.transform.constant(1));

    // parallel.nextFrame(101.01);
    // expect(element.transform.round()).toEqual(element.transform.constant(1.01));

    // parallel.nextFrame(101.5);
    // expect(element.transform.round()).toEqual(element.transform.constant(1.5));

    // parallel.nextFrame(102.5);
    // expect(element.transform.round()).toEqual(element.transform.constant(2.5));

    // remainingTime = parallel.nextFrame(103);
    // expect(element.transform.round()).toEqual(element.transform.constant(3));
    // expect(math.round(remainingTime)).toBe(0);

    // remainingTime = parallel.nextFrame(103.1);
    // expect(element.transform.round()).toEqual(element.transform.constant(3));
    // expect(math.round(remainingTime)).toBe(0.1);
  });
});
