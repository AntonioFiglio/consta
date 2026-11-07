import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStore } from "../server/store.js";
import { briefSchema, createContractBriefService, summarizeContract } from "../server/contract-summary.js";

const content = {
  overview: "Manutenção preventiva de um equipamento sintético.",
  points: [{ topic: "services" as const, text: "Preventiva a cada seis meses.", page: 1, quote: "Preventiva a cada seis meses." }],
  warnings: ["Empresa responsável não informada."],
};
const upload = (store: ReturnType<typeof createStore>, text = "Contrato sintético") => store.upload("contrato.txt", "text/plain", Buffer.from(text));

test("sem configuração retorna Lorem identificado, sem chamar IA, e persiste após reinício", async () => {
  const directory = mkdtempSync(join(tmpdir(), "consta-brief-"));
  let store = createStore(join(directory, "test.sqlite"));
  try {
    const contract = upload(store);
    let calls = 0;
    const options = { ready: () => false, generate: async () => { calls++; return content; } };
    const first = await createContractBriefService(store, options)(contract.id);
    assert.equal(first.source, "simulated");
    assert.match(first.overview, /Lorem ipsum/);
    store.close();
    store = createStore(join(directory, "test.sqlite"));
    assert.deepEqual(await createContractBriefService(store, options)(contract.id), first);
    assert.equal(calls, 0);
    assert.equal(store.getContract(contract.id)?.extraction, null);
    assert.equal("brief" in store.listContracts()[0], false);
  } finally { store.close(); rmSync(directory, { recursive: true, force: true }); }
});

test("configuração promove simulação uma única vez, coalesce chamadas e reutiliza resultado persistido", async () => {
  const store = createStore(":memory:");
  try {
    const contract = upload(store);
    let ready = false;
    let calls = 0;
    let release!: () => void;
    const wait = new Promise<void>(resolve => { release = resolve; });
    const service = createContractBriefService(store, { ready: () => ready, generate: async () => { calls++; await wait; return content; } });
    await service(contract.id);
    ready = true;
    const first = service(contract.id);
    const second = service(contract.id);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(calls, 1);
    const otherInstance = createContractBriefService(store, { ready: () => true, generate: async () => { throw new Error("não deve chamar"); } });
    await assert.rejects(() => otherInstance(contract.id), /em geração/);
    release();
    const result = await first;
    assert.deepEqual(await second, result);
    assert.equal(result.source, "ai");
    assert.deepEqual(await otherInstance(contract.id), result);
    assert.deepEqual(await service(contract.id, true), result);
    ready = false;
    assert.deepEqual(await service(contract.id), result);
    assert.equal(calls, 1);
  } finally { store.close(); }
});

test("falha fica registrada e só uma tentativa explícita permite chamar IA novamente", async () => {
  const store = createStore(":memory:");
  try {
    const contract = upload(store);
    let calls = 0;
    const service = createContractBriefService(store, { ready: () => true, generate: async () => {
      calls++; if (calls === 1) throw new Error("Falha sintética"); return content;
    } });
    await assert.rejects(() => service(contract.id), /Não foi possível/);
    assert.equal(store.getContractBrief(contract.id)?.state, "failed");
    await assert.rejects(() => service(contract.id), /geração anterior/);
    assert.equal(calls, 1);
    assert.equal((await service(contract.id, true)).source, "ai");
    assert.equal(calls, 2);
  } finally { store.close(); }
});

test("lease persistente bloqueia duplicação, recuperação exige ação e token antigo não sobrescreve resultado", async () => {
  const store = createStore(":memory:");
  try {
    const contract = upload(store);
    let now = 1000000;
    assert.equal(store.claimContractBrief(contract.id, "job-antigo", false, now), true);
    let calls = 0;
    const service = createContractBriefService(store, { ready: () => true, now: () => now, generate: async () => { calls++; return content; } });
    await assert.rejects(() => service(contract.id, true), /em geração/);
    now += 120001;
    await assert.rejects(() => service(contract.id), /geração anterior/);
    const result = await service(contract.id, true);
    assert.equal(calls, 1);
    assert.equal(store.finishContractBrief(contract.id, "job-antigo", null), false);
    assert.deepEqual(store.getContractBrief(contract.id)?.brief, result);
  } finally { store.close(); }
});

test("arquivos distintos não compartilham resumo; conteúdo idêntico deduplicado reutiliza cache", async () => {
  const store = createStore(":memory:");
  try {
    const first = upload(store, "Principal sintético");
    const second = upload(store, "Aditivo sintético");
    const duplicate = upload(store, "Principal sintético");
    let calls = 0;
    const service = createContractBriefService(store, { ready: () => true, generate: async () => { calls++; return content; } });
    const one = await service(first.id);
    const two = await service(second.id);
    assert.notEqual(one.sourceHash, two.sourceHash);
    assert.deepEqual(await service(duplicate.id), one);
    assert.equal(calls, 2);
    await assert.rejects(() => service("inexistente"), /não encontrado/);
  } finally { store.close(); }
});

test("SDK do resumo usa saída estruturada, evidência, limite de tokens e nenhuma rede real", async () => {
  const keys = ["OPENAI_API_KEY", "OPENAI_MODEL", "OPENAI_BASE_URL"] as const;
  const previous = keys.map(key => process.env[key]);
  process.env.OPENAI_API_KEY = "test-not-a-real-key";
  process.env.OPENAI_MODEL = "test-model";
  process.env.OPENAI_BASE_URL = "https://provider.invalid/v1";
  try {
    const transport = (async (url: string | URL | Request, init?: RequestInit) => {
      assert.equal(String(url), "https://provider.invalid/v1/responses");
      const body = JSON.parse(String(init?.body));
      assert.equal(body.store, false);
      assert.equal(body.max_output_tokens, 2200);
      assert.equal(body.text.format.strict, true);
      assert.match(body.instructions, /dado não confiável/);
      assert.match(body.instructions, /Não interprete aditivo isolado/);
      assert.match(body.input[0].content[0].file_data, /^data:application\/pdf;base64,/);
      return new Response(JSON.stringify({ id: "resp_test", object: "response", created_at: 1, status: "completed", model: "test-model",
        output: [{ type: "message", id: "msg_test", status: "completed", role: "assistant", content: [{ type: "output_text", text: JSON.stringify(content), annotations: [] }] }],
      }), { headers: { "Content-Type": "application/json" } });
    }) as typeof fetch;
    assert.deepEqual(await summarizeContract(Buffer.from("%PDF- synthetic"), "synthetic.pdf", "application/pdf", transport), content);
    assert.equal(briefSchema.safeParse({ ...content, points: [{ ...content.points[0], quote: "" }] }).success, false);
    delete process.env.OPENAI_API_KEY;
    await assert.rejects(() => summarizeContract(Buffer.from("test"), "test.txt", "text/plain", transport), /AI_NOT_CONFIGURED/);
  } finally { keys.forEach((key, index) => { if (previous[index] === undefined) delete process.env[key]; else process.env[key] = previous[index]; }); }
});
