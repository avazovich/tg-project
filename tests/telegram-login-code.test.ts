import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { generateLoginCode, normalizeLoginCode } from "../src/lib/telegram-login-code.ts";

describe("generateLoginCode", () => {
  test("matches the XXX-XXX shape", () => {
    assert.match(generateLoginCode(), /^[23456789A-HJ-NP-Z]{3}-[23456789A-HJ-NP-Z]{3}$/);
  });

  test("avoids visually ambiguous characters", () => {
    const sample = Array.from({ length: 200 }, () => generateLoginCode()).join("");
    for (const bad of ["0", "O", "1", "I", "L"]) {
      assert.equal(sample.includes(bad), false, `should not contain "${bad}"`);
    }
  });
});

describe("normalizeLoginCode", () => {
  test("accepts the code exactly as displayed", () => {
    assert.equal(normalizeLoginCode("8F4-K29"), "8F4-K29");
  });

  test("is lenient about case, spacing and the dash", () => {
    assert.equal(normalizeLoginCode("8f4 k29"), "8F4-K29");
    assert.equal(normalizeLoginCode("8f4k29"), "8F4-K29");
    assert.equal(normalizeLoginCode(" 8F4-K29 "), "8F4-K29");
  });

  test("rejects the wrong length", () => {
    assert.equal(normalizeLoginCode("8F4-K2"), "");
    assert.equal(normalizeLoginCode("8F4-K299"), "");
    assert.equal(normalizeLoginCode(""), "");
  });
});
