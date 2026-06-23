import { Question } from "@/types";
import { Task } from "./contracts";
import { callLLM } from "./llmClient";
import { Generator_prompt } from "@/prompts/generator";

export async function generate(input: {
  tasks: Task[];
}): Promise<{ questions: Question[] }> {
  return callLLM<{ questions: Question[] }>({
    system: Generator_prompt,
    user: JSON.stringify(input.tasks),
  });
}
