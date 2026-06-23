import { selectPlan } from "./selector.agent";
import { generate } from "./generator.agent";
import { validate } from "./validator.agent";
import { normalize } from "./normalizer.agent";

export async function generateQuestions(sourceText: string) {
  // 1. selector
  const selectorResult = await selectPlan(sourceText);
  console.log("[SELECTOR]", selectorResult);

  // 2. normalize (PURE FUNCTION)
  const normalizedResult = normalize(selectorResult);
  console.log("[NORMALIZER]", normalizedResult);

  // 3. generator
  const generatorResult = await generate(normalizedResult);
  console.log("[GENERATOR]", generatorResult);

  // 4. validator
  const validatorResult = validate(generatorResult);
  console.log("[VALIDATOR]", validatorResult);

  return {
    sourceId: crypto.randomUUID(),
    version: "mul-agent-test1",

    trace: {
      selector: selectorResult,
      generator: generatorResult,
      validator: validatorResult,
    },

    questions: validatorResult.questions,
  };
}
