// @flow
import {
  Point, Transform, parsePoint, getPoint, getTransform,
} from '../../tools/g2';
import { joinObjects, joinObjectsWithOptions } from '../../tools/tools';
// import { RGBToArray } from '../../tools/color';
import {
  FigureElementPrimitive, FigureElementCollection, FigureElement,
} from '../Element';
import {
  FigureFont,
} from '../DrawingObjects/TextObject/TextObject';
import type { ElementInterface } from './Elements/Element';
import { Elements } from './Elements/Element';
import BaseAnnotationFunction from './Elements/BaseAnnotationFunction';
import EquationForm from './EquationForm';
import type {
  TypeHAlign, TypeVAlign,
} from './EquationForm';
// import HTMLObject from '../DrawingObjects/HTMLObject/HTMLObject';
import * as html from '../../tools/htmlGenerator';
import EquationSymbols from './EquationSymbols';
import type { TypeSymbolOptions } from './EquationSymbols';
import { getFigureElement, EquationFunctions } from './EquationFunctions';
import type { TypeEquationPhrase } from './EquationFunctions';
import type { TypeEquationSymbolAngleBracket } from './Symbols/AngleBracket';
import type { TypeEquationSymbolArrowBracket } from './Symbols/Arrow';
import type {
  TypeColor, OBJ_Font,
} from '../../tools/types';
import type {
  TypeParsablePoint,
} from '../../tools/g2';
import type { OBJ_TriggerAnimationStep } from '../Animation/Animation';
import { AnimationManager, TriggerAnimationStep } from '../Animation/Animation';


// Priority:
//   1. symbol
//   2. text

/**
 * Definition of a text or symbol equation element. Symbol properties take
 * receive priority over text properties, so if 'symbol' is defined, then 'text'
 * will be ignored.
 * @property {string} [text] - Text element only
 * @property {FigureFont} [font] - Text element only
 * @property {'italic' | 'normal'} [style] - Text element only
 * @property {string} [symbol] - Symbol element only
 * @property {'top' | 'left' | 'bottom' | 'right'} [side] - Symbol element only
 * @property {object} [mods] - Properties to set on instantiated element
 * @property {TypeColor} [color] - Color to set the element
 */

export type TypeEquationTextElement = string | {
    text?: string;
    font?: FigureFont | OBJ_Font;
    style?: 'italic' | 'normal' | null;
    weight?: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
    size?: number,
    color?: TypeColor;
    mods?: Object;
  } | FigureElementPrimitive | FigureElementCollection;

export type TypeEquationElement = string
  | FigureElementPrimitive
  | FigureElementCollection
  | TypeEquationTextElement
  | TypeEquationSymbolAngleBracket
  | TypeEquationSymbolArrowBracket;


/**
 * Object with multiple equation elements.
 */
export type TypeEquationElements = {
  [elementName: string]: TypeEquationElement;
};

// type TypeFormAlignment = {
//   fixTo?: Point | string,
//   xAlign?: TypeHAlign | null,
//   yAlign?: TypeVAlign | null,
// };

/**
 * Defines how to align a form
 */
type TypeFormAlignment = {
  fixTo: FigureElementPrimitive | FigureElementCollection | Point;
  xAlign: TypeHAlign;
  yAlign: TypeVAlign;
};

/**
 * Form translation properties
 *
 * @property {'curved' | 'linear'} style - element should move in a straight
 * line, or through a curve. Default: `"linear"`
 * @property {'up' | 'down'} [direction] - curve only - element should move
 * through an up or down curve
 * @property {number} [mag] - the magnitude of the curve
 */
type TypeFormTranslationProperties = {
  style: 'curved' | 'linear',
  direction?: 'up' | 'down',
  mag: number,
};

/**
 * Duration and translation options for form animation
 *
 * @property {number} [duration] in seconds
 * @property {Object.<TypeFormTranslationProperties>} [translation]
 * @example
 * // for an equation with two of its elements named 'a' and 'b'
 * {
 *   duration: 1,
 *   translation: {
 *     a: {
 *       direction: 'up',
 *       style: 'curved',
 *       mag: 0.5,
 *     },
 *     b: {
 *       direction: 'down',
 *       style: 'curved',
 *       mag: 0.2,
 *     },
 *   },
 * }
 * // Note, not all elements need to be defined - only those that need a custom
 * duration or shouldn't have a linear path
 */
type TypeFormAnimationProperties = {
  duration?: ?number,
  translation?: {
    [elementName: string]: TypeFormTranslationProperties,
  },
}

// A form is a steady state arrangement of elements
// A form's elements can have different properties, but these properties
// are generally the same independent on which form was shown before the
// current form.
// The only exception is the translation movement properties, which can be
// different depending on whether you are going to the current form from
// the previous one, or two the next one.

/**
 * In mathematics, an equation form is a specific arrangement of an equation's
 * terms and operators. Different forms will have different arrangements, that
 * that can be achieved by performing a series of operations to both sides of
 * the equation.
 *
 * For instance, the equation:
 *
 * a + b = c
 *
 * can be rearranged to a different form:
 *
 * a = c - b
 *
 * From the figure's perspective, a form is a specific layout of equation
 * elements.
 *
 * This object defines a how the elements are laid out, what properties the
 * elements have, and some animation properties for when animating to this form.
 *
 * In the {@link Equation} object, forms are defined with form names, and
 * subForm names. Most of the time, the subForm name can be ignored.
 * However, it is useful when dealing with units. Sometimes you will have a
 * series of forms you want to animate through, that will be slightly different
 * depending on the units (for example degrees vs radians). Defining one subForm
 * as degrees, and a second as radians allows switching between subForms without
 * complicating the overall equation navigation logic.
 *
 * See the examples below for how to define subForms.
 *
 * {@link Equation#addForms}.
 *
 * @property {TypeEquationPhrase} content - the equation phrase of the form
 * defines how the elements are laid out
 * @property {number} [scale] - a scaling factor for this form
 * @property {TypeFormAlignment} [alignment] - how the Equation's position is aligned with
 * this form
 * @property {string} [subForm] - subForm name - default: `"base"`
 * @property {string} [description] - a description associated with this form -
 * used in equation navigator elements (@EquationNavigator)
 * @property {object} [modifiers] - string modifiers for the description
 * @property {TypeFormAnimationProperties} [fromPrev] - form animation
 * properties if animating forward from the previous form in a formSeries
 * @property {TypeFormAnimationProperties} [fromNext] - form animation
 * properties if animating backward from the next form in a formSeries
 * @property {TypeFormAnimationProperties} [duration] - animation move duration
 *  (fromNext and fromPrev are prioritized over this)
 * @property {TypeFormTranslationProperties} [translation] - animation move
 * style (fromNext and fromPrev are prioritized over this)
 * @property {object} [elementMods] - properties to set in the equation element
 * (@FigureElementPrimitive) when this form is shown
 *
 * @example
 * // Simple form definition of two different forms of the same equation and one
 * // of the elements is colored blue in one form and red in the other
 * forms: {
 *   form1: {
 *     content: ['a', 'plus', 'b', 'equals', 'c'],
 *     elementMods: {
 *       'a': { color: [0, 0, 1, 1] },
 *     }
 *   },
 *   form2: {
 *     content: ['a', 'equals', 'c', 'minus', 'b'],
 *     elementMods: {
 *       'a': { color: [1, 0, 0, 1] },
 *     }
 *   },
 * }
 *
 * @example
 * // Example using subForms all defined at once
 * forms: {
 *   form1: {
 *     deg: ['a', 'deg'],
 *     rad: ['a', 'rad'],
 *   },
 * }
 *
 * @example
 * // Example using subForms all defined separately
 * const eqn = new Equation();
 * eqn.addForms({
 *   deg: {
 *     content: ['a', 'deg'],
 *     subForm:'deg',
 *   }
 * });
 * eqn.addForms({
 *   rad: {
 *     content: ['a', 'rad'],
 *     subForm:'rad',
 *   }
 * });
 * @example
 * // Example showing all form options
 * forms: {
 *   form1: {
 *     content: ['a', 'b', 'c'],
 *     subForm: 'deg',
 *     scale: 1.2,
 *     alignment: {
 *       fixTo: 'b',
 *       xAlign: 'center',
 *       yAlign: 'bottom',
 *     },
 *     description: '|Form| 1 |description|',
 *     modifiers: {
 *       Form: html.highlight([1, 0, 0, 0]),
 *     },
 *     elementMods: {
 *       a: {
 *         color: color1,
 *         isTouchable: true,
 *       },
 *     },
 *     duration: 1,
 *     translation: {
 *       a: {
 *         style: 'curved',
 *         direction: 'up',
 *         mag: 0.95,
 *       },
 *       b: ['curved', 'down', 0.45],
 *     },
 *     fromPrev: {
 *       duration: null,
 *       translation: {
 *         a: ['curved', 'down', 0.2],
 *         b: ['curved', 'down', 0.2],
 *       },
 *     },
 *     fromNext: {
 *       duration: 2,
 *       translation: {
 *         a: ['curved', 'down', 0.2],
 *         b: ['curved', 'down', 0.2],
 *       },
 *     },
 *   },
 * }
 */
