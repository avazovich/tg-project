// Pure — no server-only import — kept importable from tests. Dictionary
// strings use "{name}" placeholders (e.g. "Joined ({period})"); this fills
// them in without pulling in a full ICU/format library for three locales.
export function t(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}
