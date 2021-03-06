/* eslint-disable camelcase */
/* global colSin, colCos, colCot, colTan, colSec, colCsc, colTheta,
   figure, colText */

// eslint-disable-next-line no-unused-vars
function makeEquation() {
  function frac(
    numerator, symbol, denominator, nSpace = 0.03, dSpace = 0.03, overhang = 0.03,
  ) {
    return {
      frac: {
        numerator,
        symbol,
        denominator,
        numeratorSpace: nSpace,
        denominatorSpace: dSpace,
        scale: 0.95,
        overhang,
      },
    };
  }

  figure.add({
    name: 'eqn',
    make: 'equation',
    options: {
      scale: 1.2,
      elements: {
        eq1: '  =  ',
        eq2: '  =  ',
        eq3: '  =  ',
        v1: { symbol: 'vinculum' },
        v2: { symbol: 'vinculum' },
        v3: { symbol: 'vinculum' },
        v4: { symbol: 'vinculum' },
        v5: { symbol: 'vinculum' },
        v6: { symbol: 'vinculum' },
        sin: { style: 'normal', color: colSin },
        cos: { style: 'normal', color: colCos },
        tan: { style: 'normal', color: colTan },
        cot: { style: 'normal', color: colCot },
        sec: { style: 'normal', color: colSec },
        csc: { style: 'normal', color: colCsc },
        opp: { text: 'opposite', color: colText, size: 0.2 },
        adj: { text: 'adjacent', color: colText, size: 0.2 },
        hyp: { text: 'hypotenuse', color: colText, size: 0.2 },
        theta1: { text: '\u03b8', color: colTheta },
        theta2: { text: '\u03b8', color: colTheta },
        theta3: { text: '\u03b8', color: colTheta },
        theta4: { text: '\u03b8', color: colTheta },
        theta5: { text: '\u03b8', color: colTheta },
        theta6: { text: '\u03b8', color: colTheta },
        s1: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
        lim_1: { style: 'normal' },
        lim_2: { style: 'normal' },
        rightArrow1: { text: '\u2192' },
        rightArrow2: { text: '\u2192' },
        rb1: { symbol: 'bracket', side: 'right' },
        lb1: { symbol: 'bracket', side: 'left' },
        rb2: { symbol: 'bracket', side: 'right' },
        lb2: { symbol: 'bracket', side: 'left' },
      },
      formDefaults: {
        alignment: { xAlign: 'center', yAlign: 'middle' },
      },
      phrases: {
        oppHyp: frac('opp', 'v1', 'adj'),
        sinCos: frac('sin', 'v2', 'cos'),
      },
      forms: {
        sinCosOne: [
          '_1', 'eq1',
          { sup: ['sin', '2_1'] },
          '_ + ',
          { sup: ['cos', '2_2'] },
        ],
        tanSecOne: [
          { sup: ['sec', '2_2'] },
          'eq1',
          { sup: ['tan', '2_1'] },
          '_ + ', '_1',
        ],
        cotCscOne: [
          { sup: ['csc', '2_2'] },
          'eq1',
          '_1', '_ + ',
          { sup: ['cot', '2_1'] },
        ],
        cotTanCscSec: [
          { sup: ['sec', '2_1'] },
          '_ + ',
          { sup: ['csc', '2_2'] },
          'eq1',
          { sup: [{ brac: ['lb1', ['tan', '_ + _1', 'cot'], 'rb1'] }, '2_3'] },
        ],
        oppAdj1: 'oppHyp',
        oppAdj2: ['oppHyp', 'eq1', 'sinCos'],
        oppAdj3: ['oppHyp', 'eq1', 'sinCos', 'eq2', 'tan'],
        oppAdj4: ['oppHyp', 'eq1', 'sinCos', 'eq2', 'tan', 'eq3', frac('_1', 'v3', 'cot')],
        hypAdj: [
          frac('hyp', 'v1', 'adj'),
          'eq1', frac('_1', 'v2', 'cos'),
          'eq2', 'sec',
          'eq3', frac('csc', 'v3', 'cot'),
        ],
        hypOpp: [
          frac('hyp', 'v1', 'opp'),
          'eq1', frac('_1', 'v2', 'sin'),
          'eq2', frac('sec', 'v3', 'tan'),
          'eq3', 'csc',
        ],
        lim: [
          {
            bottomComment: ['lim_1', ['theta1', 'rightArrow1', '_0']],
          }, '  ',
          { scale: [{ frac: [['sin', 'theta2'], 'v1', 'theta3'] }, 0.8] },
          'eq1', '_1',
          { container: ['', 0.7] },
          {
            bottomComment: ['lim_2', ['theta4', 'rightArrow2', '_0_1']],
          }, '  ',
          { scale: [{ frac: [['tan', 'theta5'], 'v2', 'theta6'] }, 0.8] },
          'eq2', '_1_1',
        ],
        coord: {
          content: [
            { brac: ['lb1', ['cos', '_, ', 'sin'], 'rb1'] }, 'eq1', { brac: ['lb2', ['x', '_, _1', 'y'], 'rb2'] },
          ],
          alignment: { xAlign: '1.1o', yAlign: 'baseline' },
        },
      },
      position: [0, 1.15],
    },
    mods: {
      scenarios: {
        default: { position: [0, 1] },
        top: { position: [0, 1.15] },
      },
    },
  });
  const eqn = figure.getElement('eqn');

  // Helper function that dissolves in, then out, an equation form
  const addShow = (name, form, delay = 3, scenario = 'default') => {
    figure.fnMap.global.add(name, () => {
      eqn.stop();
      eqn.setScenario(scenario);
      eqn.showForm(form);
      eqn.animations.new()
        .dissolveIn(0.5)
        .delay(delay)
        .dissolveOut(0.5)
        .start();
    });
  };

  addShow('eqnSinCosOne', 'sinCosOne');
  addShow('eqnTanSecOne', 'tanSecOne');
  addShow('eqnCotCscOne', 'cotCscOne');
  addShow('eqnHypAdj', 'hypAdj');
  addShow('eqnHypOpp', 'hypOpp');
  addShow('eqnCotTanCscSec', 'cotTanCscSec', 3, 'top');
  addShow('eqnLim', 'lim', 2.5, 'top');
  addShow('eqnCoord', 'coord');
  figure.fnMap.add('eqnOppAdj', () => {
    eqn.setScenario('default');
    eqn.showForm('oppAdj1');
    eqn.animations.new()
      .dissolveIn()
      .delay(2.3)
      .goToForm({ target: 'oppAdj2', duration: 1.5, animate: 'move' })
      .delay(2)
      .goToForm({ target: 'oppAdj3', duration: 1.5, animate: 'move' })
      .delay(3)
      .goToForm({ target: 'oppAdj4', duration: 1.5, animate: 'move' })
      .delay(3)
      .dissolveOut()
      .start();
  });
}

