// @flow
// import type { Transform } from '../tools/g2';
import { Point, getTransform, Transform } from '../tools/g2';
import { round } from '../tools/math';
import type { DiagramElement } from './Element';
import GlobalAnimation from './webgl/GlobalAnimation';
// Singleton class that contains projects global variables

function download(filename, text) {
  const element = document.createElement('a');
  element.setAttribute(
    'href', 
    `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`,
  );
  element.setAttribute('download', filename);
  element.style.display = 'none';
  const { body } = document;
  if (body != null) {
    body.appendChild(element);
    element.click();
    body.removeChild(element);
  }
}

function getIndexOfEarliestTime(
  events: Array<Array<number | string | null> | [number, number | 'next' | 'prev'] | [number, Object]>,
  index: number,
) {
  if (index < 1) {
    return index;
  }
  let i = index;
  let same = true;
  const time = events[index][0];
  while (i > 0 && same) {
    const prevTime = events[i - 1][0];
    if (prevTime !== time) {
      same = false;
    } else {
      i -= 1;
    }
  }
  return i;
}

function getIndexOfLatestTime(
  events: Array<Array<number | string | null> | [number, number | 'next' | 'prev'] | [number, Object]>,
  index: number,
) {
  const time = events[index][0];
  let i = index;
  let loop = true;
  while (loop) {
    if (i === events.length - 1) {
      loop = false;
    } else if (events[i + 1][0] === time) {
      i += 1;
    } else {
      loop = false;
    }
  }
  return Math.max(i, index);
}

function getLastUniqueIndeces(
  events: Array<Array<number | string | null> | [number, number | 'next' | 'prev'] | [number, Object]>,
  startIndex: number,
  endIndex: number,
) {
  // const indeces = [];
  const types = {};
  let start = startIndex;
  if (start < 0) {
    start = 0;
  }
  for (let i = start; i <= endIndex; i += 1) {
    const event = events[i];
    const [, type] = event;
    types[type] = i;
  }
  return Object.values(types);
}

function getIndexRangeForTime(
  events: Array<Array<number | string | null> | [number, number | 'next' | 'prev'] | [number, Object]>,
  time: number,
  startSearch: number = 0,
  endSearch: number = events.length - 1,
) {
  if (events.length === 0) {
    return [-1, -1];
  }
  const startTime = parseFloat(events[startSearch][0]);
  if (time === startTime) {
    return [startSearch, startSearch];
  }
  if (time < startTime) {
    return [-1, startSearch];
  }

  const endTime = parseFloat(events[endSearch][0]);
  if (time === endTime) {
    return [endSearch, endSearch];
  }
  if (time > endTime) {
    return [endSearch, -1];
  }

  const searchRange = endSearch - startSearch;

  if (searchRange < 2) {
    return [startSearch, endSearch];
  }

  const midSearch = startSearch + Math.floor(searchRange / 2);
  const midTime = parseFloat(events[midSearch][0]);
  if (time === midTime) {
    return [midSearch, midSearch];
  }
  if (time < midTime) {
    return getIndexRangeForTime(events, time, startSearch, midSearch);
  }
  return getIndexRangeForTime(events, time, midSearch, endSearch)
}

