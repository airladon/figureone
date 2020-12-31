const { Transform, Point } = Fig;
const { range, rand, randSign } = Fig.tools.math;

const figure = new Fig.Figure({
  limits: [-2, 0, 4, 3],
  color: [0.5, 0.5, 0.5, 1],
  font: { size: 0.1 },
});

// const startX = -1.5;
let f = 0.3; // Hz
const A = 0.6;   // m
let c = 1;   // m/s

const equationPosition = new Point(0, 1.9);
const sideEquationPosition = new Point(1.4, 1.6);
const colorText = [0.4, 0.4, 0.4, 1];

const xAxis = (name, title, units, length = 3) => ({
  name,
  method: 'collections.axis',
  options: {
    start: 0,
    stop: 5.5,
    length,
    line: { width: 0.005, arrow: { end: 'barb' } },
    ticks: { step: 1, length: 0.1 },
    labels: [
      { font: { size: 0.08 }, text: [''], precision: 0 },
      {
        values: 0, text: '0', offset: [-0.1, 0.13], font: { size: 0.08 },
      },
    ],
    title: {
      font: { style: 'italic', family: 'serif', size: 0.12 },
      text: [title, { font: { size: 0.06 }, lineSpace: 0.08, text: units }],
      position: [length + 0.1, 0.04],
    },
  },
});

const yAxis = (name, title, units) => ({
  name: 'yAxis',
  method: 'collections.axis',
  options: {
    axis: 'y',
    start: -A - 0.1,
    stop: A + 0.1,
    length: A * 2 + 0.2,
    line: { width: 0.005, arrow: 'barb' },
    position: [0, -A - 0.1],
    title: {
      font: { style: 'italic', family: 'serif', size: 0.12 },
      text: [title, { font: { size: 0.06 }, lineSpace: 0.08, text: units }],
      rotation: 0,
      offset: [0.1, A + 0.15],
    },
  },
});

// Add the Space Axis
figure.add({
  name: 'spacePlot',
  method: 'collection',
  elements: [
    xAxis('xAxis', 'x', 'meters'),
    yAxis('yAxis', 'y', 'meters'),
    { name: 'balls', method: 'collection' },
  ],
  mods: {
    scenarios: {
      default: { position: [-1.5, 1.2], scale: 1 },
      small: { position: [-1.1, 1.9], scale: 0.7 },
    },
  },
});

// Add the Time Axis
figure.add({
  name: 'timePlot',
  method: 'collection',
  elements: [
    xAxis('xAxis', 't', 'seconds'),
    yAxis('yAxis', 'y', 'meters'),
    {
      name: 'trace',
      method: 'polyline',
      options: {
        simple: true,
        width: 0.01,
      },
    },
  ],
  mods: {
    scenarios: {
      default: { position: [-1.5, 2], scale: 1 },
      small: { position: [-1.1, 0.7], scale: 0.7 },
    },
  },
});


const spacePlot = figure.getElement('spacePlot');
const timePlot = figure.getElement('timePlot');
const spaceX = spacePlot.getElement('xAxis');
const timeX = timePlot.getElement('xAxis');
const balls = spacePlot.getElement('balls');
const timeTrace = timePlot.getElement('trace');

const ball = (x, index, sides = 20) => ({
  name: `ball${index}`,
  method: 'primitives.polygon',
  path: 'spacePlot.balls',    // And now you know why they weren't called particles
  options: {
    sides,
    radius: 0.02,
    transform: new Transform().translate(x, 0),
    color: [1, 0, 0, 1],
  },
  mods: {
    dimColor: [0.7, 0.7, 0.7, 1],
  },
});


const xValues = range(0.05, 5, 0.05);
const data = new Recorder();
const time = new TimeKeeper();
// time.pause();
let enableMaxTime = false;
let timeMax = false;

xValues.forEach((x, index) => {
  const drawX = spaceX.valueToDraw(x);
  figure.add(ball(drawX, index + 1));
  const b = balls.getElement(`ball${index + 1}`);
  b.custom.x = x;
  b.custom.drawX = drawX;
});

