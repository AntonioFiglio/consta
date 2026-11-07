import { test } from "node:test";
import assert from "node:assert/strict";
import { pickPatrimony } from "../server/tombamento-ocr.js";

test("escolhe o número de tombamento e ignora a data da etiqueta", () => {
  assert.equal(
    pickPatrimony("TOMBAMENTO\n10/11/2026\n45.882-1"),
    "45.882-1",
  );
  assert.equal(pickPatrimony("Patrimônio: ABC-1029"), "ABC-1029");
  assert.equal(pickPatrimony("Nº 20441"), "20441");
  assert.equal(pickPatrimony("Nota fiscal 10/11/2026"), null);
  assert.equal(pickPatrimony("sem números"), null);
});