type TypeEquationFormObject = {
  content: TypeEquationPhrase,
  scale?: number,
  alignment?: TypeFormAlignment,
  subForm?: string,
  description?: string,           // For equation navigation
  modifiers?: {},                 // Modifiers for description
  // First Priority
  // fromPrev?: TypeFormAnimationProperties,
  // fromNext?: TypeFormAnimationProperties,
  // Last Priority
  animation?: {
    duration?: ?number,               // null means to use velocity
    translation?: TypeFormTranslationProperties,
  },
  elementMods?: {
    [elementName: string]: Object
  },
};

/**
 * A single form definition can either be:
 *
 * * an equation phrase {@link TypeEquationPhrase}
 * * or an equation form object {@link TypeEquationFormObject}
 * * or an object of subforms:
 *
 *    {
 *       subform1: ({@link TypeEquationPhrase} | {@link TypeEquationFormObject}),
 *       subform2: ...
 *    },
 *
 * @type {TypeEquationPhrase | TypeEquationFormObject |
 *   Object.<TypeEquationFormObject | TypeEquationPhrase>}
 */
type TypeEquationForm = TypeEquationPhrase
                        | TypeEquationFormObject
                        | {
                          [subFormName: string]: TypeEquationFormObject
                                                 | TypeEquationPhrase;
                        };

/**
 * An object of equation forms where each key is the form name and each value
 * is a form defintion {@link TypeEquationForm}
 *
 * @type {Object.<TypeEquationForm>}
 */
export type TypeEquationForms = {
  [formName: string]: TypeEquationForm
};

/**
 * When an equation form series is restarted, or cycled back to the first form
 * in the series, then two special animations can be defined with this object:
 * * `moveFrom`: the equation will move from a location (usually another equation of the same form)
 * * `pulse`: An element will be pulsed when the animation is finished.
 *
 * The default values in the pulse object are are:
 * * `duration`: 1s
 * * `scale`: 1.1
 */
type TypeFormRestart = {
  formRestart?: {
    moveFrom?: ?Point | FigureElementCollection;
    pulse?: {
      duration?: number;
      scale?: number;
      element?: ?FigureElement;
    }
  }
}

/**
 * {@link NextFormAnimationStep} options object.
 *
 * `OBJ_TriggerAnimationStep & OBJ_EquationGoToForm`
 *
 * Duration will be automatically calculated (unless duration is set to 0).
 * To specify it exactly, the `duration`, `dissolveOutTime`, `dissolveInTime`
 * and `blankTime` must all be specified (or at least the ones that will be used
 * in the form change).
 *
 * @extends OBJ_TriggerAnimationStep
 * @extends OBJ_EquationGoToForm
 *
 * @see {@link Equation}, {@link NextFormAnimationStep}
 */
export type OBJ_NextFormAnimationStep = {
} & OBJ_TriggerAnimationStep;

/**
 * {@link GoToFormAnimationStep} options object.
 *
 * `OBJ_TriggerAnimationStep & OBJ_EquationGoToForm & { start?: 'string', target?: 'string'}`
 *
 * Duration will be automatically calculated (unless duration is set to 0).
 * To specify it exactly, the `duration`, `dissolveOutTime`, `dissolveInTime`
 * and `blankTime` must all be specified (or at least the ones that will be used
 * in the form change).
 *
 * The `form` property of OBJ_EquationGoToForm is not used. Use `target`
 * instead.
 *
 * @extends OBJ_TriggerAnimationStep
 * @extends OBJ_EquationGoToForm
 *
 * @property {string} [start] form to start from. If undefined, then current
 * form will be used
 * @property {string} [target] form to go to. If undefined, then current
 * form will be used
 *
 * @see {@link Equation}
 */
export type OBJ_GoToFormAnimationStep = {
  start?: string,
  target?: string,
} & OBJ_TriggerAnimationStep;


/**
 * Options objects to construct an {@link Equation} class. All properties are optional.
 *
 * @property {TypeColor} [color] - default: [0.5, 0.5, 0.5, 1]
 * @property {number} [scale] - default: 0.7
 * @property {TypeEquationElements} [elements] - default: {}
 * @property {TypeFormAlignment} [defaultFormAlignment] - default:
 * { fixTo: new {@link Point}(0, 0), xAlign: 'left', yAlign: 'baseline}
 * @property {TypeEquationForms} [forms] - default: {}
 * @property {Array<string> | Object.<Array<string>>} [formSeries] - an object
 * with each key being a form series name, and each value an array for form
 * names. If defined as an array, then a form series object is created where
 * the form series name is 'base'. Default: {}
 * @property {string} [defaultFormSeries] - If more than one form series is
 * defined, then a default must be chosen to be the first current one. Default:
 * first form defined
 * @property {TypeFormRestart} [formRestart] - default: null
 * @property {FigureFont} [font] - default {@link FigureFont}('Times
 * New Roman', 'normal', 0.2, '200', 'left', 'alphabetic', color)
 * @property {Point} [position] - default: new {@link Point}(0, 0)
 */
export type EQN_Equation = {
  color?: TypeColor;
  scale?: number,
  elements?: TypeEquationElements;
  // defaultFormAlignment?: TypeFormAlignment;
  formDefaults: {
    alignment?: TypeFormAlignment,
    elementMods: {
      [elementName: string]: Object,
    },
    animation: TypeFormAnimationProperties;
  };
  forms?: TypeEquationForms;
  formSeries?: Array<string> | {};
  defaultFormSeries?: string;
  formRestart?: TypeFormRestart;
  font?: FigureFont | OBJ_Font;
  position?: Point;
  transform?: Transform;
};

