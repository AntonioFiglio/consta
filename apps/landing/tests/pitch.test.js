import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const landing = new URL("../", import.meta.url);
const original = new URL("../../pitch/", landing);
const copy = new URL("public/pitch/", landing);

test("o link do pitch abre a capa em outra aba e a cópia preserva a apresentação", () => {
  const html = readFileSync(new URL("index.html", landing), "utf8");
  assert.match(html, /href="\.\/pitch\/deck\.html#b=0" target="_blank" rel="noopener noreferrer">Ver o pitch/);
  assert.deepEqual(readFileSync(new URL("deck.html", copy)), readFileSync(new URL("deck.html", original)));
  assert.deepEqual(readFileSync(new URL("demo/native/crm-dom.js", copy)), readFileSync(new URL("demo/native/crm-dom.js", original)));
});

test("HTML, CSS, scripts e imagens estáticos do deck têm destino na cópia", () => {
  const html = readFileSync(new URL("deck.html", copy), "utf8");
  const targets = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map((match) => match[1]);
  const css = [...html.matchAll(/url\(([^)]+)\)/g)].map((match) => match[1]);
  for (const path of [...targets, ...css]) {
    if (/^(?:[a-z]+:|#|\/\/)/i.test(path)) continue;
    assert.ok(existsSync(new URL(path.split(/[?#]/)[0], copy)), `Recurso ausente: ${path}`);
  }
});
