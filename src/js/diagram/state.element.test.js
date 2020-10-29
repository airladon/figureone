import * as tools from '../tools/tools';
// import { Transform } from '../tools/g2';
import makeDiagram from '../__mocks__/makeDiagram';
import * as math from '../tools/math';

tools.isTouchDevice = jest.fn();

jest.mock('./Gesture');
jest.mock('./webgl/webgl');
jest.mock('./DrawContext2D');

describe('Diagram Element State', () => {
  let elem1;
  let diagram;
  let now;
  beforeEach(() => {
    diagram = makeDiagram();
    elem1 = diagram.shapes.polygon();
    diagram.elements.add('elem1', elem1);
    global.performance.now = () => now * 1000;
  });
  test('Transform Callback', () => {
    const setTransformCallback = jest.fn(() => {});
    elem1.fnMap.add('setTransformCallback', setTransformCallback);

    elem1.setRotation(0);
    elem1.animations.new()
      .rotation({ target: 3, duration: 3, progression: 'linear' })
      .start();

    elem1.setTransformCallback = 'setTransformCallback';
    expect(setTransformCallback.mock.calls.length).toBe(0);
    now = 0;
    diagram.draw(now);
    expect(setTransformCallback.mock.calls.length).toBe(1);

    now = 0.5;
    diagram.draw(now);
    expect(elem1.getRotation()).toBe(0.5);
    expect(setTransformCallback.mock.calls.length).toBe(2);

    const state = diagram.getState();

    now = 1;
    diagram.draw(now);
    expect(elem1.getRotation()).toBe(1);
    elem1.stop();
    expect(elem1.animations.animations).toHaveLength(0);
    expect(setTransformCallback.mock.calls.length).toBe(3);

    // now lets delay 10s
    now = 11;
    diagram.setState(state);
    diagram.draw(now);
    expect(math.round(elem1.getRotation())).toBe(0.5);
    expect(setTransformCallback.mock.calls.length).toBe(4);
  });
  test('Pulse Callback', () => {
    const pulseCallback = jest.fn(() => {});
    elem1.fnMap.add('pulseCallback', pulseCallback);
    expect(pulseCallback.mock.calls.length).toBe(0);

    elem1.pulse({
      duration: 2, scale: 2, frequency: 0.5, done: 'pulseCallback', when: 'nextFrame',
    });

    now = 0;
    diagram.draw(now);
    expect(pulseCallback.mock.calls.length).toBe(0);

    now = 0.5;
    diagram.draw(now);
    expect(pulseCallback.mock.calls.length).toBe(0);

    const state = diagram.getState();

    now = 2;
    diagram.draw(now);
    expect(pulseCallback.mock.calls.length).toBe(1);

    // now lets delay 10s
    now = 11;
    diagram.setState(state);
    diagram.draw(now);
    expect(pulseCallback.mock.calls.length).toBe(1);

    now = 12.4;
    diagram.draw(now);
    expect(pulseCallback.mock.calls.length).toBe(1);

    now = 12.5;
    diagram.draw(now);
    expect(pulseCallback.mock.calls.length).toBe(2);
  });
});
