/* globals figure, layout */

function addSlides() {
  const nav = figure.getElement('nav');
  const medium = figure.getElement('medium');
  // const title = figure.getElement('title');
  const sideEqn = figure.getElement('sideEqn');
  const eqn = figure.getElement('eqn');

  const slides = [];

  let lastDisturbance = 0;
  let timerId = null;

  const startDisturbances = (m) => {
    if (timerId != null) {
      clearTimeout(timerId);
    }
    const now = layout.time.now();
    if (now - lastDisturbance > 10) {
      disturb();
    }
    timerId = setTimeout(() => {
      startDisturbances(m);
    }, 1000);
  };

  const stopDisturbances = () => {
    if (timerId != null) {
      clearTimeout(timerId);
    }
  };
  const disturb = (m) => {
    layout.pulse(medium, 0.6);
    lastDisturbance = layout.time.now();
    // stopDisturbances();
    // startDisturbances();
  };
  medium.custom.movePad.subscriptions.add('setTransform', () => {
    if (medium.custom.movePad.state.isBeingMoved) {
      stopDisturbances();
    }
  });

  const modifiersCommon = {
    x: { font: { family: 'Times New Roman', style: 'italic', size: 0.17 } },
    f: { font: { family: 'Times New Roman', style: 'italic', size: 0.17 } },
    y: { font: { family: 'Times New Roman', style: 'italic', size: 0.17 } },
    t: { font: { family: 'Times New Roman', style: 'italic', size: 0.17 } },
    v: { font: { family: 'Times New Roman', style: 'italic', size: 0.17 } },
    k: { font: { family: 'Times New Roman', style: 'italic', size: 0.17 } },
    1: {
      font: { family: 'Times New Roman', size: 0.09 },
      offset: [0, -0.03],
    },
    0: {
      font: { family: 'Times New Roman', size: 0.09 },
      offset: [0, -0.03],
    },
    r0: {
      text: '0',
      font: { family: 'Times New Roman', size: 0.09, color: color0 },
      offset: [0, -0.03],
    },
    b1: {
      text: '1',
      font: { family: 'Times New Roman', size: 0.09, color: color1 },
      offset: [0, -0.03],
    },
    disturbance: {
      onClick: () => disturb(medium),
      font: { color: color1 },
      touchBorder: 0.1,
    },
    'first particle': {
      onClick: () => medium.custom.balls.getElement('ball0').pulse({ scale: 4 }),
      font: { color: color0 },
      touchBorder: 0.15,
    },
    x1: {
      text: 'x',
      font: {
        family: 'Times New Roman', style: 'italic', size: 0.17, color: color1,
      },
      onClick: () => medium.custom.balls.getElement('ball40').pulse({ scale: 4 }),
      touchBorder: 0.15,
    },
  };
  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiersCommon,
    showCommon: ['medium'],
    show: 'title',
    scenario: ['title'],
    form: 'title',
    steadyState: () => {
      medium.custom.balls.dim();
      layout.reset();
      layout.unpause();
      medium.custom.recording.reset((timeStep, num) => {
        const y = Array(num);
        for (let i = 0; i < num; i += 1) {
          y[i] = 0.6 * 0.8 * Math.sin(2 * Math.PI * 0.2 * (timeStep * i) + Math.PI);
        }
        return y.reverse();
      });
      layout.sineWave(medium);
    },
    leaveState: () => {
      layout.reset();
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    scenarioCommon: ['default'],
    modifiers: {
      disturbance: {
        onClick: () => disturb(medium),
        font: { color: color1 },
        touchBorder: 0.15,
      },
    },
    text: [
      'A wave is a |disturbance| that propagates through a medium or field.',
      {
        text: 'Touch the word |disturbance| or manually move the |first particle|.',
        font: { size: 0.08 },
        lineSpace: 0.2,
      },
    ],
    form: null,
    enterStateCommon: () => {
      medium.custom.movePad.setMovable(true);
      medium.custom.balls.highlight(['ball0']);
      layout.unpause();
    },
    steadyState: () => {
      disturb(medium);
      startDisturbances(medium);
    },
    leaveState: () => stopDisturbances(),
    leaveStateCommon: () => {
      stopDisturbances();
      medium.custom.balls.undim();
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    text: [
      'The |disturbance| moves with a velocity |v|.',
      '',
      {
        text: 'Thus, the time it takes to move some distance |x||1| can be calculated.',
        // lineSpace: 0.2,
      },
    ],
    steadyState: () => {
      startDisturbances(medium);
    },
    leaveState: () => stopDisturbances(),
  });
  slides.push({
    fromForm: null,
    form: 't1',
    steadyState: () => {
      startDisturbances(medium);
    },
    leaveState: () => stopDisturbances(),
  });
  slides.push({
    form: null,
    transition: (done) => {
      sideEqn.showForm('t1');
      sideEqn.animations.new()
        .scenario({ target: 'side', duration: 2 })
        .goToForm({ target: 't11', animate: 'move' })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      sideEqn.showForm('t11');
      sideEqn.setScenario('side');
      startDisturbances(medium);
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      x0: {
        text: 'x',
        font: {
          family: 'Times New Roman', style: 'italic', size: 0.17, color: color0,
        },
        onClick: () => medium.custom.balls.getElement('ball0').pulse({ scale: 4 }),
        touchBorder: 0.2,
      },
    },
    text: [
      'Now, let\'s say we know the |disturbance| as a function of time at |x0||r0|.',
      '',
    ],
    show: ['x0'],
    steadyState: () => {
      eqn.getElement('x0Box').onClick = () => medium.custom.balls.getElement('ball0').pulse({ scale: 4 });
      startDisturbances(medium);
      sideEqn.showForm('t11');
      sideEqn.setScenario('side');
    },
  });
  slides.push({
    fromForm: null,
    form: 'yx0t',
    show: ['x0'],
    enterState: () => {
      sideEqn.showForm('t11');
      sideEqn.setScenario('side');
    },
    steadyState: () => {
      eqn.getElement('x0Box').onClick = () => medium.custom.balls.getElement('ball0').pulse({ scale: 4 });
      eqn.getElement('x2Box').onClick = () => medium.custom.balls.getElement('ball40').pulse({ scale: 4 });
      startDisturbances(medium);
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      x0: {
        text: 'x',
        font: {
          family: 'Times New Roman', style: 'italic', size: 0.17, color: color0,
        },
        onClick: () => medium.custom.balls.getElement('ball0').pulse({ scale: 4 }),
        touchBorder: 0.15,
      },
    },
    text: [
      'Then the |disturbance| at |x1||b1| is the disturbance at |x0||r0| from time |t||1| ago.',
    ],
    show: ['x0', 'x1'],
    enterStateCommon: () => {
      sideEqn.showForm('t11');
      sideEqn.setScenario('side');
      medium.custom.balls.highlight(['ball0', 'ball40']);
      eqn.getElement('x0Box').onClick = () => medium.custom.balls.getElement('ball0').pulse({ scale: 4 });
      eqn.getElement('x2Box').onClick = () => medium.custom.balls.getElement('ball40').pulse({ scale: 4 });
    },
    steadyState: () => {
      startDisturbances(medium);
    },
  });

  slides.push({
    show: ['x0', 'x1'],
    fromForm: 'yx0t',
    form: 'yx0tAndft',
    steadyState: () => {
      startDisturbances(medium);
    },
  });

  slides.push({
    show: ['x0', 'x1'],
    fromForm: 'yx0tAndft',
    form: 'yx1tTemp',
    steadyState: () => {
      startDisturbances(medium);
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      one: {
        text: '(1)',
        font: {
          family: 'Times New Roman', size: 0.17,
        },
        onClick: () => sideEqn.pulse({ xAlign: 'right' }),
        touchBorder: 0.15,
      },
    },
    text: [
      'We can now substitute in equation |one|.',
    ],
    form: 'yx1t',
    show: ['x0', 'x1'],
    enterStateCommon: () => {
      sideEqn.showForm('t11');
      sideEqn.setScenario('side');
      medium.custom.balls.highlight(['ball0', 'ball40']);
      eqn.getElement('x2Box').onClick = () => medium.custom.balls.getElement('ball40').pulse({ scale: 4 });
      eqn.getElement('x1Box').onClick = () => medium.custom.balls.getElement('ball40').pulse({ scale: 4 });
    },
    steadyState: () => {
      startDisturbances(medium);
    },
  });

  slides.push({
    show: ['x0', 'x1'],
    fromForm: 'yx1t',
    form: 'yx1tSub',
    steadyState: () => {
      startDisturbances(medium);
    },
  });

  slides.push({
    show: ['x0', 'x1'],
    fromForm: 'yx1tSub',
    form: 'yx1tx1',
    steadyState: () => {
      startDisturbances(medium);
    },
  });

  // ///////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////
  slides.push({
    modifiers: {
      one: {
        text: '(1)',
        font: {
          family: 'Times New Roman', size: 0.17,
        },
        onClick: () => sideEqn.pulse({ xAlign: 'right' }),
        touchBorder: 0.15,
      },
    },
    text: [
      '|x1||b1| can be any point, and so we can generalize it by simply calling it |x|.',
    ],
    show: ['x0', 'x1'],
    enterStateCommon: () => {
      // sideEqn.showForm('t11');
      // sideEqn.setScenario('side');
      medium.custom.balls.highlight(['ball0', 'ball40']);
      eqn.getElement('x2Box').onClick = () => medium.custom.balls.getElement('ball40').pulse({ scale: 4 });
      eqn.getElement('x1Box').onClick = () => medium.custom.balls.getElement('ball40').pulse({ scale: 4 });
    },
    steadyState: () => {
      startDisturbances(medium);
    },
  });

  slides.push({
    show: ['x0', 'x1'],
    fromForm: 'yx1tx1',
    form: 'yxtx',
    steadyState: () => {
      startDisturbances(medium);
    },
  });



  nav.loadSlides(slides);
  // nav.goToSlide(13);
}

addSlides();
// nav.goToSlide()
