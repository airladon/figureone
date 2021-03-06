import * as tools from '../../../../tools/tools';
import * as math from '../../../../tools/math';
import makeFigure from '../../../../__mocks__/makeFigure';

tools.isTouchDevice = jest.fn();

jest.mock('../../../Gesture');
jest.mock('../../../webgl/webgl');
jest.mock('../../../DrawContext2D');


describe('Dim Animation', () => {
  let elem1;
  let callback;
  let color;
  let figure;
  let dimColor;
  beforeEach(() => {
    figure = makeFigure();
    elem1 = figure.collections.line({
      label: {
        text: 'a',
      },
    });
    color = [1, 1, 1, 1];
    dimColor = [0.5, 0.5, 0.5, 1];
    elem1.setColor(color);
    elem1.setDimColor(dimColor);
    callback = jest.fn(() => {});
    elem1.dim();
  });
  test('Simple undim', () => {
    elem1.animations.new()
      .undim(1)
      .whenFinished(callback)
      .start();

    expect(elem1.isShown).toBe(true);
    expect(math.round(elem1.color[0])).toEqual(0.5);
    expect(math.round(elem1._label.color[0])).toEqual(0.5);

    elem1.animations.nextFrame(0);
    expect(math.round(elem1.color[0])).toEqual(0.5);

    elem1.animations.nextFrame(0.5);
    expect(math.round(elem1.color[0])).toEqual(0.75);

    elem1.animations.nextFrame(0.9);
    expect(math.round(elem1.color[0])).toEqual(0.95);

    elem1.animations.nextFrame(1.0);
    expect(math.round(elem1.color[0])).toEqual(1.0);
    expect(callback.mock.calls.length).toBe(1);
  });
});
