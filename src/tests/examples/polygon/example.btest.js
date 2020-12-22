/* global page figure */
/* eslint-disable jest/no-export, no-await-in-loop */
// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { steps } = require('./steps.js');

expect.extend({ toMatchImageSnapshot });

const messages = [];
page.on('console', (msg) => {
  for (let i = 0; i < msg.args().length; i += 1) {
    const result = `${msg.args()[i]}`;
    messages.push(result);
    console.log(result)
  }
});

function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}

let index = 0;
function testBrowser(title, file, stepsIn) {
  jest.setTimeout(60000);

  // function delay(time) {
  //   return new Promise(function(resolve) {
  //       setTimeout(resolve, time)
  //   });
  // }
  const tests = [];
  let lastTime = 0;
  stepsIn.forEach((step) => {
    let test;
    let time;
    let action;
    let location;
    let description;
    if (Array.isArray(step)) {
      [time, action, location, description] = step;
    } else {
      time = step;
    }
    const delta = time - lastTime;
    test = [
      time,
      description || '',
      delta,
      action || null,
      location || [],
    ];
    lastTime = time;
    tests.push(test);
  });

  describe(title, () => {
    beforeAll(async () => {
      await page.setViewportSize({ width: 500, height: 375 });
      await page.goto(file);
      await page.evaluate(() => {
        clearTimeout(timeoutId);
        figure.globalAnimation.setManualFrames();
        figure.globalAnimation.frame(0);
      });
    });
    test.each(tests)('%i %s',
    async (time, description, deltaTime, action, location) => {
      await page.evaluate(([delta, t, l]) => {
        figure.globalAnimation.frame(delta)
        if (t != null) {
          const loc = Fig.tools.g2.getPoint(l || [0, 0]);
          figure[t](loc);
        }
      }, [deltaTime, action, location]);
      image = await page.screenshot({ fullPage: true });
      expect(image).toMatchImageSnapshot({
        customSnapshotIdentifier: `${zeroPad(time * 1000, 5)}-${description}`,
      });
      index += 1;
    });
  });
}

console.log(`file:/${__dirname}/example.html`)
testBrowser('Example 1', `file:/${__dirname}/example.html`, steps);
