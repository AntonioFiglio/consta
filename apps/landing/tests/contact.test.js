import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("todos os CTAs de contato abrem diretamente o WhatsApp com mensagem pronta", () => {
  const links = [...html.matchAll(/<a\b[^>]*href="(https:\/\/wa\.me\/[^\"]+)"[^>]*>/g)];
  assert.equal(links.length, 7);
  for (const [tag, href] of links) {
    const url = new URL(href);
    assert.equal(url.origin, "https://wa.me");
    assert.equal(url.pathname, "/5516991001262");
    assert.equal(url.searchParams.get("text"), "Olá, equipe Consta! Quero conhecer o projeto e entrar na lista de interesse.");
    assert.deepEqual([...url.searchParams.keys()], ["text"]);
    assert.match(tag, /target="_blank"/);
    assert.match(tag, /rel="noopener noreferrer"/);
  }
});

test("contato não exige formulário, campos ou navegação intermediária", () => {
  assert.doesNotMatch(html, /<(form|input|select|textarea)\b/i);
  assert.doesNotMatch(html, /href="#lista"/);
  const script = readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
  assert.doesNotMatch(script, /FormData|submit|interest-form|createContactUrl/);
});
