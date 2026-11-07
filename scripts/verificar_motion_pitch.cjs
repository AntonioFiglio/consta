// Samples actual continuity-wire geometry against visible copy and controls.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {webkit} = require(process.env.CONSTA_PLAYWRIGHT_MODULE || 'playwright');

function wireTextIntersections() {
  const hits = [];
  function visible(element, threshold) {
    let opacity = 1;
    for (; element && element !== document.body; element = element.parentElement) {
      const style = getComputedStyle(element);
      if (style.visibility === 'hidden' || style.display === 'none') return false;
      opacity *= Number(style.opacity);
    }
    return opacity >= threshold;
  }
  function overlap(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }
  // Slab clipping tests the rendered segment, never the containing SVG's empty box.
  function segmentHits(a, b, rect, radius) {
    let low = 0, high = 1;
    for (const [start, end, min, max] of [
      [a.x, b.x, rect.left - radius, rect.right + radius],
      [a.y, b.y, rect.top - radius, rect.bottom + radius]
    ]) {
      const delta = end - start;
      if (Math.abs(delta) < 1e-9) {
        if (start < min || start > max) return false;
      } else {
        const u = (min - start) / delta, v = (max - start) / delta;
        low = Math.max(low, Math.min(u, v)); high = Math.min(high, Math.max(u, v));
        if (low > high) return false;
      }
    }
    return true;
  }
  const targets = [];
  for (const layer of document.querySelectorAll('[data-layer], .controls')) {
    const walker = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.textContent.trim() || !visible(node.parentElement, .3)) continue;
      const range = document.createRange(); range.selectNodeContents(node);
      for (const rect of range.getClientRects()) {
        if (rect.width && rect.height) targets.push({rect, label: node.textContent.trim().slice(0, 70), canonical: !!node.parentElement.closest('#t-brand')});
      }
    }
  }
  // Protect the complete presenter-button hit area, including icon-only controls.
  for (const button of document.querySelectorAll('.controls button')) {
    if (visible(button, .3)) targets.push({rect: button.getBoundingClientRect(), label: `control:${button.id}`, canonical: false});
  }
  const line = document.querySelector('#hero-line');
  if (line && !(line instanceof SVGGeometryElement) && visible(line, .1)) {
    const rect = line.getBoundingClientRect();
    for (const target of targets) if (overlap(rect, target.rect)) hits.push({wire: 'hero-line', text: target.label});
  }
  const paths = document.querySelectorAll('[data-motion-wire], [data-logo-morph], #hero-line path, path#hero-line');
  for (const shape of paths) {
    if (!(shape instanceof SVGGeometryElement) || !visible(shape, .1)) continue;
    const style = getComputedStyle(shape);
    const hasStroke = style.stroke !== 'none' && Number(style.strokeOpacity) > .1;
    const hasFill = style.fill !== 'none' && Number(style.fillOpacity) > .1;
    if (!hasStroke && !hasFill) continue;
    const matrix = shape.getScreenCTM();
    if (!matrix) continue;
    const scale = Math.max(Math.hypot(matrix.a, matrix.b), Math.hypot(matrix.c, matrix.d));
    const radius = hasStroke ? parseFloat(style.strokeWidth) * (style.vectorEffect === 'non-scaling-stroke' ? 1 : scale) / 2 : 0;
    const length = shape.getTotalLength();
    if (!length) continue;
    // Subpixel screen sampling also lets us identify discontinuous subpaths:
    // a contour jump exceeds the arc-length step and must not become a fake connector.
    const count = Math.max(1, Math.ceil(length * scale * 2));
    const step = length / count;
    const points = [];
    for (let i = 0; i <= count; i++) points.push(shape.getPointAtLength(i * step).matrixTransform(matrix));
    const morph = shape.matches('[data-logo-morph]');
    const inverse = matrix.inverse();
    for (const target of targets) {
      if (morph && target.canonical) continue; // Only the wordmark this path replaces.
      let hit = false;
      for (let i = 1; i < points.length && !hit; i++) {
        const a = points[i - 1], b = points[i];
        if (Math.hypot(b.x - a.x, b.y - a.y) > step * scale * 1.5 + .01) continue;
        hit = segmentHits(a, b, target.rect, radius);
      }
      // A filled contour can enclose copy without crossing its rectangle edge.
      if (!hit && hasFill && typeof shape.isPointInFill === 'function') {
        const rect = target.rect;
        hit = [[rect.left, rect.top], [rect.right, rect.top], [rect.left, rect.bottom], [rect.right, rect.bottom], [(rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2]].some(([x, y]) => shape.isPointInFill(new DOMPoint(x, y).matrixTransform(inverse)));
      }
      if (hit) hits.push({wire: shape.id || (morph ? 'logo-morph' : 'svg-wire'), text: target.label});
    }
  }
  return hits;
}

