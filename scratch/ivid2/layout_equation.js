/* eslint-disable camelcase */
/* global colSin, colRad, colCos, colCot, colTan, colSec, colCsc, colTheta */
/* global color1, figure, colOpp, colHyp, colAdj */

function makeEquation() {
  const lines = (linesIn, translation = {}, alignment = {}) => {
    const contentLines = [];
    linesIn.forEach((line) => {
      const [content, justify, baselineSpace] = line;
      contentLines.push({
        content, justify, baselineSpace: baselineSpace || 0.5,
      });
    });
    return {
      content: {
        lines: {
          content: contentLines,
          baselineSpace: 0.5,
          justify: 'element',
        },
      },
      translation,
      alignment,
    };
  };
  const lines1 = contentLines => ({
    // content: {
    lines: {
      content: contentLines,
      baselineSpace: 0.5,
      justify: 'element',
    },
    // },
    // translation,
    // alignment,
  });
  const cont = (content, width = 0.6, xAlign = 'center') => ({
    container: { content, width, xAlign },
  });
  const frac = (numerator, symbol, denominator, nSpace = 0.03, dSpace = 0.03, width) => (cont({
    frac: {
      numerator, // : cont(numerator, width),
      symbol,
      denominator, // : cont(denominator, width),
      numeratorSpace: nSpace,
      denominatorSpace: dSpace,
      scale: 0.95,
    },
  }, width, 'right'));
  const space = { container: ['', 0.6] };
  figure.add({
    name: 'eqn',
    method: 'equation',
    options: {
      dimColor: [0.7, 0.7, 0.7, 1],
      elements: {
        v1: { symbol: 'vinculum' },
        v2: { symbol: 'vinculum' },
        v3: { symbol: 'vinculum' },
        v4: { symbol: 'vinculum' },
        v5: { symbol: 'vinculum' },
        v6: { symbol: 'vinculum' },
        v7: { symbol: 'vinculum' },
        v8: { symbol: 'vinculum' },
        v9: { symbol: 'vinculum' },
        v10: { symbol: 'vinculum' },
        v11: { symbol: 'vinculum' },
        equals1: '  =  ',
        equals2: '  =  ',
        equals3: '  =  ',
        equals4: '  =  ',
        equals5: '  =  ',
        equals6: '  =  ',
        equals7: '  =  ',
        equals8: '  =  ',
        equals9: '  =  ',
        equals10: '  =  ',
        equals11: '  =  ',
        equals12: '  =  ',
        equals13: '  =  ',
        equals14: '  =  ',
        equals15: '  =  ',
        equals16: '  =  ',
        oppValue: { text: '1.000' },
        hypValue: { text: '1' },
        ratioValue: { text: '0.4540' },
        oppValueDef: { text: '0.4540' },
        hypValueDef: { text: '1' },
        ratioValueDef: { text: '0.4540' },
        lb: { symbol: 'bracket', side: 'left' },
        rb: { symbol: 'bracket', side: 'right' },
        lb1: { symbol: 'bracket', side: 'left' },
        rb1: { symbol: 'bracket', side: 'right' },
        lb2: { symbol: 'bracket', side: 'left' },
        rb2: { symbol: 'bracket', side: 'right' },
        lb3: { symbol: 'bracket', side: 'left' },
        rb3: { symbol: 'bracket', side: 'right' },
        lb4: { symbol: 'bracket', side: 'left' },
        rb4: { symbol: 'bracket', side: 'right' },
        lb5: { symbol: 'bracket', side: 'left' },
        rb5: { symbol: 'bracket', side: 'right' },
        lb6: { symbol: 'bracket', side: 'left' },
        rb6: { symbol: 'bracket', side: 'right' },
        // theta: { text: '\u03b8', color: color1 },
        theta1: { text: '\u03b8', color: colTheta },
        theta2: { text: '\u03b8', color: colTheta },
        theta3: { text: '\u03b8', color: colTheta },
        theta4: { text: '\u03b8', color: colTheta },
        theta5: { text: '\u03b8', color: colTheta },
        theta6: { text: '\u03b8', color: colTheta },
        theta7: { text: '\u03b8', color: colTheta },
        theta8: { text: '\u03b8', color: colTheta },
        theta9: { text: '\u03b8', color: colTheta },
        theta10: { text: '\u03b8', color: colTheta },
        theta11: { text: '\u03b8', color: colTheta },
        theta12: { text: '\u03b8', color: colTheta },
        theta13: { text: '\u03b8', color: colTheta },
        theta14: { text: '\u03b8', color: colTheta },
        theta15: { text: '\u03b8', color: colTheta },
        dotDotDot: '...',
        bowstring: { color: color1 },
        halfBowstring: { text: 'half-bowstring', color: color1 },
        sinus: { color: color1 },
        sine: { color: color1 },
        sinText: { color: color1 },
        tan_1: { font: { style: 'normal', color: colTan } },
        sec_1: { font: { style: 'normal', color: colSec } },
        cot_1: { font: { style: 'normal', color: colCot } },
        csc_1: { font: { style: 'normal', color: colCsc } },
        tan: { font: { style: 'normal' } },
        gent: { font: { style: 'normal' } },
        sin: { font: { style: 'normal' } },
        sin_1: { font: { style: 'normal' } },
        sin_2: { font: { style: 'normal' } },
        sin_3: { font: { style: 'normal' } },
        sin_4: { font: { style: 'normal' } },
        csc: { font: { style: 'normal' } },
        sec: { font: { style: 'normal' } },
        cot: { font: { style: 'normal' } },
        // cos: { font: { style: 'normal' } },
        cos_1: { font: { style: 'normal' } },
        cos_2: { font: { style: 'normal' } },
        cos_3: { font: { style: 'normal' } },
        cos_4: { font: { style: 'normal' } },
        _1_rad: { color: colRad },
        ine: { font: { style: 'normal' } },
        mplementary: { font: { style: 'normal' } },
        s: { font: { style: 'normal' } },
        co: { font: { style: 'normal' } },
        comma: ',',
        times1: ' \u00d7 ',
        times2: ' \u00d7 ',
        times3: ' \u00d7 ',
        times4: ' \u00d7 ',
        opposite: { color: colSin },
        opposite_1: { color: colSin },
        opposite_2: { color: colSin },
        opposite_3: { color: colSin },
        hypotenuse: { color: colRad },
        hypotenuse_1: { color: colRad },
        hypotenuse_2: { color: colRad },
        hypotenuse_3: { color: colRad },
        hypotenuse_4: { color: colRad },
        hypotenuse_5: { color: colRad },
        hypotenuse_6: { color: colRad },
        adjacent: { color: colCos },
        adjacent_1: { color: colCos },
        adjacent_2: { color: colCos },
        adjacent_3: { color: colCos },
        _90min: { text: '90\u00b0 \u2212 ', color: colTheta },
        brace: { symbol: 'brace', side: 'top' },
        stk1: { symbol: 'strike', style: 'forward', lineWidth: 0.006 },
        stk2: { symbol: 'strike', style: 'forward', lineWidth: 0.006 },
        value1: '0.0000',
        value2: '0.0000',
        value3: '0.0000',
        value4: '0.0000',
        value5: '0.0000',
        value6: '0.0000',
      },
      phrases: {
        f1: { sub: ['f_1', '_1'] },
        f2: { sub: ['f_2', '_2'] },
        f3: { sub: ['f_3', '_3'] },
        f4: { sub: ['f_4', '_4'] },
        f5: { sub: ['f_5', '_5'] },
        f6: { sub: ['f_6', '_6'] },
        bTheta1: { brac: ['lb1', 'theta1', 'rb1'] },
        bTheta2: { brac: ['lb2', 'theta2', 'rb2'] },
        bTheta3: { brac: ['lb3', 'theta3', 'rb3'] },
        bTheta4: { brac: ['lb4', 'theta4', 'rb4'] },
        bTheta5: { brac: ['lb5', 'theta5', 'rb5'] },
        bTheta6: { brac: ['lb6', 'theta6', 'rb6'] },
        oppOnHyp: frac('opposite', 'v1', cont('hypotenuse', 0.6), 0.01, 0.03, 0.65),
        adjOnHyp: frac('adjacent', 'v2', 'hypotenuse_1', 0.01, 0.03, 0.65),
        oppOnAdj: frac('opposite_1', 'v3', 'adjacent_1', 0.01, 0.03, 0.65),
        hypOnOpp: frac('hypotenuse_3', 'v4', 'opposite_2', 0.01, 0.03, 0.65),
        hypOnAdj: frac('hypotenuse_4', 'v5', 'adjacent_2', 0.01, 0.03, 0.65),
        adjOnOpp: frac('adjacent_3', 'v6', 'opposite_3', 0.01, 0.03, 0.65),
        oppOnHypEq: ['oppOnHyp', 'equals1'],
        adjOnHypEq: ['adjOnHyp', 'equals2'],
        oppOnAdjEq: ['oppOnAdj', 'equals3'],
        hypOnAdjEq: ['hypOnAdj', 'equals4'],
        adjOnOppEq: ['adjOnOpp', 'equals5'],
        hypOnOppEq: ['hypOnOpp', 'equals6'],
        oppOnHypF: ['oppOnHypEq', cont(['f1', 'bTheta1'], 0.3)],
        adjOnHypF: ['adjOnHypEq', cont(['f2', 'bTheta2'], 0.3)],
        oppOnAdjF: ['oppOnAdjEq', cont(['f3', 'bTheta3'], 0.3)],
        hypOnAdjF: ['hypOnAdjEq', cont(['f4', 'bTheta4'], 0.3)],
        adjOnOppF: ['adjOnOppEq', cont(['f5', 'bTheta5'], 0.3)],
        hypOnOppF: ['hypOnOppEq', cont(['f6', 'bTheta6'], 0.3)],
        sinTheta1: ['sin_1', ' ', 'theta11'],
        sinTheta2: ['sin_2', ' ', 'theta12'],
        sinTheta3: ['sin_3', ' ', 'theta13'],
        sinTheta4: ['sin_4', ' ', 'theta14'],
        cosTheta1: ['cos', ' ', 'theta7'],
        cosTheta2: ['cos_2', ' ', 'theta8'],
        cosTheta3: ['cos_3', ' ', 'theta9'],
        cosTheta4: ['cos_4', ' ', 'theta10'],
        oppOnHypSin: ['oppOnHypEq', 'sinTheta1'],
        adjOnHypCos: ['adjOnHypEq', 'cosTheta1'],
        oppOnAdjSinOnCosHyp: ['oppOnAdjF', 'equals7', frac(['hypotenuse_5', 'times3', 'sinTheta2'], 'v7', ['hypotenuse_6', 'times4', 'cosTheta2'], 0.01, 0.03, 1.05)],
        oppOnAdjSinOnCosHypStk: ['oppOnAdjF', 'equals7', frac([{ strike: ['hypotenuse_5', 'stk1'] }, 'times3', 'sinTheta2'], 'v7', [{ strike: ['hypotenuse_6', 'stk2'] }, 'times4', 'cosTheta2'], 0.01, 0.03, 1.05)],
        oppOnAdjSinOnCos: ['oppOnAdjF', 'equals7', frac('sinTheta2', 'v7', 'cosTheta2', 0.05, 0.03, 0.34)],
        oppOnAdjTanOnOne: ['oppOnAdjF', 'equals7', frac('sinTheta2', 'v7', 'cosTheta2', 0.05, 0.03, 0.34), 'equals11', frac('tan_1', 'v11', '_1_rad', 0.03, 0.03, 0.2)],
        oppOnAdjTanOnOneStk: ['oppOnAdjF', 'equals7', frac('sinTheta2', 'v7', 'cosTheta2', 0.05, 0.03, 0.34), 'equals11', frac('tan_1', 'v11', { strike: ['_1_rad', 'stk1'] }, 0.03, 0.03, 0.2)],
        oppOnAdjTanEquals: ['oppOnAdjF', 'equals7', frac('sinTheta2', 'v7', 'cosTheta2', 0.05, 0.03, 0.34), 'equals11', 'tan_1'],
        oppOnAdjTan: ['oppOnAdjEq', cont(['tan', ' ', 'theta15'], 0.3), 'equals7', frac('sinTheta2', 'v7', 'cosTheta2', 0.05, 0.03, 0.34)],
        tanTheta: [cont(['tan', ' ', 'theta15'], 0.3), 'equals7', frac('sinTheta2', 'v7', 'cosTheta2', 0.05, 0.03, 0.34)],
        hypOnAdjHypOnCos: ['hypOnAdjF', 'equals8', frac('hypotenuse_5', 'v8', ['hypotenuse_6', 'times4', 'cosTheta3'], 0.01, 0.03, 1.05)],
        hypOnAdjOneOnCosStk: ['hypOnAdjF', 'equals8', frac({ sup: [{ strike: ['hypotenuse_5', 'stk1'] }, '_1_1', 0.9, [-0.1, 0.07], false] }, 'v8', [{ strike: ['hypotenuse_6', 'stk2'] }, 'times4', 'cosTheta3'], 0.01, 0.03, 1.05)],
        hypOnAdjOneOnCos: ['hypOnAdjF', 'equals8', frac('_1_1', 'v8', 'cosTheta3', 0.03, 0.03, 0.34)],
        hypOnAdjSecOnOne: ['hypOnAdjF', 'equals8', frac('_1_1', 'v8', 'cosTheta3', 0.03, 0.03, 0.34), 'equals11', frac('sec_1', 'v11', '_1_rad', 0.03, 0.03, 0.2)],
        hypOnAdjSecEquals: ['hypOnAdjF', 'equals8', frac('_1_1', 'v8', 'cosTheta3', 0.03, 0.03, 0.34), 'equals11', 'sec_1'],
        hypOnAdjSec: ['hypOnAdjEq', cont(['sec', ' ', 'theta3'], 0.3), 'equals8', frac('_1_1', 'v8', 'cosTheta3', 0.03, 0.03, 0.34)],
        secTheta: [cont(['sec', ' ', 'theta3'], 0.3), 'equals8', frac('_1_1', 'v8', 'cosTheta3', 0.03, 0.03, 0.34)],
        adjOnOppCosOnSin: ['adjOnOppF', 'equals9', frac('cosTheta4', 'v9', 'sinTheta3', 0.05, 0.05, 0.34)],
        adjOnOppCotOnOne: ['adjOnOppF', 'equals9', frac('cosTheta4', 'v9', 'sinTheta3', 0.05, 0.05, 0.34), 'equals11', frac('cot_1', 'v11', '_1_rad', 0.03, 0.03, 0.2)],
        adjOnOppCotEquals: ['adjOnOppF', 'equals9', frac('cosTheta4', 'v9', 'sinTheta3', 0.05, 0.05, 0.34), 'equals11', 'cot_1'],
        adjOnOppCot: ['adjOnOppEq', cont(['cot', ' ', 'theta4'], 0.3), 'equals9', frac('cosTheta4', 'v9', 'sinTheta3', 0.05, 0.05, 0.34)],
        cotTheta: [cont(['cot', ' ', 'theta4'], 0.3), 'equals9', frac('cosTheta4', 'v9', 'sinTheta3', 0.05, 0.05, 0.34)],
        hypOnOppOneOnSin: ['hypOnOppF', 'equals10', frac('_1_2', 'v10', 'sinTheta4', 0.05, 0.05, 0.34)],
        hypOnOppCscOnOne: ['hypOnOppF', 'equals10', frac('_1_2', 'v10', 'sinTheta4', 0.05, 0.05, 0.34), 'equals11', frac('csc_1', 'v11', '_1_rad', 0.03, 0.03, 0.2)],
        hypOnOppCscEquals: ['hypOnOppF', 'equals10', frac('_1_2', 'v10', 'sinTheta4', 0.05, 0.05, 0.34), 'equals11', 'csc_1'],
        hypOnOppCsc: ['hypOnOppEq', cont(['csc', ' ', 'theta5'], 0.3), 'equals10', frac('_1_2', 'v10', 'sinTheta4', 0.05, 0.05, 0.34)],
        cscTheta: [cont(['csc', ' ', 'theta5'], 0.3), 'equals10', frac('_1_2', 'v10', 'sinTheta4', 0.05, 0.05, 0.34)],
        oppHypSin: [cont('opposite', 0.65, 'right'), 'equals1', 'hypotenuse', 'times1', 'sinTheta1'],
        adjHypCos: [cont('adjacent', 0.65, 'right'), 'equals2', 'hypotenuse_1', 'times2', 'cosTheta1'],
        oppOnOne: { frac: ['opposite', 'v1', cont('_1_rad')] },
        // oppOnHyp: { frac: ['opposite', 'v1', cont('hypotenuse')] },
        fTheta: ['function', { container: ['', 0.02] }, { brac: ['lb', 'theta1', 'rb'] }],
        sinBracTheta: ['sin_1', { brac: ['lb', 'theta1', 'rb'] }],
        // sinTheta: ['sin', ' ', 'theta'],
        cos: ['co', 's'],
        cosineTheta: ['cos', 'ine', ' ', 'theta7'],
        tangentTheta: ['tan', 'gent', ' ', 'theta9'],
        // tanTheta: ['tan', ' ', 'theta9'],
        // cscTheta: ['csc', ' ', 'theta10'],
        // secTheta: ['sec', ' ', 'theta11'],
        // cotTheta: ['cot', ' ', 'theta12'],
        sinOnCos: { frac: ['sinTheta2', 'v7', 'cosTheta2'] },
        cosOnSin: { frac: ['cosTheta4', 'v8', 'sinTheta4'] },
        oneOnSinTheta: { frac: ['_1_1', 'v9', 'sinTheta3'] },
        oneOnCosTheta: { frac: ['_1_2', 'v10', 'cosTheta3'] },
        sinComp: ['sin_2', { brac: ['lb1', ['_90min', 'theta2'], 'rb1'] }],
        compComment: {
          topComment: {
            content: ['_90min', 'theta8'],
            comment: 'complementary angle',
            inSize: false,
            commentSpace: 0.1,
            contentSpace: 0.1,
            symbol: 'brace',
          },
        },
        sinCompComment: ['sin_2', { brac: ['lb1', 'compComment', 'rb1'] }],
        complementarySineTheta: ['co', 'mplementary', ' ', 's', 'ine', ' ', 'theta7'],
      },
      formDefaults: {
        translation: {
          hypotenuse: { style: 'curve', mag: 0.5, direction: 'down' },
          hypotenuse_1: { style: 'curve', mag: 0.5, direction: 'down' },
          duration: 2,
        },
      },
      // forms: {
      //   oppOnHyp: 'oppOnHyp',
      //   twoSideRatios: lines([[['oppOnHyp']], [['adjOnHyp']]]),
      //   sixSideRatios: lines([
      //     [['oppOnHyp']], [['adjOnHyp']], [['oppOnAdj']], [['hypOnAdj']], [['adjOnOpp']], [['hypOnOpp']],
      //   ]),
      //   sixSideRatiosWithValue: lines([
      //     [['oppOnHypEq', 'value1']], [['adjOnHypEq', 'value2']], [['oppOnAdjEq', 'value3']], [['hypOnAdjEq', 'value4']], [['adjOnOppEq', 'value5']], [['hypOnOppEq', 'value6']],
      //   ]),
      //   sixSideRatiosFunction: lines1([
      //     ['oppOnHypF'], ['adjOnHypF'], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF'],
      //   ]),
      //   /*
      //   ..######..####.##....##
      //   .##....##..##..###...##
      //   .##........##..####..##
      //   ..######...##..##.##.##
      //   .......##..##..##..####
      //   .##....##..##..##...###
      //   ..######..####.##....##
      //   */
      //   sixRatiosSinHighlight: {
      //     content: [
      //       lines1([[''], ['adjOnHypF'], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF'],
      //       ]),
      //       { offset: ['oppOnHypF', [0.5, 0]] },
      //     ],
      //     translation: { hypotenuse: { style: 'linear' } },
      //   },
      //   sixSROppHyp1: [
      //     lines1([[''], ['adjOnHypF'], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF'],
      //     ]),
      //     { offset: [[frac('opposite', 'v1', { bottomStrike: [cont('hypotenuse', 0.6), 'stk1', '_1_rad', false, 0, 0.7, 0] }, 0.01, 0.03, 0.65), 'equals1', 'f1', 'bTheta1'], [0.5, 0]] },
      //   ],
      //   sixSROppF: [
      //     lines1([[''], ['adjOnHypF'], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF']]),
      //     { offset: [[cont('opposite', 0.65, 'right'), 'equals1', 'f1', 'bTheta1'], [0.5, 0]] },
      //   ],
      //   sixSRSin: lines1([
      //     ['oppOnHypSin'], ['adjOnHypF'], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF'],
      //   ]),
      //   /*
      //   ..######...#######...######.
      //   .##....##.##.....##.##....##
      //   .##.......##.....##.##......
      //   .##.......##.....##..######.
      //   .##.......##.....##.......##
      //   .##....##.##.....##.##....##
      //   ..######...#######...######.
      //   */
      //   sixSRCosHighlight: {
      //     content: [
      //       lines1([['oppOnHypSin'], [''], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF'],
      //       ]),
      //       { scale: [{ offset: ['adjOnHypF', [1.5, -0.3]] }, 1.1] },
      //     ],
      //     translation: { hypotenuse_1: { style: 'linear' } },
      //   },
      //   sixSRCosComp: {
      //     content: [
      //       lines1([['oppOnHypSin'], [''], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF'],
      //       ]),
      //       { scale: [{ offset: [['adjOnHypEq', 'sinCompComment'], [1.5, -0.3]] }, 1.1] },
      //     ],
      //   },
      //   sixSRCosComplementarySine: {
      //     content: [
      //       lines1([['oppOnHypSin'], [''], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF'],
      //       ]),
      //       { scale: [{ offset: [['adjOnHypEq', 'sinCompComment'], [1.5, -0.3]] }, 1.1] },
      //       { scale: [{ offset: [['equals7', 'complementarySineTheta'], [2.15, -0.6]] }, 1.1] },
      //     ],
      //   },
      //   sixSRCosCosine: {
      //     content: [
      //       lines1([['oppOnHypSin'], [''], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF'],
      //       ]),
      //       { scale: [{ offset: [['adjOnHypEq', 'sinCompComment'], [1.5, -0.3]] }, 1.1] },
      //       { scale: [{ offset: [['equals7', 'cosineTheta'], [2.15, -0.6]] }, 1.1] },
      //     ],
      //   },
      //   sixSRCosCos: {
      //     content: [
      //       lines1([['oppOnHypSin'], [''], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF'],
      //       ]),
      //       { scale: [{ offset: [['adjOnHypEq', 'sinCompComment'], [1.5, -0.3]] }, 1.1] },
      //       { scale: [{ offset: [['equals7', 'cosTheta1'], [2.15, -0.6]] }, 1.1] },
      //     ],
      //   },
      //   sixSRCosThetaHighlight: {
      //     content: [
      //       lines1([['oppOnHypSin'], [''], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF'],
      //       ]),
      //       { scale: [{ offset: ['adjOnHypCos', [1.5, -0.3]] }, 1.1] },
      //     ],
      //   },
      //   sixSRCos: {
      //     content: lines1([['oppOnHypSin'], ['adjOnHypCos'], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF']]),
      //     translation: { hypotenuse_1: { style: 'linear' } },
      //   },
      //   /*
      //   .########.####.##.......##......
      //   .##........##..##.......##......
      //   .##........##..##.......##......
      //   .######....##..##.......##......
      //   .##........##..##.......##......
      //   .##........##..##.......##......
      //   .##.......####.########.########
      //   */
      //   sixSRCosRearrange: lines1([['oppHypSin'], ['adjHypCos'], ['oppOnAdjF'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF']]),
      //   sixSRSinOnCosHyp: lines1([['oppHypSin'], ['adjHypCos'], ['oppOnAdjSinOnCosHyp'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF']]),
      //   sixSRSinOnCosHypStk: lines1([['oppHypSin'], ['adjHypCos'], ['oppOnAdjSinOnCosHypStk'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF']]),
      //   sixSRSinOnCos: lines1([['oppHypSin'], ['adjHypCos'], ['oppOnAdjSinOnCos'], ['hypOnAdjF'], ['adjOnOppF'], ['hypOnOppF']]),
      //   sixSRHypOnCos: lines1([['oppHypSin'], ['adjHypCos'], ['oppOnAdjSinOnCos'], ['hypOnAdjHypOnCos'], ['adjOnOppF'], ['hypOnOppF']]),
      //   sixSROneOnCosStk: lines1([['oppHypSin'], ['adjHypCos'], ['oppOnAdjSinOnCos'], ['hypOnAdjOneOnCosStk'], ['adjOnOppF'], ['hypOnOppF']]),
      //   sixSROneOnCos: lines1([['oppHypSin'], ['adjHypCos'], ['oppOnAdjSinOnCos'], ['hypOnAdjOneOnCos'], ['adjOnOppF'], ['hypOnOppF']]),
      //   sixSRCosOnSin: lines1([['oppHypSin'], ['adjHypCos'], ['oppOnAdjSinOnCos'], ['hypOnAdjOneOnCos'], ['adjOnOppCosOnSin'], ['hypOnOppF']]),
      //   sixSROneOnSin: lines1([['oppHypSin'], ['adjHypCos'], ['oppOnAdjSinOnCos'], ['hypOnAdjOneOnCos'], ['adjOnOppCosOnSin'], ['hypOnOppOneOnSin']]),
      //   sixSRR: lines1([['oppOnHypSin'], ['adjOnHypCos'], ['oppOnAdjSinOnCos'], ['hypOnAdjOneOnCos'], ['adjOnOppCosOnSin'], ['hypOnOppOneOnSin']]),
      //   /*
      //   .########....###....##....##
      //   ....##......##.##...###...##
      //   ....##.....##...##..####..##
      //   ....##....##.....##.##.##.##
      //   ....##....#########.##..####
      //   ....##....##.....##.##...###
      //   ....##....##.....##.##....##
      //   */
      //   sixSRRTanOnOne: lines1([['oppOnHypSin'], ['adjOnHypCos'], ['oppOnAdjTanOnOne'], ['hypOnAdjOneOnCos'], ['adjOnOppCosOnSin'], ['hypOnOppOneOnSin']]),
      //   sixSRRTanOnOneStk: lines1([['oppOnHypSin'], ['adjOnHypCos'], ['oppOnAdjTanOnOneStk'], ['hypOnAdjOneOnCos'], ['adjOnOppCosOnSin'], ['hypOnOppOneOnSin']]),
      //   sixSRRTanEquals: lines1([['oppOnHypSin'], ['adjOnHypCos'], ['oppOnAdjTanEquals'], ['hypOnAdjOneOnCos'], ['adjOnOppCosOnSin'], ['hypOnOppOneOnSin']]),
      //   sixSRRTan: {
      //     content: lines1([['oppOnHypSin'], ['adjOnHypCos'], ['oppOnAdjTan'], ['hypOnAdjOneOnCos'], ['adjOnOppCosOnSin'], ['hypOnOppOneOnSin']]),
      //     // translation: { tan_1: { style: 'curve', magnitude: 0.5, direction: 'down' } },
      //   },
      //   /*
      //   ..######..########..######.
      //   .##....##.##.......##....##
      //   .##.......##.......##......
      //   ..######..######...##......
      //   .......##.##.......##......
      //   .##....##.##.......##....##
      //   ..######..########..######.
      //   */
      //   sixSRRSecOnOne: lines1([['oppOnHypSin'], ['adjOnHypCos'], ['oppOnAdjTan'], ['hypOnAdjSecOnOne'], ['adjOnOppCosOnSin'], ['hypOnOppOneOnSin']]),
      //   sixSRRSecEquals: lines1([['oppOnHypSin'], ['adjOnHypCos'], ['oppOnAdjTan'], ['hypOnAdjSecEquals'], ['adjOnOppCosOnSin'], ['hypOnOppOneOnSin']]),
      //   sixSRRSec: lines1([['oppOnHypSin'], ['adjOnHypCos'], ['oppOnAdjTan'], ['hypOnAdjSec'], ['adjOnOppCosOnSin'], ['hypOnOppOneOnSin']]),

      //   /*
      //   ..######...#######..########
      //   .##....##.##.....##....##...
      //   .##.......##.....##....##...
      //   .##.......##.....##....##...
      //   .##.......##.....##....##...
      //   .##....##.##.....##....##...
      //   ..######...#######.....##...
      //   */
      //   sixSRRCotOnOne: lines1([['oppOnHypSin'], ['adjOnHypCos'], ['oppOnAdjTan'], ['hypOnAdjSec'], ['adjOnOppCotOnOne'], ['hypOnOppOneOnSin']]),
      //   sixSRRCotEquals: lines1([['oppOnHypSin'], ['adjOnHypCos'], ['oppOnAdjTan'], ['hypOnAdjSec'], ['adjOnOppCotEquals'], ['hypOnOppOneOnSin']]),
      //   sixSRRCot: lines1([['oppOnHypSin'], ['adjOnHypCos'], ['oppOnAdjTan'], ['hypOnAdjSec'], ['adjOnOppCot'], ['hypOnOppOneOnSin']]),

      //   /*
      //   ..######...######...######.
      //   .##....##.##....##.##....##
      //   .##.......##.......##......
      //   .##........######..##......
      //   .##.............##.##......
      //   .##....##.##....##.##....##
      //   ..######...######...######.
      //   */
      //   sixSRRCscOnOne: lines1([['oppOnHypSin'], ['adjOnHypCos'], ['oppOnAdjTan'], ['hypOnAdjSec'], ['adjOnOppCot'], ['hypOnOppCscOnOne']]),
      //   sixSRRCscEquals: lines1([['oppOnHypSin'], ['adjOnHypCos'], ['oppOnAdjTan'], ['hypOnAdjSec'], ['adjOnOppCot'], ['hypOnOppCscEquals']]),
      //   sixSRRCsc: lines1([['oppOnHypSin'], ['adjOnHypCos'], ['oppOnAdjTan'], ['hypOnAdjSec'], ['adjOnOppCot'], ['hypOnOppCsc']]),

      //   /*
      //   .##.....##....###....##.......##.....##.########..######.
      //   .##.....##...##.##...##.......##.....##.##.......##....##
      //   .##.....##..##...##..##.......##.....##.##.......##......
      //   .##.....##.##.....##.##.......##.....##.######....######.
      //   ..##...##..#########.##.......##.....##.##.............##
      //   ...##.##...##.....##.##.......##.....##.##.......##....##
      //   ....###....##.....##.########..#######..########..######.
      //   */
      //   sixSRRWithValues: lines1([
      //     ['sinTheta1', 'equals11', 'value1'],
      //     ['cosTheta1', 'equals12', 'value2'],
      //     ['tanTheta', 'equals13', 'value3'],
      //     ['secTheta', 'equals14', 'value4'],
      //     ['cotTheta', 'equals15', 'value5'],
      //     ['cscTheta', 'equals16', 'value6'],
      //   ]),

      //   /*
      //   ..######..##.....##.##.....##.##.....##....###....########..##....##
      //   .##....##.##.....##.###...###.###...###...##.##...##.....##..##..##.
      //   .##.......##.....##.####.####.####.####..##...##..##.....##...####..
      //   ..######..##.....##.##.###.##.##.###.##.##.....##.########.....##...
      //   .......##.##.....##.##.....##.##.....##.#########.##...##......##...
      //   .##....##.##.....##.##.....##.##.....##.##.....##.##....##.....##...
      //   ..######...#######..##.....##.##.....##.##.....##.##.....##....##...
      //   */
      //   summaryTable: lines1([
      //     [cont(['sinTheta1'], 0.9), cont('cosTheta1')],
      //     [cont(['sine'], 0.9), cont('cosine')],
      //     [cont(['oppOnHyp'], 0.9), cont('adjOnHyp')],
      //   ]),


      //   oneRatio: ['oppOnHyp', 'equals1', 'constant_1'],
      //   twoRatios: lines([
      //     [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
      //     [['adjOnHyp', 'equals2'], 'equals2'],
      //   ]),
      //   twoRatiosSinComp: lines([
      //     [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
      //     [['adjOnHyp', 'equals2', 'sinComp'], 'equals2'],
      //   ]),
      //   twoRatiosSinCompComment: lines([
      //     [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
      //     [['adjOnHyp', 'equals2', 'sinCompComment'], 'equals2'],
      //   ]),
      //   twoRatiosComplementarySine: lines([
      //     [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
      //     [['adjOnHyp', 'equals2', 'sinCompComment'], 'equals2'],
      //     [['equals3', 'complementarySineTheta'], 'equals3', 0.4],
      //   ]),
      //   twoRatiosCosine: lines([
      //     [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
      //     [['adjOnHyp', 'equals2', 'sinCompComment'], 'equals2'],
      //     [['equals3', 'cosineTheta'], 'equals3', 0.4],
      //   ]),
      //   twoRatiosCos: lines([
      //     [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
      //     [['adjOnHyp', 'equals2', 'sinCompComment'], 'equals2'],
      //     [['equals3', 'cosTheta1'], 'equals3', 0.4],
      //   ]),
      //   twoRatiosCosOnly: lines([
      //     [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
      //     [['adjOnHyp', 'equals2', 'cosTheta1'], 'equals2'],
      //   ]),
      //   threeRatiosEqual: lines([
      //     [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
      //     [['adjOnHyp', 'equals2', 'cosTheta1'], 'equals2'],
      //     [['oppOnAdj', 'equals3'], 'equals3'],
      //   ]),
      //   threeRatiosSineTimes: lines(
      //     [
      //       [['opposite', 'equals1', 'hypotenuse', 'times1', 'sinTheta1'], 'equals1'],
      //       [['adjacent', 'equals2', 'hypotenuse_1', 'times2', 'cosTheta1'], 'equals2'],
      //       [['oppOnAdj', 'equals3'], 'equals3'],
      //     ],
      //     // {
      //     //   hypotenuse: { style: 'curve', mag: 0.5, direction: 'down' },
      //     //   hypotenuse_1: { style: 'curve', mag: 0.5, direction: 'down' },
      //     // },
      //     // { xAlign: 'left' },
      //   ),
      //   threeRatiosSineTimes2: lines(
      //     [
      //       [['opposite', 'equals1', 'hypotenuse', 'times1', 'sinTheta1'], 'equals1'],
      //       [['adjacent', 'equals2', 'hypotenuse_1', 'times2', 'cosTheta1'], 'equals2'],
      //       [['oppOnAdj', 'equals3', {
      //         frac: [
      //           ['hypotenuse_2', 'times3', 'sinTheta2'],
      //           'v7',
      //           ['hypotenuse_3', 'times4', 'cosTheta2'],
      //         ],
      //       }], 'equals3'],
      //     ],
      //   ),
      //   threeRatiosSineTimesStrike: lines(
      //     [
      //       [['opposite', 'equals1', 'hypotenuse', 'times1', 'sinTheta1'], 'equals1'],
      //       [['adjacent', 'equals2', 'hypotenuse_1', 'times2', 'cosTheta1'], 'equals2'],
      //       [['oppOnAdj', 'equals3', {
      //         frac: [
      //           [{ strike: ['hypotenuse_2', 'stk1'] }, 'times3', 'sinTheta2'],
      //           'v7',
      //           [{ strike: ['hypotenuse_3', 'stk2'] }, 'times4', 'cosTheta2'],
      //         ],
      //       }], 'equals3'],
      //     ],
      //   ),
      //   threeRatiosSineOnCosTimes: lines(
      //     [
      //       [['opposite', 'equals1', 'hypotenuse', 'times1', 'sinTheta1'], 'equals1'],
      //       [['adjacent', 'equals2', 'hypotenuse_1', 'times2', 'cosTheta1'], 'equals2'],
      //       [['oppOnAdj', 'equals3', 'sinOnCos'], 'equals3'],
      //     ],
      //   ),
      //   threeRatiosSineOnCos: lines(
      //     [
      //       [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
      //       [['adjOnHyp', 'equals2', 'cosTheta1'], 'equals2'],
      //       [['oppOnAdj', 'equals3', 'sinOnCos'], 'equals3'],
      //     ],
      //   ),
      //   fourRatios: lines(
      //     [
      //       [['oppOnHyp', 'equals1', 'sinTheta1', space, 'hypOnOpp', 'equals4', 'oneOnSinTheta'], 'equals1'],
      //       [['adjOnHyp', 'equals2', 'cosTheta1'], 'equals2'],
      //       [['oppOnAdj', 'equals3', 'sinOnCos'], 'equals3'],
      //     ],
      //   ),
      //   fiveRatios: lines(
      //     [
      //       [['oppOnHyp', 'equals1', 'sinTheta1', space, 'hypOnOpp', 'equals4', 'oneOnSinTheta'], 'equals1'],
      //       [['adjOnHyp', 'equals2', 'cosTheta1', space, 'hypOnAdj', 'equals5', 'oneOnCosTheta'], 'equals2'],
      //       [['oppOnAdj', 'equals3', 'sinOnCos'], 'equals3'],
      //     ],
      //   ),
      //   sixRatios: lines(
      //     [
      //       [['oppOnHyp', 'equals1', 'sinTheta1', space, 'hypOnOpp', 'equals4', 'oneOnSinTheta'], 'equals1'],
      //       [['adjOnHyp', 'equals2', 'cosTheta1', space, 'hypOnAdj', 'equals5', 'oneOnCosTheta'], 'equals2'],
      //       [['oppOnAdj', 'equals3', 'sinOnCos', space, 'adjOnOpp', 'equals6', 'cosOnSin'], 'equals3'],
      //     ],
      //   ),
      //   sixRatiosLeft: lines(
      //     [
      //       [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
      //       [['hypOnOpp', 'equals4', 'oneOnSinTheta'], 'equals4'],
      //       [['adjOnHyp', 'equals2', 'cosTheta1'], 'equals2'],
      //       [['hypOnAdj', 'equals5', 'oneOnCosTheta'], 'equals5'],
      //       [['oppOnAdj', 'equals3', 'sinOnCos'], 'equals3'],
      //       [['adjOnOpp', 'equals6', 'cosOnSin'], 'equals6'],
      //     ],
      //     {
      //       hypotenuse: { style: 'linear' },
      //       hypotenuse_1: { style: 'linear' },
      //     },
      //   ),
      //   sixRatiosTan: lines(
      //     [
      //       [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
      //       [['hypOnOpp', 'equals4', 'oneOnSinTheta'], 'equals4'],
      //       [['adjOnHyp', 'equals2', 'cosTheta1'], 'equals2'],
      //       [['hypOnAdj', 'equals5', 'oneOnCosTheta'], 'equals5'],
      //       [['oppOnAdj', 'equals3', 'sinOnCos', 'equals7', 'tanTheta'], 'equals3'],
      //       [['adjOnOpp', 'equals6', 'cosOnSin'], 'equals6'],
      //     ],
      //   ),
      //   sixRatiosSec: lines(
      //     [
      //       [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
      //       [['hypOnOpp', 'equals4', 'oneOnSinTheta'], 'equals4'],
      //       [['adjOnHyp', 'equals2', 'cosTheta1'], 'equals2'],
      //       [['hypOnAdj', 'equals5', 'oneOnCosTheta', 'equals8', 'secTheta'], 'equals5'],
      //       [['oppOnAdj', 'equals3', 'sinOnCos', 'equals7', 'tanTheta'], 'equals3'],
      //       [['adjOnOpp', 'equals6', 'cosOnSin'], 'equals6'],
      //     ],
      //   ),
      //   sixRatiosCot: lines(
      //     [
      //       [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
      //       [['hypOnOpp', 'equals4', 'oneOnSinTheta'], 'equals4'],
      //       [['adjOnHyp', 'equals2', 'cosTheta1'], 'equals2'],
      //       [['hypOnAdj', 'equals5', 'oneOnCosTheta', 'equals8', 'secTheta'], 'equals5'],
      //       [['oppOnAdj', 'equals3', 'sinOnCos', 'equals7', 'tanTheta'], 'equals3'],
      //       [['adjOnOpp', 'equals6', 'cosOnSin', 'equals9', 'cotTheta'], 'equals6'],
      //     ],
      //   ),
      //   sixRatiosCsc: lines(
      //     [
      //       [['oppOnHyp', 'equals1', 'sinTheta1'], 'equals1'],
      //       [['hypOnOpp', 'equals4', 'oneOnSinTheta', 'equals10', 'cscTheta'], 'equals4'],
      //       [['adjOnHyp', 'equals2', 'cosTheta1'], 'equals2'],
      //       [['hypOnAdj', 'equals5', 'oneOnCosTheta', 'equals8', 'secTheta'], 'equals5'],
      //       [['oppOnAdj', 'equals3', 'sinOnCos', 'equals7', 'tanTheta'], 'equals3'],
      //       [['adjOnOpp', 'equals6', 'cosOnSin', 'equals9', 'cotTheta'], 'equals6'],
      //     ],
      //   ),
      //   sixRatiosLeftOnOne: lines(
      //     [
      //       [['oppOnOne', 'equals1', 'sinTheta1'], 'equals1'],
      //       [['hypOnOpp', 'equals4', 'oneOnSinTheta'], 'equals4'],
      //       [['adjOnHyp', 'equals2', 'cosTheta1'], 'equals2'],
      //       [['hypOnAdj', 'equals5', 'oneOnCosTheta'], 'equals5'],
      //       [['oppOnAdj', 'equals3', 'sinOnCos'], 'equals3'],
      //       [['adjOnOpp', 'equals6', 'cosOnSin'], 'equals6'],
      //     ],
      //   ),
      //   sixRatiosLeftOpp: lines(
      //     [
      //       [['opposite', 'equals1', 'sinTheta1'], 'equals1'],
      //       [['hypOnOpp', 'equals4', 'oneOnSinTheta'], 'equals4'],
      //       [['adjOnHyp', 'equals2', 'cosTheta1'], 'equals2'],
      //       [['hypOnAdj', 'equals5', 'oneOnCosTheta'], 'equals5'],
      //       [['oppOnAdj', 'equals3', 'sinOnCos'], 'equals3'],
      //       [['adjOnOpp', 'equals6', 'cosOnSin'], 'equals6'],
      //     ],
      //   ),


      //   threeRatiosSineOnCosTangent: lines(
      //     [
      //       [['opposite', 'equals1', 'hypotenuse', 'times1', 'sinTheta'], 'equals1'],
      //       [['adjacent', 'equals2', 'hypotenuse_1', 'times2', 'cosTheta'], 'equals2'],
      //       [['oppOnAdj', 'equals3', { frac: ['sinTheta1', 'v4', 'cosTheta1'] }], 'equals3'],
      //       [['equals4', 'tangentTheta'], 'equals4'],
      //     ],
      //   ),
      //   threeRatiosSineOnCosTan: lines(
      //     [
      //       [['opposite', 'equals1', 'hypotenuse', 'times1', 'sinTheta'], 'equals1'],
      //       [['adjacent', 'equals2', 'hypotenuse_1', 'times2', 'cosTheta'], 'equals2'],
      //       [['oppOnAdj', 'equals3', { frac: ['sinTheta1', 'v4', 'cosTheta1'] }], 'equals3'],
      //       [['equals4', 'tanTheta'], 'equals4'],
      //     ],
      //   ),
      //   threeRatiosTimesTan: lines(
      //     [
      //       [['opposite', 'equals1', 'hypotenuse', 'times1', 'sinTheta'], 'equals1'],
      //       [['adjacent', 'equals2', 'hypotenuse_1', 'times2', 'cosTheta'], 'equals2'],
      //       [['oppOnAdj', 'equals3', 'tanTheta'], 'equals3'],
      //     ],
      //   ),
      //   threeRatiosSinCosTan: lines(
      //     [
      //       [['oppOnHyp', 'equals1', 'sinTheta'], 'equals1'],
      //       [['adjOnHyp', 'equals2', 'cosTheta'], 'equals2'],
      //       [['oppOnAdj', 'equals3', 'tanTheta'], 'equals3'],
      //     ],
      //     {
      //       hypotenuse: { style: 'curve', mag: 0.5, direction: 'down' },
      //       hypotenuse_1: { style: 'curve', mag: 0.5, direction: 'down' },
      //     },
      //   ),
      //   ratioValue: ['oppOnHyp', 'equals1', 'ratioValue'],
      //   ratioValueDef: ['oppOnHyp', 'equals1', 'ratioValueDef'],
      //   f: ['oppOnHyp', 'equals1', 'fTheta'],
      //   sinBracTheta: ['oppOnHyp', 'equals1', 'sinBracTheta'],
      //   sinTheta: ['oppOnHyp', 'equals1', 'sinTheta1'],
      //   sinThetaOne: ['oppOnOne', 'equals1', 'sinTheta1'],
      //   sinThetaOpp: ['opposite', 'equals1', 'sinTheta1'],
      //   sinOnly: [{ container: ['', 0.9] }, 'sinTheta1'],
      //   fOnly: [{ container: ['', 0.9] }, 'fTheta'],
      //   fLeft: ['fTheta'],
      //   sinInf: {
      //     content: [
      //       'sinTheta1', 'equals1', 'theta2', '_  –  _1',
      //       { frac: [{ sup: ['theta3', '3', 0.6] }, 'v2', '3!'] },
      //       '_  +  _1',
      //       { frac: [{ sup: ['theta5', '5', 0.6] }, 'v3', '5!'] },
      //       '_  –  _2',
      //       { frac: [{ sup: ['theta7', '7', 0.6] }, 'v4', '7!'] },
      //       '_  +  _2', 'dotDotDot',
      //     ],
      //     alignment: { xAlign: 'center' },
      //   },
      //   bowstring: 'bowstring',
      //   halfBowstring: ['half way there ', 'bowstring'],
      //   sinus: 'sinus',
      //   sine: 'sine',
      //   sineSin: ['sine', 'comma', 'sinText'],
      //   // statement: ['oppOnHyp', '_  is the same for all right triangles with angle ', 'theta',
      //   // ],
      // },
    },
    mods: {
      scenarios: {
        upperLeft: { position: [-2, 0.4], scale: 1 },
        left: { position: [-1.8, 0.7], scale: 1.2 },
        default: { position: [0, 0], scale: 1.4 },
        table: { position: [-2.1, 1.1], scale: 1 },
        // top: { position: [-1.5, 0.7], scale: 1 },
        topRight: { position: [1.6, 0.95], scale: 1 },
        bottom: { position: [0, -1.3], scale: 1 },
        eqnTri: { position: [-2.5, 1.2], scale: 1 },
        eqnTriValues: { position: [-2.8, 1.2], scale: 1 },
        eqnTri1: { position: [0.5, 0.7], scale: 1.1 },
        right: { position: [1, 0], scale: 1.1 },
        eqnCirc: { position: [-2.5, 0], scale: 1.1 },
        eqnCircLeft: { position: [-2.7, 1.2], scale: 0.8 },
      },
    },
  });
  figure.add({
    name: 'eqn1',
    method: 'equation',
    options: {
      elements: {
        v1: { symbol: 'vinculum' },
        v2: { symbol: 'vinculum' },
        v3: { symbol: 'vinculum' },
        equals1: '  =  ',
        equals2: '  =  ',
        equals3: '  =  ',
        theta: { text: '\u03b8', color: color1 },
        theta1: { text: '\u03b8', color: color1 },
        theta2: { text: '\u03b8', color: color1 },
        theta3: { text: '\u03b8', color: color1 },
        theta4: { text: '\u03b8', color: color1 },
        dotDotDot: '...',
        lb: { symbol: 'bracket', side: 'left' },
        rb: { symbol: 'bracket', side: 'right' },
        _1_rad: { color: colRad },
        tan_1: { color: colTan, style: 'normal' },
        tan_2: { color: colTan, style: 'normal' },
        cot_1: { color: colCot, style: 'normal' },
        cot_2: { color: colCot, style: 'normal' },
        csc_1: { color: colCsc, style: 'normal' },
        csc_2: { color: colCsc, style: 'normal' },
        sec_1: { color: colSec, style: 'normal' },
        sec_2: { color: colSec, style: 'normal' },
        // opposite_1: { color: colSin },
        // adjacent_1: { color: colCos },
        // hypotenuse_1: { color: colRad },
      },
      phrases: {
        oppOnHyp: { frac: ['opposite', 'v1', 'hypotenuse_1'] },
        adjOnHyp: { frac: ['adjacent', 'v2', 'hypotenuse_1'] },
        hypOnAdj: { frac: ['hypotenuse_1', 'v2', 'adjacent_1'] },
        oppOnAdj: { frac: ['opposite_1', 'v3', 'adjacent_1'] },
        adjOnOpp: { frac: ['adjacent_1', 'v3', 'opposite_1'] },
        hypOnOpp: { frac: ['hypotenuse_1', 'v2', 'opposite_1'] },
        fTheta: ['f', { container: ['', 0.02] }, { brac: ['lb', 'theta', 'rb'] }],
      },
      forms: {
        fInf: {
          content: [
            'fTheta', 'equals1', 'theta1', '_  –  _1',
            { frac: [{ sup: ['theta2', '3'] }, 'v2', '3!'] },
            '_  +  _1',
            { frac: [{ sup: ['theta3', '5'] }, 'v3', '5!'] },
            '_  –  _2',
            { frac: [{ sup: ['theta4', '7'] }, 'v4_vinculum', '7!'] },
            '_  +  _2', 'dotDotDot',
          ],
          alignment: { xAlign: 'center' },
        },
        oppOnAdj: 'oppOnAdj',
        hypOnAdj: 'hypOnAdj',
        adjOnHyp: 'adjOnHyp',
        hypOnOpp: 'hypOnOpp',
        adjOnOpp: 'adjOnOpp',
        secOn1: ['hypOnAdj', 'equals1', { frac: ['sec_1', 'v1', '_1_rad'] }],
        sec: ['hypOnAdj', 'equals1', { frac: ['sec_1', 'v1', '_1_rad'] }, 'equals2', 'sec_2'],
        tanOn1: ['oppOnAdj', 'equals1', { frac: ['tan_1', 'v1', '_1_rad'] }],
        tan: ['oppOnAdj', 'equals1', { frac: ['tan_1', 'v1', '_1_rad'] }, 'equals2', 'tan_2'],
        cotOn1: ['adjOnOpp', 'equals1', { frac: ['cot_1', 'v1', '_1_rad'] }],
        cot: ['adjOnOpp', 'equals1', { frac: ['cot_1', 'v1', '_1_rad'] }, 'equals2', 'cot_2'],
        cscOn1: ['hypOnOpp', 'equals1', { frac: ['csc_1', 'v1', '_1_rad'] }],
        csc: ['hypOnOpp', 'equals1', { frac: ['csc_1', 'v1', '_1_rad'] }, 'equals2', 'csc_2'],
      },
    },
    mods: {
      scenarios: {
        default: { position: [1, -0.2] },
        eqn1Right: { position: [0.4, 0.6] },
        eqn1MoreRight: { position: [0.8, 0.6] },
      },
    },
  });

  const lin = (content, baselineSpace = 0.5) => ({
    lines: { content, baselineSpace, justify: 'left' },
  });
  const s = (content, strikeNum) => ({
    strike: { content, symbol: `s${strikeNum}`, inSize: false },
  });
  const b = (content, boxNum) => ({
    box: {
      content, symbol: `b${boxNum}`, inSize: false, space: 0.05,
    },
  });
  const w1 = 0.33;

  const addFn = (name, elements, centerOn, xAlign, yAlign = 'middle') => {
    figure.fnMap.global.add(name, () => {
      figure.getElement('eqn').pulse({
        elements, centerOn, xAlign, yAlign, scale: 2.5,
      });
    });
  };
  addFn('eqnPulseTan', ['tan', 'theta9'], 'tan', 'left', 'middle');
  addFn('eqnPulseCot', ['cot', 'theta12'], 'cot', 'left', 'middle');
  addFn('eqnPulseSec', ['sec', 'theta11'], 'sec', 'left', 'middle');
  addFn('eqnPulseCsc', ['csc', 'theta10'], 'csc', 'left', 'middle');
  addFn('eqnPulseF1', ['f_1', '_1', 'lb1', 'theta1', 'rb1'], 'f_1', 'left');
  addFn('eqnPulseF2', ['f_2', '_2', 'lb2', 'theta2', 'rb2'], 'f_2', 'left');
  addFn('eqnPulseF3', ['f_3', '_3', 'lb3', 'theta3', 'rb3'], 'f_3', 'left');
  addFn('eqnPulseF4', ['f_4', '_4', 'lb4', 'theta4', 'rb4'], 'f_4', 'left');
  addFn('eqnPulseF5', ['f_5', '_5', 'lb5', 'theta5', 'rb5'], 'f_5', 'left');
  addFn('eqnPulseF6', ['f_6', '_6', 'lb6', 'theta6', 'rb6'], 'f_6', 'left');
  addFn('eqnPulseSin', ['sin_1', 'theta1'], 'sin_1', 'left', 'middle');

  figure.add({
    name: 'eqn2',
    method: 'equation',
    options: {
      elements: {
        eq1: ' =',
        eq2: ' =',
        eq3: ' =',
        eq4: ' =',
        eq5: ' =',
        eq6: ' =',
        eq7: ' =',
        eq8: ' =',
        eq9: ' =',
        eq10: ' =',
        eq11: ' =',
        eq12: ' =',
        eq13: ' =',
        eq14: ' =',
        eq15: ' =',
        eq16: ' =',
        eq17: ' =',
        eq18: ' =',
        v1: { symbol: 'vinculum' },
        v2: { symbol: 'vinculum' },
        v3: { symbol: 'vinculum' },
        v4: { symbol: 'vinculum' },
        v5: { symbol: 'vinculum' },
        v6: { symbol: 'vinculum' },
        v7: { symbol: 'vinculum' },
        v8: { symbol: 'vinculum' },
        v9: { symbol: 'vinculum' },
        v10: { symbol: 'vinculum' },
        v11: { symbol: 'vinculum' },
        v12: { symbol: 'vinculum' },
        v13: { symbol: 'vinculum' },
        v14: { symbol: 'vinculum' },
        v15: { symbol: 'vinculum' },
        v16: { symbol: 'vinculum' },
        v17: { symbol: 'vinculum' },
        v18: { symbol: 'vinculum' },
        v19: { symbol: 'vinculum' },
        v20: { symbol: 'vinculum' },
        v21: { symbol: 'vinculum' },
        v22: { symbol: 'vinculum' },
        v23: { symbol: 'vinculum' },
        v24: { symbol: 'vinculum' },
        sin_1: { style: 'normal' },
        sin_2: { style: 'normal' },
        sin_3: { style: 'normal' },
        sin_4: { style: 'normal' },
        cos_1: { style: 'normal' },
        cos_2: { style: 'normal' },
        cos_3: { style: 'normal' },
        cos_4: { style: 'normal' },
        tan_1: { style: 'normal' },
        tan_2: { style: 'normal' },
        tan_3: { style: 'normal' },
        tan_4: { style: 'normal' },
        cot_1: { style: 'normal' },
        cot_2: { style: 'normal' },
        cot_3: { style: 'normal' },
        cot_4: { style: 'normal' },
        sec_1: { style: 'normal' },
        sec_2: { style: 'normal' },
        sec_3: { style: 'normal' },
        sec_4: { style: 'normal' },
        csc_1: { style: 'normal' },
        csc_2: { style: 'normal' },
        csc_3: { style: 'normal' },
        csc_4: { style: 'normal' },
        opp_1: { text: 'opposite', color: colOpp, size: 0.17 },
        opp_2: { text: 'opposite', color: colOpp, size: 0.17 },
        opp_3: { text: 'opposite', color: colOpp, size: 0.17 },
        opp_4: { text: 'opposite', color: colOpp, size: 0.17 },
        adj_1: { text: 'adjacent', color: colAdj, size: 0.17 },
        adj_2: { text: 'adjacent', color: colAdj, size: 0.17 },
        adj_3: { text: 'adjacent', color: colAdj, size: 0.17 },
        adj_4: { text: 'adjacent', color: colAdj, size: 0.17 },
        hyp_1: { text: 'hypotenuse', color: colHyp, size: 0.17 },
        hyp_2: { text: 'hypotenuse', color: colHyp, size: 0.17 },
        hyp_3: { text: 'hypotenuse', color: colHyp, size: 0.17 },
        hyp_4: { text: 'hypotenuse', color: colHyp, size: 0.17 },
        theta1: { text: '\u03b8', color: colTheta },
        theta2: { text: '\u03b8', color: colTheta },
        theta3: { text: '\u03b8', color: colTheta },
        theta4: { text: '\u03b8', color: colTheta },
        theta5: { text: '\u03b8', color: colTheta },
        theta6: { text: '\u03b8', color: colTheta },
        theta7: { text: '\u03b8', color: colTheta },
        theta8: { text: '\u03b8', color: colTheta },
        theta9: { text: '\u03b8', color: colTheta },
        theta10: { text: '\u03b8', color: colTheta },
        theta11: { text: '\u03b8', color: colTheta },
        s1: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
        s2: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
        s3: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
        s4: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
        s5: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
        s6: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
        s7: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
        s8: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
        val1: '0.0000',
        val2: '0.0000',
        val3: '0.0000',
        val4: '0.0000',
        val5: '0.0000',
        val6: '0.0000',
        // b1: { symbol: 'box', lineWidth: 0.008, color: color1 },
        // b2: { symbol: 'box', lineWidth: 0.008, color: color1 },
        // b3: { symbol: 'box', lineWidth: 0.008, color: color1 },
        // b4: { symbol: 'box', lineWidth: 0.008, color: color1 },
        // b5: { symbol: 'box', lineWidth: 0.008, color: color1 },
        // b6: { symbol: 'box', lineWidth: 0.008, color: color1 },
        // b7: { symbol: 'box', lineWidth: 0.008, color: color1 },
        // b8: { symbol: 'box', lineWidth: 0.008, color: color1 },
        // b9: { symbol: 'box', lineWidth: 0.008, color: color1 },
        // b10: { symbol: 'box', lineWidth: 0.008, color: color1 },
      },
      phrases: {
        oppHyp: { frac: ['opp_1', 'v1', 'hyp_1'] },
        adjHyp: { frac: ['adj_1', 'v2', 'hyp_2'] },
        oppAdj: { frac: ['opp_2', 'v3', 'adj_2'] },
        hypOpp: { frac: ['hyp_3', 'v4', 'opp_3'] },
        hypAdj: { frac: ['hyp_4', 'v5', 'adj_3'] },
        adjOpp: { frac: ['adj_4', 'v6', 'opp_4'] },
        sinOne: cont({ frac: ['sin_1', 'v7', '_1_1'] }, w1),
        cosOne: cont({ frac: ['cos_1', 'v8', '_1_2'] }, w1),
        sinCos: cont({ frac: ['sin_2', 'v9', 'cos_2'] }, w1),
        oneSin: cont({ frac: ['_1_3', 'v10', 'sin_3'] }, w1),
        oneCos: cont({ frac: ['_1_4', 'v11', 'cos_3'] }, w1),
        cosSin: cont({ frac: ['cos_4', 'v12', 'sin_4'] }, w1),
        tanSec: cont({ frac: ['tan_1', 'v13', 'sec_1'] }, w1),
        oneSec: cont({ frac: ['_1_5', 'v14', 'sec_2'] }, w1),
        tanOne: cont({ frac: ['tan_2', 'v15', '_1_6'] }, w1),
        secTan: cont({ frac: ['sec_3', 'v16', 'tan_3'] }, w1),
        secOne: cont({ frac: ['sec_4', 'v17', '_1_7'] }, w1),
        oneTan: cont({ frac: ['_1_8', 'v18', 'tan_4'] }, w1),
        oneCsc: cont({ frac: ['_1_9', 'v19', 'csc_1'] }, w1),
        cotCsc: cont({ frac: ['cot_1', 'v20', 'csc_2'] }, w1),
        oneCot: cont({ frac: ['_1_10', 'v21', 'cot_2'] }, w1),
        cscOne: cont({ frac: ['csc_3', 'v22', '_1_11'] }, w1),
        cscCot: cont({ frac: ['csc_4', 'v23', 'cot_3'] }, w1),
        cotOne: cont({ frac: ['cot_4', 'v24', '_1_12'] }, w1),
        sin: cont('sin_1', w1),
        cos: cont('cos_1', w1),
        tan: cont('tan_2', w1),
        sec: cont('sec_4', w1),
        cot: cont('cot_4', w1),
        csc: cont('csc_3', w1),
        sinTheta: cont(['sin_1', ' ', 'theta1'], w1),
        cosTheta: cont(['cos_1', ' ', 'theta2'], w1),
        tanTheta: cont(['tan_2', ' ', 'theta3'], w1),
        secTheta: cont(['sec_4', ' ', 'theta4'], w1),
        cotTheta: cont(['cot_4', ' ', 'theta5'], w1),
        cscTheta: cont(['csc_3', ' ', 'theta6'], w1),
        sinCosTheta: cont({ frac: [['sin_2', ' ', 'theta7'], 'v9', ['cos_2', ' ', 'theta8']] }, w1),
        oneSinTheta: cont({ frac: ['_1_3', 'v10', ['sin_3', ' ', 'theta9']] }, w1),
        oneCosTheta: cont({ frac: ['_1_4', 'v11', ['cos_3', ' ', 'theta10']] }, w1),
        oneTanTheta: cont({ frac: ['_1_8', 'v18', ['tan_4', ' ', 'theta11']] }, w1),
        c1: lin(['oppHyp', 'adjHyp', 'oppAdj', 'hypOpp', 'hypAdj', 'adjOpp']),

        c2_0: cont(lin(['eq1', '', '', '', '', '']), 0.3),
        c2_1: cont(lin(['eq1', 'eq2', '', '', '', '']), 0.3),
        c2_2: cont(lin(['eq1', 'eq2', 'eq3', '', '', '']), 0.3),
        c2_3: cont(lin(['eq1', 'eq2', 'eq3', 'eq4', '', '']), 0.3),
        c2_4: cont(lin(['eq1', 'eq2', 'eq3', 'eq4', 'eq5', '']), 0.3),
        c2_5: cont(lin(['eq1', 'eq2', 'eq3', 'eq4', 'eq5', 'eq6']), 0.3),
        c2d: cont(lin(['eq1', 'eq2', 'eq3', 'eq4', 'eq5', 'eq6']), 0.3),
        c2: cont(lin(['eq1', 'eq2', 'eq3', 'eq4', 'eq5', 'eq18']), 0.3),

        c5_00: lin(['sinOne', '', '', '', '', '']),
        c5_01: lin(['sin', '', '', '', '', '']),
        c5_02: lin(['sin', 'cosOne', '', '', '', '']),
        c5_03: lin(['sin', 'cos', '', '', '', '']),
        c5_04: lin(['sin', 'cos', 'sinCos', '', '', '']),
        c5_05: lin(['sin', 'cos', 'sinCos', 'oneSin', '', '']),
        c5_06: lin(['sin', 'cos', 'sinCos', 'oneSin', 'oneCos', '']),
        c5_07: lin(['sin', 'cos', 'sinCos', 'oneSin', 'oneCos', 'cosSin']),
        c5s: lin(['sin', 'cos', 'sinCos', 'oneSin', 'oneCos', s('cosSin', 1)]),
        // c5b: lin([b('sin', 1), b('cos', 2), b('sinCos', 3), b('oneSin', 4), b('oneCos', 5), 'cosSin']),
        c5d: lin(['sin', 'cos', 'sinCos', 'oneSin', 'oneCos', '']),
        c5: lin(['', '', 'sinCos', 'oneSin', 'oneCos', 'oneTan']),
        c5Theta: lin(['', '', 'sinCosTheta', 'oneSinTheta', 'oneCosTheta', 'oneTanTheta']),
        c5v: lin(['val1', 'val2', 'sinCos', 'oneSin', 'oneCos', 'oneTan']),

        c4_0: cont(lin(['eq7', '', '', '', '', '']), 0.3),
        c4_1: cont(lin(['eq7', 'eq8', '', '', '', '']), 0.3),
        c4_2: cont(lin(['eq7', 'eq8', 'eq9', '', '', '']), 0.3),
        c4_3: cont(lin(['eq7', 'eq8', 'eq9', 'eq10', '', '']), 0.3),
        c4_4: cont(lin(['eq7', 'eq8', 'eq9', 'eq10', 'eq11', '']), 0.3),
        c4_5: cont(lin(['eq7', 'eq8', 'eq9', 'eq10', 'eq11', 'eq12']), 0.3),
        c4d: cont(lin(['', '', 'eq9', '', 'eq11', '']), 0.3),
        c4: cont(lin(['', '', 'eq9', 'eq10', 'eq11', 'eq6']), 0.3),
        c4v: cont(lin(['eq7', 'eq8', 'eq9', 'eq10', 'eq11', 'eq6']), 0.3),

        c3_00: lin(['tanSec', '', '', '', '', '']),
        c3_01: lin(['tanSec', 'oneSec', '', '', '', '']),
        c3_02: lin(['tanSec', 'oneSec', 'tanOne', '', '', '']),
        c3_03: lin(['tanSec', 'oneSec', 'tan', '', '', '']),
        c3_04: lin(['tanSec', 'oneSec', 'tan', 'secTan', '', '']),
        c3_05: lin(['tanSec', 'oneSec', 'tan', 'secTan', 'secOne', '']),
        c3_06: lin(['tanSec', 'oneSec', 'tan', 'secTan', 'sec', '']),
        c3_07: lin(['tanSec', 'oneSec', 'tan', 'secTan', 'sec', 'oneTan']),
        // c3b: lin(['tanSec', 'oneSec', b('tan', 6), 'secTan', b('sec', 7), b('oneTan', 8)]),
        c3s: lin([s('tanSec', 2), s('oneSec', 3), 'tan', s('secTan', 4), 'sec', 'oneTan']),
        c3d: lin(['', '', 'tan', '', 'sec', 'oneTan']),
        c3: lin(['sin', 'cos', 'tan', 'csc', 'sec', 'cot']),
        c3Theta: lin(['sinTheta', 'cosTheta', 'tanTheta', 'cscTheta', 'secTheta', 'cotTheta']),

        c6_0: cont(lin(['eq13', '', '', '', '', '']), 0.3),
        c6_1: cont(lin(['eq13', 'eq14', '', '', '', '']), 0.3),
        c6_2: cont(lin(['eq13', 'eq14', 'eq15', '', '', '']), 0.3),
        c6_3: cont(lin(['eq13', 'eq14', 'eq15', 'eq16', '', '']), 0.3),
        c6_4: cont(lin(['eq13', 'eq14', 'eq15', 'eq16', 'eq17', '']), 0.3),
        c6_5: cont(lin(['eq13', 'eq14', 'eq15', 'eq16', 'eq17', 'eq18']), 0.3),
        c6d: cont(lin(['', '', '', 'eq16', '', 'eq18']), 0.3),
        c6v: cont(lin(['', '', 'eq15', 'eq16', 'eq17', 'eq13']), 0.3),

        c7_00: lin(['oneCsc', '', '', '', '', '']),
        c7_01: lin(['oneCsc', 'cotCsc', '', '', '', '']),
        c7_02: lin(['oneCsc', 'cotCsc', 'oneCot', '', '', '']),
        c7_03: lin(['oneCsc', 'cotCsc', 'oneCot', 'cscOne', '', '']),
        c7_04: lin(['oneCsc', 'cotCsc', 'oneCot', 'csc', '', '']),
        c7_05: lin(['oneCsc', 'cotCsc', 'oneCot', 'csc', 'cscCot', '']),
        c7_06: lin(['oneCsc', 'cotCsc', 'oneCot', 'csc', 'cscCot', 'cotOne']),
        c7_07: lin(['oneCsc', 'cotCsc', 'oneCot', 'csc', 'cscCot', 'cot']),
        // c7b: lin(['oneCsc', 'cotCsc', 'oneCot', b('csc', 9), 'cscCot', b('cot', 10)]),
        c7s: lin([s('oneCsc', 5), s('cotCsc', 6), s('oneCot', 7), 'csc', s('cscCot', 8), 'cot']),
        c7d: lin(['', '', '', 'csc', '', 'cot']),

        values: lin(['', '', 'val3', 'val4', 'val5', 'val6']),
      },
      formDefaults: {
        translation: {
          cot_4: { style: 'linear' },
          csc_3: { style: 'linear' },
        },
      },
      forms: {
        '00': ['c1'],
        '01': ['c1', 'c2_0', 'c3_00'],
        '02': ['c1', 'c2_1', 'c3_01'],
        '03': ['c1', 'c2_2', 'c3_02'],
        '04': ['c1', 'c2_2', 'c3_03'],
        // '05': ['c1', 'c2_3', 'c3_04'],
        // '06': ['c1', 'c2_4', 'c3_05'],
        // '07': ['c1', 'c2_4', 'c3_06'],
        '08': ['c1', 'c2_5', 'c3_07'],
        10: ['c1', 'c2_5', 'c3_07', 'c4_0', 'c5_00'],
        11: ['c1', 'c2_5', 'c3_07', 'c4_0', 'c5_01'],
        // 12: ['c1', 'c2_5', 'c3_07', 'c4_1', 'c5_02'],
        // 13: ['c1', 'c2_5', 'c3_07', 'c4_1', 'c5_03'],
        // 14: ['c1', 'c2_5', 'c3_07', 'c4_2', 'c5_04'],
        // 15: ['c1', 'c2_5', 'c3_07', 'c4_3', 'c5_05'],
        // 16: ['c1', 'c2_5', 'c3_07', 'c4_4', 'c5_06'],
        17: ['c1', 'c2_5', 'c3_07', 'c4_5', 'c5_07'],
        20: ['c1', 'c2_5', 'c3_07', 'c4_5', 'c5_07', 'c6_0', 'c7_00'],
        // 21: ['c1', 'c2_5', 'c3_07', 'c4_5', 'c5_07', 'c6_1', 'c7_01'],
        // 22: ['c1', 'c2_5', 'c3_07', 'c4_5', 'c5_07', 'c6_2', 'c7_02'],
        // 23: ['c1', 'c2_5', 'c3_07', 'c4_5', 'c5_07', 'c6_3', 'c7_03'],
        // 24: ['c1', 'c2_5', 'c3_07', 'c4_5', 'c5_07', 'c6_3', 'c7_04'],
        // 25: ['c1', 'c2_5', 'c3_07', 'c4_5', 'c5_07', 'c6_4', 'c7_05'],
        // 26: ['c1', 'c2_5', 'c3_07', 'c4_5', 'c5_07', 'c6_5', 'c7_06'],
        27: ['c1', 'c2_5', 'c3_07', 'c4_5', 'c5_07', 'c6_5', 'c7_07'],
        summaryStrike: ['c1', 'c2_5', 'c3s', 'c4_5', 'c5s', 'c6_5', 'c7s'],
        summaryDissapear: ['c1', 'c2d', 'c3d', 'c4d', 'c5d', 'c6d', 'c7d'],
        summary: {
          content: ['c1', 'c2', 'c3', 'c4', 'c5'],
          translation: {
            cot_4: { style: 'curve', direction: 'up', mag: 0.4 },
            csc_3: { style: 'curve', direction: 'up', mag: 0.4 },
            eq18: { style: 'curve', direction: 'up', mag: 0.4 },
          },
          duration: 2,
        },
        summaryTheta: ['c1', 'c2', 'c3Theta', 'c4', 'c5Theta'],
        noRatios: ['c3', 'c4', 'c5'],
        values: {
          content: ['c3', 'c4v', 'c5v', 'c6v', 'values'],
          alignment: { xAlign: '-0.4o' },
        },
        // c3: lin(['sin', 'cos', 'tan', 'csc', 'sec', 'cot'])
        // c4v: cont(lin(['eq7', 'eq8', 'eq9', 'eq10', 'eq11', 'eq6']), 0.3),
        // c5v: lin(['val1', 'val2', 'sinCos', 'oneSin', 'oneCos', 'oneTan']),
        // c6v: cont(lin(['', '', 'eq15', 'eq16', 'eq17', 'eq18']), 0.3),
        // values: lin(['', '', 'val3', 'val4', 'val5', 'val6']),
      },
      position: [-2.8, 1.2],
    },
  });
  const eqn2 = figure.getElement('eqn2');
  figure.fnMap.global.add('eqnColors', () => {
    eqn2.getElement('sin_1').setColor(colSin);
    eqn2.getElement('sin_2').setColor(colSin);
    eqn2.getElement('sin_3').setColor(colSin);
    eqn2.getElement('cos_1').setColor(colCos);
    eqn2.getElement('cos_2').setColor(colCos);
    eqn2.getElement('cos_3').setColor(colCos);
    eqn2.getElement('tan_2').setColor(colTan);
    eqn2.getElement('tan_4').setColor(colTan);
    eqn2.getElement('sec_4').setColor(colSec);
    eqn2.getElement('csc_3').setColor(colCsc);
    eqn2.getElement('cot_4').setColor(colCot);
    eqn2.getElement('val1').setColor(colSin);
    eqn2.getElement('val2').setColor(colCos);
    eqn2.getElement('val3').setColor(colTan);
    eqn2.getElement('val4').setColor(colCsc);
    eqn2.getElement('val5').setColor(colSec);
    eqn2.getElement('val6').setColor(colCot);
  });
  figure.fnMap.global.add('eqnColorsReset', () => {
    eqn2.getElement('sin_1').setColor(colText);
    eqn2.getElement('sin_2').setColor(colText);
    eqn2.getElement('sin_3').setColor(colText);
    eqn2.getElement('cos_1').setColor(colText);
    eqn2.getElement('cos_2').setColor(colText);
    eqn2.getElement('cos_3').setColor(colText);
    eqn2.getElement('tan_2').setColor(colText);
    eqn2.getElement('tan_4').setColor(colText);
    eqn2.getElement('sec_4').setColor(colText);
    eqn2.getElement('csc_3').setColor(colText);
    eqn2.getElement('cot_4').setColor(colText);
    eqn2.getElement('val1').setColor(colText);
    eqn2.getElement('val2').setColor(colText);
    eqn2.getElement('val3').setColor(colText);
    eqn2.getElement('val4').setColor(colText);
    eqn2.getElement('val5').setColor(colText);
    eqn2.getElement('val6').setColor(colText);
  });

  const t = (content, boxNum, rightSpace = 0.3) => ({
    tBox: {
      content, symbol: `t${boxNum}`, space: 0.25, rightSpace,
    },
  });
  figure.add({
    name: 'eqn3',
    method: 'equation',
    options: {
      elements: {
        eq1: '=',
        eq2: '=',
        eq3: '=',
        eq4: '=',
        eq5: '=',
        eq6: '=',
        eq7: '=',
        eq8: '=',
        eq9: '=',
        eq10: '=',
        eq11: '=',
        eq12: '=',
        eq13: '=',
        eq14: '=',
        eq15: '=',
        eq16: '=',
        eq17: '=',
        eq18: '=',
        v1: { symbol: 'vinculum' },
        v2: { symbol: 'vinculum' },
        v3: { symbol: 'vinculum' },
        v4: { symbol: 'vinculum' },
        v5: { symbol: 'vinculum' },
        v6: { symbol: 'vinculum' },
        v7: { symbol: 'vinculum' },
        v8: { symbol: 'vinculum' },
        v9: { symbol: 'vinculum' },
        v10: { symbol: 'vinculum' },
        sin_0: { style: 'normal' },
        sin_1: { style: 'normal', color: colSin },
        sin_2: { style: 'normal', color: colSin },
        sin_3: { style: 'normal', color: colSin },
        sin_4: { style: 'normal', color: colSin },
        cos_0: { style: 'normal' },
        cos_1: { style: 'normal', color: colCos },
        cos_2: { style: 'normal', color: colCos },
        cos_3: { style: 'normal', color: colCos },
        cos_4: { style: 'normal', color: colCos },
        tan_0: { style: 'normal' },
        tan_1: { style: 'normal', color: colTan },
        tan_2: { style: 'normal', color: colTan },
        cot_0: { style: 'normal' },
        cot_1: { style: 'normal', color: colCot },
        sec_0: { style: 'normal' },
        sec_1: { style: 'normal', color: colSec },
        csc_0: { style: 'normal' },
        csc_1: { style: 'normal', color: colCsc },
        opp_1: { text: 'opposite', color: colOpp, size: 0.2 },
        opp_2: { text: 'opposite', color: colOpp, size: 0.2 },
        opp_3: { text: 'opposite', color: colOpp, size: 0.2 },
        opp_4: { text: 'opposite', color: colOpp, size: 0.2 },
        adj_1: { text: 'adjacent', color: colAdj, size: 0.2 },
        adj_2: { text: 'adjacent', color: colAdj, size: 0.2 },
        adj_3: { text: 'adjacent', color: colAdj, size: 0.2 },
        adj_4: { text: 'adjacent', color: colAdj, size: 0.2 },
        hyp_1: { text: 'hypotenuse', color: colHyp, size: 0.2 },
        hyp_2: { text: 'hypotenuse', color: colHyp, size: 0.2 },
        hyp_3: { text: 'hypotenuse', color: colHyp, size: 0.2 },
        hyp_4: { text: 'hypotenuse', color: colHyp, size: 0.2 },
        hyp_5: { text: 'hypotenuse', color: colHyp, size: 0.2 },
        hyp_6: { text: 'hypotenuse', color: colHyp, size: 0.2 },
        theta1: { text: '\u03b8', color: colTheta },
        theta2: { text: '\u03b8', color: colTheta },
        theta3: { text: '\u03b8', color: colTheta },
        theta4: { text: '\u03b8', color: colTheta },
        theta5: { text: '\u03b8', color: colTheta },
        theta6: { text: '\u03b8', color: colTheta },
        theta7: { text: '\u03b8', color: colTheta },
        theta8: { text: '\u03b8', color: colTheta },
        theta9: { text: '\u03b8', color: colTheta },
        theta10: { text: '\u03b8', color: colTheta },
        theta11: { text: '\u03b8', color: colTheta },
        thetaVal1: { text: '0\u00b0', color: colTheta },
        thetaVal2: { text: '0\u00b0', color: colTheta },
        thetaVal3: { text: '0\u00b0', color: colTheta },
        thetaVal4: { text: '0\u00b0', color: colTheta },
        thetaVal5: { text: '0\u00b0', color: colTheta },
        thetaVal6: { text: '0\u00b0', color: colTheta },
        thetaVal7: { text: '0\u00b0', color: colTheta },
        thetaVal8: { text: '0\u00b0', color: colTheta },
        thetaVal9: { text: '0\u00b0', color: colTheta },
        thetaVal10: { text: '0\u00b0', color: colTheta },
        thetaVal11: { text: '0\u00b0', color: colTheta },
        s1: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
        s2: { symbol: 'strike', style: 'forward', lineWidth: 0.008 },
        val1: { text: '0.0000', color: colSin },
        val2: { text: '0.0000', color: colCos },
        val3: { text: '0.0000', color: colTan },
        val4: { text: '0.0000', color: colCsc },
        val5: { text: '0.0000', color: colSec },
        val6: { text: '0.0000', color: colCot },
        val7: { text: '0.0000' },
        val8: { text: '0.0000' },
        val9: { text: '0.0000' },
        val10: { text: '0.0000' },
        val11: { text: '0.0000' },
        val12: { text: '0.0000' },
        times1: ' \u00d7 ',
        times2: ' \u00d7 ',
        times3: ' \u00d7 ',
        times4: ' \u00d7 ',
        t1: { symbol: 'tBox' },
        t2: { symbol: 'tBox' },
        t3: { symbol: 'tBox' },
        t4: { symbol: 'tBox' },
        t5: { symbol: 'tBox' },
        t6: { symbol: 'tBox' },
        lb1: { symbol: 'bracket', side: 'left' },
        lb2: { symbol: 'bracket', side: 'left' },
        lb3: { symbol: 'bracket', side: 'left' },
        lb4: { symbol: 'bracket', side: 'left' },
        lb5: { symbol: 'bracket', side: 'left' },
        lb6: { symbol: 'bracket', side: 'left' },
        rb1: { symbol: 'bracket', side: 'right' },
        rb2: { symbol: 'bracket', side: 'right' },
        rb3: { symbol: 'bracket', side: 'right' },
        rb4: { symbol: 'bracket', side: 'right' },
        rb5: { symbol: 'bracket', side: 'right' },
        rb6: { symbol: 'bracket', side: 'right' },
      },
      phrases: {
        oppHyp: frac('opp_1', 'v1', 'hyp_1', 0.01, 0.03, 0.65),
        adjHyp: frac('adj_1', 'v2', 'hyp_2', 0.01, 0.03, 0.65),
        oppAdj: frac('opp_2', 'v3', 'adj_2', 0.01, 0.03, 0.65),
        hypOpp: frac('hyp_3', 'v4', 'opp_3', 0.01, 0.03, 0.65),
        hypAdj: frac('hyp_4', 'v5', 'adj_3', 0.01, 0.03, 0.65),
        adjOpp: frac('adj_4', 'v6', 'opp_4', 0.01, 0.03, 0.65),
        sinTheta: cont(['sin_1', ' ', 'theta1'], w1),
        cosTheta: cont(['cos_1', ' ', 'theta2'], w1),
        tanTheta: cont(['tan_1', ' ', 'theta3'], w1),
        cscTheta: cont(['csc_1', ' ', 'theta4'], w1),
        secTheta: cont(['sec_1', ' ', 'theta5'], w1),
        cotTheta: cont(['cot_1', ' ', 'theta6'], w1),
        sinThetaG: cont(['sin_0', ' ', 'theta1'], w1),
        cosThetaG: cont(['cos_0', ' ', 'theta2'], w1),
        tanThetaG: cont(['tan_0', ' ', 'theta3'], w1),
        cscThetaG: cont(['csc_0', ' ', 'theta4'], w1),
        secThetaG: cont(['sec_0', ' ', 'theta5'], w1),
        cotThetaG: cont(['cot_0', ' ', 'theta6'], w1),
        sinThetaT: cont(t(['sin_1', ' ', 'theta1'], 1, 1.5), w1),
        cosThetaT: cont(t(['cos_1', ' ', 'theta2'], 2, 1.5), w1),
        tanThetaT: cont(t(['tan_1', ' ', 'theta3'], 3, 2.2), w1),
        cscThetaT: cont(t(['csc_1', ' ', 'theta4'], 4, 2.2), w1),
        secThetaT: cont(t(['sec_1', ' ', 'theta5'], 5, 2.2), w1),
        cotThetaT: cont(t(['cot_1', ' ', 'theta6'], 6, 2.2), w1),
        sinHyp: ['hyp_1', 'times1', 'sinTheta'],
        cosHyp: ['hyp_2', 'times2', 'cosTheta'],
        sinTheta1: ['sin_2', ' ', 'theta7'],
        sinTheta2: ['sin_3', ' ', 'theta8'],
        cosTheta1: ['cos_2', ' ', 'theta9'],
        cosTheta2: ['cos_3', ' ', 'theta10'],
        tanTheta1: ['tan_2', ' ', 'theta11'],
        sinHcosH: {
          frac: [
            ['hyp_5', 'times3', 'sinTheta1'], 'v7', ['hyp_6', 'times4', 'cosTheta1'],
          ],
        },
        sinHcosHStrk: {
          frac: [
            [s('hyp_5', 1), 'times3', 'sinTheta1'], 'v7', [s('hyp_6', 2), 'times4', 'cosTheta1'],
          ],
        },
        sinOne: cont({ frac: ['sinTheta', 'v7', '_1_1'] }, w1),
        cosOne: cont({ frac: ['cosTheta', 'v7', '_1_1'] }, w1),
        tanOne: cont({ frac: ['tanTheta', 'v7', '_1_1'] }, w1),
        cscOne: cont({ frac: ['cscTheta', 'v7', '_1_1'] }, w1),
        secOne: cont({ frac: ['secTheta', 'v7', '_1_1'] }, w1),
        cotOne: cont({ frac: ['cotTheta', 'v7', '_1_1'] }, w1),
        sinCos: cont({ frac: ['sinTheta1', 'v7', 'cosTheta1'] }, w1),
        oneTan: cont({ frac: ['_1_1', 'v8', 'tanTheta1'] }, w1),
        oneSin: cont({ frac: ['_1_2', 'v9', 'sinTheta2'] }, w1),
        oneCos: cont({ frac: ['_1_3', 'v10', 'cosTheta2'] }, w1),
        sin: cont('sin_1', w1),
        cos: cont('cos_1', w1),
        tan: cont('tan_2', w1),
        sec: cont('sec_4', w1),
        cot: cont('cot_4', w1),
        csc: cont('csc_3', w1),
        f1: [{ sub: ['f_1', '_1'] }, { brac: ['lb1', 'theta1', 'rb1'] }],
        f2: [{ sub: ['f_2', '_2'] }, { brac: ['lb2', 'theta2', 'rb2'] }],
        f3: [{ sub: ['f_3', '_3'] }, { brac: ['lb3', 'theta3', 'rb3'] }],
        f4: [{ sub: ['f_4', '_4'] }, { brac: ['lb4', 'theta4', 'rb4'] }],
        f5: [{ sub: ['f_5', '_5'] }, { brac: ['lb5', 'theta5', 'rb5'] }],
        f6: [{ sub: ['f_6', '_6'] }, { brac: ['lb6', 'theta6', 'rb6'] }],

        c1: lin(['oppHyp', 'adjHyp', 'oppAdj', 'hypOpp', 'hypAdj', 'adjOpp']),
        c1_rearrange: lin(['opp_1', 'adj_1', 'oppAdj', 'hypOpp', 'hypAdj', 'adjOpp']),

        c2_0: cont(lin(['', '', 'eq3', '', '', '']), 0.3),
        c2_1: cont(lin(['', '', 'eq3', '', 'eq5', '']), 0.3),
        c2_2: cont(lin(['', '', 'eq3', '', 'eq5', 'eq6']), 0.3),
        c2_3: cont(lin(['', '', 'eq3', 'eq4', 'eq5', 'eq6']), 0.3),
        c2_4: cont(lin(['eq1', '', 'eq3', 'eq4', 'eq5', 'eq6']), 0.3),
        c2_5: cont(lin(['eq1', 'eq2', 'eq3', 'eq4', 'eq5', 'eq6']), 0.3),
        c2: cont(lin(['eq1', 'eq2', 'eq3', 'eq4', 'eq5', 'eq6']), 0.3),

        c3_00: lin(['', '', 'tanOne', '', '', '']),
        c3_01: lin(['', '', 'tanTheta', '', '', '']),
        c3_10: lin(['', '', 'tanTheta', '', 'secOne', '']),
        c3_11: lin(['', '', 'tanTheta', '', 'secTheta', '']),
        c3_20: lin(['', '', 'tanTheta', '', 'secTheta', 'cotOne']),
        c3_21: lin(['', '', 'tanTheta', '', 'secTheta', 'cotTheta']),
        c3_30: lin(['', '', 'tanTheta', 'cscOne', 'secTheta', 'cotTheta']),
        c3_31: lin(['', '', 'tanTheta', 'cscTheta', 'secTheta', 'cotTheta']),
        c3_40: lin(['sinOne', '', 'tanTheta', 'cscTheta', 'secTheta', 'cotTheta']),
        c3_41: lin(['sinTheta', '', 'tanTheta', 'cscTheta', 'secTheta', 'cotTheta']),
        c3_50: lin(['sinTheta', 'cosOne', 'tanTheta', 'cscTheta', 'secTheta', 'cotTheta']),
        c3_51: lin(['sinTheta', 'cosTheta', 'tanTheta', 'cscTheta', 'secTheta', 'cotTheta']),
        c3_r1: lin(['sinHyp', 'cosHyp', 'tanTheta', 'cscTheta', 'secTheta', 'cotTheta']),
        c3_r2: lin(['sinHyp', 'cosHyp', ['tanTheta', cont('eq7', w1), 'sinHcosH'], 'cscTheta', 'secTheta', 'cotTheta']),
        c3_r3: lin(['sinHyp', 'cosHyp', ['tanTheta', cont('eq7', w1), 'sinHcosHStrk'], 'cscTheta', 'secTheta', 'cotTheta']),
        c3_r4: lin(['sinHyp', 'cosHyp', ['tanTheta', cont('eq7', w1), 'sinCos'], 'cscTheta', 'secTheta', 'cotTheta']),
        c3_r5: lin(['sinTheta', 'cosTheta', ['tanTheta', cont('eq7', w1), 'sinCos'], 'cscTheta', 'secTheta', 'cotTheta']),
        c3t: lin(['sinThetaT', 'cosThetaT', 'tanThetaT', 'cscThetaT', 'secThetaT', 'cotThetaT']),

        c4_0: cont(lin(['', '', 'eq7', '', '', '']), 0.3),
        c4_1: cont(lin(['', '', 'eq7', 'eq8', '', '']), 0.3),
        c4_2: cont(lin(['', '', 'eq7', 'eq8', 'eq9', '']), 0.3),
        c4_3: cont(lin(['', '', 'eq7', 'eq8', 'eq9', 'eq10']), 0.3),
        c4: cont(lin(['eq11', 'eq12', 'eq7', 'eq8', 'eq9', 'eq10']), 0.3),

        c5_0: lin(['', '', 'sinCos']),
        c5_1: lin(['', '', 'sinCos', 'oneSin']),
        c5_2: lin(['', '', 'sinCos', 'oneSin', 'oneCos']),
        c5_3: lin(['', '', 'sinCos', 'oneSin', 'oneCos', 'oneTan']),
        c5_v: lin(['val1', 'val2', 'sinCos', 'oneSin', 'oneCos', 'oneTan']),

        c6: cont(lin(['', '', 'eq13', 'eq14', 'eq15', 'eq16']), 0.3),
        c7: cont(lin(['', '', 'val3', 'val4', 'val5', 'val6']), 0.3),

        r1: ['oppHyp', cont('eq1', 0.3), 'constant_1'],
        r2: [lin(['oppHyp', 'adjHyp'], 0.5), cont(lin(['eq1', 'eq2'], 0.5), 0.3), lin(['constant_1', 'constant_2'], 0.5)],
        rc: [lin(['constant_1', 'constant_2', 'constant_3', 'constant_4', 'constant_5', 'constant_6'], 0.5)],
        rVals: lin(['val7', 'val8', 'val9', 'val10', 'val11', 'val12']),
        r6: lin(['oppHyp', 'adjHyp', 'oppAdj', 'hypOpp', 'hypAdj', 'adjOpp'], 0.5),
        re: cont(lin(['eq1', 'eq2', 'eq3', 'eq4', 'eq5', 'eq6'], 0.5), 0.3),
        rFuncs: lin(['f1', 'f2', 'f3', 'f4', 'f5', 'f6']),
        rNames: lin(['sinThetaG', 'cosThetaG', 'tanThetaG', 'cscThetaG', 'secThetaG', 'cotThetaG']),
      },
      formDefaults: {
        translation: {
          hyp_1: { style: 'curve', direction: 'down', mag: 0.5 },
          hyp_2: { style: 'curve', direction: 'down', mag: 0.5 },
        },
      },
      forms: {
        r1Constant: 'r1',
        r2Constant: 'r2',
        rConstant: ['r6', 're', 'rc'],
        rValues: ['c1', 'c2', 'rVals'],
        rFunctions: ['c1', 'c2', 'rFuncs'],
        rNames: ['c1', 'c2', 'rNames'],
        0: ['c1'],
        1: ['c1', 'c2_0', 'c3_00'],
        2: ['c1', 'c2_0', 'c3_01'],
        3: ['c1', 'c2_1', 'c3_10'],
        4: ['c1', 'c2_1', 'c3_11'],
        5: ['c1', 'c2_2', 'c3_20'],
        6: ['c1', 'c2_2', 'c3_21'],
        7: ['c1', 'c2_3', 'c3_30'],
        8: ['c1', 'c2_3', 'c3_31'],
        9: ['c1', 'c2_4', 'c3_40'],
        10: ['c1', 'c2_4', 'c3_41'],
        11: ['c1', 'c2_5', 'c3_50'],
        12: ['c1', 'c2_5', 'c3_51'],
        13: ['c1_rearrange', 'c2_5', 'c3_r1'],
        14: ['c1_rearrange', 'c2_5', 'c3_r2'],
        15: ['c1_rearrange', 'c2_5', 'c3_r3'],
        16: ['c1_rearrange', 'c2_5', 'c3_r4'],
        17: ['c1', 'c2_5', 'c3_r5'],
        18: ['c1', 'c2_5', 'c3_51', 'c4_0', 'c5_0'],
        19: ['c1', 'c2_5', 'c3_51', 'c4_1', 'c5_1'],
        20: ['c1', 'c2_5', 'c3_51', 'c4_2', 'c5_2'],
        21: ['c1', 'c2_5', 'c3_51', 'c4_3', 'c5_3'],
        values: ['c3t', 'c4', 'c5_v', 'c6', 'c7'],
      },
      position: [-2.8, 1.2],
    },
    mods: {
      scenarios: {
        eqnTri: { position: [-2.3, 1.2] },
        eqnCirc: { position: [-2.8, 1.2] },
      },
    },
  });
  const eqn3 = figure.getElement('eqn3');
  const circ = figure.getElement('circ');
  const [sin, cos, tan] = circ.getElements(['sin', 'cosAlt', 'tanAlt']);
  const [csc, sec, cot] = circ.getElements(['cscAlt', 'secAlt', 'cotAlt']);
  const [t1, t2, t3, t4, t5, t6] = eqn3.getElements(['t1', 't2', 't3', 't4', 't5', 't6']);
  const makeOnClick = (phrases, elems, line, figElements) => () => {
    const elements = [...eqn3.getPhraseElements(phrases), ...elems];
    if (line.isShown) {
      circ.hide(figElements);
      eqn3.dim(elements);
    } else {
      circ.show(figElements);
      eqn3.undim(elements);
      circ._rotatorFull.fnMap.exec('updateCircle');
    }
  };
  t1.onClick = makeOnClick(
    ['sinTheta'], ['eq11', 'val1'], sin, ['sin', 'sinLabel'],
  );
  t2.onClick = makeOnClick(
    ['cosTheta'], ['eq12', 'val2'], cos, ['cosAlt', 'cosLabelAlt'],
  );
  t3.onClick = makeOnClick(
    ['tanTheta', 'sinCos'], ['eq7', 'eq13', 'val3'], tan, ['tanAlt', 'tanLabelAlt'],
  );
  t4.onClick = makeOnClick(
    ['cscTheta', 'oneSin'], ['eq8', 'eq14', 'val4'], csc, ['cscAlt', 'cscLabelAlt'],
  );
  t5.onClick = makeOnClick(
    ['secTheta', 'oneCos'], ['eq9', 'eq15', 'val5'], sec, ['secAlt', 'secLabelAlt'],
  );
  t6.onClick = makeOnClick(
    ['cotTheta', 'oneTan'], ['eq10', 'eq16', 'val6'], cot, ['cotAlt', 'cotLabelAlt'],
  );
}