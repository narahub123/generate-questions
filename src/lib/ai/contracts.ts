export const VALID_TYPES = [
  "ox",
  "mcq",
  "blank",
  "keyword-find",
  "keyword-list",
  "sequence",
] as const;

export type QuestionType = (typeof VALID_TYPES)[number];

export type BaseQuestion = {
  type: QuestionType;
  question: string;
  answer: any;
  explanation: string;
};

export type QuestionPlan = {
  tasks: {
    type: QuestionType;

    source: string;
    extract: string;

    // 핵심 추가
    answerShape: "string" | "string[]";

    requiredFields: (
      | "choices"
      | "acceptedAnswers"
      | "candidates"
      | "shuffledItems"
    )[];
  }[];
};

export type Note = string;

export type Task = {
  type: "ox" | "mcq" | "blank" | "keyword-find" | "keyword-list" | "sequence";

  source: string;

  extract: string | string[];
  
  answerShape?: "string" | "string[]" | "choice";
};

export type SelectResult = {
  tasks: Task[];
};
