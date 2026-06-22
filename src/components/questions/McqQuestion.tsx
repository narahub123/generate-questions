"use client";

import { Question } from "@/types";

interface McqQuestionProps {
  question: Question;
  answer: string;
  setAnswer: (val: string) => void;
  submitted: boolean;
}

export default function McqQuestion({
  question,
  answer,
  setAnswer,
  submitted,
}: McqQuestionProps) {
  return (
    <ul className="grid gap-3">
      {question.choices?.map((c) => {
        const isSelected = answer === c.key;
        return (
          <li key={c.key}>
            <button
              disabled={submitted}
              onClick={() => setAnswer(c.key)}
              className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center gap-3
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/50 text-blue-700 font-semibold ring-2 ring-blue-500/20"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                } disabled:cursor-not-allowed`}
            >
              <span
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold transition-colors
                ${isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 bg-white text-gray-500"}`}
              >
                {c.key}
              </span>
              <span>{c.text}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
