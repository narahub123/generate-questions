import { callLLM } from "@/lib/ai/llmClient";
import { QuestionTask, TaskPlannerInput } from "../types";
import { TASK_PLANNER_SYSTEM_PROMPT } from "../prompts/task-planner";

export async function taskPlannerAgent(
  input: TaskPlannerInput,
): Promise<QuestionTask[]> {
  return callLLM<QuestionTask[]>({
    system: TASK_PLANNER_SYSTEM_PROMPT,
    user: JSON.stringify(input),
  });
}