(async () => {
  const output = '/tmp/consta-temporal-qa';
  fs.mkdirSync(output, {recursive: true});
  const browser = await webkit.launch({headless: true, ...(process.env.CONSTA_WEBKIT_EXECUTABLE ? {executablePath: process.env.CONSTA_WEBKIT_EXECUTABLE} : {})});
  const findings = [];
  try {
    for (const viewport of [{width: 1280, height: 720}, {width: 1920, height: 1080}, {width: 1024, height: 768}]) {
      const page = await browser.newPage({viewport, offline: true});
      await page.goto(pathToFileURL(path.resolve(__dirname, '../pitch/deck.html')).href);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(900);
      const total = 17; // Visible route; legacy internal beat aliases are not slides.
      const size = `${viewport.width}x${viewport.height}`;
      async function sample(label, times = [120, 360, 760, 1600]) {
        let elapsed = 0;
        for (const time of times) {
          await page.waitForTimeout(time - elapsed); elapsed = time;
          const hits = await page.evaluate(wireTextIntersections);
          if (hits.length) findings.push({viewport: size, transition: label, ms: time, hits});
          if (hits.length || viewport.width === 1280 || time === times[times.length - 1]) {
            await page.screenshot({path: `${output}/${size}-${label}-${time}.png`});
          }
        }
        // Routing plus logo formation may outlast the fixed intermediate samples.
        // Still inspect its settled frame instead of treating duration as a failure.
        if (times[times.length - 1] === 1600) {
          await page.waitForFunction(() => {
            const wire = document.querySelector('#hero-wire');
            return !wire || wire.dataset.phase === 'idle';
          }, {timeout: 10000});
          const hits = await page.evaluate(wireTextIntersections);
          if (hits.length) findings.push({viewport: size, transition: label, ms: 'idle', hits});
          await page.screenshot({path: `${output}/${size}-${label}-idle.png`});
        }
      }
      for (let beat = 1; beat < total; beat++) {
        await page.evaluate(() => constaPitch.next()); await sample(`forward-to-${beat}`);
      }
      for (let beat = total - 2; beat >= 0; beat--) {
        await page.evaluate(() => constaPitch.prev()); await sample(`reverse-to-${beat}`);
      }
      // Reverse while the logo and map transitions are in flight; goTo itself stays instant.
      for (const start of [5, 16, 14]) {
        await page.evaluate(beat => constaPitch.goTo(beat), start);
        await page.evaluate(() => constaPitch.next());
        await sample(`interrupt-out-${start}`, [120, 360]);
        await page.evaluate(() => constaPitch.prev());
        await sample(`interrupt-return-${start}`);
      }
      await page.close();
    }
    fs.writeFileSync(`${output}/findings.json`, JSON.stringify(findings, null, 2));
    assert.deepEqual(findings, [], 'Continuity wire crossed visible copy/controls; see temporal screenshots');
    console.log('PASS: forward, reverse and interrupted transitions have no sampled wire/copy intersections at all three viewports.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error); process.exitCode = 1;});
