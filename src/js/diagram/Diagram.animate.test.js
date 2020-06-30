import {
  Point, Transform,
} from '../tools/g2';
import {
  round,
} from '../tools/math';
import * as tools from '../tools/tools';
import makeDiagram from '../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('./recorder.worker');

describe('Animate To State', () => {
  let diagram;
  let p1;
  let p2;
  let p3;
  let c;
  beforeEach(() => {
    diagram = makeDiagram();
    diagram.addElements([
      {
        name: 'c',
        method: 'collection',
        addElements: [
          {
            name: 'p2',
            method: 'polygon',
          },
          {
            name: 'p3',
            method: 'polygon',
            mods: {
              transformUpdatesIndependantly: false,
            },
          },
        ],
      },
      {
        name: 'p1',
        method: 'polygon',
      }
    ]);
    c = diagram.elements._c;
    p1 = diagram.elements._p1;
    p2 = c._p2;
    p3 = c._p3;
    diagram.initialize();
  });
  describe('Animate to State', () => {
    beforeEach(() => {
      p2.setTransformCallback = () => {
        p3.setPosition(p2.getPosition());
      };
    });
    test('Simple', () => {
      p1.setPosition(2, 2);
      p2.setPosition(1, 1);
      c.setPosition(1, 1);
      diagram.setFirstTransform();
      expect(p1.getPosition('diagram').round(3)).toEqual(new Point(2, 2));
      expect(p2.getPosition('diagram').round(3)).toEqual(new Point(2, 2));
      expect(p3.getPosition('diagram').round(3)).toEqual(new Point(2, 2));
      expect(c.getPosition('diagram').round(3)).toEqual(new Point(1, 1));
      const state = diagram.getState();
      p1.setPosition(0, 0);
      p2.setPosition(0, 0);
      c.setPosition(0, 0);
      diagram.setFirstTransform();
      let done = false;
      const callback = () => { done = true; };
      diagram.animateToState(state, { duration: 1 }, callback);
      diagram.draw(0);
      expect(p1.animations.animations).toHaveLength(1);
      expect(p2.animations.animations).toHaveLength(1);
      expect(p3.animations.animations).toHaveLength(0);
      expect(c.animations.animations).toHaveLength(1);
      expect(done).toBe(false);
      diagram.draw(0.5);
      expect(p1.getPosition('diagram').round(3)).toEqual(new Point(1, 1));
      expect(p2.getPosition('diagram').round(3)).toEqual(new Point(1, 1));
      expect(p3.getPosition('diagram').round(3)).toEqual(new Point(1, 1));
      expect(c.getPosition('diagram').round(3)).toEqual(new Point(0.5, 0.5));
      expect(done).toBe(false);
      diagram.draw(1);
      expect(p1.getPosition('diagram').round(3)).toEqual(new Point(2, 2));
      expect(p2.getPosition('diagram').round(3)).toEqual(new Point(2, 2));
      expect(p3.getPosition('diagram').round(3)).toEqual(new Point(2, 2));
      expect(c.getPosition('diagram').round(3)).toEqual(new Point(1, 1));
      expect(done).toBe(true);
    });
    test('Visibility', () => {
      p1.setPosition(2, 2);
      p2.setPosition(1, 1);
      p1.hide();
      c.setPosition(1, 1);
      diagram.setFirstTransform();
      const state = diagram.getState({ ignoreShown: true });
      p1.setPosition(0, 0);
      p2.setPosition(0, 0);
      c.setPosition(0, 0);
      p3.hide();
      p1.show();
      diagram.setFirstTransform();
      diagram.animateToState(state, { duration: 1 });
      expect(p3.animations.animations).toHaveLength(1);
      diagram.draw(0);
      expect(p1.animations.animations[0].steps[0].steps).toHaveLength(2);
      expect(p2.animations.animations[0].steps[0].steps).toHaveLength(1);
      expect(p3.animations.animations[0].steps[0].steps).toHaveLength(1);
      expect(c.animations.animations[0].steps[0].steps).toHaveLength(1);
      diagram.draw(0.5);
      expect(p1.getPosition('diagram').round(3)).toEqual(new Point(1, 1));
      expect(p2.getPosition('diagram').round(3)).toEqual(new Point(1, 1));
      expect(p3.getPosition('diagram').round(3)).toEqual(new Point(1, 1));
      expect(c.getPosition('diagram').round(3)).toEqual(new Point(0.5, 0.5));
      expect(p1.opacity).toBe(0.5005);
      expect(p1.isShown).toBe(true);
      expect(p3.opacity).toBe(0.5005);
      expect(p3.isShown).toBe(true);

      // diagram.draw(0.9);
      diagram.draw(1);
      expect(p1.getPosition('local').round(3)).toEqual(new Point(2, 2));
      expect(p2.getPosition('diagram').round(3)).toEqual(new Point(2, 2));
      expect(p3.getPosition('diagram').round(3)).toEqual(new Point(2, 2));
      expect(c.getPosition('diagram').round(3)).toEqual(new Point(1, 1));
      expect(p1.opacity).toBe(1);
      expect(p1.isShown).toBe(false);
      expect(p3.opacity).toBe(1);
      expect(p3.isShown).toBe(true);
    });
  });
  describe('Remaining Time', () => {
    test('Simple', () => {
      p1.animations.new()
        .position({ target: [1, 1], duration: 1 })
        .start();
      expect(diagram.isAnimating()).toBe(true);
      expect(diagram.getRemainingAnimationTime()).toBe(1);
      diagram.draw(0);
      expect(diagram.getRemainingAnimationTime(0)).toBe(1);
      diagram.draw(0.5);
      expect(diagram.getRemainingAnimationTime(0.5)).toBe(0.5);
      diagram.draw(1);
      expect(diagram.getRemainingAnimationTime(1)).toBe(0);
      diagram.draw(1.1);
      expect(diagram.getRemainingAnimationTime(1.1)).toBe(0);
    });
    test('Multiple different times', () => {
      p1.animations.new()
        .position({ target: [1, 1], duration: 1 })
        .start();
      p2.animations.new()
        .position({ target: [1, 1], delay: 1, duration: 1 })
        .start();
      expect(diagram.isAnimating()).toBe(true);
      expect(diagram.getRemainingAnimationTime()).toBe(2);
      diagram.draw(0);
      expect(diagram.getRemainingAnimationTime(0)).toBe(2);
      diagram.draw(0.5);
      expect(diagram.getRemainingAnimationTime(0.5)).toBe(1.5);
      diagram.draw(1);
      expect(diagram.getRemainingAnimationTime(1)).toBe(1);
      diagram.draw(2.1);
      expect(diagram.getRemainingAnimationTime(1.1)).toBe(0);
    });
  })
  describe('Animation Finished Callback', () => {
    let callback;
    beforeEach(() => {
      callback = jest.fn(() => {});
      diagram.animationFinishedCallback = callback;
    })
    test('Simple', () => {
      p1.animations.new()
        .position({ target: [1, 1], duration: 1 })
        .start();
      expect(diagram.isAnimating()).toBe(true);
      diagram.draw(0);
      diagram.draw(0.5);
      expect(diagram.isAnimating()).toBe(true);
      expect(callback.mock.calls).toHaveLength(0);
      diagram.draw(1);
      expect(callback.mock.calls).toHaveLength(1);
    });
    test('Multiple animations with same durations', () => {
      p1.animations.new()
        .position({ target: [1, 1], duration: 1 })
        .start();
      p2.animations.new()
        .position({ target: [1, 1], duration: 1 })
        .start();
      expect(diagram.isAnimating()).toBe(true);
      
      diagram.draw(0);
      diagram.draw(0.5);
      expect(diagram.isAnimating()).toBe(true);
      expect(callback.mock.calls).toHaveLength(0);
      
      diagram.draw(1);
      expect(diagram.isAnimating()).toBe(false);
      expect(callback.mock.calls).toHaveLength(1);
    });
    test('Multiple animations with different durations', () => {
      p1.animations.new()
        .position({ target: [1, 1], duration: 1 })
        .start();
      p2.animations.new()
        .position({ target: [1, 1], duration: 2 })
        .start();
      expect(diagram.isAnimating()).toBe(true);
      
      diagram.draw(0);
      diagram.draw(0.5);
      expect(diagram.isAnimating()).toBe(true);
      expect(callback.mock.calls).toHaveLength(0);
      
      diagram.draw(1);
      expect(diagram.isAnimating()).toBe(true);
      expect(callback.mock.calls).toHaveLength(0);
      
      diagram.draw(1.5);
      expect(diagram.isAnimating()).toBe(true);
      expect(callback.mock.calls).toHaveLength(0);
      
      diagram.draw(2);
      expect(callback.mock.calls).toHaveLength(1);
    });
  });
});
describe('Animate To State with pulse', () => {
  let diagram;
  let a;
  beforeEach(() => {
    diagram = makeDiagram();
    diagram.addElements([
      {
        name: 'a',
        method: 'polygon',
      }
    ]);
    a = diagram.elements._a;
    diagram.initialize();
  });
  test('Simple', () => {
    diagram.setFirstTransform();
    a.setPosition(1, 1);
    a.pulseScaleNow(1, 1.5);

    diagram.mock.timeStep(0);
    diagram.mock.timeStep(0.5);
    expect(a.getPosition()).toEqual(new Point(1, 1));
    expect(a.pulseTransforms[0].order[0].x).toEqual(1.5);
    expect(a.pulseTransforms[0].order[0].y).toEqual(1.5);
    const state = diagram.getState();
    diagram.stop();
    diagram.mock.timeStep(1);
    a.setPosition(0, 0);
    diagram.mock.timeStep(2);
    diagram.animateToState(state);
    diagram.mock.timeStep(0);
    expect(a.getPosition()).toEqual(new Point(0, 0));
    expect(a.pulseTransforms[0].order[0].x).toEqual(1);
    expect(a.pulseTransforms[0].order[0].y).toEqual(1);

    diagram.mock.timeStep(0.5);
    expect(diagram.isAnimating()).toBe(true);
    expect(a.getPosition()).toEqual(new Point(0.5, 0.5));
    expect(a.pulseTransforms[0].order[0].x).toEqual(1);
    expect(a.pulseTransforms[0].order[0].y).toEqual(1);

    diagram.mock.timeStep(1);
    expect(diagram.isAnimating()).toBe(true);
    expect(a.getPosition()).toEqual(new Point(1, 1));
    expect(a.pulseTransforms[0].order[0].x).toEqual(1);
    expect(a.pulseTransforms[0].order[0].y).toEqual(1);

    diagram.mock.timeStep(0.25);
    expect(a.getPosition()).toEqual(new Point(1, 1));
    expect(round(a.pulseTransforms[0].order[0].x, 3)).toEqual(1.354);
    expect(round(a.pulseTransforms[0].order[0].y, 3)).toEqual(1.354);

    diagram.mock.timeStep(0.25);
    expect(a.getPosition()).toEqual(new Point(1, 1));
    expect(round(a.pulseTransforms[0].order[0].x, 3)).toEqual(1.5);
    expect(round(a.pulseTransforms[0].order[0].y, 3)).toEqual(1.5);
    expect(diagram.isAnimating()).toBe(true);
  })
});