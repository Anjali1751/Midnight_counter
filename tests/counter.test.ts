import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const contract = readFileSync("contracts/counter.compact", "utf8");

test("defines public counter state and owner-only circuits", () => {
  assert.match(contract, /export ledger state: State/);
  assert.match(contract, /export ledger owner: Bytes<32>/);
  assert.match(contract, /export ledger count: Counter/);
  assert.match(contract, /export circuit claim\(\)/);
  assert.match(contract, /export circuit increment\(\)/);
});

test("models the unclaimed-to-claimed state transition", () => {
  assert.match(contract, /state = State\.UNCLAIMED/);
  assert.match(contract, /assert\(state == State\.UNCLAIMED/);
  assert.match(contract, /state = State\.CLAIMED/);
  assert.match(contract, /assert\(state == State\.CLAIMED/);
});

test("keeps the secret witness private while disclosing only its commitment", () => {
  assert.match(contract, /witness localSecretKey\(\): Bytes<32>/);
  assert.match(contract, /owner = disclose\(ownerCommitment\(localSecretKey\(\)\)\)/);
  assert.doesNotMatch(contract, /disclose\(localSecretKey\(\)\)/);
});