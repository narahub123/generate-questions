import { ValidationResult, ValidatorInput } from "../types";

export function validatorAgent(input: ValidatorInput): ValidationResult {
  const errors: ValidationResult["errors"] = [];

  for (const question of input.questions) {
    // 1. spec 매칭 (유일 기준)
    const spec = input.spec.find((s) => s.taskId === (question as any).taskId);

    if (!spec) {
      errors.push({
        taskId: (question as any).taskId ?? "unknown",
        reason: "missing spec",
      });
      continue;
    }

    // 2. required fields 체크
    for (const field of spec.requiredFields) {
      if (!(field in question)) {
        errors.push({
          taskId: spec.taskId,
          reason: `missing field: ${field}`,
        });
      }
    }

    // 3. answer type 체크
    const answer = question.answer;
    const expectedType = spec.outputRule.answerType;

    if (expectedType === "string") {
      if (typeof answer !== "string") {
        errors.push({
          taskId: spec.taskId,
          reason: "answer must be string",
        });
      }
    }

    if (expectedType === "string[]") {
      if (!Array.isArray(answer)) {
        errors.push({
          taskId: spec.taskId,
          reason: "answer must be string[]",
        });
      }
    }

    // 4. MCQ
    if (question.type === "mcq") {
      const choices = (question as any).choices;

      if (!choices) {
        errors.push({
          taskId: spec.taskId,
          reason: "missing choices",
        });
      } else {
        if (choices.length < spec.outputRule.constraints.minChoices) {
          errors.push({
            taskId: spec.taskId,
            reason: "too few choices",
          });
        }

        if (choices.length > spec.outputRule.constraints.maxChoices) {
          errors.push({
            taskId: spec.taskId,
            reason: "too many choices",
          });
        }
      }
    }

    // 5. keyword-list
    if (question.type === "keyword-list") {
      if (Array.isArray(answer)) {
        if (answer.length < spec.outputRule.constraints.minAnswers) {
          errors.push({
            taskId: spec.taskId,
            reason: "too few answers",
          });
        }
      }
    }

    // 6. ox
    if (question.type === "ox") {
      if (!spec.outputRule.constraints.values.includes(answer)) {
        errors.push({
          taskId: spec.taskId,
          reason: "invalid OX value",
        });
      }
    }

    // 7. sequence
    // 7. sequence
    if (question.type === "sequence") {
      if (!Array.isArray(answer)) {
        errors.push({
          taskId: spec.taskId,
          reason: "sequence must be array",
        });
      }

      // 추가 1) candidates 필수 체크
      if (!Array.isArray((question as any).candidates)) {
        errors.push({
          taskId: spec.taskId,
          reason: "sequence must have candidates",
        });
        continue;
      }

      const candidates = (question as any).candidates as string[];

      // 추가 2) answer는 candidates의 permutation이어야 함
      const isValid =
        answer.length === candidates.length &&
        answer.every((v: string) => candidates.includes(v));

      if (!isValid) {
        errors.push({
          taskId: spec.taskId,
          reason: "sequence answer must match candidates set",
        });
      }
    }

    if (!question.explanation || question.explanation.trim() === "") {
      errors.push({
        taskId: spec.taskId,
        reason: "no explanation",
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