function getNextIndexForTime(
  events: Array<Array<number | string | null> | [number, number | 'next' | 'prev'] | [number, Object]>,
  time: number,
  startSearch: number = 0,
  endSearch: number = events.length - 1,
) {
  // // console.log(startSearch, endSearch)
  // if (events.length === 0) {
  //   return -1;
  // }
  // if (time === 0) {
  //   return 0;
  // }
  // const startTime = parseFloat(events[startSearch][0]);
  // if (time <= startTime) {
  //   return startSearch;
  // }

  // const endTime = parseFloat(events[endSearch][0]);
  // if (time > endTime) {
  //   return -1;
  // }

  // if (startSearch === endSearch) {
  //   return startSearch;
  // }

  // const searchRange = endSearch - startSearch;
  // let midSearch = startSearch;
  // if (searchRange > 1) {
  //   midSearch = Math.floor(startSearch + searchRange / 2);
  // } else if (searchRange === 1) {
  //   midSearch = endSearch;
  // }

  // // console.log(startSearch, endSearch, midSearch)
  // if (midSearch === 0) {
  //   return 0;
  // }

  // const prevTime = events[midSearch - 1][0];
  // const midTime = events[midSearch][0];
  // if (time === midTime) {
  //   return midSearch;
  // }
  // if (time <= midTime && time > prevTime) {
  //   return midSearch;
  // }
  // if (time < midTime) {
  //   return getNextIndexForTime(events, time, startSearch, midSearch);
  // }
  // return getNextIndexForTime(events, midSearch, endSearch);
  const nextIndex = getIndexRangeForTime(events, time, startSearch, endSearch)[1];
  return getIndexOfEarliestTime(events, nextIndex);
}

function getPrevIndexForTime(
  events: Array<Array<number | string | null> | [number, number | 'next' | 'prev'] | [number, Object]>,
  time: number,
  startSearch: number = 0,
  endSearch: number = events.length - 1,
) {
  // if (events.length === 0) {
  //   return -1;
  // }
  // if (events.length < startSearch || events.length < endSearch) {
  //   return -1;
  // }
  // console.log(time, events)
  // const index = getNextIndexForTime(events, time, startSearch, endSearch);
  // if (index === 0 || index === -1) {
  //   return index;
  // }
  // return index - 1;
  const prevIndex = getIndexRangeForTime(events, time, startSearch, endSearch)[0];
  return getIndexOfEarliestTime(events, prevIndex);
}

function getTimeToIndex(
  events: Array<Array<number | string | null> | [number, number | 'next' | 'prev'] | [number, Object]>,
  eventIndex: number,
  time: number,
) {
  if (eventIndex === -1 || eventIndex > events.length) {
    return -1;
  }
  const nextTime = events[eventIndex][0];
  return nextTime - time;
}

class Recorder {
  // Method for requesting the next animation frame
  events: Array<Array<number | string | null>>;
  states: Array<[number, Object]>;
  slides: Array<[number, number | 'next' | 'prev']>;
  isRecording: boolean;
  isPlaying: boolean;
  startTime: number;
  precision: number;
  touchDown: (Point) => boolean;
  touchUp: void => void;
  // touchMoveDown: (Point, Point) => boolean;
  cursorMove: (Point) => void;
  getState: () => Object;
  setState: (Object) => void;
  eventIndex: number;
  stateIndex: number;
  animation: GlobalAnimation;
  previousPoint: ?Point;
  animateDiagramNextFrame: () => void;
  getElement: () => DiagramElement;
  nextEventTimeout: TimeoutID;
  nextStateTimeout: TimeoutID;
  stateTimeout: TimeoutID;
  stateTimeStep: number;
  // currentTime: number;

  lastShownEventIndex: number;
  lastShownStateIndex: number;
  lastShownSlideIndex: number;

  // requestNextAnimationFrame: (()=>mixed) => AnimationFrameID;
  // animationId: AnimationFrameID;    // used to cancel animation frames
  static instance: Object;
  // drawQueue: Array<(number) => void>;
  // nextDrawQueue: Array<(number) => void>;

