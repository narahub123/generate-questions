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
