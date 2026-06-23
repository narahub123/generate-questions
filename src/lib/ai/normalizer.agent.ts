import { SelectResult } from "./contracts";

export function normalize(input: SelectResult): SelectResult {
  return {
    tasks: input.tasks.map((t) => ({
      ...t,
      source: cleanItem(t.source),
      extract: normalizeValue(t.extract),
    })),
  };
}

function normalizeValue(value: string | string[]): string | string[] {
  if (Array.isArray(value)) {
    return value.map(cleanItem);
  }

  return cleanItem(value);
}

function cleanItem(text: string): string {
  return text
    .replace(/^\d+\.\s*/g, "")
    .replace(/^\-\s*/g, "")
    .trim();
}
