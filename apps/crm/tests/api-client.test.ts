import { test } from "node:test";
import assert from "node:assert/strict";
import { api } from "../src/api.js";

test("página HTML com status 200 não é aceita como configuração de autenticação", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(
    "<!doctype html><html><body>Consta</body></html>",
    { headers: { "Content-Type": "text/html" } },
  ));
  await assert.rejects(() => api("/config"), /Não foi possível conectar ao servidor do Consta/);
  await assert.rejects(() => api("/login", {
    method: "POST", body: JSON.stringify({ password: "synthetic-password" }),
  }), /Não foi possível conectar ao servidor do Consta/);
});

test("configuração autenticada continua retornando os dados da API", async (t) => {
  const config = { authenticated: true, passwordRequired: true };
  t.mock.method(globalThis, "fetch", async () => Response.json(config));
  assert.deepEqual(await api("/config"), config);
});

test("senha incorreta preserva a mensagem de autenticação do servidor", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json(
    { error: "Senha incorreta." }, { status: 401 },
  ));
  await assert.rejects(() => api("/login", {
    method: "POST", body: JSON.stringify({ password: "synthetic-wrong-password" }),
  }), /^Error: Senha incorreta\.$/);
});
