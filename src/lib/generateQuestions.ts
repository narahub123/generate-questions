import { GENERATE_QUESTIONS_PROMPT_V4 } from "@/prompts/generate-questions.v4";

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const VALID_TYPES = ["ox", "mcq", "short", "blank"] as const;

function isValidType(type: string) {
  return VALID_TYPES.includes(type as any);
}

export async function generateQuestions(sourceText: string) {
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: GENERATE_QUESTIONS_PROMPT_V4.trim(),
      },
      {
        role: "user",
        content: sourceText,
      },
    ],
  });

  console.log("tokens:", res.usage);

  const content = res.choices[0].message.content;

  if (!content) {
    throw new Error("Empty response from AI");
  }

  let parsed: any;

  try {
    parsed = JSON.parse(content);
  } catch (e) {
    console.error("JSON parse failed:", content);
    throw new Error("Invalid JSON from AI");
  }

  // -----------------------------
  // 1. 구조 검증
  // -----------------------------
  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error("Invalid structure: questions missing");
  }

  // -----------------------------
  // 2. 타입 검증 + 필터링
  // -----------------------------
  parsed.questions = parsed.questions.filter((q: any) => isValidType(q.type));

  // -----------------------------
  // 3. MCQ 구조 보정
  // -----------------------------
  parsed.questions = parsed.questions.map((q: any) => {
    if (q.type === "mcq") {
      if (!Array.isArray(q.choices) || q.choices.length !== 4) {
        throw new Error("Invalid MCQ structure");
      }
    }

    return q;
  });

  // -----------------------------
  // 4. 개수 보정 (안전장치)
  // -----------------------------
  if (parsed.questions.length !== 4) {
    console.warn("Question count mismatch:", parsed.questions.length);
  }

  return parsed;
}
