// Browser checks for the waiting cover and BLE appendix. No runtime dependency for the deck.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {webkit} = require(process.env.CONSTA_PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const output = '/tmp/consta-support-qa';
  fs.mkdirSync(output, {recursive: true});
  const browser = await webkit.launch({
    headless: true,
    ...(process.env.CONSTA_WEBKIT_EXECUTABLE ? {executablePath: process.env.CONSTA_WEBKIT_EXECUTABLE} : {})
  });
  const file = name => pathToFileURL(path.resolve(__dirname, '../pitch', name)).href;
  try {
    for (const width of [1920, 1280]) {
      const page = await browser.newPage({viewport: {width, height: width === 1920 ? 1080 : 720}, offline: true});
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(file('cover.html'));
      await page.waitForTimeout(500);
      await page.screenshot({path: `${output}/cover-${width}.png`});
      await page.keyboard.press('PageDown');
      await page.waitForTimeout(1000);
      assert(page.url().includes('deck.html'));
      await page.goto(file('apoio-tecnico.html'));
      await page.waitForTimeout(500);
      const total = await page.evaluate(() => constaBLE.getState().total);
      for (let beat = 0; beat < total; beat++) {
        await page.evaluate(index => constaBLE.goTo(index), beat);
        await page.waitForTimeout(500);
        assert.equal(await page.evaluate(() => constaBLE.getState().beat), beat);
        const brokenImages = await page.locator('img').evaluateAll(elements =>
          elements.filter(element => !element.complete || !element.naturalWidth).map(element => element.src));
        assert.deepEqual(brokenImages, []);
        await page.screenshot({path: `${output}/ble-${width}-${beat}.png`});
      }
      await page.evaluate(() => constaBLE.goTo(0));
      await page.keyboard.press('PageDown');
      assert.equal(await page.evaluate(() => constaBLE.getState().beat), 1);
      await page.keyboard.press('PageUp');
      assert.equal(await page.evaluate(() => constaBLE.getState().beat), 0);
      await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'PageDown', repeat: true, bubbles: true
      })));
      assert.equal(await page.evaluate(() => constaBLE.getState().beat), 0, 'Repeated key changed BLE screen');
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('PASS: cover advance, BLE states, offline images, keys and repeat in both viewports.');
  } finally {
    await browser.close();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
