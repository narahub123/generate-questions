import { callLLM } from "@/lib/ai/llmClient";
import { BaseQuestion, GeneratorInput } from "../types";
import { GENERATOR_SYSTEM_PROMPT } from "../prompts/generator";

export async function generatorAgent(
  input: GeneratorInput,
): Promise<BaseQuestion> {
  return callLLM<BaseQuestion>({
    system: GENERATOR_SYSTEM_PROMPT,
    user: JSON.stringify(input),
  });
}
