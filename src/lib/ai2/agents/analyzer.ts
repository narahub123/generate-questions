import { callLLM } from "@/lib/ai/llmClient";
import { AnalyzerInput, NoteAnalysis } from "../types";
import { ANALYZER_SYSTEM_PROMPT } from "../prompts/analyzer";

export async function analyzerAgent(
  input: AnalyzerInput,
): Promise<NoteAnalysis> {
  return callLLM<NoteAnalysis>({
    system: ANALYZER_SYSTEM_PROMPT,
    user: JSON.stringify(input),
  });
}