/**
 * Options object for {@link Equation#goToForm}.
 *
 * Often, `goToForm` is called to animate from a shown form to a desired form.
 * Therefore there will be some equation elements that:
 * * Are currently shown, but need to be hidden as they are not in the desired form
 * * Are currently shown, are in the desired form, and need to be moved to the
 *   correct layout position for the desired form
 * * Are currently hidden and need to be shown in the desired form
 *
 * The order that elements are shown, hidden and moved is defined by the
 * `animate` property:
 * * `'move'`: Dissolve out elements to hide, move existing elements to new,
 * dissolve in elements that need to be shown
 * * `'dissolveInThenMove'`: Dissolve out the elements to hide, dissolve in the
 * elements that need to be shown in the correct locations of the form, then
 * move existing elements to their correct locations
 * * `'dissolve'`: Dissolve out the entire current form, and then dissolve in the entire new form
 * * `'moveFrom'`: Shows the desired form at the position defined in the
 * formRestart property of {@link EQN_Equation}, then moves it to the
 * current location
 * * `'pulse'`: Same as `'dissolve'`, but once finished will pulse the element
 *  defined in the pulse object in the formRestart property of {@link EQN_Equation}
 *
 * If a form is already animating, then the `ifAnimating` property will define
 * the behavior of the animation:
 * * `cancelGoTo: true`, `skipToTarget: true`: Current animation will skip to
 *   the end, and current goTo call will be cancelled
 * * `cancelGoTo: true`, `skipToTarget: false`: Current animation will stop in
 *   its current state, and current goTo call will be cancelled
 * * `cancelGoTo: false`, `skipToTarget: true`: Current animation will skip to
 *   the end, and current goTo call will then be executed
 * * `cancelGoTo: false`, `skipToTarget: false`: Current animation will stop in
 *   its current state, and current goTo call will be executed
 *
 * @property {string} [name] - form name to goto
 * @property {number} [index] - form index to goto (can be used instead of name)
 * @property {'move' | 'dissolve' | 'moveFrom' | 'pulse' |
 *  'dissolveInThenMove'} [animate] - default: `"dissolve"`
 * @property {number} [delay] - delay before goto start. Default: `0`
 * @property {number} [dissolveOutTime] - Default: 0.4 of duration, or 0.4s if
 * no duration
 * @property {number} [duration] - animation duration. Default: `null`
 * @property {number} [blankTime] - time between dissolve out and dissolve in
 * when animating with `dissolve` or `pulse`. Default: 0.2 of duration, or 0.2s
 * if no duration
 * @property {number} [dissolveInTime] - Default: 0.4 of duration, or 0.4s if
 * no duration
 * @property {boolean} [prioritizeFormDuration] - use duration from the form
 * definition {@link TypeEquationFormObject}. Default: `true`
 * @property {'fromPrev' | 'fromNext'} [fromWhere] - prioritze *fromPrev* or
 * *fromNext* duration from the form definition. {@link TypeEquationFormObject}
 * Default: `null`
 * @property {{cancelGoTo?: boolean, skipToTarget?: boolean}} [ifAnimating] -
 * behavior for if currently animating between forms. Default:
 * `skipToTarget: true`, `cancelGoTo: true`
 * @property {?() => void} [callback] - call when goto finished
 */
type OBJ_EquationGoToForm = {
  name?: string,
  index?: number,
  animate?: 'move' | 'dissolve' | 'moveFrom' | 'pulse' | 'dissolveInThenMove',
  delay?: number,
  dissolveOutTime?: number,
  duration?: ?number,
  dissolveInTime?: number,
  blankTime?: number,
  prioritizeFormDuration?: boolean,
  fromWhere?: string | null,
  ifAnimating?: {
    cancelGoTo?: boolean;
    skipToTarget?: boolean;
  },
  callback?: ?(string | (() => void)),
}


/**
 * Next form animation step
 *
 * ![](./apiassets/nextformanimationstep.gif)
 *
 * Animation step that animates to the next equation form in a formSeries.
 * Equivalent to a triggering a
 * <a href="#equationnextform">Equation.nextForm</a> call.
 *
 * This animation step is only available in {@link Equation}.
 *
 * @extends TriggerAnimationStep
 * @param {OBJ_NextFormAnimationStep} options
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * // Example showing both ways to access GoToForm animation step
 * figure.addElement({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: { times: ' \u00D7', equals: ' = ' },
 *     forms: {
 *       0: ['a', 'equals', 'b', 'times', ' ', '_1'],
 *       1: ['a', 'equals', 'b', 'times', { strike: [[' ', '_1'], 'strike'] }],
 *       2: ['a', 'equals', 'b'],
 *     },
 *     formSeries: ['0', '1', '2'],
 *   },
 * });
 * const e = figure.getElement('eqn');
 * e.showForm('0');
 * e.animations.new()
 *   .delay(2)
 *   .inParallel([
 *     e.animations.nextForm({ animate: 'move', duration: 1 }),
 *     e._times.animations.dim({ duration: 1 }),
 *     e.__1.animations.dim({ duration: 1 }),
 *   ])
 *   .delay(1)
 *   .nextForm({ animate: 'move', duration: 1 })
 *   .start();
 */
// eslint-disable-next-line no-unused-vars
class NextFormAnimationStep extends TriggerAnimationStep {
}

/**
 * GoToForm form animation step
 *
 * ![](./apiassets/gotoformanimationstep.gif)
 *
 * Animation step that animates moving between equation forms. Equivalent to
 * a triggering a <a href="#equationgotoform">Equation.goToForm</a> call.
 *
 * This animation step is only available in {@link Equation}.
 *
 * @extends TriggerAnimationStep
 * @param {OBJ_GoToFormAnimationStep} options
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @example
 * // Example showing both ways to access GoToForm animation step
 * figure.addElement({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: { times: ' \u00D7', equals: ' = ' },
 *     forms: {
 *       0: ['a', 'equals', 'b', 'times', ' ', '_1'],
 *       1: ['a', 'equals', 'b', 'times', { strike: [[' ', '_1'], 'strike'] }],
 *       2: ['a', 'equals', 'b'],
 *     }
 *   },
 * });
 * const e = figure.getElement('eqn');
 * e.showForm('0');
 * e.animations.new()
 *   .delay(2)
 *   .inParallel([
 *     e.animations.goToForm({ target: '1', animate: 'move' }),
 *     e._times.animations.dim({ duration: 1 }),
 *     e.__1.animations.dim({ duration: 1 }),
 *   ])
 *   .delay(1)
 *   .goToForm({ target: '2', animate: 'move' })
 *   .start();
 */
// eslint-disable-next-line no-unused-vars
class GoToFormAnimationStep extends TriggerAnimationStep {
}

// export const foo = () => {};
// An Equation is a collection of elements that can be arranged into different
// forms.
// Equation allows setting of forms, and navigating through form series
// Eqn manages different forms of the

/**
 * An Equation is a collection of elements that can be arranged into different
 * forms.
 *
 * `Equation` should be instantiated from an *object definition*, or from
 * the `figure.primitives.equation` method.
 *
 * Equation includes two additional animation steps in {@link Equation.animations}:
 * * {@link GoToFormAnimationStep}
 * * {@link NextFormAnimationStep}
 *
 * @extends FigureElementCollection
 *
 * @see To test examples, append them to the
 * <a href="#equation-boilerplate">boilerplate</a>
 *
 * @param {EQN_Equation} options
 * @example
 * // Create with options definition
 * figure.addElement({
 *   name: 'eqn',
 *   method: 'equation',
 *   options: {
 *     elements: {
 *       a: 'a',
 *       b: { color: [0, 0, 1, 1] },
 *       c: 'c',
 *       equals: ' = ',
 *       plus: ' + ',
 *     },
 *     forms: {
 *       1: ['a', 'equals', 'b', 'plus', 'c'],
 *     },
 *   },
 * });
 * // `eqn` is the instance of `Equation`
 * const eqn = figure.elements._eqn;
 * eqn.showForm('1');
 *
 * @example
 * // Create with methods
 * const eqn = figure.primitives.equation();
 * eqn.addElements({
 *   a: 'a',
 *   b: { color: [0, 0, 1, 1] },
 *   c: 'c',
 *   equals: ' = ',
 *   plus: ' + ',
 * });
 * eqn.addForms({
 *   1: ['a', 'equals', 'b', 'plus', 'c'],
 * });
 * figure.add('eqn', eqn);
 * eqn.showForm('1');
 */