  constructor(
    diagramTouchDown?: (Point) => boolean,
    diagramTouchUp?: void => void,
    // diagramCursorMove?: (Point) => void,
    // diagramTouchMoveDown?: (Point, Point) => boolean,
    diagramCursorMove?: (Point) => void,
    animateDiagramNextFrame?: () => void,
    getElement?: () => DiagramElement,
    getState?: () => Object,
    setState?: (Object) => void,
  ) {
    // If the instance alread exists, then don't create a new instance.
    // If it doesn't, then setup some default values.
    if (!Recorder.instance) {
      Recorder.instance = this;
      this.events = [];
      this.isRecording = false;
      this.precision = 5;
      this.stateTimeStep = 1000;
      this.lastShownEventIndex = -1;
      this.lastShownStateIndex = -1;
      this.lastShownSlideIndex = -1;
      if (diagramTouchDown) {
        this.touchDown = diagramTouchDown;
      }
      if (diagramTouchUp) {
        this.touchUp = diagramTouchUp;
      }
      // if (diagramTouchMoveDown) {
      //   this.touchMoveDown = diagramTouchMoveDown;
      // }
      if (diagramCursorMove) {
        this.cursorMove = diagramCursorMove;
      }
      this.animation = new GlobalAnimation();
      this.previousPoint = null;
      if (animateDiagramNextFrame) {
        this.animateDiagramNextFrame = animateDiagramNextFrame;
      }
      if (getElement) {
        this.getElement = getElement;
      }
      if (getState) {
        this.getState = getState;
      }
      if (setState) {
        this.setState = setState;
      }
      // this.drawScene = this.draw.bind(this);
    }
    return Recorder.instance;
  }

  timeStamp() {   // eslint-disable-line class-methods-use-this
    return (new Date()).getTime();
  }

  now() {   // eslint-disable-line class-methods-use-this
    return this.timeStamp() - this.startTime;
  }

  start() {
    this.events = [];
    this.slides = [];
    this.states = [];
    this.startTime = this.timeStamp();
    this.isRecording = true;
    this.queueRecordState(0);
  }

  stop() {
    this.isRecording = false;
    clearTimeout(this.stateTimeout);
  }

  getNextEventIndexForTime(time: number,) {
    return getNextIndexForTime(this.events, time);
  }

  getPrevEventIndexForTime(time: number,) {
    return getPrevIndexForTime(this.events, time);
  }

  recordEvent(...args: Array<number | string>) {
    const out = [];
    args.forEach((arg) => {
      if (typeof arg === 'number' && this.precision > -1) {
        out.push(round(arg, this.precision));
        return;
      }
      out.push(arg);
    })
    this.events.push([this.now() / 1000, ...out]);
  }

  recordState(state: Object) {
    this.states.push([this.now() / 1000, state]);
  }

  recordSlide(slide: number | 'next' | 'prev') {
    this.slides.push([this.now() / 1000, slide]);
  }

  // showEvents() {
  //   const wnd = window.open('about:blank', '', '_blank');
  //   this.events.forEach((event) => {
  //     const out = [];
  //     event.forEach((arg) => {
  //       if (arg instanceof Transform) {
  //         out.push(arg.toString(5));
  //       } else if (typeof arg === 'string') {
  //         out.push(`"${arg}"`);
  //       } else if (typeof arg === 'number') {
  //         out.push(round(arg, this.precision));
  //       } else {
  //         out.push(arg);
  //       }
  //     });
  //     wnd.document.write(`[${out.join(',')}],`, '<br>');
  //   });
  // }

  // showState() {
  //   const wnd = window.open('about:blank', '', '_blank');
  //   this.states.forEach((state) => {
  //     wnd.document.write(JSON.stringify(state), '<br>');
  //   });
  // }

  save() {
    const slidesOut = [];
    this.slides.forEach((slide) => {
      slidesOut.push(JSON.stringify(slide));
    });

    const eventsOut = [];
    this.events.forEach((event) => {
      eventsOut.push(JSON.stringify(event));
    });

    const statesOut = [];
    this.states.forEach((state) => {
      statesOut.push(JSON.stringify(state));
    });

    const dateStr = new Date().toISOString();
    const location = (window.location.pathname).replace('/', '_');
    download(`${dateStr} ${location} slides.txt`, slidesOut.join('\n'));
    download(`${dateStr} ${location} events.txt`, eventsOut.join('\n'));
    download(`${dateStr} ${location} states.txt`, statesOut.join('\n'));
  }

