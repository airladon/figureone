// @flow
import type {
  OBJ_PositionAnimationStep,
} from './AnimationStep/ElementAnimationStep/PositionAnimationStep';
import PositionAnimationStep from './AnimationStep/ElementAnimationStep/PositionAnimationStep';

import type {
  OBJ_ScenarioAnimationStep,
} from './AnimationStep/ElementAnimationStep/ScenarioAnimationStep';
import ScenarioAnimationStep from './AnimationStep/ElementAnimationStep/ScenarioAnimationStep';


import type {
  OBJ_ColorAnimationStep,
} from './AnimationStep/ElementAnimationStep/ColorAnimationStep';
import {
  ColorAnimationStep, DimAnimationStep, UndimAnimationStep, dim,
  undim,
} from './AnimationStep/ElementAnimationStep/ColorAnimationStep';


import type {
  OBJ_OpacityAnimationStep,
} from './AnimationStep/ElementAnimationStep/OpacityAnimationStep';
import {
  OpacityAnimationStep, DissolveInAnimationStep, dissolveIn,
  DissolveOutAnimationStep, dissolveOut,
} from './AnimationStep/ElementAnimationStep/OpacityAnimationStep';


import type {
  OBJ_TransformAnimationStep,
} from './AnimationStep/ElementAnimationStep/TransformAnimationStep';
import TransformAnimationStep from './AnimationStep/ElementAnimationStep/TransformAnimationStep';

import type {
  TypePulseTransformAnimationStepInputOptions,
} from './AnimationStep/ElementAnimationStep/PulseTransformAnimationStep';
import PulseTransformAnimationStep from './AnimationStep/ElementAnimationStep/PulseTransformAnimationStep';

import type {
  OBJ_RotationAnimationStep,
} from './AnimationStep/ElementAnimationStep/RotationAnimationStep';
import RotationAnimationStep from './AnimationStep/ElementAnimationStep/RotationAnimationStep';

import type {
  OBJ_ScaleAnimationStep,
} from './AnimationStep/ElementAnimationStep/ScaleAnimationStep';
import ScaleAnimationStep from './AnimationStep/ElementAnimationStep/ScaleAnimationStep';

import type {
  TypePulseAnimationStepInputOptions,
} from './AnimationStep/ElementAnimationStep/PulseAnimationStep';
import PulseAnimationStep from './AnimationStep/ElementAnimationStep/PulseAnimationStep';

import type {
  OBJ_TriggerAnimationStep,
} from './AnimationStep/TriggerStep';
import {
  TriggerAnimationStep, trigger,
} from './AnimationStep/TriggerStep';

import type {
  OBJ_CustomAnimationStep,
} from './AnimationStep/CustomStep';
import {
  CustomAnimationStep, custom,
} from './AnimationStep/CustomStep';


import type {
  TypeParallelAnimationStepInputOptions,
} from './AnimationStep/ParallelAnimationStep';
import {
  ParallelAnimationStep, inParallel,
} from './AnimationStep/ParallelAnimationStep';

import type {
  TypeSerialAnimationStepInputOptions,
} from './AnimationStep/SerialAnimationStep';
import {
  SerialAnimationStep, inSerial,
} from './AnimationStep/SerialAnimationStep';

// import type {
//   OBJ_AnimationStep,
// } from './AnimationStep/DelayAnimationStep';
import {
  DelayAnimationStep, delay,
} from './AnimationStep/DelayStep';

import type {
  OBJ_AnimationStep,
} from './AnimationStep';
import AnimationStep from './AnimationStep';

import type {
  TypeAnimationManagerInputOptions,
} from './AnimationManager';

// eslint-disable-next-line import/no-cycle
import AnimationManager from './AnimationManager';

import type { TypeAnimationBuilderInputOptions } from './AnimationBuilder';
// eslint-disable-next-line import/no-cycle
import AnimationBuilder from './AnimationBuilder';


export type {
  OBJ_PositionAnimationStep, TypeAnimationBuilderInputOptions,
  TypeParallelAnimationStepInputOptions, TypeSerialAnimationStepInputOptions,
  OBJ_TransformAnimationStep, OBJ_AnimationStep,
  OBJ_TriggerAnimationStep,
  OBJ_ColorAnimationStep, OBJ_CustomAnimationStep,
  TypeAnimationManagerInputOptions, OBJ_RotationAnimationStep,
  OBJ_ScaleAnimationStep, TypePulseAnimationStepInputOptions,
  OBJ_OpacityAnimationStep, OBJ_ScenarioAnimationStep,
  TypePulseTransformAnimationStepInputOptions,
};
export {
  PositionAnimationStep, AnimationBuilder, ParallelAnimationStep, SerialAnimationStep,
  TransformAnimationStep, AnimationStep, DelayAnimationStep, TriggerAnimationStep,
  inParallel, inSerial, trigger, delay, ColorAnimationStep,
  DissolveInAnimationStep, dissolveIn, DissolveOutAnimationStep, dissolveOut,
  CustomAnimationStep, custom, AnimationManager, RotationAnimationStep,
  ScaleAnimationStep, PulseAnimationStep, OpacityAnimationStep,
  DimAnimationStep, dim, UndimAnimationStep, undim, ScenarioAnimationStep,
  PulseTransformAnimationStep,
};