// $FlowFixMe
export class Equation extends FigureElementCollection {
  /**
   * Equation parameters and functions
   * @property {EquationFunctions} functions - equation functions
   */
  eqn: {
    // forms: { [formName: string]: {
    //     base: EquationForm;                   // There is always a base form
    //     [subFormName: string]: EquationForm;  // Sub forms may differ in units
    //     name: string;                         // Name of form
    //   }
    // };
    forms: {
      [formName: string]: EquationForm;
    };

    functions: EquationFunctions;
    symbols: EquationSymbols;
    currentForm: string;
    // currentSubForm: string;
    font: FigureFont;
    // fontText: FigureFont;
    scale: number;

    // subFormPriority: Array<string>,

    // formSeries: { [seriesName: String]: Array<EquationForm> };
    formSeries: { [string]: Array<string> };
    currentFormSeries: Array<string>;
    currentFormSeriesName: string;

    //
    // defaultFormAlignment: {
    //   fixTo: FigureElementPrimitive | FigureElementCollection | Point;
    //   xAlign: TypeHAlign;
    //   yAlign: TypeVAlign;
    // };

    formDefaults: {
      alignment: TypeFormAlignment,
      elementMods: {
        [elementName: string]: Object,
      },
    } & TypeFormAnimationProperties;

    isAnimating: boolean;

    descriptionElement: FigureElementPrimitive | null;
    descriptionPosition: Point;

    formRestart: ?{
      moveFrom?: Point | FigureElementCollection;
      pulse?: {
        duration: number;
        scale: number;
        element: FigureElement;
      }
    }
    // formRestartPosition: ?Point | FigureElementCollection;
    // formRestartAnimation: 'dissolve' | 'moveFrom' | 'pulse';
  };

  /**
   * {@link AnimationManager} extended to include additional animation steps
   * specific to equations
   * @property {NextFormAnimationStep} nextForm
   * @property {GoToFormAnimationStep} goToForm
   * @extends AnimationManager
   */
  animations: {
    nextForm: (OBJ_NextFormAnimationStep) => TriggerAnimationStep,
    goToForm: (OBJ_GoToFormAnimationStep) => TriggerAnimationStep,
  } & AnimationManager;

  // isTouchDevice: boolean;
  // animateNextFrame: void => void;
  shapes: Object;

  getCurrentForm: () => ?EquationForm;

  /**
   * @hideconstructor
   */
  constructor(
    shapes: Object,
    options: EQN_Equation = {},
  ) {
    let { color } = options;
    if (color == null) {
      color = [1, 0, 0, 1];
    }
    const defaultFont = {
      family: 'Times New Roman',
      style: 'normal',
      size: 0.2,
      weight: '200',
      color,
    };
    const defaultOptions = {
      color,
      position: new Point(0, 0),
      scale: 0.7,
      formDefaults: {
        alignment: {
          fixTo: new Point(0, 0),
          xAlign: 'left',
          yAlign: 'baseline',
        },
        elementMods: {},
      },
      elements: {},
      forms: {},
      formSeries: {},
      formRestart: null,
      limits: shapes.limits,
      transform: new Transform('Equation').scale(1, 1).rotate(0).translate(0, 0),
    };

    const optionsToUse = joinObjectsWithOptions({ except: ['font'] }, {}, defaultOptions, options);
    if (options.font instanceof FigureFont) {
      optionsToUse.font = options.font;
    } else if (options.font != null) {
      optionsToUse.font = new FigureFont(
        joinObjects({}, defaultFont, options.font),
      );
    } else {
      optionsToUse.font = new FigureFont(defaultFont);
    }
    if (optionsToUse.transform != null) {
      optionsToUse.transform = getTransform(optionsToUse.transform);
    }

    optionsToUse.formDefaults.alignment.fixTo = parsePoint(
      optionsToUse.formDefaults.alignment.fixTo,
      optionsToUse.formDefaults.alignment.fixTo,
    );
    // optionsToUse.defaultFormAlignment.fixTo = parsePoint(
    //   optionsToUse.defaultFormAlignment.fixTo,
    //   optionsToUse.defaultFormAlignment.fixTo,
    // );
    if (optionsToUse.formRestart != null
      && optionsToUse.formRestart.pulse != null) {
      optionsToUse.formRestart.pulse = joinObjects({}, {
        scale: 1.1,
        duration: 1,
      }, optionsToUse.formRestart.pulse);
    }

    super(optionsToUse);
    // if (optionsToUse.transform != null) {
    //   this.setTransform(getTransform(optionsToUse.transform));
    // }
    this.shapes = shapes;
    this.setColor(optionsToUse.color);
    // this.isTouchDevice = isTouchDevice;
    // this.animateNextFrame = animateNextFrame;

    // Set default values
    this.eqn = {
      forms: {},
      currentForm: '',
      // currentSubForm: '',
      // subFormPriority: ['base'],
      formSeries: { base: [] },
      currentFormSeries: [],
      currentFormSeriesName: '',
      scale: optionsToUse.scale,
      // defaultFormAlignment: optionsToUse.defaultFormAlignment,
      formDefaults: {
        alignment: optionsToUse.formDefaults.alignment,
        elementMods: optionsToUse.formDefaults.elementMods,
        animation: optionsToUse.formDefaults.animation,
      },
      functions: new EquationFunctions(
        this.elements,
        this.addElementFromKey.bind(this),
        this.getExistingOrAddSymbol.bind(this),
      ),
      symbols: new EquationSymbols(this.shapes, this.color),
      font: optionsToUse.font,
      // fontText: optionsToUse.fontText,
      isAnimating: false,
      descriptionElement: null,
      descriptionPosition: new Point(0, 0),
      formRestart: optionsToUse.formRestart,
    };

    if (optionsToUse.elements != null) {
      this.addElements(optionsToUse.elements);
    }

    if (optionsToUse.phrases != null) {
      this.addPhrases(optionsToUse.phrases);
    }

    if (optionsToUse.forms != null) {
      this.addForms(optionsToUse.forms);
    }

    if (optionsToUse.formSeries != null) {
      if (Array.isArray(optionsToUse.formSeries)) {
        this.eqn.formSeries = { base: optionsToUse.formSeries };
        this.eqn.currentFormSeries = this.eqn.formSeries.base;
        this.eqn.currentFormSeriesName = 'base';
      } else {
        this.eqn.formSeries = optionsToUse.formSeries;
        if (optionsToUse.defaultFormSeries != null) {
          this.setFormSeries(optionsToUse.defaultFormSeries);
        } else {
          this.setFormSeries(Object.keys(this.eqn.formSeries)[0]);
        }
      }
    }

    this.animations.goToForm = (...opt) => {
      const o = joinObjects({}, {
        element: this,
        duration: 1,
      }, ...opt);
      if (o.callback != null) {
        o.done = o.callback;
      }
      o.callback = () => {
        const currentForm = this.getCurrentForm();
        if (currentForm != null) {
          if (o.start == null) {
            o.start = currentForm.name;
          }
          if (o.target == null) {
            o.target = currentForm.name;
          }
        }
        this.showForm(o.start);
        this.goToForm(joinObjects({}, o, {
          form: o.target,
          callback: null,
          delay: 0,
        }));
        return this.getRemainingAnimationTime(['_Equation', '_EquationColor']);
      };
      return new TriggerAnimationStep(o);
    };
    this.animations.customSteps.push({
      step: this.animations.goToForm.bind(this),
      name: 'goToForm',
    });

    this.animations.nextForm = (...opt) => {
      const o = joinObjects({}, {
        element: this,
        duration: 1,  // need a non zero duration so trigger can incorporate the new duration
      }, ...opt);
      if (o.callback != null) {
        o.done = o.callback;
      }
      o.callback = () => {
        this.nextForm(joinObjects({}, o, {
          callback: null,
          delay: 0,
        }));
        return this.getRemainingAnimationTime(['_Equation', '_EquationColor']);
      };
      return new TriggerAnimationStep(o);
    };
    this.animations.customSteps.push({
      step: this.animations.nextForm.bind(this),
      name: 'nextForm',
    });
  }

  _getStateProperties(options: Object) {  // eslint-disable-line class-methods-use-this
    return [...super._getStateProperties(options),
      'eqn.currentForm',
      // 'eqn.currentSubForm',
      'eqn.isAnimating',
      'eqn.currentFormSeries',
      'eqn.currentFormSeriesName',
    ];
  }

