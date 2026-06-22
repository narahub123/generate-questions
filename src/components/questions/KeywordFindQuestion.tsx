"use client";

import { useEffect, useState } from "react";
import { Question } from "@/types";

interface KeywordFindQuestionProps {
  question: Question;
  answer: string; // 상위 상태 (JSON string 형태로 저장)
  setAnswer: (val: string) => void;
  submitted: boolean;
}

export default function KeywordFindQuestion({
  question,
  answer,
  setAnswer,
  submitted,
}: KeywordFindQuestionProps) {
  // 현재 선택된 키워드들을 추적하는 로컬 상태
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  // 키워드 클릭 시 토글 핸들러
  const handleToggle = (keyword: string) => {
    if (submitted) return;

    let updated: string[];
    if (selectedKeywords.includes(keyword)) {
      updated = selectedKeywords.filter((k) => k !== keyword);
    } else {
      updated = [...selectedKeywords, keyword];
    }

    setSelectedKeywords(updated);
    // 상위 컴포넌트의 단일 string 상태와 호환되도록 JSON 문자열로 변환하여 저장
    // (채점 시에는 JSON.parse(answer)와 question.answer 배열을 비교하면 됩니다)
    setAnswer(JSON.stringify(updated.sort()));
  };

  // 문제 번호나 인덱스가 바뀔 때 상태 초기화
  useEffect(() => {
    if (!submitted) {
      setSelectedKeywords([]);
    }
  }, [question, submitted]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2.5">
        {question.candidates?.map((keyword) => {
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
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] transition-colors
                    ${isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 bg-white"}`}
                >
                  {isSelected && "✓"}
                </span>
                {keyword}
              </span>
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