figure.add(ball(spaceX.valueToDraw(0), 0, 50));
const b0 = balls.getElement('ball0');
b0.setMovable();
b0.touchBorder = 0.2;
b0.move.bounds = {
  translation: {
    left: 0, right: 0, bottom: -A, top: A,
  },
};
let timeoutId = null;
b0.subscriptions.add('stopBeingMoved', () => {
  if (enableMaxTime) {
    if (timeoutId != null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    b0.subscriptions.add('stopBeingMoved', () => {
      timeoutId = setTimeout(() => time.pause(), 500);
    }, 1);
  }
});

b0.subscriptions.add('setTransform', () => {
  if (enableMaxTime && timeMax) {
    return;
  }
  time.unpause();
});


// Update function for everytime we want to update the signal
function update() {
  const deltaTime = time.step();
  const { y } = b0.transform.order[0];
  data.record(y, deltaTime);
  if (enableMaxTime && time.now() > 5) {
    // b0.isTouchable = false;
    timeMax = true;
    time.pause();
  }
  for (let i = 1; i < xValues.length + 1; i += 1) {
    const b = balls[`_ball${i}`];
    const by = data.getValueAtTimeAgo((b.custom.x) / c);
    b.setPosition(b.custom.drawX, by);
  }
  if (timePlot.isShown) {
    const trace = data.getRecording();
    const points = Array(trace.time.length);
    for (let i = 0; i < points.length; i += 1) {
      points[i] = new Point(timeX.valueToDraw(trace.time[i]), trace.data[i]);
    }
    timeTrace.custom.updatePoints({ points });
  }
}

// Before each draw, update the points
figure.subscriptions.add('beforeDraw', () => {
  update();
});

// After each draw, call a next animation frame so udpates happen on each frame
figure.subscriptions.add('afterDraw', () => {
  figure.animateNextFrame();
});

const reset = () => {
  figure.stop();
  b0.setPosition(0, 0);
  time.reset();
  data.reset(0);
  time.pause();
};

const disturbPulse = () => {
  reset();
  const y = rand(0.1, 0.3) * randSign();
  const t = rand(0.2, 0.4);
  b0.animations.new()
    .position({ duration: t, target: [0, y], progression: 'easeout' })
    .position({ duration: t, target: [0, 0], progression: 'easein' })
    .start();
};

const disturbSine = (delay = 0, resetSignal = true) => {
  if (resetSignal) {
    reset();
  }
  b0.animations.new('_noStop_sine')
    .delay(delay)
    .custom({
      callback: () => {
        const t = time.now();
        // console.log(Math.floor(t * 10))
        b0.setPosition(0, A * Math.sin(2 * Math.PI * f * t));
      },
      duration: 10000,
    })
    .start();
};

balls.dim();

const b1 = content => ({
  brac: {
    left: 'lb1', content, right: 'rb1', height: 0.2, descent: 0.05,
  },
});
const ASin = content => ([
  'A', 'sin',
  {
    brac: {
      left: 'lb2', content, right: 'rb2', height: 0.2, descent: 0.05,
    },
  },
]);
const b2 = content => ({
  brac: {
    left: 'lb2', content, right: 'rb2', height: 0.2, descent: 0.05,
  },
});
const brac3 = content => ({
  brac: {
    left: 'lb3', content, right: 'rb3', descent: 0.05,
  },
});
const scale = (content, s = 0.8) => ({
  scale: { content, scale: s },
});

const ann = (content, comment, symbol, space = 0.2) => ({
  bottomComment: {
    content,
    comment,
    commentSpace: space,
    symbol,
    inSize: false,
  },
});

const tann = (content, comment, symbol, space = 0.2) => ({
  topComment: {
    content,
    comment,
    commentSpace: space,
    symbol,
    inSize: false,
  },
});

const frac = (numerator, denominator) => ({
  frac: {
    numerator, denominator, symbol: 'v', overhang: 0.02,
  },
});

const stk = (content, num) => ({
  strike: {
    content,
    symbol: `strike${num}`,
  },
});

const color0 = [1, 0, 0, 1];
const color1 = [0, 0.5, 1, 1];
// const colorDef = [0.4, 0.4, 0.4, 1];
const colorDef = colorText.slice();
const dimColor = [0.75, 0.75, 0.75, 1];
// const color2 = [0, ]

// Add equation
figure.add([
  {
    name: 'eqn',
    method: 'collections.equation',
    options: {
      // Define the elements that require specific styling
      color: colorDef,
      dimColor,
      elements: {
        sin: { style: 'normal' },
        lb1: { symbol: 'bracket', side: 'left' },
        rb1: { symbol: 'bracket', side: 'right' },
        lb2: { symbol: 'bracket', side: 'left' },
        rb2: { symbol: 'bracket', side: 'right' },
        lb3: { symbol: 'squareBracket', side: 'left' },
        rb3: { symbol: 'squareBracket', side: 'right' },
        equals: '  =  ',
        equals2: '  =  ',
        w1: '\u03c9',
        w2: '\u03c9',
        w3: '\u03c9',
        min: ' \u2212 ',
        min2: ' \u2212 ',
        _2pi1: '2\u03c0',
        _2pi2: '2\u03c0',
        comma1: ', ',
        comma2: ', ',
        lambda: '\u03bb',
        v: { symbol: 'vinculum', lineWidth: 0.007 },
        v2: { symbol: 'vinculum', lineWidth: 0.007 },
        brace: { symbol: 'brace', side: 'bottom', lineWidth: 0.005 },
        line1: { symbol: 'line', width: 0.005, arrow: { start: { head: 'triangle' } } },
        line2: { symbol: 'line', width: 0.005, arrow: { start: { head: 'triangle' } } },
        x_4: { color: color0 },
        _0_4: { color: color0 },
        x_5: { color: color1 },
        x_6: { color: color1 },
        x_7: { color: color1 },
        _1_5: { color: color1 },
        _1_6: { color: color1 },
        _1_7: { color: color1 },
        strike1: { symbol: 'strike', lineWidth: 0.007 },
        strike2: { symbol: 'strike', lineWidth: 0.007 },
      },
      phrases: {
        ytx: ['y_1', b1(['x_1', 'comma1', 't_1'])],
        sinkx: ['sin', b2(['w1', 't_2', 'min', 'k', 'x_2'])],
        t1: { sub: ['t_2', '_1_1'] },
        t12: { sub: ['t_6', '_1_3'] },
        x11: { sub: ['x_2', '_1_2'] },
        x12: { sub: ['x_6', '_1_6'] },
        x13: { sub: ['x_7', '_1_7'] },
        x1OnC: frac('x11', 'c'),
        x1OnCb: frac('x13', 'c'),
        sX1OnC: scale('x1OnCb'),
        sX1ToXOnC: scale(frac(tann('x13', 'x_1', 'line2'), 'c')),
        // swX1OnC: scale({ frac: [['w3', 'x13'], 'v', 'c'] }),
        // swX1ToXOnC: scale({ frac: [['w3', tann('x13', 'x_1', 'line2')], 'v', 'c'] }),
        x0: { sub: ['x_4', '_0_4'] },
        yx0t: ['y_0', b1(['x0', 'comma1', 't_1'])],
        yx0To1t: ['y_0', b1([ann('x0', 'x12', 'line1'), 'comma1', 't_1'])],
        yx1t: ['y_0', b1(['x12', 'comma1', 't_1'])],
        yx1ToXt: ['y_0', b1([tann('x12', 'x_0', 'line1'), 'comma1', 't_1'])],
        yxt: ['y_0', b1(['x_0', 'comma1', 't_1'])],
        sXOnC: scale(frac('x_1', 'c')),
        _2pifOnC: scale(frac(['_2pi2', ' ', 'f_2'], 'c')),
        wt: ['w1', 't_3'],
        tToTMinT1: ann('t_3', ['t_4', 'min', 't1'], 'line2'),

        // // t12: { sub: ['t_3', '_1_2'] },
        // x12: { sub: ['x_3', '_1_4'] },
        // // yx0: ['y_0', b2(['x0', 'comma2', 't_1', 'min', 't12'])],
        // xOnC: { frac: ['x_2', 'v', 'c'] },
        // sX1OnC: scale('x1OnC'),
        // sXOnC: scale('xOnC'),
        // yx1c: ['y_0', b2(['x0', 'comma2', 't_1', 'min', 'sX1OnC'])],
        // yxc: ['y_0', b2(['x0', 'comma2', 't_1', 'min', 'sXOnC'])],
      },
      formDefaults: {
        alignment: { fixTo: 'sin' },
        duration: 1,
      },
      forms: {
        0: ['ytx', 'equals', 'sinkx'],
        1: [],
        2: ['t1', 'equals', 'x1OnC'],
        3: ['yx0t', 'equals', ASin(['w1', 't_3'])],
        4: ['yx0To1t', 'equals', ASin(['w1', 'tToTMinT1'])],
        5: ['yx1t', 'equals', ASin(['w1', brac3(['t_4', 'min', 't1'])])],
        6: [
          'yx1t', 'equals', ASin(
            {
              bottomComment: [
                ['w1', brac3(['t_4', 'min', 't1'])],
                ['w2', 't_5', 'min2', 'w3', 't12'],
                'brace',
              ],
            },
          ),
        ],
        7: [
          'yx1t', 'equals', ASin(
            ['w2', 't_5', 'min2', 'w3', 't12'],
          ),
        ],
        8: [
          'yx1t', 'equals', ASin(
            ['w2', 't_5', 'min2', 'w3', tann('t12', 'x1OnCb', 'line2')],
          ),
        ],
        9: ['yx1t', 'equals', ASin(['w2', 't_5', 'min2', 'w3', 'sX1OnC'])],
        10: ['yx1ToXt', 'equals', ASin(['w2', 't_5', 'min2', 'w3', 'sX1ToXOnC'])],
        11: ['yxt', 'equals', ASin(['w2', 't_5', 'min2', 'w3', 'sXOnC'])],
        12: ['yxt', 'equals', ASin(['w2', 't_5', 'min2', 'w3', 'sXOnC'])],
        13: [
          'yxt', 'equals',
          ASin([
            'w2',
            tann('t_5', 'constant', 'line1'), 'min2', 'w3',
            'sXOnC',
          ]),
        ],
        '13a': [
          'yxt', 'equals',
          ASin([
            'w2',
            tann('t_5', 'constant', 'line1'), 'min2',
            scale(frac(['w3', 'x_1'], 'c')),
          ]),
        ],
        14: [
          'yxt', 'equals',
          ASin([
            'w2',
            tann('t_5', 'constant', 'line1'), 'min2',
            scale(frac('w3', 'c')), ' ', 'x_1',
          ]),
        ],
        15: [
          'yxt', 'equals',
          ASin([
            'w2',
            tann('t_5', 'constant', 'line1'), 'min2',
            scale(frac(tann('w3', ['_2pi2', ' ', 'f_2'], 'line2'), 'c')), ' ', 'x_1',
          ]),
        ],
        16: [
          'yxt', 'equals',
          ASin([
            'w2',
            tann('t_5', 'constant', 'line1'), 'min2',
            scale(frac(['_2pi2', ' ', 'f_2'], 'c')), ' ', 'x_1',
          ]),
        ],
        lambdacf: ['lambda', 'equals2', { frac: ['c_1', 'v2', 'f'] }],
        clambdaf: {
          content: ['c_1', 'equals2', 'lambda', ' ', 'f'],
          translation: {
            c_1: { style: 'curved', direction: 'up', mag: 0.8 },
            lambda: { style: 'curved', direction: 'down', mag: 0.8 },
          },
        },
        17: [
          'yxt', 'equals',
          ASin([
            'w2',
            tann('t_5', 'constant', 'line1'), 'min2',
            scale(frac(['_2pi2', ' ', 'f_2'], ann('c', ['lambda', ' ', 'f'], 'line2'))), ' ', 'x_1',
          ]),
        ],
        18: {
          content: [
            'yxt', 'equals',
            ASin([
              'w2',
              tann('t_5', 'constant', 'line1'), 'min2',
              scale(frac(['_2pi2', ' ', 'f_2'], ['lambda', ' ', 'f'])), ' ', 'x_1',
            ]),
          ],
          translation: {
            lambda: { style: 'linear' },
          },
        },
        19: [
          'yxt', 'equals',
          ASin([
            'w2',
            tann('t_5', 'constant', 'line1'), 'min2',
            scale(frac(['_2pi2', ' ', stk('f_2', 1)], ['lambda', ' ', stk('f', 2)])), ' ', 'x_1',
          ]),
        ],
        20: [
          'yxt', 'equals',
          ASin([
            'w2',
            tann('t_5', 'constant', 'line1'), 'min2',
            scale(frac('_2pi2', 'lambda')), ' ', 'x_1',
          ]),
        ],
        21: [
          'yxt', 'equals',
          ASin([
            'w2',
            tann('t_5', 'constant', 'line1'), 'min2',
            scale(ann(frac('_2pi2', 'lambda'), 'k', 'brace')), ' ', 'x_1',
          ]),
        ],
        22: [
          'yxt', 'equals',
          ASin([
            'w2',
            tann('t_5', 'constant', 'line1'), 'min2', 'k', ' ', 'x_1',
          ]),
        ],
        23: [
          'yxt', 'equals',
          ASin(['w2', 't_5', 'min2', 'k', ' ', 'x_1']),
        ],
        // 10: ['yx1t', 'equals', 'A', 'sin', b2(['w2', 't_5', 'min2', 'swX1OnC'])],
        // 11: ['yx1ToXt', 'equals', 'A', 'sin', b2(['w2', 't_5', 'min2', 'swX1ToXOnC'])],
        // 12: ['yxt', 'equals', 'A', 'sin', b2(['w2', 't_5', 'min2', 'sXOnC'])],
        // 13: ['w2', 't_5', 'min2', 'sXOnC'],
      },
      formSeries: ['0'],
      position: equationPosition,
    },
    // mods: {
    //   scenarios: {
    //     center: { position: equationPosition, scale: 1 },
    //     side: { position: sideEquationPosition, scale: 0.6 },
    //   },
    // },
  },
  {
    name: 'sideEqn',
    method: 'equation',
    options: {
      // scale: 0.5,
      color: colorDef,
      elements: {
        id1: '    (1)',
        id2: '    (2)',
        v: { symbol: 'vinculum', lineWidth: 0.007 },
        comma1: ', ',
        comma2: ', ',
        min: ' \u2212 ',
        lb1: { symbol: 'bracket', side: 'left' },
        rb1: { symbol: 'bracket', side: 'right' },
        lb2: { symbol: 'bracket', side: 'left' },
        rb2: { symbol: 'bracket', side: 'right' },
        equals: '  =  ',
        lambda: '\u03bb',
      },
      phrases: {
        t1: { sub: ['t', '_1_1'] },
        x1: { sub: ['x', '_1_2'] },
        x0: { sub: ['x_1', '_0'] },
        ytx: ['y_1', b1(['x_3', 'comma1', 't_0'])],
        xOnC: { frac: ['x_2', 'v', 'c'] },
        sXOnC: scale('xOnC'),
        yxc: ['y_0', b2(['x0', 'comma2', 't_1', 'min', 'sXOnC'])],
      },
      formDefaults: { alignment: { xAlign: 'equals' } }, // { fixTo: 'equals' } },
      forms: {
        2: ['t1', 'equals', frac('x1', 'c')],
        '2id': ['t1', 'equals', frac('x1', 'c'), 'id1'],
        clambdaf: ['c', 'equals', 'lambda', ' ', 'f'],
        clambdafid: ['c', 'equals', 'lambda', ' ', 'f', 'id2'],
      },
      // position: sideEquationPosition,
    },
    mods: {
      scenarios: {
        center: { position: equationPosition, scale: 1 },
        side: { position: sideEquationPosition, scale: 0.7 },
      },
    },
  },
  {
    name: 'nav',
    method: 'collections.slideNavigator',
    options: {
      prevButton: { position: [-1.5, 0.2] },
      nextButton: { position: [1.5, 0.2] },
      text: { font: { size: 0.1 }, position: [-1.5, 2.8], xAlign: 'left' },
      equation: 'eqn',
    },
  },
]);

const eqn = figure.getElement('eqn');
// const nextButton = figure.getElement('nextButton');
// const prevButton = figure.getElement('prevButton');
// const description = figure.getElement('description');
const sideEqn = figure.getElement('sideEqn');
// const balls = figure.getElement('space.balls');
// const ballx0 = figure.getElement('balls.ball0');
const bx1 = balls.getElement('ball25');
bx1.setColor(color1);
balls.toFront(bx1.name);

// prevButton.onClick = () => {
//   if (data.paused) {
//     data.unpause();
//   } else {
//     data.pause();
//   }
// };

const slides = [];

const modifiers = {
  disturbance: {
    font: { color: [0, 0.5, 1, 1] },
    onClick: () => disturbPulse(),
    touchBorder: [0.1, 0.03, 0.1, 0.1],
  },
  'first particle': {
    font: { color: color0 },
    onClick: () => b0.pulse({ scale: 4 }),
  },
  'sine function': {
    font: { color: [0, 0.5, 1, 1] },
    onClick: () => disturbSine(0, true),
  },
  // 'some point': {
  //   font: { color: color1 },
  //   onClick: () => figure.getElement('balls.ball50').pulse({ scale: 4 }),
  // },
  1: {
    font: { family: 'Times New Roman', size: 0.06 },
    offset: [0, -0.03],
    inLine: false,
  },
  0: {
    font: { family: 'Times New Roman', size: 0.06 },
    offset: [0, -0.03],
    inLine: false,
  },
  x: { font: { family: 'Times New Roman', style: 'italic' } },
  f: { font: { family: 'Times New Roman', style: 'italic' } },
  y: { font: { family: 'Times New Roman', style: 'italic' } },
  t: { font: { family: 'Times New Roman', style: 'italic' } },
  c: { font: { family: 'Times New Roman', style: 'italic' } },
  k: { font: { family: 'Times New Roman', style: 'italic' } },
  'wave number': { font: { style: 'italic' } },
  substitute: {
    font: { color: color1 },
    onClick: () => {
      eqn.pulse({ elements: ['t_6', '_1_3'], centerOn: 't_6', xAlign: 0.3 });
      sideEqn.pulse({ elements: ['t', '_1_1'], centerOn: 't', xAlign: 'right' });
    },
    touchBorder: 0.1,
  },
  substitued: {
    font: { color: color1 },
    onClick: () => {
      eqn.pulse({ elements: ['c'] });
      sideEqn.pulse({ elements: ['c'] });
    },
    touchBorder: 0.1,
  },
  xr0: {
    text: 'x',
    font: { family: 'Times New Roman', style: 'italic', color: color0 },
    onClick: () => b0.pulse({ scale: 4 }),
    touchBorder: 0.1,
  },
  _0r: {
    text: '0',
    font: {
      family: 'Times New Roman', color: color0, size: 0.06,
    },
    offset: [0, -0.03],
    inLine: false,
  },
  xb1: {
    text: 'x',
    font: { family: 'Times New Roman', style: 'italic', color: color1 },
    onClick: () => bx1.pulse({ scale: 4 }),
    touchBorder: 0.1,
  },
  _1b: {
    text: '1',
    font: {
      family: 'Times New Roman', color: color1, size: 0.06,
    },
    offset: [0, -0.03],
    inLine: false,
  },
  w: {
    text: '\u03c9',
    font: { family: 'Times New Roman', style: 'italic' },
  },
  pi: {
    text: '\u03c0',
    font: { family: 'Times New Roman', style: 'italic' },
  },
  lambda: {
    text: '\u03bb',
    font: { family: 'Times New Roman', style: 'italic' },
  },
  frequency: {
    font: { color: color1 },
    onClick: () => eqn.pulse({ elements: ['f_1', 'f_2'] }),
  },
  time: {
    font: { color: color1 },
    onClick: () => {
      eqn.pulse({ elements: ['t_5'] });
      eqn.pulse({ elements: ['x_1', 'v'], translation: 0.04, angle: Math.PI / 2, frequency: 3, });
    },
  },
  freeze: {
    font: { color: color1 },
    touchBorder: 0.1,
    onClick: () => {
      if (data.paused) {
        data.unpause();
      } else {
        data.pause();
      }
    },
  },
};


/*
........######..##.......####.########..########..######.
.......##....##.##........##..##.....##.##.......##....##
.......##.......##........##..##.....##.##.......##......
........######..##........##..##.....##.######....######.
.............##.##........##..##.....##.##.............##
.......##....##.##........##..##.....##.##.......##....##
........######..########.####.########..########..######.
*/
// /////////////////////////////////////////////////////////////////
slides.push({
  modifiersCommon: modifiers,
  text: [
    'Explore the equation of a travelling sine wave and the relationship',
    'between velocity wavelength and frequency.',
    // {
    //   font: { size: 0.06 },
    //   text: 'And the relationship between frequency wavelength, and velocity.',
    // },
  ],
  form: '0',
  steadyState: () => {
    reset();
    disturbSine(0, false);
    spacePlot.setScenario('default');
    timePlot.hide();
    // const now = time.now();
    data.reset((timeStep, num) => {
      const y = Array(num);
      for (let i = 0; i < num; i += 1) {
        y[i] = A * Math.sin(2 * Math.PI * f * (timeStep * i) + Math.PI);
      }
      return y.reverse();
    });
    balls.dim();
    sideEqn.hide();
  },
  // leaveStateCommon: () => { getPhase(); },
});

slides.push({
  steadyState: () => {
    spacePlot.setScenario('default');
    timePlot.hide();
    enableMaxTime = false;
    // timePlot.setScenario('default');
  },
});
slides.push({
  enterState: () => {
    time.pause();
    reset();
  },
  transition: (done) => {
    spacePlot.animations.new()
      .scenario({ target: 'small', duration: 1 })
      .whenFinished(done)
      .start();
  },
  steadyState: () => {
    spacePlot.setScenario('small');
    timePlot.show();
    timePlot.setScenario('small');
    enableMaxTime = true;
  },
});

// /////////////////////////////////////////////////////////////////
slides.push({
  text: [
    'A wave is a |disturbance| that propagates through a medium or field',
    {
      text: 'Touch the word |disturbance| or move the |first particle| manually.',
      font: { size: 0.08 },
      lineSpace: 0.2,
    },
  ],
  form: [null],
  steadyState: () => {
    reset();
    b0.animations.cancel('_noStop_sine');
    disturbPulse();
    figure.elements._balls.highlight(['ball0']);
  },
});


// /////////////////////////////////////////////////////////////////
slides.push({
  text: [
    'The |disturbance| moves with a constant velocity |c|.',
    '',
    {
      text: 'Thus, the time it takes to move some distance |x||1|  can be calculated.',
      // lineSpace: 0.2,
    },
  ],
  steadyState: () => {
    reset();
    disturbPulse();
  },
});

slides.push({ form: '2' });
slides.push({
  form: '2',
  text: 'Let\'s record this as equation (1)',
  steadyState: () => { sideEqn.hide(); },
});
slides.push({
  transition: (done) => {
    eqn.hide();
    sideEqn.showForm('2');
    sideEqn.setScenario('center');
    sideEqn.animations.new()
      .goToForm({ target: '2id', animate: 'move' })
      .scenario({ start: 'center', target: 'side', duration: 1 })
      .whenFinished(done)
      .start();
  },
  steadyStateCommon: () => {
    sideEqn.setScenario('side');
    sideEqn.showForm('2id');
  },
  steadyState: () => { eqn.hide(); },
});

// /////////////////////////////////////////////////////////////////
slides.push({
  form: [],
  text: 'Now, let\'s disturb the |first particle| with a |sine function|.',
  enterState: () => {
    b0.isTouchable = true;
    b0.animations.cancel('_noStop_sine');
    reset();
  },
});

slides.push({
  enterStateCommon: () => {
    if (!b0.isAnimating()) {
      disturbSine(0, true);
    }
    b0.isTouchable = false;
  },
  form: '3',
  steadyState: () => {
    // sideEqn.showForm('2id');
    balls.hasTouchableElements = false;
    figure.elements._balls.highlight(['ball0']);
    if (!b0.isAnimating()) {
      disturbSine(0, true);
    }
  },
});

// /////////////////////////////////////////////////////////////////
slides.push({
  text: [
    'The disturbance at some point |xb1||_1b|  is the disturbance at |xr0||_0r|  from',
    '|t||1|  seconds ago.',
  ],
  steadyState: () => {
    figure.elements._balls.highlight(['ball0', bx1.name]);
    bx1.pulse({ scale: 4 });
  },
});

slides.push({ form: '4' });
slides.push({ form: '5' });
slides.push({ text: 'Multiply the angular frequency |w| through:' });
slides.push({ form: '6' });
slides.push({ form: '7' });
slides.push({ text: 'We can now |substitute| equation (1)' });
slides.push({ form: '8' });
slides.push({ form: '9', steadyState: () => sideEqn.hide() });
slides.push({
  text: [
    '|xb1||_1b|  was arbitrarily selected, so we can say |x| more generally.',
  ],
  steadyStateCommon: () => sideEqn.hide(),
});
slides.push({ form: '10' });
slides.push({ form: '11' });
slides.push({
  text: [
    'This equation describes the string at any position |x| at any time |t|.',
  ],
});
slides.push({
  text: [
    'Now let\'s examine the terms within the sine function more closely.',
  ],
});
slides.push({
  form: '12',
  enterStateCommon: () => eqn.highlight([
    'w2', 't_5', 'w3', 'x_1', 'v', 'c', 'min2', 'line1',
    'constant', 'sin', 'lb2', 'rb2',
  ]),
  leaveStateCommon: () => eqn.undim(),
});
slides.push({
  text: [
    'If we |freeze| time, then |t| is constant (and thus |w||t| is constant).',
  ],
  steadyState: () => data.unpause(),
});
slides.push({ form: '13', steadyStateCommon: () => data.pause() });
slides.push({
  enterStateCommon: () => eqn.highlight([
    'w3', 'x_1', 'v', 'c', 'min2', 'sin', 'lb2', 'rb2', 'line2', '_2pi2', 'f_2',
    'c_1', 'lambda', 'f', 'equals2', 'v2', 'strike1', 'strike2', 'k', 'brace',
  ]),
});
slides.push({ text: 'We are left with a sine curve along |x|.' });
slides.push({
  text: [
    'Rearranging the last term and expanding the angular frequency gives:',
  ],
});
slides.push({ form: ['13a', '14'] });
slides.push({ form: '15' });
slides.push({ form: '16' });
slides.push({
  text: [
    'The sine function repeats when the value it operates on changes by 2|pi|.',
  ],
});
slides.push({
  text: [
    'The term |two||pi1||f1|  says there are |f|  lots of 2|pi| cycles per second.',
    '',
    'Therefore it takes 1/ |f|  seconds to cycle through 2|pi|.',
  ],
  modifiers: {
    two: {
      text: '2',
      font: { color: color1 },
      touchBorder: [0.1, 0.1, 0.2, 0.1],
      onClick: () => {
        eqn.pulse({ elements: ['_2pi2', 'f_2'], centerOn: 'f_2', xAlign: 'left' });
      },
    },
    pi1: { text: '\u03c0', font: { family: 'Times New Roman', style: 'italic', color: color1 } },
    f1: { text: 'f', font: { family: 'Times New Roman', style: 'italic', color: color1 } },
  },
  steadyState: () => eqn.exec(['setColor', color1], ['_2pi2', 'f_2']),
  leaveState: () => eqn.exec(['setColor', colorDef], ['_2pi2', 'f_2']),
});
slides.push({
  text: [
    'In 1/ |f|  seconds, a wave with velocity |c| will cover a distance |c|//|f|.',
    '',
    '|c|//|f|  is therefore the distance the wave travels before it starts to repeat.',
  ],
});

slides.push({
  text: [
    'The wavelength |lambda| of a sine wave is the distance between repeated',
    'portions of the wave - such as the distance between peaks.',
  ],
});

slides.push({
  text: [
    'Thus, the wavelength is |c|//|f|.',
  ],
});
slides.push({ form: 'lambdacf' });
slides.push({
  text: [
    'Or more commonly rearranged for |c|.',
  ],
});
slides.push({ form: 'clambdaf' });
slides.push({
  transition: (done) => {
    eqn.hide();
    sideEqn.showForm('clambdaf');
    sideEqn.setScenario('center');
    sideEqn.animations.new()
      .goToForm({ target: 'clamdafid', animate: 'move' })
      .scenario({ start: 'center', target: 'side', duration: 1 })
      .whenFinished(done)
      .start();
  },
  steadyStateCommon: () => { sideEqn.showForm('clambdafid'); },
  steadyState: () => { eqn.showForm('16'); },
});
slides.push({
  form: '16',
  text: [
    '(2) can now be |substitued| into our equation.',
  ],
});
slides.push({ form: '17' });
slides.push({ form: '18' });
slides.push({ text: 'And now simplify' });
slides.push({ form: '19' });
slides.push({ form: '20' });
slides.push({
  text: [
    'The 2|pi|//|lambda| term is often called the |wave number| |k| and gives',
    'the number of radians per unit distance.',
  ],
});
slides.push({ form: '21' });
slides.push({ form: '22' });
slides.push({ form: '23', enterStateCommon: () => {} });
slides.push({
  text: [
    'And so we see the equation for a travelling sine wave.',
  ],
  steadyStateCommon: () => data.unpause(),
});

figure.getElement('nav').setSlides(slides);

// slides.push({
//   text: []
// })

// The sine function repeats when the value it operates changes by 2π.
//
// The 2πf term is a value that cycles through 2π f times per second.
//
// Therefore, it takes 1/f seconds to cycle through 2π once.
//
// In 1/fs, a wave travelling at velocity c will cover a distance c/f.
//
// c/f is therefore the distance the wave travels before it starts
// to repeat.
//
// The distance between repeated portions of a wave is the 'wavelength'.
//
// Therefore wavelength = c/f.
//
// We can no rearrange the equation to 2πf / c = 2π/L
//
// 2π/L is commonly called the wave number 'k'

// When multiplied by a distance then, the resulting number of radians is found.
//
// k is a physical property of a wave that describes the number of radians
// per unit distance.
//
// The 2πf term is a value that cycles through 2π f times per second.
// Therefore, it will take 1/f seconds to cycle through 2π once.
// If the wave is travelling at a velocity of c, then the distance
// it covers in 1/fs is c/f.
// c/f is therefore the distance the wave travels before it starts
// to repeat.
// 

// wt is constant, so this is just a normal sine wave dependent on f, c and x.
// The wavelenght of the sine wave is the distance it takes for the angle to cycle
// through 2π radians.
// The 2πf term says how many times per second the angle moves through a full 2π
// radians, therefore the time it takes to go through a single 2π radians must be 1/f.
// If the velocity of the wave is c, then the distance it travels in 1/fs is c/fm.
// In other words, the wavelength is equal to c/f,  or more commonly c = lamda f.
// Knowning this we can rearrange 2πf/c = 2π/wavelength. This is often called
// the phase term of the propagation constant, and is denoted as k.
// In other words, the propagation constant describes how many radians per meter
// are cycled through - which when finally multiplied by x gives a final angle term dependent on f, c, and x.
// This also means, as our velocity gets faster, then our wavelength must
// get smaller.


// 2πf says how many times per second the angle moves through a full 2π radians.
// Therefore 2πft says how many times the angle has moved through 2π radians in time t, and leaves us with a resultant angle.
// For 2πf x/c we similarly have 2πf saying how many times per second the angle
// covers 2π radians, and then the x/c term is the time giving us a resultant
// angle. Antoher way to think of this is 2πf revoltions per second per c m/s.
// 2π f/c (1/s / m/s = 1/m) which is how many times does the angle traverse
// through 2π radians per meter. Now the wavelength is how many meters is
// 2π radians, 

// const navigator = figure.navigator({

// })

// /////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////
// slideNav.loadSlides({
//   slides, prevButton, nextButton, collection: figure, text: description, equation: [eqn],
// });

// const slideNav = figure.slideNavigator({
//   slides, prevButton, nextButton, text: description, equation: [eqn],
// });
// // nextButton.onClick = slideNav.nextSlide;
// // prevButton.onClick = slideNav.prevSlide;

// slideNav.goToSlide(0);

// // console.log('asdfasdf')
// figure.add({
//   name: 'eee',
//   method: 'equation',
//   options: {
//     forms: {
//       0: ['a', { strike: ['sadf', 'strike'] }],
//     },
//     position: [0, 1],
//   },
// });
// figure.add({
//   name: 'eqn12',
//   method: 'equation',
//   options: {
//     elements: {
//       x: { symbol: 'strike', color: [0.6, 0.6, 0.6, 1] },
//     },
//     forms: {
//       1: { topStrike: ['radius', 'x', 'radius = 1'] },
//     },
//     position: [0, 1],
//   },
// });