  _getStatePropertiesMin() {
    return [
      ...super._getStatePropertiesMin(),
      'eqn.currentForm',
      // 'eqn.currentSubForm',
    ];
  }

  // animateToState(
  //   state: Object,
  //   options: Object,
  //   independentOnly: boolean = false,
  //   // countStart: () => void,
  //   // countEnd: () => void,
  // ) {
  //   super.animateToState(state, options, independentOnly);
  //   if (this.eqn.currentForm !== state.eqn.currentForm) {
  //     // countStart();
  //     this.goToForm({ name: state.eqn.currentForm, callback: countEnd });
  //   }
  // }

  /**
    * Set the current form series to 'name'
   */
  setFormSeries(name: string) {
    if (this.eqn.formSeries[name] != null) {
      this.eqn.currentFormSeries = this.eqn.formSeries[name];
      this.eqn.currentFormSeriesName = name;
    }
  }

  /**
    * Get the current form series name
   */
  getFormSeries(): string {
    return this.eqn.currentFormSeriesName;
  }

  makeTextElem(
    options: {
      text?: string,
      font?: FigureFont | OBJ_Font,
      style?: 'italic' | 'normal',
      weight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
      size?: number,
      family?: string,
      color?: TypeColor,
      touchBorder?: number,
    },
    defaultText: string = '',
  ) {
    let textToUse = defaultText;
    if (options.text != null) {
      textToUse = options.text;
    }
    const defaultFontDefinition = this.eqn.font.definition();
    let fontDefinition = defaultFontDefinition;
    if (options.font != null && options.font instanceof FigureFont) {
      fontDefinition = options.font.definition();
    } else {
      fontDefinition = joinObjects(
        {},
        defaultFontDefinition,
        {
          style: options.style,
          weight: options.weight,
          family: options.family,
          size: options.size,
          color: options.color,
        },
        options.font,
      );
    }

    if (
      options.style == null
      && (
        (options.font != null && options.font.style == null)
        || options.font == null
      )
    ) {
      if (textToUse.match(/[A-Z,a-z,\u03B8]/)) {
        fontDefinition.style = 'italic';
      } else {
        fontDefinition.style = 'normal';
      }
    }
    if (fontDefinition.color == null) {
      fontDefinition.color = this.color;
    }
    // console.log(textToUse, fontDefinition)
    // const font = new FigureFont(fontDefinition);
    const p = this.shapes.text(
      {
        text: textToUse,
        position: new Point(0, 0),
        font: fontDefinition,
        xAlign: 'left',
        yAlign: 'baseline',
        touchBorder: options.touchBorder,
      },
    );
    return p;
  }

  // eslint-disable-next-line class-methods-use-this
  getTextFromKey(key: string) {
    return key.replace(/^_*/, '').replace(/_.*/, '');
  }

  getExistingOrAddSymbol(symbol: string | Object) {
    if (typeof symbol === 'string') {
      return this.getExistingOrAddSymbolFromKey(symbol, {});
    }
    const [key, params] = Object.entries(symbol)[0];  // $FlowFixMe
    return this.getExistingOrAddSymbolFromKey(key, params);
  }

  // 'text'
  // 'text_id'
  // 'id_symbol'
  // 'id_id_symbol'
  // 'symbol'
  getExistingOrAddSymbolFromKey(key: string, options: Object = {}) {
    const existingElement = this.getElement(key);
    if (existingElement != null) {
      return existingElement;
    }

    // Check if the options has a symbol definition
    if (options.symbol != null && typeof options.symbol === 'string') {
      // debugger;
      const symbol = this.makeSymbolElem(options);
      if (symbol != null) {
        this.add(key, symbol);
        return symbol;
      }
    }

    // Check the key is a symbol
    const cleanKey = key.replace(/^_*/, '');
    let symbol = this.eqn.symbols.get(cleanKey, options);
    if (symbol != null) {
      symbol.setColor(this.color);
      this.add(key, symbol);
      return symbol;
    }
    const ending = cleanKey.match(/_[^_]*$/);
    if (ending != null) {
      symbol = this.eqn.symbols.get(ending[0].replace(/_/, ''), options);
      if (symbol != null) {
        symbol.setColor(this.color);
        this.add(key.replace(/_[^_]*$/, ''), symbol);
        return symbol;
      }
    }
    return null;
  }

  addElementFromKey(key: string, options: Object = {}) {
    let element = this.getExistingOrAddSymbolFromKey(key, options);
    if (element != null) {
      return element;
    }
    const cleanKey = key.replace(/^_*/, '');
    const text = cleanKey.replace(/_.*/, '');
    element = this.makeTextElem(joinObjects({ text }, options));
    this.add(key, element);
    return element;
  }

  // addElementFromObject(key: string, options: Object) {
  //   if (typeof key !== 'string') {
  //     return null;
  //   }
  //   const existingElement = this.getElement(key);
  //   if (existingElement != null) {
  //     return existingElement;
  //   }
  //   const text = this.getTextFromKey(key);
  //   const element = this.makeTextElem({ text });
  //   this.add(key, element);
  //   return element;
  // }

  makeSymbolElem(
    options: {
      symbol: string
    } & TypeSymbolOptions,
  ) {
    let symbol = this.eqn.symbols.get(options.symbol, options);
    // console.log('got', symbol)
    if (symbol == null) {
      symbol = this.makeTextElem({
        text: `Symbol ${options.symbol} not valid`,
      });
    }
    if (options.color == null) {
      symbol.setColor(this.color);
    }
    return symbol;
  }

  /**
   * Add elements to equation.
   */
  addElements(
    elems: TypeEquationElements,
  ) {
    // Go through each element and add it
    Object.keys(elems).forEach((key) => {
      // const [key, elem] = entry;
      const elem = elems[key];
      if (typeof elem === 'string') {
        if (!(key.startsWith('space') && key.startsWith(' '))) {
          this.add(key, this.makeTextElem({ text: elem }));
        }
      } else if (elem instanceof FigureElementPrimitive) {
        this.add(key, elem);
      } else if (elem instanceof FigureElementCollection) {
        this.add(key, elem);
      } else {
        let figureElem;
        if (elem.symbol != null && typeof elem.symbol === 'string') {
          // console.log(elem.symbol)
          // $FlowFixMe
          figureElem = this.makeSymbolElem(elem);
        } else {
          // $FlowFixMe
          figureElem = this.makeTextElem(elem, this.getTextFromKey(key));
        }
        if (figureElem != null) {
          if (elem.mods != null) {
            figureElem.setProperties(elem.mods);
          }
          this.add(key, figureElem);
        }
      }
    });

    const fullLineHeightPrimitive = this.makeTextElem({ text: 'gh' });
    const form = this.createForm({ elem: fullLineHeightPrimitive });
    form.content = [this.eqn.functions.contentToElement(fullLineHeightPrimitive)];
    form.arrange(
      this.eqn.scale,
      'left',
      'baseline',
      new Point(0, 0),
    );
    this.eqn.functions.fullLineHeight = form;

    this.setFirstTransform(this.transform);
  }

  addDescriptionElement(
    descriptionElement: FigureElementPrimitive | null = null,
    descriptionPosition: Point = new Point(0, 0),
  ) {
    this.eqn.descriptionElement = descriptionElement;
    this.eqn.descriptionPosition = descriptionPosition;
    if (this.eqn.descriptionElement) {
      this.eqn.descriptionElement
        .setPosition(this.getPosition('figure')
          .add(descriptionPosition));
    }
  }

  setPosition(pointOrX: TypeParsablePoint | number, y: number = 0) {
    super.setPosition(pointOrX, y);
    const position = this.getPosition('figure');
    // console.log(this.eqn, this.eqn.descriptionElement)
    if (this.eqn.descriptionElement != null) {
      this.eqn.descriptionElement.setPosition(position.add(this.eqn.descriptionPosition));
    }
  }

