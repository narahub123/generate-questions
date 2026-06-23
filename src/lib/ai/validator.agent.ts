import { Question } from "@/types";
import { VALID_TYPES } from "../generateQuestions";

export function validate(result: { questions: Question[] }) {
  if (!Array.isArray(result.questions)) {
    throw new Error("invalid structure");
  }

  for (const q of result.questions) {
    if (!VALID_TYPES.includes(q.type as any)) {
      throw new Error("invalid type");
    }

    // MCQ check
    if (q.type === "mcq") {
      if (!q.choices || q.choices.length !== 4) {
        throw new Error("invalid mcq choices");
      }

      const keys = q.choices.map((c) => c.key);
      if (!keys.includes(q.answer as string)) {
        throw new Error("mcq answer must be key");
      }
    }

    // SEQUENCE check (IMPORTANT)
    if (q.type === "sequence") {
      if (!Array.isArray(q.shuffledItems)) {
        throw new Error("invalid sequence");
      }

      // hint leak detection
      const hasNumber = q.shuffledItems.some((i) => /^\d+\./.test(i));
      if (hasNumber) {
        throw new Error("sequence contains numbering leak");
      }
    }

    // BLANK check
    if (q.type === "blank") {
      if (Array.isArray(q.answer)) {
        throw new Error("blank must be string");
      }
    }
  }

  return result;
}