  show() {
    const wnd = window.open('about:blank', '', '_blank');
    this.slides.forEach((slide) => {
      wnd.document.write(JSON.stringify(slide), '<br>');
    });

    wnd.document.write('<br><br>');
    wnd.document.write(`// ${'/'.repeat(500)}<br>`);
    wnd.document.write(`// ${'/'.repeat(500)}<br>`);
    wnd.document.write('<br><br>');

    this.events.forEach((event) => {
      const rounded = event.map((e) => {
        if (typeof e === 'number') {
          return round(e, this.precision);
        }
        return e;
      });
      wnd.document.write(JSON.stringify(rounded), '<br>');
    });
    wnd.document.write('<br><br>');
    wnd.document.write(`// ${'/'.repeat(500)}<br>`);
    wnd.document.write(`// ${'/'.repeat(500)}<br>`);
    wnd.document.write('<br><br>');
    this.states.forEach((state) => {
      wnd.document.write(JSON.stringify(state), '<br>');
    });
  }

  recordClick(id: string) {
    this.events.push([this.now(), id]);
  }

  getTotalTime() {
    let time = 0;
    if (this.slides.length > 0) {
      const endTime = this.slides.slice(-1)[0][0];
      time = Math.max(time, endTime);
    }
    if (this.events.length > 0) {
      const endTime = this.events.slice(-1)[0][0];
      time = Math.max(time, endTime);
    }
    if (this.states.length > 0) {
      const endTime = this.states.slice(-1)[0][0];
      time = Math.max(time, endTime);
    }
    return time;
  }

  scrub(percentTime: number) {
    this.stopPlayback();
    const totalTime = this.getTotalTime();
    const timeTarget = percentTime * totalTime;
    this.setToTime(timeTarget);
  }

  setToTime(time: number) {
    this.currentTime = time;
    this.stateIndex = Math.max(getNextIndexForTime(this.states, time) - 1, 0);
    // this.playbackState();
    this.setState(this.states[this.stateIndex][1]);
    this.animateDiagramNextFrame();
  }

  getCurrentTime() {
    return this.now() / 1000;
  }

  setStartTime(fromTime: number = 0) {
    this.startTime = this.timeStamp() - fromTime * 1000;
  }

  startPlayback(fromTime: number = 0, showPointer: boolean = true) {
    this.lastShownEventIndex = -1;
    this.lastShownStateIndex = -1;
    this.lastShownSlideIndex = -1;
    this.isRecording = false;
    this.isPlaying = true;
    // const prevEventIndex = getPrevIndexForTime(this.events, fromTime);
    // const prevStateIndex = getPrevIndexForTime(this.states, fromTime);
    // const prevSlideIndex = getPrevIndexForTime(this.slides, fromTime);

    // this.currentTime = 0;
    this.eventIndex = 0;
    this.stateIndex = 0;
    this.previousPoint = null;
    this.setStartTime(fromTime);
    this.touchUp();
    this.animation.queueNextFrame(this.playFrame.bind(this));
    // this.eventIndex = getNextIndexForTime(this.events, fromTime);
    // this.queuePlaybackEvent(this.getTimeToIndex(this.events, this.eventIndex, fromTime));
    // this.queuePlaybackState(this.getTimeToIndex(this.states, this.stateIndex, fromTime));
    const pointer = this.getElement('pointer.up');
    if (pointer != null && showPointer) {
      pointer.show();
    }
    // this.playbackEvent(this.getTimeToIndex);
  }