  // scaleForm(name: string, scale: number, subForm: string = 'base') {
  //   // console.log(name, this.form, formType, this.form[name][formType])
  //   if (name in this.eqn.forms) {
  //     if (subForm in this.eqn.forms[name]) {
  //       this.eqn.forms[name][subForm].arrange(
  //         scale,
  //         this.eqn.formAlignment.xAlign,
  //         this.eqn.formAlignment.yAlign,
  //         this.eqn.formAlignment.fixTo,
  //       );
  //     }
  //   }
  // }

  // scale(scale: number) {
  //   Object.keys(this.form).forEach((name) => {
  //     Object.keys(this.form[name]).forEach((formType) => {
  //       if (formType !== 'name') {
  //         this.scaleForm(name, scale, formType);
  //       }
  //     });
  //   });
  // }

  addPhrases(phrases: { [phraseName: string]: TypeEquationPhrase }) {
    Object.keys(phrases).forEach((phraseName) => {
      const phrase = phrases[phraseName];
      this.eqn.functions.phrases[phraseName] = phrase;
    });
  }

  /**
   * Add forms to equation.
   */
  addForms(forms: TypeEquationForms) {
    const isFormString = form => typeof form === 'string';
    const isFormArray = form => Array.isArray(form);
    const isFormMethodDefinition = (form) => {
      if (isFormString(form) || isFormArray(form)) {
        return false;
      }
      if (form != null && typeof form === 'object') {
        // $FlowFixMe
        const keys = Object.keys(form);
        if (keys.length === 1 && keys[0] in this.eqn.functions) {
          return true;
        }
      }
      return false;
    };
    // eslint-disable-next-line max-len
    const isFormElements = form => (form instanceof Elements || form instanceof BaseAnnotationFunction);
    // const isFormFullObject = (form) => {
    //   if (isFormString(form) || isFormArray(form)
    //     || isFormMethodDefinition(form) || isFormElements(form)
    //   ) {
    //     return false;
    //   }
    //   if (form != null && typeof form === 'object' && form.content != null) {
    //     return true;
    //   }
    //   return false;
    // };
    const addFormNormal = (name: string, form: TypeEquationForm) => {
      // $FlowFixMe
      const formContent = [this.eqn.functions.contentToElement(form)];
      this.addForm(name, formContent);
    };
    const addFormFullObject = (name: string, form: TypeEquationForm) => {
      // $FlowFixMe
      const formContent = [this.eqn.functions.contentToElement(form.content)];
      const {   // $FlowFixMe
        elementMods, duration, alignment, scale, // $FlowFixMe
        description, modifiers, animation, // $FlowFixMe
        fromForm,
      } = form;
      const options = {
        // subForm,
        // addToSeries,
        elementMods,
        duration,
        animation,
        alignment,
        scale,
        description,
        modifiers,
        // fromPrev,
        // fromNext,
        fromForm,
      };
      // $FlowFixMe
      this.addForm(name, formContent, options);
    };

    Object.keys(forms).forEach((name) => {
      const form: TypeEquationForm = forms[name];
      if (isFormString(form) || isFormArray(form)
        || isFormMethodDefinition(form) || isFormElements(form)
      ) {
        addFormNormal(name, form);
      } else {
        addFormFullObject(name, form);
      }
      // } else if (isFormFullObject(form)) {
      //   addFormFullObject(name, form);
      // } else {
      //   Object.entries(form).forEach((subFormEntry) => {
      //     const [subFormName: string, subFormValue] = subFormEntry;
      //     // const subFormOption = { subForm: subFormName };
      //     if (isFormString(subFormValue) || isFormArray(subFormValue)
      //       || isFormMethodDefinition(subFormValue) || isFormElements(subFormValue)
      //     ) { // $FlowFixMe
      //       addFormFullObject(name, { content: subFormValue, subForm: subFormName });
      //     } else {
      //       // $FlowFixMe
      //       addFormFullObject(name, joinObjects(subFormValue, { subForm: subFormName }));
      //     }
      //   });
      // }
    });
  }

  checkFixTo(
    fixTo: FigureElementCollection
          | FigureElementPrimitive
          | string | Point | null,
  ): FigureElementPrimitive | FigureElementCollection | Point {
    if (typeof fixTo === 'string') {
      const element = getFigureElement(this, fixTo);
      if (element != null) {
        return element;
      }
      return new Point(0, 0);
    }
    if (fixTo instanceof FigureElementPrimitive
      || fixTo instanceof FigureElementCollection
      || fixTo instanceof Point
    ) {
      return fixTo;
    }
    return new Point(0, 0);
  }

  createForm(
    elements: { [elementName: string]: FigureElementPrimitive |
                                       FigureElementCollection }
    = this.elements,
  ) {
    return new EquationForm(
      elements,
      {
        getAllElements: this.getChildren.bind(this),
        hideAll: this.hideAll.bind(this),
        show: this.show.bind(this),
        showOnly: this.showOnly.bind(this),
        stop: this.stopEquationAnimating.bind(this),
        getElementTransforms: this.getElementTransforms.bind(this),
        setElementTransforms: this.setElementTransforms.bind(this),
        animateToTransforms: this.animateToTransforms.bind(this),
      },
    );
  }

  stopEquationAnimating(how: 'complete' | 'cancel' = 'cancel') {
    this.stopAnimating(how, '_Equation', true);
    this.stopAnimating(how, '_EquationColor', true);
    this.stopPulsing(how);
  }

  addForm(
    name: string,
    content: Array<ElementInterface>,
    options: {
      // subForm?: string,
      scale?: number,
      alignment?: TypeFormAlignment,
      description?: string,
      modifiers?: Object,
      elementMods?: {
        [elementName: string]: Object,
      },
      animation?: {
        duration?: number,
        translation?: { [elementName: string]: TypeFormTranslationProperties },
      },
      fromForm: {
        [formName: string]: {
          animation?: {
            duration?: number,
            translation?: { [elementName: string]: TypeFormTranslationProperties },
          },
          elementMods?: {
            [elementName: string]: Object,
          },
        },
      },
    } = {},
  ) {
    // if (!(name in this.eqn.forms)) {
    //   // $FlowFixMe   - its ok for this to start undefined, it will be filled.
    //   this.eqn.forms[name] = {};
    // }
    const defaultOptions = joinObjects({}, {
      elementMods: {},
      description: '',
      modifiers: {},
      scale: this.eqn.scale,
      animation: {
        duration: undefined,    // use null for velocities
      },
      fromForm: {},
    }, this.eqn.formDefaults);
    let optionsToUse = defaultOptions;
    if (options) {
      optionsToUse = joinObjects({}, defaultOptions, options);
    }
    const {
      description, modifiers, animation, fromForm,
    } = optionsToUse;
    // this.eqn.forms[name].name = name;
    // const form = this.eqn.forms[name];
    // form[subForm] = this.createForm();
    const form = this.createForm();
    this.eqn.forms[name] = form;
    form.description = description;
    form.modifiers = modifiers;
    form.name = name;
    form.animation = animation;
    form.fromForm = fromForm;

    // Populate element mods
    form.elementMods = {};

    const transformElementMods = (elementMods) => {
      const newMods = {};
      Object.keys(elementMods).forEach((elementName) => {
        const mods = elementMods[elementName];
        const figureElement = getFigureElement(this, elementName);
        if (figureElement != null) {
          newMods[elementName] = { element: figureElement, mods };
        }
      });
      return newMods;
    };

    const transformTranslation = (translation) => {
      const newTranslation = {};
      Object.keys(translation).forEach((elementName) => {
        const figureElement = getFigureElement(this, elementName);
        const mods = translation[elementName];
        let direction;
        let style;
        let mag;
        if (Array.isArray(mods)) {
          [style, direction, mag] = mods;
        } else {
          ({ style, direction, mag } = mods);
        }
        if (figureElement != null) {
          newTranslation[elementName] = {
            element: figureElement, style, direction, mag,
          };
        }
      });
      return newTranslation;
    };

    form.elementMods = transformElementMods(optionsToUse.elementMods);
    if (form.animation.translation != null) {
      form.animation.translation = transformTranslation(form.animation.translation);
    }
    if (form.fromForm != null) {
      Object.keys(form.fromForm).forEach((fromFormKey) => {
        const f = form.fromForm[fromFormKey];
        if (f.elementMods != null) {
          f.elementMods = transformElementMods(f.elementMods);
        }
        if (f.animation != null && f.animation.translation != null) { // $FlowFixMe
          f.animation.translation = transformTranslation(f.animation.translation);
        }
      });
    }

    optionsToUse.alignment.fixTo = this.checkFixTo(optionsToUse.alignment.fixTo);
    form.content = content;
    form.arrange(
      optionsToUse.scale,
      optionsToUse.alignment.xAlign,
      optionsToUse.alignment.yAlign,
      optionsToUse.alignment.fixTo,
    );

    // // make the first form added also equal to the base form as always
    // // need a base form for some functions
    // if (this.eqn.forms[name].base === undefined) {
    //   const baseOptions = joinObjects({}, optionsToUse);
    //   baseOptions.subForm = 'base';
    //   this.addForm(name, content, baseOptions);
    // }

    if (this.eqn.currentForm === '') {
      this.eqn.currentForm = name;
    }
    // if (this.eqn.currentSubForm === '') {
    //   this.eqn.currentSubForm = 'base';
    // }
  }

