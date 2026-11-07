import { test } from "node:test";
import assert from "node:assert/strict";
import { DialogStack } from "../src/DialogManager.js";

function surface(parent: HTMLDialogElement | null = null) {
  let focused = 0;
  const element = {
    style: { zIndex: "" },
    dataset: { active: "" },
    parentElement: { closest: () => parent },
    focus: () => { focused++; },
    contains: (node: unknown) => node === element,
  } as unknown as HTMLDialogElement;
  return { element, focused: () => focused };
}

test("abrir e ativar janelas preserva as anteriores e atualiza a ordem visual", () => {
  const stack = new DialogStack();
  const first = surface();
  const second = surface();
  stack.add({ id: "first", element: first.element, opener: null });
  stack.add({ id: "second", element: second.element, opener: null });
  assert.equal(stack.top()?.id, "second");
  assert.equal(first.element.dataset.active, "false");
  stack.activate("first");
  assert.equal(stack.top()?.id, "first");
  assert.equal(stack.entries.length, 2);
  assert.ok(Number(first.element.style.zIndex) > Number(second.element.style.zIndex));
  stack.remove("second");
  assert.equal(first.focused(), 0, "fechar janela de fundo não rouba foco");
});

test("fechar a superior restaura o foco de origem; origem removida retorna à janela anterior", () => {
  const stack = new DialogStack();
  const parent = surface();
  const child = surface();
  let restored = 0;
  const opener = { isConnected: true, focus: () => { restored++; } } as unknown as HTMLElement;
  parent.element.contains = node => node === opener;
  stack.add({ id: "parent", element: parent.element, opener: null });
  stack.add({ id: "child", element: child.element, opener });
  stack.remove("child");
  assert.equal(restored, 1);
  stack.add({ id: "child", element: child.element, opener: null });
  stack.remove("child");
  assert.equal(parent.focused(), 1);
  assert.equal(stack.top()?.id, "parent");
});

test("ativar detalhes internos traz também a janela que os contém para frente", () => {
  const stack = new DialogStack();
  const parent = surface();
  const details = surface(parent.element);
  const other = surface();
  stack.add({ id: "parent", element: parent.element, opener: null });
  stack.add({ id: "details", element: details.element, opener: null });
  stack.add({ id: "other", element: other.element, opener: null });
  stack.activate("details");
  assert.deepEqual(stack.entries.map(entry => entry.id), ["other", "parent", "details"]);
  stack.remove("details");
  assert.equal(stack.top()?.id, "parent");
});

test("bloqueia ações da tela principal até fechar o último dialog, preservando chamadas internas", () => {
  const stack = new DialogStack();
  const workspace = { inert: false } as HTMLElement;
  stack.workspace = workspace;
  const first = surface();
  const nested = surface(first.element);
  let changes = 0;
  const unsubscribe = stack.subscribe(() => { changes++; });
  stack.add({ id: "first", element: first.element, opener: null });
  assert.equal(workspace.inert, true);
  assert.equal(stack.hasDialogs(), true);
  stack.add({ id: "nested", element: nested.element, opener: first.element });
  assert.equal(stack.top()?.id, "nested");
  stack.remove("nested");
  assert.equal(workspace.inert, true, "fechar o filho não libera ações da tela principal");
  stack.remove("first");
  assert.equal(workspace.inert, false);
  assert.equal(stack.hasDialogs(), false);
  assert.ok(changes > 0);
  unsubscribe();
});
