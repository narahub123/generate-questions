import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type LLMCallParams = {
  system: string;
  user: string;
  temperature?: number;
};

export async function callLLM<T = any>({
  system,
  user,
  temperature = 0.2,
}: LLMCallParams): Promise<T> {
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  if (res.usage) {
    console.log("--- 토큰 사용량 ---");
    console.log(`질문(프롬프트) 토큰: ${res.usage.prompt_tokens}`);
    console.log(`답변(완성) 토큰: ${res.usage.completion_tokens}`);
    console.log(`전체 토큰 합계: ${res.usage.total_tokens}`);
    console.log("-------------------");
  }

  const content = res.choices[0].message.content;

  if (!content) {
    throw new Error("LLM empty response");
  }

  try {
    return JSON.parse(content);
  } catch (e) {
    console.error("LLM JSON parse failed:", content);
    throw new Error("Invalid JSON from LLM");
  }
}