  /**
   * Get the current equation form
   */
  getCurrentForm(): ?EquationForm {
    if (this.eqn.forms[this.eqn.currentForm] == null) {
      return null;
    }
    // if (this.eqn.forms[this.eqn.currentForm][this.eqn.currentSubForm] == null) {
    //   return null;
    // }
    return this.eqn.forms[this.eqn.currentForm];
  }

  render(animationStop: boolean = true) {
    const form = this.getCurrentForm();
    if (form != null) {
      form.setPositions();
      form.showHide(0, 0, null, animationStop);
      this.show();
      // form.setPositions();
      form.applyElementMods();
      // this.updateDescription();
    }
  }

  /**
   * Set current equation form - Note, this does not show the form.
   */
  setCurrentForm(
    formOrName: EquationForm | string,
    // subForm: string = 'base',
  ) {
    if (typeof formOrName === 'string') {
      this.eqn.currentForm = '';
      // this.eqn.currentSubForm = '';
      if (formOrName in this.eqn.forms) {
        this.eqn.currentForm = formOrName;
        // if (subForm in this.eqn.forms[formOrName]) {
        //   this.eqn.currentSubForm = subForm;
        // }
      }
    } else {
      this.eqn.currentForm = formOrName.name;
      // this.eqn.currentSubForm = formOrName.subForm;
    }
  }

  /**
   * Show equation form
   */
  showForm(
    formOrName: EquationForm | string,
    // subForm: ?string = null,
    animationStop: boolean = true,
  ) {
    this.show();
    let form = formOrName;
    if (typeof formOrName === 'string') {
      form = this.getForm(formOrName);
    }
    if (form) {
      this.setCurrentForm(form);
      this.render(animationStop);
    }
  }

  /**
   * Get an equation form object from a form name
   */
  getForm(
    formOrName: string | EquationForm,
    // subForm: ?string,
  ): null | EquationForm {
    if (formOrName instanceof EquationForm) {
      return formOrName;
    }
    if (formOrName in this.eqn.forms) {
      // let formTypeToUse = subForm;
      // if (formTypeToUse == null) {
      //   const possibleFormTypes     // $FlowFixMe
      //     = this.eqn.subFormPriority.filter(fType => fType in this.eqn.forms[formOrName]);
      //   if (possibleFormTypes.length) {
      //     // eslint-disable-next-line prefer-destructuring
      //     formTypeToUse = possibleFormTypes[0];
      //   }
      // }
      // if (formTypeToUse != null) {
      //   return this.eqn.forms[formOrName][formTypeToUse];
      // }
      return this.eqn.forms[formOrName];
    }
    return null;
  }

  /**
   * Start an animation to an equation form
   * @memberof Equation
   */
  goToForm(optionsIn: OBJ_EquationGoToForm = {}) {
    const defaultOptions = {
      duration: null,
      prioritizeFormDuration: true,
      delay: 0,
      fromWhere: '_current',
      animate: 'dissolve',
      callback: null,
      ifAnimating: {
        skipToTarget: true,
        cancelGoTo: true,
      },
    };
    const options = joinObjects(defaultOptions, optionsIn);
    if (this.eqn.isAnimating) {
      if (options.ifAnimating.skipToTarget) {
        // this.stopEquationAnimating('complete', '_Equation', true);
        // this.stopEquationAnimating('complete', '_EquationColor', true);
        // this.stopEquationAnimatingPulsing();
        this.stopEquationAnimating('complete');
        // this.stopEquationAnimating('complete');
        const currentForm = this.getCurrentForm();
        if (currentForm != null) {
          this.showForm(currentForm);
        }
      } else {
        // this.stopEquationAnimating('cancel');
        // this.stopEquationAnimating('cancel', '_Equation', true);
        // this.stopEquationAnimating('cancel', '_EquationColor', true);
        // this.stopEquationAnimatingPulsing();
        this.stopEquationAnimating('cancel');
      }
      this.eqn.isAnimating = false;
      if (options.ifAnimating.cancelGoTo) {
        return;
      }
    }
    // this.stopEquationAnimating(true, true);
    // this.eqn.isAnimating = false;
    // Get the desired form - preference is name, then series index,
    // then next form in the current series
    let form;
    if (options.form != null) {
      form = this.eqn.forms[options.form];
    } else if (options.index != null) {
      form = this.eqn.forms[this.eqn.currentFormSeries[options.index]];
    } else if (this.eqn.currentFormSeries.length > 0) {
      let index = 0;
      const currentForm = this.getCurrentForm();
      if (currentForm != null) {
        index = this.eqn.currentFormSeries.indexOf(currentForm.name);
        if (index < 0) {
          index = 0;
        }
      }
      let formIndex = index + 1;
      if (formIndex === this.eqn.currentFormSeries.length) {
        formIndex = 0;
      }
      form = this.eqn.forms[this.eqn.currentFormSeries[formIndex]];
    }

    if (form == null) {
      return;
    }

    if (options.fromWhere === '_current') {
      options.fromWhere = this.eqn.currentForm;
    }

    let { duration } = options;
    // console.log(options)
    if (options.prioritizeFormDuration) {
      if (form.animation.duration !== undefined) {
        duration = form.animation.duration;
      }
      if (
        options.fromWhere != null
        && form.fromForm[options.fromWhere] != null
        && form.fromForm[options.fromWhere].animation !== undefined
        && form.fromForm[options.fromWhere].animation.duration !== undefined
      ) {
        duration = form.fromForm[options.fromWhere].animation.duration;
      }
    }

    if (duration != null && duration > 0 && options.animate === 'dissolve') {
      if (options.dissolveOutTime == null) {
        options.dissolveOutTime = duration * 0.4;
      }
      if (options.dissolveInTime == null) {
        options.dissolveInTime = duration * 0.4;
      }
      if (options.blankTime == null) {
        options.blankTime = duration * 0.2;
      }
    } else {
      if (options.dissolveOutTime == null) {
        options.dissolveOutTime = 0.4;
      }
      if (options.dissolveInTime == null) {
        options.dissolveInTime = 0.4;
      }
      if (options.blankTime == null) {
        options.blankTime = 0.2;
      }
    }
    if (duration === 0) {
      this.showForm(form);
      this.fnMap.exec(options.callback);
      // if (options.callback != null) {
      //   options.callback();
      // }
    } else {
      this.eqn.isAnimating = true;
      const end = () => {
        this.eqn.isAnimating = false;
        this.fnMap.exec(options.callback);
        // if (options.callback != null) {
        //   options.callback();
        // }
      };
      if (options.animate === 'move') {
        // console.log('move', duration, options, subForm.duration)
        // console.log('******************* animate')
        form.animatePositionsTo(
          options.delay,
          options.dissolveOutTime,
          duration,
          options.dissolveInTime,
          end,
          options.fromWhere,
          false,
        );
      } else if (options.animate === 'dissolveInThenMove') {
        // console.log('move', duration, options, subForm.duration)
        // console.log('******************* animate')
        form.animatePositionsTo(
          options.delay,
          options.dissolveOutTime,
          duration,
          options.dissolveInTime,
          end,
          options.fromWhere,
          true,
        );
      } else if (
        options.animate === 'moveFrom'
        && this.eqn.formRestart != null
        && this.eqn.formRestart.moveFrom != null
      ) {
        const { moveFrom } = this.eqn.formRestart;
        const target = this.getPosition();
        let start = this.getPosition();
        if (moveFrom instanceof Equation) {
          moveFrom.showForm(form.name);
        }
        if (moveFrom instanceof FigureElementCollection) {
          start = moveFrom.getPosition();
        } else {  // $FlowFixMe
          start = getPoint(this.eqn.formRestart.moveFrom);
        }
        const showFormCallback = () => {  // $FlowFixMe
          this.showForm(form.name, false);
        };
        this.fnMap.add('_equationShowFormCallback', showFormCallback);
        this.animations.new('_Equation')
          .dissolveOut({ duration: options.dissolveOutTime })
          .position({ target: start, duration: 0 })
          .trigger({
            callback: 'showFormCallback',
            duration: 0.01,
          })
          .position({ target, duration })
          .whenFinished(end)
          .start();
      } else if (
        options.animate === 'pulse'
        && this.eqn.formRestart != null
        && this.eqn.formRestart.pulse != null
      ) {
        const { pulse } = this.eqn.formRestart;
        const newEnd = () => {
          this.pulse({
            duration: pulse.duration,
            scale: pulse.scale,
            frequency: 0,
            done: end,
          });
          if (pulse.element != null
            && pulse.element instanceof Equation  // $FlowFixMe
            && pulse.element.getCurrentForm().name === form.name
          ) { // $FlowFixMe
            pulse.element.pulse({ duration: pulse.duration, scale: pulse.scale });
          }
        };
        form.allHideShow(
          options.delay,
          options.dissolveOutTime,
          options.blankTime,
          options.dissolveInTime,
          newEnd,
        );
      } else {
        // console.log('******************* hideshow')
        form.allHideShow(
          options.delay,
          options.dissolveOutTime,
          options.blankTime,
          options.dissolveInTime,
          end,
        );
      }
      this.setCurrentForm(form);
    }
  }

