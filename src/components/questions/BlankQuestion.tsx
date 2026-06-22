"use client";

import { Question } from "@/types";

interface BlankQuestionProps {
  question: Question;
  answer: string;
  setAnswer: (val: string) => void;
  submitted: boolean;
}

export default function BlankQuestion({
  question,
  answer,
  setAnswer,
  submitted,
}: BlankQuestionProps) {
  return (
    <h2 className="text-xl font-bold text-gray-900 leading-loose whitespace-normal">
      {question.question.split("____").map((part, i) => (
        <span key={i} className="inline-flex flex-wrap items-center">
          {part}
          {i === 0 && (
            <input
              disabled={submitted}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="정답"
              className="mx-2 text-center border-b-2 border-gray-400 focus:border-blue-600 outline-none text-blue-600 bg-transparent px-2 w-32 font-bold transition disabled:text-gray-500 disabled:border-gray-200"
            />
          )}
        </span>
      ))}
    </h2>
  );
}
