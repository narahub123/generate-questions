export type QuestionType = "ox" | "mcq" | "short" | "blank";

export type Choice = {
  key: string;
  text: string;
};

export type Question = {
  type: QuestionType;
  question: string;
  answer: string;
  explanation: string;
  choices?: Choice[];
};
