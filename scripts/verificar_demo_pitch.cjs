// Presentation behavior only: simulated extraction is not an AI speed benchmark.
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const {webkit} = require(process.env.CONSTA_PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await webkit.launch({headless: true, ...(process.env.CONSTA_WEBKIT_EXECUTABLE ? {executablePath: process.env.CONSTA_WEBKIT_EXECUTABLE} : {})});
  try {
    const page = await browser.newPage({viewport: {width: 1280, height: 720}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(`${process.cwd()}/pitch/deck.html`).href);
    await page.waitForFunction(() => window.constaProductDemo?.getState);
    // Natural entry and a direct deep link must autoplay without a manual restart.
    await page.evaluate(() => { constaPitch.goTo(16); constaPitch.next(); });
    await page.waitForFunction(() => constaProductDemo.getState().beat === 8 && constaProductDemo.getState().running, {}, {timeout: 3000});
    const direct = await browser.newPage({viewport: {width: 1280, height: 720}, offline: true});
    await direct.goto(pathToFileURL(`${process.cwd()}/pitch/deck.html`).href + '#b=8');
    await direct.waitForFunction(() => window.constaProductDemo?.getState().beat === 8 && constaProductDemo.getState().running, {}, {timeout: 3000});
    await direct.close();

    await page.evaluate(() => {
      window.demoCompletions = [];
      document.addEventListener('consta:demo-complete', event => demoCompletions.push(event.detail.beat));
      constaPitch.goTo(8);
    });
    await page.waitForTimeout(100);
    await page.evaluate(() => constaProductDemo.restart());
    await page.waitForFunction(() => constaPitch.getState().beat === 10, {}, {timeout: 15000});
    await page.waitForTimeout(2800);
    assert.deepEqual(await page.evaluate(() => demoCompletions), [8, 9]);
    assert.equal(await page.evaluate(() => constaPitch.getState().beat), 10);

    await page.evaluate(() => { demoCompletions = []; constaPitch.goTo(8); });
    await page.waitForTimeout(100);
    await page.evaluate(() => { constaProductDemo.restart(); document.querySelector('#stage').focus(); });
    for (const expected of [9, 10, 11, 13]) {
      await page.waitForTimeout(150);
      await page.keyboard.press('PageDown');
      assert.equal(await page.evaluate(() => constaPitch.getState().beat), expected, 'one key press advances one demo step');
    }
    await page.waitForTimeout(5000);
    assert.equal(await page.evaluate(() => constaPitch.getState().beat), 13, 'cancelled animations cannot advance later');
    assert.deepEqual(await page.evaluate(() => demoCompletions), []);
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.evaluate(() => constaPitch.goTo(8));
    await page.waitForTimeout(1000);
    assert.equal(await page.evaluate(() => constaPitch.getState().beat), 8);
    assert.deepEqual(await page.evaluate(() => demoCompletions), []);
    assert.deepEqual(errors, []);
    console.log('PASS: automatic demo stops at inventory; one key advances; cancelled/reduced runs emit no stale completion; no page errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
