import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import { createApp } from "../server/app.js";

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

test("link autenticado de foto do tombamento abre, preenche e encerra", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "consta-capture-"));
  let reading: string | null = "20441";
  const running = createApp({
    database: join(directory, "test.sqlite"),
    password: "test-password",
    seed: false,
    readTombamento: async () => reading,
  });
  const server = running.app.listen(0, "127.0.0.1");
  try {
    await once(server, "listening");
  } catch (error) {
    running.store.close();
    rmSync(directory, { recursive: true, force: true });
    if ((error as NodeJS.ErrnoException).code === "EPERM") {
      t.skip("O ambiente não permite abrir portas para o teste.");
      return;
    }
    throw error;
  }
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
  let cookie = "";
  const send = (path: string, init: RequestInit = {}) =>
    fetch(base + path, {
      ...init,
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
        ...(typeof init.body === "string"
          ? { "Content-Type": "application/json" }
          : {}),
        ...init.headers,
      },
    });
  const photoOf = (name: string) => {
    const body = new FormData();
    body.append("file", new Blob([new Uint8Array(png)], { type: "image/png" }), name);
    return body;
  };
  try {
    const login = await send("/login", {
      method: "POST",
      body: JSON.stringify({ password: "test-password" }),
    });
    assert.equal(login.status, 200);
    cookie = login.headers.get("set-cookie")!.split(";")[0];
    const savedCookie = cookie;
    const upload = new FormData();
    upload.append(
      "file",
      new Blob(["Contrato sintético para fotos de tombamento."]),
      "contrato.txt",
    );
    const uploaded = await send("/contracts", { method: "POST", body: upload });
    assert.equal(uploaded.status, 201);
    const contract = await uploaded.json();
    const rowKey = crypto.randomUUID();
    cookie = "";
    assert.equal(
      (
        await send("/captures", {
          method: "POST",
          body: JSON.stringify({
            contractId: contract.id,
            rows: [{ key: rowKey, name: "Bomba" }],
          }),
        })
      ).status,
      401,
    );
    cookie = savedCookie;
    const created = await send("/captures", {
      method: "POST",
      body: JSON.stringify({
        contractId: contract.id,
        rows: [{ key: rowKey, name: "Bomba de infusão" }],
      }),
    });
    assert.equal(created.status, 201);
    const link = await created.json();
    assert.match(link.token, /^[a-f0-9]{64}$/);
    assert.equal(link.path, `/captura/${link.token}`);

    cookie = "";
    assert.equal((await send(`/captures/${link.token}`)).status, 200);
    assert.equal(
      (await send(`/captures/${link.token}/seal`, { method: "POST" })).status,
      401,
    );
    cookie = savedCookie;
    assert.equal(
      (await send(`/captures/${link.token}/seal`, { method: "POST" })).status,
      409,
    );
    cookie = "";
    assert.equal((await send(`/captures/${link.token}`)).status, 200);

    reading = null;
    const unreadable = photoOf("etiqueta.png");
    unreadable.append("rowKey", rowKey);
    assert.equal(
      (
        await send(`/captures/${link.token}/photos`, {
          method: "POST",
          body: unreadable,
        })
      ).status,
      422,
    );
    reading = "20441";
    const photo = photoOf("etiqueta.png");
    photo.append("rowKey", rowKey);
    const read = await send(`/captures/${link.token}/photos`, {
      method: "POST",
      body: photo,
    });
    assert.equal(read.status, 200);
    assert.equal((await read.json()).patrimony, "20441");
    const view = await (await send(`/captures/${link.token}`)).json();
    assert.equal(view.photosSubmitted, true);
    assert.equal(view.rows[0].patrimony, "20441");
    const invalid = new FormData();
    invalid.append(
      "file",
      new Blob(["não é imagem"], { type: "text/plain" }),
      "nota.txt",
    );
    invalid.append("rowKey", rowKey);
    assert.equal(
      (
        await send(`/captures/${link.token}/photos`, {
          method: "POST",
          body: invalid,
        })
      ).status,
      400,
    );

    cookie = savedCookie;
    assert.equal(
      (await send(`/captures/${link.token}/seal`, { method: "POST" })).status,
      200,
    );
    cookie = "";
    assert.equal((await send(`/captures/${link.token}`)).status, 410);
    const again = photoOf("etiqueta.png");
    again.append("rowKey", rowKey);
    assert.equal(
      (
        await send(`/captures/${link.token}/photos`, {
          method: "POST",
          body: again,
        })
      ).status,
      410,
    );
    assert.equal((await send("/captures/nao-existe")).status, 404);
  } finally {
    await new Promise((resolve) => server.close(() => resolve(undefined)));
    running.store.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
