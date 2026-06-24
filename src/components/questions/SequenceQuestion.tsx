"use client";

import { useEffect, useState } from "react";
import { Question } from "@/types";
import { ArrowDown, RefreshCw } from "lucide-react";

interface SequenceQuestionProps {
  question: Question;
  answer: string; // 상위 상태 (정렬된 결과 배열을 JSON string으로 보관)
  setAnswer: (val: string) => void;
  submitted: boolean;
}

export default function SequenceQuestion({
  question,
  answer,
  setAnswer,
  submitted,
}: SequenceQuestionProps) {
  // 초기 풀 풀이 세팅용 대기 목록과 조립 완료 목록
  const [pool, setPool] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);

  useEffect(() => {
    if (question.candidates) {
      // 배열을 무작위로 섞는 로직 추가
      const shuffled = [...question.candidates].sort(() => Math.random() - 0.5);
      setPool(shuffled);
      setSelectedOrder([]);
    }
  }, [question, submitted]);

  // 하단 풀에서 아이템 선택 -> 상단 순서 패널로 이동
  const handleSelect = (item: string) => {
    if (submitted) return;
    const nextPool = pool.filter((i) => i !== item);
    const nextOrder = [...selectedOrder, item];

    setPool(nextPool);
    setSelectedOrder(nextOrder);
    setAnswer(JSON.stringify(nextOrder));
  };

  // 상단 패널에서 아이템 취소 -> 하단 풀로 되돌리기
  const handleCancel = (item: string) => {
    if (submitted) return;
    const nextOrder = selectedOrder.filter((i) => i !== item);
    const nextPool = [...pool, item];

    setSelectedOrder(nextOrder);
    setPool(nextPool);
    setAnswer(nextOrder.length > 0 ? JSON.stringify(nextOrder) : "");
  };

  // 전체 초기화
  const handleReset = () => {
    if (submitted || !question.shuffledItems) return;
    setPool([...question.shuffledItems]);
    setSelectedOrder([]);
    setAnswer("");
  };

  return (
    <div className="space-y-5">
      {/* 1. 내가 조립 중인 순서 영역 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            정답 순서 배치 조정
          </span>
          {!submitted && selectedOrder.length > 0 && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs text-red-500 hover:underline"
            >
              <RefreshCw className="w-3 h-3" /> 전체 초기화
            </button>
          )}
        </div>
        <div className="min-h-[140px] p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col gap-2">
          {selectedOrder.length === 0 && (
            <p className="text-xs text-gray-400 m-auto text-center">
              아래 주어진 항목들을 발생 순서대로 차례차례 클릭해 주세요.
            </p>
          )}
          {selectedOrder.map((item, index) => (
            <button
              key={index}
              disabled={submitted}
              onClick={() => handleCancel(item)}
              className="w-full bg-white border border-blue-100 hover:border-red-200 p-3 rounded-lg text-left text-xs font-semibold text-gray-800 shadow-3xs transition flex items-center justify-between group disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-md flex items-center justify-center font-bold text-[11px]">
                  {index + 1}
                </span>
                <span>{item}</span>
              </div>
              {!submitted && (
                <span className="text-[10px] text-gray-400 group-hover:text-red-500 transition-colors">
                  취소
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {!submitted && pool.length > 0 && (
        <div className="flex justify-center">
          <ArrowDown className="w-4 h-4 text-gray-300" />
        </div>
      )}

      {/* 2. 고를 수 있는 셔플 후보 풀 영역 */}
      {!submitted && pool.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            선택 가능한 항목
          </span>
          <div className="flex flex-col gap-2">
            {pool.map((item) => (
              <button
                key={item}
                onClick={() => handleSelect(item)}
                className="w-full bg-white border border-gray-200 hover:bg-gray-50 p-3 rounded-lg text-left text-xs font-medium text-gray-700 shadow-3xs transition"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