  playFrame() {
    const time = this.getCurrentTime();
    console.log(time)

    const prevStateIndex = Math.max(getPrevIndexForTime(this.states, time), 0);
    if (prevStateIndex > this.lastShownStateIndex) {
      // console.log('processState')
      const lastIndexWithSameTime = getIndexOfLatestTime(this.states, prevStateIndex);
      // const indexRange = getLastUniqueIndeces(this.lastShownStateIndex, lastIndexWithSameTime);
      this.setState(this.states[lastIndexWithSameTime][1]);
      this.lastShownStateIndex = lastIndexWithSameTime;
      // this.processState(this.states[prevStateIndex]);
    }
    const prevEventIndex = Math.max(getPrevIndexForTime(this.events, time), 0);
    if (prevEventIndex > this.lastShownEventIndex) {
      const lastIndexWithSameTime = getIndexOfLatestTime(this.events, prevEventIndex);
      let indexRange = getLastUniqueIndeces(
        this.events,
        this.lastShownEventIndex,
        lastIndexWithSameTime,
      ).sort();
      for (let i = 0; i < indexRange.length; i += 1) {
        // console.log(time, indexRange)
        this.processEvent(this.events[indexRange[i]].slice(1));
      }
      this.lastShownEventIndex = indexRange[indexRange.length - 1];
    }
    // console.log(time, prevEventIndex, prevStateIndex);
    if (
      (
        this.lastShownEventIndex >= this.events.length - 1
        || this.lastShownEventIndex === -1
      )
      && (
        this.lastShownStateIndex >= this.states.length - 1
        || this.lastShownStateIndex === -1
      )
    ) {
      this.stopPlayback();
    } else {
      this.animation.queueNextFrame(this.playFrame.bind(this));
    }
    this.animateDiagramNextFrame();
    // const prevSlideIndex = getPrevIndexForTime(this.slides, time);
  }

  getTimeToIndex(time: number) {
    if (this.eventIndex === -1 || this.eventIndex > this.events.length) {
      return -1;
    }
    const nextTime = this.events[this.eventIndex][0];
    return nextTime - time;
  }

  // getNextIndexForTime(
  //   time: number,
  //   startSearch: number = 0,
  //   endSearch: number = this.events.length - 1,
  // ) {
  //   if (time === 0) {
  //     return 0;
  //   }
  //   const endTime = parseFloat(this.events[endSearch][0]);
  //   if (time > endTime) {
  //     return -1;
  //   }
  //   const searchRange = endSearch - startSearch;
  //   let midSearch = startSearch;
  //   if (searchRange > 1) {
  //     midSearch = Math.floor(startSearch + searchRange / 2);
  //   } else if (searchRange === 1) {
  //     midSearch = endSearch;
  //   }
  //   // console.log(startSearch, endSearch, midSearch)
  //   if (midSearch === 0) {
  //     return 0;
  //   }
  //   const prevTime = this.events[midSearch - 1][0];
  //   const midTime = this.events[midSearch][0];
  //   if (time === midTime) {
  //     return midSearch;
  //   }
  //   if (time <= midTime && time > prevTime) {
  //     return midSearch;
  //   }
  //   if (time < midTime) {
  //     return this.getNextIndexForTime(time, startSearch, midSearch);
  //   }
  //   return this.getNextIndexForTime(time, midSearch, endSearch);
  // }

  stopPlayback() {
    this.isPlaying = false;
    clearTimeout(this.nextEventTimeout);
    clearTimeout(this.stateTimeout);
    const pointer = this.getElement('pointer');
    if (pointer != null) {
      pointer.hide();
    }
  }

