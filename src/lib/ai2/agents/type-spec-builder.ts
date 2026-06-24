import { callLLM } from "@/lib/ai/llmClient";
import { TypeSpec, TypeSpecInput } from "../types";
import { TYPE_SPEC_SYSTEM_PROMPT } from "../prompts/type-spec-builder";

export async function typeSpecBuilder(input: TypeSpecInput): Promise<TypeSpec> {
  return callLLM<TypeSpec>({
    system: TYPE_SPEC_SYSTEM_PROMPT,
    user: JSON.stringify(input),
  });
}
