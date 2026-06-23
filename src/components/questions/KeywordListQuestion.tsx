"use client";

import { useEffect, useState } from "react";
import { Question } from "@/types";
import { Plus, X } from "lucide-react";

interface KeywordListQuestionProps {
  question: Question;
  answer: string; // JSON.stringify(string[]) 형태
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

  // 1. 상위 answer 상태가 바뀔 때 로컬 상태와 동기화
  useEffect(() => {
    try {
      const parsed = answer ? JSON.parse(answer) : [];
      setChips(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      setChips([]);
    }
  }, [answer]);

  // 2. 새로운 문제가 로드되면 입력창 비우기
  useEffect(() => {
    setInputValue("");
  }, [question]);

  // 3. 키워드 추가 로직 (대소문자 무시 및 소문자 통일 저장)
  const handleAddChip = () => {
    if (submitted) return;

    // 핵심: 입력값을 소문자로 변환하여 비교 및 저장
    const trimmed = inputValue.trim().toLowerCase();
    if (!trimmed) return;

    if (!chips.includes(trimmed)) {
      const updated = [...chips, trimmed];
      setAnswer(JSON.stringify(updated));
    }
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
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
            핵심 키워드를 입력하여 추가해 주세요.
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

      {/* 입력창 인터페이스 */}
      {!submitted && (
        <div className="flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="키워드 입력 후 Enter"
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