  processEvent(event: Array<string | number>) {
    const [eventType] = event;
    switch (eventType) {
      case 'touchDown': {
        const [, x, y] = event;
        this.touchDown(new Point(x, y));
        break;
      }
      case 'touchUp':
        this.touchUp();
        break;
      case 'cursorMove': {
        const [, x: number, y: number] = event;
        this.cursorMove(new Point(x, y));
        break;
      }
      case 'startBeingMoved': {
        const [, elementPath] = event;
        const element = this.getElement(elementPath);
        element.startBeingMoved();
        break;
      }
      case 'moved': {
        const [, elementPath, transformDefinition] = event;
        const element = this.getElement(elementPath);
        const transform = getTransform(transformDefinition);
        element.moved(transform);
        break;
      }
      case 'click': {
        const [, id] = event;
        const element = document.getElementById(id);
        if (element != null) {
          element.click();
        }
        break;
      }
      // case 'cursorMoved': {
      //   const [, x, y] = event;
      //   this.
      // }
      case 'stopBeingMoved': {
        const [, elementPath, transformDefinition, velocityDefinition] = event;
        const element = this.getElement(elementPath);
        const transform = getTransform(transformDefinition);
        const velocity = getTransform(velocityDefinition);
        element.transform = transform;
        element.state.movement.velocity = velocity;
        element.stopBeingMoved();
        break;
      }
      case 'startMovingFreely': {
        const [, elementPath, transformDefinition, velocityDefinition] = event;
        const element = this.getElement(elementPath);
        const transform = getTransform(transformDefinition);
        const velocity = getTransform(velocityDefinition);
        element.simulateStartMovingFreely(transform, velocity);
        break;
      }
      default:
        break;
    }
  }

  queuePlaybackEvent(time: number = 0) {
    // if (time === 0) {
    //   this.playbackEvent();
    //   return;
    // }
    this.nextEventTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.playbackEvent();
      }
    }, time);
  }

  queuePlaybackState(time: number = 0) {
    this.nextStateTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.playbackState();
      }
    }, time);
  }

  queueRecordState(time: number = 0) {
    this.stateTimeout = setTimeout(() => {
      if (this.isRecording) {
        this.recordState(this.getState());
        this.queueRecordState(this.stateTimeStep);
      }
    }, time);
  }

  playbackEvent() {
    const event = this.events[this.eventIndex];
    const [currentTime] = event;
    console.log('event', this.getCurrentTime(), currentTime)
    this.processEvent(event.slice(1));
    this.animateDiagramNextFrame();
    this.eventIndex += 1;
    if (this.eventIndex === this.events.length) {
      this.stopPlayback();
      return;
    }
    const nextTime = (this.events[this.eventIndex][0] - currentTime) * 1000;
    this.queuePlaybackEvent(nextTime);
  }

  playbackState() {
    if (this.states.length === 0 || this.stateIndex > this.states.length - 1) {
      return;
    }
    const state = this.states[this.stateIndex];
    const [currentTime] = state;
    console.log('state**********', this.getCurrentTime(), currentTime)
    this.setState(state[1]);
    this.animateDiagramNextFrame();
    this.stateIndex += 1;
    if (this.stateIndex === this.states.length) {
      this.stopPlayback();
      return;
    }
    const nextTime = (this.states[this.stateIndex][0] - currentTime) * 1000;
    this.queuePlaybackState(nextTime);
  }

  // playbackClick() { // eslint-disable-line class-methods-use-this
  // }

  // playbackTouch() {
  //   const [, x, y, touch] = this.events[this.eventIndex];
  //   switch (touch) {
  //     case 'd':
  //       this.touchDown(new Point(x, y));
  //       if (this.previousPoint == null && x != null && y != null) {
  //         this.previousPoint = new Point(x, y);
  //       }
  //       break;
  //     case 'u':
  //       this.touchUp();
  //       this.previousPoint = null;
  //       break;
  //     case 'm':
  //       this.touchMoveDown(this.previousPoint, new Point(x, y));
  //       this.previousPoint = new Point(x, y);
  //       break;
  //     default:
  //       this.touchMoveUp(new Point(x, y));
  //       break;
  //   }
  // }
}

// Do not automatically create and instance and return it otherwise can't
// mock elements in jest
// // const globalvars: Object = new GlobalVariables();
// // Object.freeze(globalvars);

export {
  Recorder,
  getIndexOfEarliestTime,
  download,
  getIndexOfLatestTime,
  getLastUniqueIndeces,
  getNextIndexForTime,
  getPrevIndexForTime,
};
