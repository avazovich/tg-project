import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { safeNext } from "../src/lib/safe-redirect.ts";

describe("safeNext", () => {
  test("allows ordinary in-app paths", () => {
    assert.equal(safeNext("/onboarding"), "/onboarding");
    assert.equal(safeNext("/stats?edit=abc"), "/stats?edit=abc");
  });

  test("falls back when absent", () => {
    assert.equal(safeNext(null), "/");
    assert.equal(safeNext(undefined), "/");
    assert.equal(safeNext(""), "/");
  });

  test("rejects absolute URLs to other origins", () => {
    assert.equal(safeNext("https://evil.example.com"), "/");
    assert.equal(safeNext("http://evil.example.com/x"), "/");
  });

  test("rejects protocol-relative URLs", () => {
    // Browsers treat "//host" as absolute — the classic open-redirect bypass.
    assert.equal(safeNext("//evil.example.com"), "/");
  });

  test("rejects backslash variants browsers may normalise", () => {
    assert.equal(safeNext("/\\evil.example.com"), "/");
    assert.equal(safeNext("/path\\..\\x"), "/");
  });

  test("rejects scheme-bearing values that skip the leading slash", () => {
    assert.equal(safeNext("javascript:alert(1)"), "/");
    assert.equal(safeNext("mailto:x@y.z"), "/");
  });
});
