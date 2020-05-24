// @flow
import {
  ObjectTracker,
} from '../tools/tools';

let cache = new ObjectTracker();

addEventListener("message", (event) => {
  const { message, payload } = event.data;
  if (message === 'reset') {
    resetCache(payload.baseReference, payload.references)
  } else if (message === 'get') {
    postMessage({
      baseReferece: cache.baseReference,
      references: cache.references,
      diffs: cache.diffs,
    });
  } else if (message = 'add') {
    add(payload.now, payload.state, payload.reference, payload.lastRecordTimeCount);
  }
  // console.log('worker', event.data);
  // postMessage(`From Worker: ${event.data[0] + 2 * event.data[1]}`)
});

function resetCache(baseReference: Object, references: Object) {
  cache = new ObjectTracker();
  cache.baseReference = baseReference;
  cache.references = references;
}

function add(now: number, state: Object, reference: string, lastRecordTimeCount: number) {
  
}
