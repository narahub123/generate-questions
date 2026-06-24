export type QuestionType =
  | "ox"
  | "mcq"
  | "blank"
  | "keyword-find"
  | "keyword-list"
  | "sequence";

/** 1) ANALYZER */
export type AnalyzerInput = {
  note: string;
};

export type NoteAnalysis = {
  concepts: {
    id: string;
    content: string;
    keywords: string[];
  }[];
};

/** 2) TASK PLANNER */
export type QuestionTask = {
  id: string;
  type: QuestionType;
  conceptId: string;
  intent: "recall" | "understand" | "apply" | "distinguish";
  target: string;
  difficulty: "easy" | "medium" | "hard";
};

export type TaskPlannerInput = {
  analysis: NoteAnalysis;
};

/** 3) TYPE SPEC */
export type TypeSpec = {
  taskId: string;
  type: QuestionType;

  requiredFields: string[];

  outputRule: {
    answerType: "string" | "string[]";
    constraints: Record<string, any>;
  };
}[];

export type TypeSpecInput = {
  tasks: QuestionTask[];
};

/** 4) GENERATOR */
export type GeneratorInput = {
  task: QuestionTask;
  spec: TypeSpec[number];
  source: string;
};

export type BaseQuestion = {
  taskId: string;
  type: QuestionType;
  question: string;
  choices?: string[];

  // keyword-find 핵심
  candidates?: string[];

  answer: any;
  explanation: string;
};

/** 5) VALIDATOR */
export type ValidatorInput = {
  questions: BaseQuestion[];
  spec: TypeSpec;
};

export type ValidationResult = {
  valid: boolean;
  errors: {
    taskId: string;
    reason: string;
  }[];
};
