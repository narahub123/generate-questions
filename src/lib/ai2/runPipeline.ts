import { analyzerAgent } from "./agents/analyzer";
import { generatorAgent } from "./agents/generator";
import { taskPlannerAgent } from "./agents/task-planner";
import { typeSpecBuilder } from "./agents/type-spec-builder";
import { validatorAgent } from "./agents/validator";

export async function runPipeline(note: string) {
  // 1. analyze
  const analysis = await analyzerAgent({ note });

  // 2. plan
  const tasks = await taskPlannerAgent({ analysis });

  // 3. spec
  const spec = await typeSpecBuilder({ tasks });

  // 4. generate
  const questions = await Promise.all(
    tasks.map((task) =>
      generatorAgent({
        task,
        spec: spec.find((s) => s.taskId === task.id)!,
        source: note,
      }),
    ),
  );

  // 5. validate
  const result = validatorAgent({
    questions,
    spec,
  });

  return {
    analysis,
    tasks,
    spec,
    questions,
    result,
  };
}
