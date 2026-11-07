import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ContractImportProgress,
  type ContractImportState,
} from "../src/ContractImportProgress.js";

function render(progress: ContractImportState, itemCount = 0, registered = false) {
  return renderToStaticMarkup(
    createElement(ContractImportProgress, { progress, itemCount, registered }),
  );
}

test("envio ainda não confirmado mantém zero etapas concluídas", () => {
  const html = render({ phase: "upload", startedAt: Date.now() });
  assert.match(html, /aria-valuenow="0"/);
  assert.match(html, /Enviando o documento/);
});

test("cadastro automático confirmado diferencia equipamentos salvos de dados apenas preparados", () => {
  const html = render({ phase: "ready", startedAt: Date.now() }, 6, true);
  assert.match(html, /Equipamentos cadastrados/);
  assert.match(html, /6 equipamentos cadastrados no TC/);
  assert.doesNotMatch(html, /Confira os dados antes de salvar/);
});

test("arquivo recebido aguarda Continuar antes da leitura por IA", () => {
  const html = render({ phase: "uploaded", startedAt: Date.now() });
  assert.match(html, /aria-valuenow="1"/);
  assert.match(html, /Clique em Continuar/);
  assert.doesNotMatch(html, /Em andamento/);
});

test("leitura demorada mostra atividade sem avançar etapas pelo tempo", () => {
  const html = render({ phase: "extract", startedAt: Date.now() - 90000 });
  assert.match(html, /aria-valuenow="1"/);
  assert.match(html, /A IA ainda está processando/);
  assert.match(html, /aria-current="step"/);
  assert.doesNotMatch(html, /Dados prontos para conferir|%/);
});

test("dados recebidos completam o progresso e solicitam conferência humana", () => {
  const html = render({ phase: "ready", startedAt: Date.now() }, 2);
  assert.match(html, /aria-valuenow="3"/);
  assert.match(html, /2 itens para conferir/);
  assert.match(html, /Confira os dados antes de salvar/);
});

test("falha na IA preserva a etapa incompleta e orienta nova tentativa", () => {
  const html = render({
    phase: "extract",
    startedAt: Date.now() - 10000,
    failed: true,
  });
  assert.match(html, /aria-valuenow="1"/);
  assert.match(html, /Interrompido/);
  assert.match(html, /arquivo foi preservado/);
  assert.match(html, /Continuar para tentar novamente/);
  assert.doesNotMatch(html, /Em andamento|Dados prontos para conferir/);
});
