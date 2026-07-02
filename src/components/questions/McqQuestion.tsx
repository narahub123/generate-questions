"use client";

import { useMemo } from "react";
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
  // Choice 타입이 { text: string } 또는 유사한 객체 구조라고 가정합니다.
  // 만약 Choice가 단순히 string이라면 아래 map 로직을 그대로 쓰시면 됩니다.
  const shuffledChoices = useMemo(() => {
    if (!question.choices) return [];
    // 원본 데이터를 유지하며 순서만 섞음
    return [...question.choices].sort(() => Math.random() - 0.5);
  }, [question.choices]);

  return (
    <ul className="grid gap-3">
      {shuffledChoices.map((c, index) => {
        // Choice 타입이 객체인지 문자열인지에 따라 c.text 또는 c로 접근하세요
        const choiceText = typeof c === "string" ? c : (c as any).text;
        const isSelected = answer === choiceText;

        return (
          <li key={index}>
            <button
              disabled={submitted}
              onClick={() => setAnswer(choiceText)}
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
              <span>{choiceText}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
