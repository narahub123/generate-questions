import { selector_prompt } from "@/prompts/selector";
import { callLLM } from "./llmClient";
import { SelectResult } from "./contracts";

export async function selectPlan(sourceText: string): Promise<SelectResult> {
  return callLLM<SelectResult>({
    system: selector_prompt,
    user: sourceText,
  });
}
