"use client";

import { useMemo } from "react"; // 1. useMemo 추가
import { BaseQuestion } from "@/lib/ai2/types";

interface McqQuestionProps {
  question: BaseQuestion;
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
  // 2. 선택지를 컴포넌트 마운트 시 한 번만 무작위로 섞음
  const shuffledChoices = useMemo(() => {
    if (!question.choices) return [];
    return [...question.choices].sort(() => Math.random() - 0.5);
  }, [question.choices]);

  return (
    <ul className="grid gap-3">
      {/* 3. question.choices 대신 shuffledChoices 사용 */}
      {shuffledChoices.map((c, index) => {
        const isSelected = answer === c;
        return (
          <li key={c}>
            <button
              disabled={submitted}
              onClick={() => setAnswer(c)}
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
                {index + 1}
              </span>
              <span>{c}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
