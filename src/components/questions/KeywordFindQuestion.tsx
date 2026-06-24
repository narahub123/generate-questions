"use client";

import { useEffect, useState, useMemo } from "react";
import { Question } from "@/types";

interface KeywordFindQuestionProps {
  question: Question;
  answer: string;
  setAnswer: (val: string) => void;
  submitted: boolean;
}

export default function KeywordFindQuestion({
  question,
  answer,
  setAnswer,
  submitted,
}: KeywordFindQuestionProps) {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  // 1. candidates를 무작위로 섞은 배열 생성 (question.candidates가 바뀔 때만 다시 섞임)
  const shuffledCandidates = useMemo(() => {
    if (!question.candidates) return [];
    return [...question.candidates].sort(() => Math.random() - 0.5);
  }, [question.candidates]);

  const handleToggle = (keyword: string) => {
    if (submitted) return;

    let updated: string[];
    if (selectedKeywords.includes(keyword)) {
      updated = selectedKeywords.filter((k) => k !== keyword);
    } else {
      updated = [...selectedKeywords, keyword];
    }

    setSelectedKeywords(updated);
    setAnswer(JSON.stringify(updated.sort()));
  };

  useEffect(() => {
    if (!submitted) {
      setSelectedKeywords([]);
    }
  }, [question, submitted]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2.5">
        {/* 2. shuffledCandidates 사용 */}
        {shuffledCandidates.map((keyword) => {
          const isSelected = selectedKeywords.includes(keyword);
          return (
            <button
              key={keyword}
              disabled={submitted}
              onClick={() => handleToggle(keyword)}
              className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold shadow-2xs"
                    : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                }`}
            >
              {keyword}
            </button>
          );
        })}
      </div>
      {!submitted && (
        <p className="text-xs text-gray-400">
          * 올바른 키워드를 모두 선택한 후 제출해 주세요. (다중 선택 가능)
        </p>
      )}
    </div>
  );
}
