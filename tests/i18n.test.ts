import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { resolveLocale, isLocale, LOCALES } from "../src/i18n/config.ts";
import { t } from "../src/i18n/interpolate.ts";

describe("resolveLocale", () => {
  test("matches a plain language tag", () => {
    assert.equal(resolveLocale("uz"), "uz");
    assert.equal(resolveLocale("ru"), "ru");
  });

  test("matches a region-qualified tag by its base language", () => {
    assert.equal(resolveLocale("ru-RU"), "ru");
    assert.equal(resolveLocale("uz-UZ,uz;q=0.9"), "uz");
  });

  test("picks the first supported language in a weighted Accept-Language list", () => {
    assert.equal(resolveLocale("fr-FR,fr;q=0.9,ru;q=0.8,en;q=0.7"), "ru");
  });

  test("falls back to the default for an unsupported or missing header", () => {
    assert.equal(resolveLocale("fr-FR"), "en");
    assert.equal(resolveLocale(null), "en");
    assert.equal(resolveLocale(""), "en");
  });
});

describe("isLocale", () => {
  test("accepts every supported locale", () => {
    for (const l of LOCALES) assert.equal(isLocale(l), true);
  });

  test("rejects anything else", () => {
    assert.equal(isLocale("fr"), false);
    assert.equal(isLocale(undefined), false);
    assert.equal(isLocale(""), false);
  });
});

describe("interpolate (t)", () => {
  test("fills in a single placeholder", () => {
    assert.equal(t("Joined ({period})", { period: "7d" }), "Joined (7d)");
  });

  test("fills in multiple placeholders", () => {
    assert.equal(
      t("{retained} of {eligible} joins retained", { retained: 3, eligible: 5 }),
      "3 of 5 joins retained"
    );
  });

  test("leaves an unmatched placeholder untouched rather than throwing", () => {
    assert.equal(t("Hello {name}", {}), "Hello {name}");
  });

  test("is a no-op on a template with no placeholders", () => {
    assert.equal(t("Save", {}), "Save");
  });
});