  getFormIndex(formToGet: EquationForm | string) {
    const form = this.getForm(formToGet);
    let index = -1;
    if (form != null) {
      index = this.eqn.currentFormSeries.indexOf(form.name);
    }
    return index;
  }

  /**
   * Animate to previous form in the current form series
   */
  prevForm(
    durationOrOptions: number | null | OBJ_EquationGoToForm = null,
    delay: number = 0,
  ) {
    const currentForm = this.getCurrentForm();
    if (currentForm == null) {
      return;
    }
    let index = this.getFormIndex(currentForm);
    if (index > -1) {
      index -= 1;
      if (index < 0) {
        index = this.eqn.currentFormSeries.length - 1;
      }
      if (typeof durationOrOptions === 'number' || durationOrOptions == null) {
        this.goToForm({
          index,
          duration: durationOrOptions,
          delay,
          fromWhere: currentForm.name,
        });
      } else {
        this.goToForm(joinObjects({
          index,
          fromWhere: currentForm.name,
        }, durationOrOptions));
      }
    }
  }

  /**
   * Animate to next form in the current form series
   */
  nextForm(
    durationOrOptions: number | null | OBJ_EquationGoToForm = null,
    delay: number = 0,
  ) {
    let animate = 'move';

    const currentForm = this.getCurrentForm();
    if (currentForm == null) {
      return;
    }
    let index = this.getFormIndex(currentForm);
    if (index > -1) {
      index += 1;
      if (index > this.eqn.currentFormSeries.length - 1) {
        index = 0;
        const { formRestart } = this.eqn;
        if (formRestart != null && formRestart.moveFrom != null) {
          animate = 'moveFrom';
        } else if (formRestart != null && formRestart.pulse != null) {
          animate = 'pulse';
        } else {
          animate = 'dissolve';
        }
      }
      if (typeof durationOrOptions === 'number' || durationOrOptions == null) {
        this.goToForm({
          index,
          duration: durationOrOptions,
          delay,
          fromWhere: currentForm.name,
          animate,
        });
      } else {
        this.goToForm(joinObjects({
          index,
          animate,
          fromWhere: currentForm.name,
        }, durationOrOptions));
      }
    }
  }

  /**
   * Start from previous form and animate to current form
   */
  replayCurrentForm(duration: number) {
    if (this.eqn.isAnimating) {
      // this.stopEquationAnimating(true, true);
      this.stopEquationAnimating('complete');
      // this.animations.cancel('complete');
      // this.animations.cancel('complete');
      this.eqn.isAnimating = false;
      const currentForm = this.getCurrentForm();
      if (currentForm != null) {
        this.showForm(currentForm);
      }
      return;
    }
    // this.animations.cancel();
    // this.animations.cancel();
    // this.stopEquationAnimating();
    this.stopEquationAnimating();
    this.eqn.isAnimating = false;
    this.prevForm(0);
    this.nextForm(duration, 0.5);
  }

  animateToForm(
    name: string,
    duration: number | null = null,
    delay: number = 0,
    callback: null | string | (() => void) = null,
  ) {
    // this.stopEquationAnimatingColor(true, true);
    // this.stopEquationAnimatingColor(true, true);
    // this.stopEquationAnimating();
    this.stopEquationAnimating();
    // this.animations.cancel();
    // this.animations.cancel();
    const form = this.getForm(name);
    if (form != null) {
      form.animatePositionsTo(delay, 0.4, duration, 0.4, callback);
    }
    this.setCurrentForm(name);
  }


  changeDescription(
    formOrName: EquationForm | string,
    description: string = '',
    modifiers: Object = {},
    // subForm: string = 'base',
  ) {
    const form = this.getForm(formOrName);
    if (form != null) {
      form.description = `${description}`;
      form.modifiers = modifiers;
    }
  }

  getDescription(
    formOrName: EquationForm | string,
    // subForm: string = 'base',
  ) {
    const form = this.getForm(formOrName);
    if (form != null && form.description != null) {
      return html.applyModifiers(form.description, form.modifiers);
    }
    return '';
  }

  // updateDescription(
  //   formOrName: EquationForm | string | null = null,
  //   subForm: string = 'base',
  // ) {
  //   const element = this.eqn.descriptionElement;
  //   if (element == null) {
  //     return;
  //   }
  //   if (element.isShown === false) {
  //     return;
  //   }
  //   let form = null;
  //   if (formOrName == null) {
  //     form = this.getCurrentForm();
  //   } else if (typeof formOrName === 'string') {
  //     form = this.getForm(formOrName, subForm);
  //   } else {
  //     form = formOrName;
  //   }
  //   if (form == null) {
  //     return;
  //   }
  //   if (form.description == null) {
  //     return;
  //   }

  //   const { drawingObject } = element;
  //   if (drawingObject instanceof HTMLObject) {
  //     drawingObject.change(
  //       html.applyModifiers(form.description, form.modifiers),
  //       element.lastDrawTransform.m(),
  //     );
  //     html.setOnClicks(form.modifiers);
  //   }
  // }
}