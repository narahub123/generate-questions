"use client";

import { useEffect, useState } from "react";
import { Question } from "@/types";
import { Plus, X } from "lucide-react";

interface KeywordListQuestionProps {
  question: Question;
  answer: string; // 상위 상태 (JSON string)
  setAnswer: (val: string) => void;
  submitted: boolean;
}

export default function KeywordListQuestion({
  question,
  answer,
  setAnswer,
  submitted,
}: KeywordListQuestionProps) {
  const [inputValue, setInputValue] = useState("");
  const [chips, setChips] = useState<string[]>([]);

  // 1. 상위 answer 상태나 문제(question)가 바뀔 때 로컬 칩 상태 동기화
  useEffect(() => {
    if (answer) {
      try {
        const parsed = JSON.parse(answer);
        if (Array.isArray(parsed)) {
          setChips(parsed);
          return;
        }
      } catch (e) {
        console.error("답안 파싱 실패", e);
      }
    }
    // answer가 비어있거나 올바르지 않은 포맷이면 비워줌
    setChips([]);
  }, [answer, question]);

  // 2. 새로운 문제가 로드되면 입력창 글자 비우기
  useEffect(() => {
    setInputValue("");
  }, [question]);

  const handleAddChip = () => {
    if (submitted) return;
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // 중복 방지
    if (!chips.includes(trimmed)) {
      const updated = [...chips, trimmed];
      // 로컬 상태를 바꾸는 대신 상위 상태를 업데이트 -> useEffect가 감지하여 로컬 칩을 변경함
      setAnswer(JSON.stringify(updated));
    }
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // form 서브밋 방지 및 엔터 키 입력 차단
      handleAddChip();
    }
  };

  const handleRemoveChip = (indexToRemove: number) => {
    if (submitted) return;
    const updated = chips.filter((_, i) => i !== indexToRemove);
    setAnswer(updated.length > 0 ? JSON.stringify(updated) : "");
  };

  return (
    <div className="space-y-4">
      {/* 칩 리스트 컨테이너 */}
      <div className="flex flex-wrap gap-2 p-3 min-h-[52px] bg-gray-50/50 border border-dashed border-gray-200 rounded-xl">
        {chips.length === 0 && (
          <span className="text-xs text-gray-400 self-center pl-1">
            아래에 핵심 키워드를 입력하여 추가해 주세요.
          </span>
        )}
        {chips.map((chip, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-2xs"
          >
            {chip}
            {!submitted && (
              <button
                type="button"
                onClick={() => handleRemoveChip(idx)}
                className="text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
      </div>

      {/* 입력창 인터페이스 (제출 완료 후에는 UI 청결을 위해 숨김 처리) */}
      {!submitted && (
        <div className="flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="기억나는 원리/특성 키워드를 입력하세요"
            className="flex-1 border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          <button
            type="button"
            onClick={handleAddChip}
            disabled={!inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 text-white px-4 rounded-xl flex items-center justify-center transition shadow-2xs"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
