"use server";

import { callLLM } from "@/lib/ai/llmClient";
import { getSourceContent } from "../source";

export async function evaluateAnswer(sourceId: string, userAnswer: string) {
  // 1. 원본 데이터 로드
  const sourceContent = await getSourceContent(sourceId);

  const systemPrompt = `당신은 엄격하고 꼼꼼한 학습 튜터입니다. 
다음 원본 노트와 사용자의 회상(Recall) 내용을 비교하여 평가하세요.

[평가 지침]
1. 사용자가 원본 노트의 모든 섹션(REST API 개념, 특징, HTTP 요청 과정 등)을 제대로 언급했는지 확인하세요.
2. 언급하지 않았거나 누락된 핵심 개념을 반드시 지적하세요.
3. 순서가 중요한 경우(예: HTTP 요청 과정) 틀린 순서를 바로잡아 주세요.
4. 전반적인 이해도(isCorrect)를 평가하세요.

[응답 형식 (JSON)]
{
  "isCorrect": boolean,
  "feedback": "전체적인 평가와 함께, 누락된 내용과 개선할 점을 구체적으로 포함한 상세 피드백"
}
`;

  // 2. LLM 호출
  const result = await callLLM({
    system: systemPrompt,
    user: `원본 노트: ${sourceContent}\n\n사용자 회상: ${userAnswer}`,
  });

  // 3. 결과 파싱 (callLLM이 객체를 반환한다면 그대로 사용)
  return result;
}
