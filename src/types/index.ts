import { VALID_TYPES } from "@/lib/generateQuestions";

// 1. 신규 조건부 문제 유형 3가지 추가
export type QuestionType = (typeof VALID_TYPES)[number];

export type Choice = {
  key: string; // 예: "A", "B", "C", "D"
  text: string;
};

export type Question = {
  type: QuestionType;
  question: string;

  // 2. 단일 정답(string)과 다중 선택/순서 정답(string[])을 모두 수용하도록 확장
  answer: string | string[];

  explanation: string;

  // 3. mcq(객관식) 전용 선택지
  choices?: Choice[];

  // 4. blank, keyword-list 유형에서 복수 정답 인정을 위한 대체 문구 배열
  acceptedAnswers?: string[];

  // 5. keyword-find 유형에서 사용자가 고를 다중 키워드 보기 목록
  candidates?: string[];

  // 6. sequence 유형에서 순서가 무작위로 섞여 제공되는 아이템 목록
  shuffledItems?: string[];
};
