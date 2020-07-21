import {
  Point, Transform,
} from '../tools/g2';
import {
  round,
} from '../tools/math';
import * as tools from '../tools/tools';
import makeDiagram from '../__mocks__/makeDiagram';
import Worker from '../__mocks__/recorder.worker.mock';

// tools.isTouchDevice = jest.fn();

jest.mock('./recorder.worker');

describe('Animate To State', () => {
  let diagram;
  let recorder;
  let playbackStartedCallback;
  let preparingToPlayCallback;
  let preparingToPauseCallback;
  let playbackStoppedCallback;
  let a;
  let b;
  beforeEach(() => {
    jest.useFakeTimers();
    diagram = makeDiagram();
    diagram.globalAnimation.reset();
    diagram.addElements([
      {
        name: 'a',
        method: 'polygon',
      },
      {
        name: 'b',
        method: 'polygon',
      },
    ]);
    a = diagram.elements._a;
    b = diagram.elements._b;
    diagram.initialize();
    ({ recorder } = diagram);
    recorder.reset();
    recorder.worker = new Worker();
    recorder.worker.recorder = recorder;
    playbackStartedCallback = jest.fn();
    preparingToPlayCallback = jest.fn();
    preparingToPauseCallback = jest.fn();
    playbackStoppedCallback = jest.fn();
    const subs = recorder.subscriptions;
    subs.subscribe('playbackStarted', playbackStartedCallback);
    subs.subscribe('playbackStopped', playbackStoppedCallback);
    subs.subscribe('preparingToPause', preparingToPauseCallback);
    subs.subscribe('preparingToPlay', preparingToPlayCallback);
    recorder.stateTimeStep = 1;
  });
  describe('Animation', () => {
    let states;
    let callbacks;
    beforeEach(() => {
      // a.pauseSettings.animation.complete = false;
      // a.pauseSettings.animation.clear = true;
      const startAnimation = () => {
        a.animations.new()
          .position({ start: [0, 0], target: [1, 1], duration: 2 })
          .start();
      };
      recorder.addEventType('startAnimation', startAnimation.bind(this));

      // setup
      diagram.mock.timeStep(0);  // Ok
      recorder.startRecording();
      diagram.mock.timeStep(1);
      startAnimation();
      recorder.recordEvent('startAnimation');
      diagram.mock.timeStep(1);
      diagram.mock.timeStep(1);
      diagram.mock.timeStep(1);
      recorder.recordEvent('touch', ['up']);
      recorder.stopRecording();
      recorder.seek(0);

      // const check = (recorderState, diagramIsPaused, aIsPaused, isAnimating, remainingAnimationTime, x) => {
      //   expect(recorderState).toEqual(recorderState)
      // }
      states = () => [recorder.state, diagram.state.pause, a.state.pause, diagram.isAnimating(), round(diagram.getRemainingAnimationTime()), a.getPosition().round(3).x];
      callbacks = () => [
        preparingToPlayCallback.mock.calls.length,
        playbackStartedCallback.mock.calls.length,
        preparingToPauseCallback.mock.calls.length,
        playbackStoppedCallback.mock.calls.length,
      ];
    });
    test('No Pausing', () => {
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 0]);
      expect(callbacks()).toEqual([0, 0, 0, 0]);
      recorder.startPlayback(0);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 0]);
      expect(callbacks()).toEqual([0, 1, 0, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 2, 0]);
      expect(callbacks()).toEqual([0, 1, 0, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      expect(callbacks()).toEqual([0, 1, 0, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
      expect(callbacks()).toEqual([0, 1, 0, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
      expect(callbacks()).toEqual([0, 1, 0, 1]);
    });
    test('Try to change paused diagram during recorder pause', () => {
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 0]);
      recorder.startPlayback(0);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 2, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      recorder.settings.pause = 'freeze';
      recorder.pausePlayback();

      a.animations.new()
        .position({ target: [4.5, 4.5], duration: 2 })
        .start('now');
      diagram.mock.timeStep(1);
      expect(a.getPosition().round(3).x).toBe(0.5);

      // Resume
      recorder.settings.play = 'instant';
      recorder.resumePlayback();
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
    });
    test('Change upaused diagram during recorder pause', () => {
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 0]);
      recorder.startPlayback(0);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 2, 0]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      recorder.settings.pause = 'freeze';
      recorder.pausePlayback();

      diagram.unpause();
      a.animations.new()
        .position({ target: [4.5, 4.5], duration: 2 })
        .start('now');
      diagram.mock.timeStep(1);
      expect(a.getPosition().round(3).x).toBe(2.5);

      // Resume
      recorder.settings.play = 'instant';
      recorder.resumePlayback();
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
    });
    describe('Pause', () => {
      beforeEach(() => {
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 0]);
        recorder.startPlayback(0);
        expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 0]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 2, 0]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
        expect(callbacks()).toEqual([0, 1, 0, 0]);
      });
      test('Freeze', () => {
        recorder.settings.pause = 'freeze';
        recorder.pausePlayback();
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 0.5]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 0.5]);
      });
      test('Complete', () => {
        recorder.settings.pause = 'complete';
        recorder.pausePlayback();
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
      });
      test('Complete before pause', () => {
        recorder.settings.pause = 'completeBeforePause';
        recorder.pausePlayback();
        expect(states()).toEqual(['preparingToPause', 'preparingToPause', 'preparingToPause', true, 1, 0.5]);
        expect(callbacks()).toEqual([0, 1, 1, 0]);
        diagram.mock.timeStep(0.5);
        expect(states()).toEqual(['preparingToPause', 'preparingToPause', 'preparingToPause', true, 0.5, 0.9]);
        diagram.mock.timeStep(0.5);
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
        expect(callbacks()).toEqual([0, 1, 1, 1]);
      });
    });
    describe('Resume after Freeze', () => {
      beforeEach(() => {
        recorder.settings.pause = { default: 'freeze' };
        recorder.startPlayback(0);
        diagram.mock.timeStep(1);
        diagram.mock.timeStep(1);
        recorder.pausePlayback();
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 0.5]);
        expect(callbacks()).toEqual([0, 1, 0, 1]);
      });
      describe('No State Change', () => {
        afterEach(() => {
          recorder.resumePlayback();
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
        });
        test('Animate to resume', () => {
          recorder.settings.play = 'animate';
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
        });
      });
      describe('State Change', () => {
        beforeEach(() => {
          a.setPosition(2.5, 2.5);
        });
        afterEach(() => {
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
          recorder.resumePlayback();
        });
        test('Animate to resume (default velocity)', () => {
          recorder.settings.play = 'animate';
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 2.5]);
          expect(callbacks()).toEqual([1, 1, 0, 1]);
          diagram.mock.timeStep(0.5);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.5, 1.5]);
          diagram.mock.timeStep(0.5);
        });
        test('Animate to resume with velocity and duration', () => {
          // duration should trump
          recorder.settings.play = {
            action: 'animate',
            duration: 2,
            velocity: {
              position: 2,
            },
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 2, 2.5]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 1.5]);
          diagram.mock.timeStep(1);
        });
        test('Animate to resume with custom velocity', () => {
          recorder.settings.play = {
            action: 'animate',
            velocity: { position: 1 },
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 2, 2.5]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 1.5]);
          diagram.mock.timeStep(1);
        });
        test('Animate to resume with velocity and maxTime', () => {
          recorder.settings.play = {
            action: 'animate',
            maxTime: 0.5, // default velocity of position: 2 will result in time of 1
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.5, 2.5]);
          diagram.mock.timeStep(0.25);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.25, 1.5]);
          diagram.mock.timeStep(0.25);
        });
        test('Animate to resume with velocity and minTime', () => {
          recorder.settings.play = {
            action: 'animate',
            minTime: 2, // default velocity of position: 2 will result in time of 1
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 2, 2.5]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 1.5]);
          diagram.mock.timeStep(1);
        });
        test('Animate to resume with velocity and zeroThreshold', () => {
          recorder.settings.play = {
            action: 'animate',
            zeroDurationThreshold: 1, // default velocity of position: 2 will result in time of 1
          };
          recorder.resumePlayback();
        });
        test('Animate to resume with velocity and allDurationsSame', () => {
          a.setColor([0.9, 0, 0, 1]);
          recorder.settings.play = {
            action: 'animate',
            allDurationsSame: true, // default velocity of position: 2 will result in time of 1
            velocity: {
              position: 2,
              color: 1,
            },
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 2.5]);
          expect(round(a.color[0])).toBe(0.9);
          diagram.mock.timeStep(0.5);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.5, 1.5]);
          expect(round(a.color[0])).toBe(0.95);
          diagram.mock.timeStep(0.5);
        });
        test('Animate to resume with velocity and NOT allDurationsSame', () => {
          a.setColor([0.9, 0, 0, 1]);
          recorder.settings.play = {
            action: 'animate',
            allDurationsSame: false, // default velocity of position: 2 will result in time of 1
            velocity: {
              position: 2,
              color: 0.2,
            },
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 2.5]);
          expect(round(a.color[0])).toBe(0.9);
          diagram.mock.timeStep(0.25);
          expect(round(a.color[0])).toBe(0.95);
          diagram.mock.timeStep(0.25);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.5, 1.5]);
          expect(round(a.color[0])).toBe(1);
          diagram.mock.timeStep(0.5);
        });
        test('Animate to resume with duration', () => {
          recorder.settings.play = {
            action: 'animate',
            duration: 2,
          };
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 2, 2.5]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 1.5]);
          diagram.mock.timeStep(1);
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';

          recorder.resumePlayback();
          // dissolve out
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 2.5]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.6, 2.5]);
          expect(round(diagram.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);

          // end dissolve out, start delay
          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.2, 2.5]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);

          // end delay, start dissolve in
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.8, 0.5]);
          // expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);
          // disolve in
          expect(round(diagram.elements.opacity)).toBe(0.001);
          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.4, 0.5]);
          expect(diagram.elements.isShown).toBe(true);
          expect(round(diagram.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);
          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
        });
        test('Dissolve to resume with duration', () => {
          recorder.settings.play = {
            action: 'dissolve',
            duration: {
              dissolveIn: 1,
              dissolveOut: 1,
              delay: 1,
            },
          };

          recorder.resumePlayback();
          // dissolve out
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 2, 2.5]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          diagram.mock.timeStep(0.5);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1.5, 2.5]);
          expect(round(diagram.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);

          // end dissolve out, start delay
          diagram.mock.timeStep(0.5);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 2.5]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);
          
          // end delay, start dissolve in
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 0.5]);
          // expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);
          
          // disolve in
          expect(round(diagram.elements.opacity)).toBe(0.001);

          diagram.mock.timeStep(0.5);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.5, 0.5]);
          expect(diagram.elements.isShown).toBe(true);
          expect(round(diagram.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);

          diagram.mock.timeStep(0.5);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
        });
      });
    });
    describe('Resume after Complete', () => {
      beforeEach(() => {
        recorder.settings.pause = 'complete';
        recorder.startPlayback(0);

        diagram.mock.timeStep(1);
        diagram.mock.timeStep(1);
        recorder.pausePlayback();
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
      });
      describe('No State Change', () => {
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
          recorder.resumePlayback();
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
        });
        test('Animate to resume', () => {
          recorder.settings.play = 'animate';
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.25, 1]);
          diagram.mock.timeStep(0.125);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.125, 0.75]);
          diagram.mock.timeStep(0.125);
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';

          recorder.resumePlayback();
          // dissolve out
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 1]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.6, 1]);
          expect(round(diagram.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);

          // end dissolve out, start delay
          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.2, 1]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);
          
          // end delay, start dissolve in
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.8, 0.5]);
          // expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);
          
          // disolve in
          expect(round(diagram.elements.opacity)).toBe(0.001);

          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.4, 0.5]);
          expect(diagram.elements.isShown).toBe(true);
          expect(round(diagram.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);

          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 0.5]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
        });
      });
    })
  });
  describe('Pulse Scale', () => {
    let states;
    let callbacks;
    beforeEach(() => {
      const startPulse = () => {
        // a.pulseScaleNow(2, 2);
        a.pulseScale({ duration: 2, scale: 2, when: 'sync' });
      };
      recorder.addEventType('startPulse', startPulse.bind(this));

      diagram.mock.timeStep(0);  // Ok
      // console.log(a.drawTransforms[0].s().round(3).x)
      recorder.startRecording();
      diagram.mock.timeStep(1);
      // console.log(a.drawTransforms[0].s().round(3).x)
      startPulse();
      recorder.recordEvent('startPulse');
      diagram.mock.timeStep(0);  // Ok
      diagram.mock.timeStep(1);
      // console.log(a.drawTransforms[0].s().round(3).x)
      diagram.mock.timeStep(1);
      diagram.mock.timeStep(1);
      // console.log(a.drawTransforms[0].s().round(3).x)
      recorder.recordEvent('touch', ['up']);
      recorder.stopRecording();
      recorder.seek(0);
      // console.log(a.drawTransforms[0].s().round(3).x)

      states = () => {
        const scale = a.drawTransforms[0].s().round(3).x;
        return [
          recorder.state, diagram.state.pause, a.state.pause,
          diagram.isAnimating(),
          round(diagram.getRemainingAnimationTime()), scale,
        ];
      };
      callbacks = () => [
        preparingToPlayCallback.mock.calls.length,
        playbackStartedCallback.mock.calls.length,
        preparingToPauseCallback.mock.calls.length,
        playbackStoppedCallback.mock.calls.length,
      ];
    });
    test('No Pausing', () => {
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
      recorder.startPlayback(0);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 2, 1]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 2]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
    });
    describe('Pause', () => {
      beforeEach(() => {
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
        recorder.startPlayback(0);
        expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 2, 1]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 2]);
      });
      test('Freeze', () => {
        recorder.settings.pause = 'freeze';
        recorder.pausePlayback();
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 2]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 2]);
      });
      test('Complete', () => {
        recorder.settings.pause = 'complete';
        expect(a.pulseTransforms[0].s().round(3).x).toBe(2);
        recorder.pausePlayback();
        expect(a.pulseTransforms.length).toBe(0);
        expect(a.frozenPulseTransforms.length).toBe(0);
        // This is ok to do a 0 step as the drawTransforms is only updated
        // on the next draw
        diagram.mock.timeStep(0);  // ok
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
      });
      test('Complete before pause', () => {
        recorder.settings.pause = 'completeBeforePause';
        recorder.pausePlayback();
        expect(states()).toEqual(['preparingToPause', 'preparingToPause', 'preparingToPause', true, 1, 2]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
      });
    });
    describe('Resume after freeze', () => {
      beforeEach(() => {
        recorder.settings.pause = 'freeze';
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
        recorder.startPlayback(0);
        expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 2, 1]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 2]);
        expect(a.pulseTransforms[0].s().round(3).x).toBe(2);
        expect(a.frozenPulseTransforms.length).toBe(0);
        recorder.pausePlayback();
        // recorder.resumePlayback();
        expect(a.pulseTransforms.length).toBe(0);
        expect(a.frozenPulseTransforms[0].s().round(3).x).toBe(2);
        
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 2]);
      });
      describe('No State Change', () => {
        afterEach(() => {
          recorder.resumePlayback();
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 2]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
        });
        test('Animate to resume', () => {
          recorder.settings.play = 'animate';
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
        });
      });
      describe('Pulse State Change', () => {
        beforeEach(() => {
          diagram.unpause();
          // a.pulseScaleNow(2, 4);
          a.pulseScale({ duration: 2, scale: 4, when: 'sync' });
          // This is ok as it kicks off the pulse
          diagram.mock.timeStep(0); // Ok
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['idle', 'unpaused', 'unpaused', true, 1, 4]);
        });
        afterEach(() => {
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 2]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
          expect(a.pulseTransforms[0].s().round(3).x).toBe(4);
          recorder.resumePlayback();
          expect(a.pulseTransforms[0].s().round(3).x).toBe(2);
          // This is ok as drawTransforms won't update will next draw and
          // pulseTransforms is confirmed updated
          diagram.mock.timeStep(0); // Ok
        });
        test('Animate to resume', () => {
          recorder.settings.play = 'animate';
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 2, 4]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 3]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 2]);
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
          recorder.resumePlayback();

          // dissolve out
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 4]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.6, 4]);
          expect(round(diagram.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);

          // end dissolve out, start delay
          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.2, 4]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);
          
          // end delay, start dissolve in
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.8, 2]);
          // expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);
          
          // disolve in
          expect(round(diagram.elements.opacity)).toBe(0.001);

          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.4, 2]);
          expect(diagram.elements.isShown).toBe(true);
          expect(round(diagram.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);

          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 2]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
        });
      });
      describe('Position State Change', () => {
        beforeEach(() => {
          a.setPosition(4, 4);
        });
        afterEach(() => {
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 2]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
          recorder.resumePlayback();
        });
        test('Animate to resume', () => {
          recorder.settings.play = 'animate';
          expect(a.getPosition().round(3).x).toBe(4);
          recorder.resumePlayback();
          expect(a.getPosition().round(3).x).toBe(4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 2, 2]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 2]);
          expect(a.getPosition().round(3).x).toBe(2);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 2]);
          expect(a.getPosition().round(3).x).toBe(0);
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
          recorder.resumePlayback();
          // diagram.mock.timeStep(0)

          // dissolve out
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 2]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.getPosition().round(3).x).toBe(4);
          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.6, 2]);
          expect(round(diagram.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(a.getPosition().round(3).x).toBe(4);

          // end dissolve out, start delay
          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.2, 2]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);
          expect(a.getPosition().round(3).x).toBe(4);
          
          // end delay, start dissolve in
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.8, 2]);
          // expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);
          expect(a.getPosition().round(3).x).toBe(0);
          
          // disolve in
          expect(round(diagram.elements.opacity)).toBe(0.001);

          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.4, 2]);
          expect(diagram.elements.isShown).toBe(true);
          expect(round(diagram.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);
          expect(a.getPosition().round(3).x).toBe(0);

          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 2]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.getPosition().round(3).x).toBe(0);
        });
      });
      describe('Position and Pulse State Change', () => {
        beforeEach(() => {
          diagram.unpause();
          a.setPosition(4, 4);
          // a.pulseScaleNow(2, 4);
          a.pulseScale({ duration: 2, scale: 4, when: 'sync' });
          // This is ok as it kicks off the pulse
          diagram.mock.timeStep(0);  // Ok
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['idle', 'unpaused', 'unpaused', true, 1, 4]);
        });
        afterEach(() => {
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 2]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
          expect(a.pulseTransforms[0].s().round(3).x).toBe(4);
          recorder.resumePlayback();
          expect(a.pulseTransforms[0].s().round(3).x).toBe(2);
          // This is ok as pulseTransforms is updated and drawTransforms will
          // be updated on the next draw
          diagram.mock.timeStep(0);  // Ok
        });
        test('Animate to resume with different durations', () => {
          recorder.settings.play = 'animate';
          a.setPosition(2, 2);
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 2, 4]);
          expect(a.getPosition().round(3).x).toBe(2);
          diagram.mock.timeStep(0.5);
          expect(a.getPosition().round(3).x).toBe(1);
          diagram.mock.timeStep(0.5);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 3]);
          expect(a.getPosition().round(3).x).toBe(0);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 2]);
          expect(a.getPosition().round(3).x).toBe(0);
        });
        test('Animate to resume with same durations', () => {
          recorder.settings.play = 'animate';
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 2, 4]);
          expect(a.getPosition().round(3).x).toBe(4);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 3]);
          expect(a.getPosition().round(3).x).toBe(2);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 2]);
          expect(a.getPosition().round(3).x).toBe(0);
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
          recorder.resumePlayback();


          // dissolve out
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 4]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.getPosition().round(3).x).toBe(4);
          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.6, 4]);
          expect(round(diagram.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(a.getPosition().round(3).x).toBe(4);

          // end dissolve out, start delay
          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.2, 4]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);
          expect(a.getPosition().round(3).x).toBe(4);
          
          // end delay, start dissolve in
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.8, 2]);
          // expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);
          expect(a.getPosition().round(3).x).toBe(0);
          
          // disolve in

          expect(round(diagram.elements.opacity)).toBe(0.001);

          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.4, 2]);
          expect(diagram.elements.isShown).toBe(true);
          expect(round(diagram.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);
          expect(a.getPosition().round(3).x).toBe(0);

          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 2]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.getPosition().round(3).x).toBe(0);
        });
      });
    });
    describe('Resume after complete', () => {
      beforeEach(() => {
        recorder.settings.pause = 'complete';
        recorder.startPlayback(0);
        diagram.mock.timeStep(0);  // Ok
        diagram.mock.timeStep(1);
        diagram.mock.timeStep(1);
        recorder.pausePlayback();
        diagram.mock.timeStep(0);  // Ok
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
      });
      describe('No State Change', () => {
        afterEach(() => {
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 2]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, 1]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, 1]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
          expect(a.pulseTransforms.length).toBe(0);
          recorder.resumePlayback();
          expect(a.pulseTransforms[0].s().round(3).x).toBe(2);
          // This is ok as pulseTransforms is updated, and drawTransforms will
          // be updated on the next draw
          diagram.mock.timeStep(0);  // Ok
        });
        test('Animate to resume', () => {
          recorder.settings.play = 'animate';
          expect(a.frozenPulseTransforms.map(t => t.s().round(3).x)).toEqual([]);
          recorder.resumePlayback();
          expect(a.frozenPulseTransforms.map(t => t.s().round(3).x)).toEqual([1]);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 1]);
          diagram.mock.timeStep(0.5);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.5, 1.5]);
          diagram.mock.timeStep(0.5);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 2]);
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
          recorder.resumePlayback();

          // dissolve out
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, 1]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.6, 1]);
          expect(round(diagram.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);

          // end dissolve out, start delay
          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.2, 1]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);

          // end delay, start dissolve in
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.8, 2]);
          // expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);

          // disolve in

          expect(round(diagram.elements.opacity)).toBe(0.001);

          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.4, 2]);
          expect(diagram.elements.isShown).toBe(true);
          expect(round(diagram.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);

          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, 2]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          // recorder.resumePlayback();
        });
      });
    });
  });
  describe('Pulse Lines', () => {
    let states;
    let callbacks;
    beforeEach(() => {
      const startPulse = () => {
        // a.pulseThickNow(2, 1.1, 3);
        a.pulseThick({
          duration: 2, scale: 1.1, num: 3, when: 'sync',
        });
      };
      recorder.addEventType('startPulse', startPulse.bind(this));

      diagram.mock.timeStep(0);  // Ok
      recorder.startRecording();
      diagram.mock.timeStep(1);
      startPulse();
      recorder.recordEvent('startPulse');
      diagram.mock.timeStep(1);
      diagram.mock.timeStep(1);
      diagram.mock.timeStep(1);
      recorder.recordEvent('touch', ['up']);
      recorder.stopRecording();
      recorder.seek(0);

      // const check = (recorderState, diagramIsPaused, aIsPaused, isAnimating, remainingAnimationTime, x) => {
      //   expect(recorderState).toEqual(recorderState)
      // }
      states = () => {

        const scale = a.drawTransforms.map(t => t.s().round(3).x);
        return [recorder.state, diagram.state.pause, a.state.pause, diagram.isAnimating(), round(diagram.getRemainingAnimationTime()), scale];
      };
      callbacks = () => [
        preparingToPlayCallback.mock.calls.length,
        playbackStartedCallback.mock.calls.length,
        preparingToPauseCallback.mock.calls.length,
        playbackStoppedCallback.mock.calls.length,
      ];
    });
    test('No Pausing', () => {
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, [1]]);
      recorder.startPlayback(0);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, [1]]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 2, [1,1, 1]]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, [1.1, 1, 0.9]]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, [1]]);
      diagram.mock.timeStep(1);
      expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, [1]]);
    });
    describe('Pause', () => {
      beforeEach(() => {
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, [1]]);
        recorder.startPlayback(0);
        expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, [1]]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 2, [1,1, 1]]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, [1.1, 1, 0.9]]);
      });
      test('Freeze', () => {
        recorder.settings.pause = 'freeze';
        recorder.pausePlayback();
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, [1.1, 1, 0.9]]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, [1.1, 1, 0.9]]);
      });
      test('Complete', () => {
        recorder.settings.pause = 'complete';
        expect(a.pulseTransforms.map(t => t.s().round(3).x)).toEqual([1.1, 1, 0.9]);
        recorder.pausePlayback();
        expect(a.pulseTransforms.map(t => t.s().round(3).x)).toEqual([]);
        // This is ok as pulseTransforms is updated, and drawTransforms
        // will be updated on next frame
        diagram.mock.timeStep(0);  // Ok
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, [1]]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, [1]]);
      });
      test('Complete before pause', () => {
        recorder.settings.pause = 'completeBeforePause';
        recorder.pausePlayback();
        expect(states()).toEqual(['preparingToPause', 'preparingToPause', 'preparingToPause', true, 1, [1.1, 1, 0.9]]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, [1]]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, [1]]);
      });
    });
    describe('Resume after freeze', () => {
      beforeEach(() => {
        recorder.settings.pause = 'freeze';
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, [1]]);
        recorder.startPlayback(0);
        expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, [1]]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 2, [1,1, 1]]);
        diagram.mock.timeStep(1);
        expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, [1.1, 1, 0.9]]);
        recorder.pausePlayback();
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, [1.1, 1, 0.9]]);
      });
      describe('No State Change', () => {
        afterEach(() => {
          recorder.resumePlayback();
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, [1.1, 1, 0.9]]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, [1]]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, [1]]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
        });
        test('Animate to resume', () => {
          recorder.settings.play = 'animate';
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
        });
      });
      describe('Pulse State Change', () => {
        beforeEach(() => {
          diagram.unpause();
          // a.pulseThickNow(2, 1.2, 3);
          a.pulseThick({
            duration: 2, scale: 1.2, num: 3, when: 'sync',
          });
          // This is Ok as it kicks off pulse
          diagram.mock.timeStep(0);  // Ok
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['idle', 'unpaused', 'unpaused', true, 1, [1.2, 1, 0.8]]);
        });
        afterEach(() => {
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, [1.1, 1, 0.9]]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, [1]]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, [1]]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
          expect(a.pulseTransforms.map(t => t.s().round(3).x)).toEqual([1.2, 1, 0.8]);
          recorder.resumePlayback();
          expect(a.pulseTransforms.map(t => t.s().round(3).x)).toEqual([1.1, 1, 0.9]);
          // This is Ok as pulseTransforms is updated, and drawTransforms will
          // be updated on the next frame
          diagram.mock.timeStep(0);  // Ok
        });
        test('Animate to resume', () => {
          recorder.settings.play = 'animate';
          recorder.resumePlayback();
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.1, [1.2, 1, 0.8]]);
          diagram.mock.timeStep(0.05);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.05, [1.15, 1, 0.85]]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, [1.1, 1, 0.9]]);
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
          recorder.resumePlayback();


          // dissolve out
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, [1.2, 1, 0.8]]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.6, [1.2, 1, 0.8]]);
          expect(round(diagram.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);

          // end dissolve out, start delay
          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.2, [1.2, 1, 0.8]]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);
          
          // end delay, start dissolve in
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.8, [1.1, 1, 0.9]]);
          // expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);
          
          // disolve in

          expect(round(diagram.elements.opacity)).toBe(0.001);

          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.4, [1.1, 1, 0.9]]);
          expect(diagram.elements.isShown).toBe(true);
          expect(round(diagram.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);

          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, [1.1, 1, 0.9]]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
        });
      });
    });
    describe('Resume after complete', () => {
      beforeEach(() => {
        recorder.settings.pause = 'complete';
        recorder.startPlayback(0);
        diagram.mock.timeStep(0);  // Ok
        diagram.mock.timeStep(1);
        diagram.mock.timeStep(1);
        recorder.pausePlayback();
        diagram.mock.timeStep(0);  // Ok
        expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, [1]]);
      });
      describe('No State Change', () => {
        afterEach(() => {
          expect(a.frozenPulseTransforms.map(t => t.s().round(3).x)).toEqual([]); 
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, [1.1, 1, 0.9]]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', false, 0, [1]]);
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['idle', 'paused', 'paused', false, 0, [1]]);
        });
        test('Instant resume', () => {
          recorder.settings.play = 'instant';
          expect(a.pulseTransforms.map(t => t.s().round(3).x)).toEqual([]);
          recorder.resumePlayback();
          expect(a.pulseTransforms.map(t => t.s().round(3).x)).toEqual([1.1, 1, 0.9]);
          // This is ok as pulseTransforms is updated and drawTransforms will
          // be updated on next frame
          diagram.mock.timeStep(0);  // Ok
        });
        test('Animate to resume', () => {
          recorder.settings.play = 'animate';
          expect(a.pulseTransforms.map(t => t.s().round(3).x)).toEqual([]);
          expect(a.frozenPulseTransforms.map(t => t.s().round(3).x)).toEqual([]); 
          recorder.resumePlayback();
          expect(a.pulseTransforms.map(t => t.s().round(3).x)).toEqual([]);
          expect(a.frozenPulseTransforms.map(t => t.s().round(3).x)).toEqual([1, 1, 1]);
          // This is ok as frozenPulseTransforms is updated and
          // drawTransforms will be updated on next frame
          diagram.mock.timeStep(0);  // Ok
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.1, [1, 1, 1]]);
          diagram.mock.timeStep(0.05);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.05, [1.05, 1, 0.95]]);
          diagram.mock.timeStep(0.05);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, [1.1, 1, 0.9]]);
        });
        test('Dissolve to resume', () => {
          recorder.settings.play = 'dissolve';
          recorder.resumePlayback();


          // dissolve out
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 1, [1]]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.6, [1]]);
          expect(round(diagram.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);

          // end dissolve out, start delay
          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.2, [1]]);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.isShown).toBe(false);
          
          // end delay, start dissolve in
          diagram.mock.timeStep(1);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.8, [1.1, 1, 0.9]]);
          // expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.001);
          
          // disolve in

          expect(round(diagram.elements.opacity)).toBe(0.001);

          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['preparingToPlay', 'unpaused', 'unpaused', true, 0.4, [1.1, 1, 0.9]]);
          expect(diagram.elements.isShown).toBe(true);
          expect(round(diagram.elements.opacity)).toBe(0.5005);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(0.5005);

          diagram.mock.timeStep(0.4);
          expect(states()).toEqual(['playing', 'unpaused', 'unpaused', true, 1, [1.1, 1, 0.9]]);
          expect(a.isShown).toBe(true);
          expect(round(a.opacity)).toBe(1);
          expect(round(diagram.elements.opacity)).toBe(1);
          expect(diagram.elements.isShown).toBe(true);
        });
      });
    });
  });
  describe('Two Elements', () => {
    beforeEach(() => {
      const startPulse = () => {
        // a.pulseScaleNow(2, 2);
        a.pulseScale({ duration: 2, scale: 2, when: 'sync' });
      };
      recorder.addEventType('startPulse', startPulse.bind(this));

      diagram.mock.timeStep(0);  // Ok
      recorder.startRecording();
      diagram.mock.timeStep(1);
      startPulse();
      recorder.recordEvent('startPulse');
      diagram.mock.timeStep(0);  // Ok
      diagram.mock.timeStep(1);
      diagram.mock.timeStep(1);
      diagram.mock.timeStep(1);
      recorder.recordEvent('touch', ['up']);
      recorder.stopRecording();
      recorder.seek(0);

      recorder.startPlayback();
      diagram.mock.timeStep(1);
      diagram.mock.timeStep(1);
      expect(a.drawTransforms[0].s().round(3).x).toBe(2);
      recorder.settings.pause = 'freeze';
      recorder.settings.play = 'animate';
      recorder.pausePlayback();
      diagram.mock.timeStep(1);
      expect(a.drawTransforms[0].s().round(3).x).toBe(2);
    });
    test('Position Change', () => {
      b.setPosition(4, 0);
      diagram.mock.timeStep(1);
      expect(a.drawTransforms[0].s().round(3).x).toBe(2);
      expect(b.drawTransforms[0].t().round(3).x).toBe(4);
      expect(a.pulseTransforms.length).toBe(0);
      expect(a.frozenPulseTransforms[0].s().round(3).x).toBe(2);

      recorder.resumePlayback();
      expect(a.pulseTransforms.length).toBe(0);
      expect(a.frozenPulseTransforms[0].s().round(3).x).toBe(2);
      expect(b.drawTransforms[0].t().round(3).x).toBe(4);
      
      diagram.mock.timeStep(0);
      expect(a.pulseTransforms.length).toBe(0);
      expect(a.frozenPulseTransforms[0].s().round(3).x).toBe(2);
      expect(a.drawTransforms[0].s().round(3).x).toBe(2);
      expect(b.drawTransforms[0].t().round(3).x).toBe(4);

      diagram.mock.timeStep(1);
      expect(recorder.state).toBe('preparingToPlay');
      expect(a.pulseTransforms.length).toBe(0);
      expect(a.frozenPulseTransforms[0].s().round(3).x).toBe(2);
      expect(a.drawTransforms[0].s().round(3).x).toBe(2);
      expect(b.drawTransforms[0].t().round(3).x).toBe(2);

      diagram.mock.timeStep(1);
      expect(recorder.state).toBe('playing');
      expect(a.pulseTransforms[0].s().round(3).x).toBe(2);
      expect(a.frozenPulseTransforms.length).toBe(0);
      expect(a.drawTransforms[0].s().round(3).x).toBe(2);
      expect(b.drawTransforms[0].t().round(3).x).toBe(0);

      diagram.mock.timeStep(0.5);
      expect(recorder.state).toBe('playing');
      expect(a.pulseTransforms[0].s().round(3).x).toBe(1.707);
      expect(a.frozenPulseTransforms.length).toBe(0);
      expect(a.drawTransforms[0].s().round(3).x).toBe(1.707);
      expect(b.drawTransforms[0].t().round(3).x).toBe(0);

      diagram.mock.timeStep(0.5);
      expect(recorder.state).toBe('playing');
      expect(a.pulseTransforms[0].s().round(3).x).toBe(1);
      expect(a.frozenPulseTransforms.length).toBe(0);
      expect(a.drawTransforms[0].s().round(3).x).toBe(1);
      expect(b.drawTransforms[0].t().round(3).x).toBe(0);

      diagram.mock.timeStep(1);
      expect(recorder.state).toBe('idle');
      expect(a.pulseTransforms.length).toBe(0);
      expect(a.frozenPulseTransforms.length).toBe(0);
      expect(a.drawTransforms[0].s().round(3).x).toBe(1);
      expect(b.drawTransforms[0].t().round(3).x).toBe(0);
    });
  });
});