"use client";

import { Question } from "@/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Loader2,
  Award,
} from "lucide-react";

export default function QuestionDetailClient({
  id,
  index,
}: {
  id: string;
  index: string;
}) {
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [result, setResult] = useState<null | "correct" | "wrong">(null);
  const [submitted, setSubmitted] = useState(false);

  async function load() {
    const res = await fetch(`/api/questions?sourceId=${id}`);
    const data = await res.json();
    setQuestion(data.questions?.[Number(index)]);
  }

  useEffect(() => {
    if (!id) return;
    load();
  }, [id]);

  function submit() {
    if (!question || !answer.trim()) return;

    // 대소문자나 공백에 따른 오답 처리를 방지하기 위해 trim() 및 변환 적용 가능
    const isCorrect = answer.trim() === question.answer.trim();

    setResult(isCorrect ? "correct" : "wrong");
    setSubmitted(true);
  }

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-2">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm text-gray-500">문제를 불러오는 중입니다...</p>
      </div>
    );
  }

  const currentNum = Number(index) + 1;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* 상단 네비게이션 */}
      <button
        onClick={() => router.push(`/sources/${id}/questions`)}
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors gap-1"
      >
        <ArrowLeft className="w-4 h-4" />
        문제 목록으로 돌아가기
      </button>

      {/* 퀴즈 카드 풀이 영역 */}
      <main className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* 카드 상단 정보바 */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
            {question.type} QUIZ
          </span>
          <span className="text-sm font-semibold text-gray-500">
            Question {currentNum}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* 질문 제목 (빈칸 채우기 유형이 아닐 때만 렌더링) */}
          {question.type !== "blank" && (
            <h2 className="text-xl font-bold text-gray-900 leading-snug">
              {question.question}
            </h2>
          )}

          {/* 1. 객관식 (MCQ) UI */}
          {question.type === "mcq" && (
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
          )}

          {/* 2. O/X UI */}
          {question.type === "ox" && (
            <div className="grid grid-cols-2 gap-4">
              {["O", "X"].map((option) => {
                const isSelected = answer === option;
                return (
                  <button
                    key={option}
                    disabled={submitted}
                    onClick={() => setAnswer(option)}
                    className={`p-6 rounded-xl border text-2xl font-bold transition-all
                      ${
                        isSelected
                          ? option === "O"
                            ? "border-green-500 bg-green-50 text-green-600 ring-2 ring-green-500/20"
                            : "border-red-500 bg-red-50 text-red-600 ring-2 ring-red-500/20"
                          : "border-gray-200 hover:bg-gray-50 text-gray-400"
                      } disabled:cursor-not-allowed`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {/* 3. 주관식 단답형 (SHORT) UI */}
          {question.type === "short" && (
            <div className="space-y-1">
              <input
                disabled={submitted}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="정답을 입력하세요"
                className="w-full border border-gray-300 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          )}

          {/* 4. 빈칸 채우기 (BLANK) UI */}
          {question.type === "blank" && (
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
          )}

          {/* 제출 버튼 (제출 전 상태에만 활성화) */}
          {!submitted && (
            <button
              onClick={submit}
              disabled={!answer.trim()}
              className="w-full py-3 px-4 bg-gray-950 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition shadow-sm mt-4"
            >
              정답 제출하기
            </button>
          )}
        </div>

        {/* 5. 채점 결과 및 해설 영역 (제출 완료 후 노출) */}
        {submitted && (
          <div
            className={`border-t p-6 space-y-4 transition-colors duration-300 ${
              result === "correct"
                ? "bg-green-50/50 border-green-100"
                : "bg-red-50/50 border-red-100"
            }`}
          >
            <div className="flex items-center gap-2">
              {result === "correct" ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-bold text-green-800">
                    정답입니다! 아주 훌륭해요.
                  </h3>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-bold text-red-800">
                    아쉽지만 틀렸습니다.
                  </h3>
                </>
              )}
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-2xs space-y-2.5 text-sm">
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-gray-500 min-w-[60px]">
                  정답:
                </span>
                <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-sm">
                  {question.answer}
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-gray-500 min-w-[60px]">
                  작성 답안:
                </span>
                <span
                  className={`font-semibold ${result === "correct" ? "text-green-600" : "text-red-600"}`}
                >
                  {answer}
                </span>
              </div>
              <hr className="border-gray-100 my-2" />
              <div className="space-y-1">
                <span className="font-bold text-gray-500 block">해설:</span>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {question.explanation || "제공된 해설이 없습니다."}
                </p>
              </div>
            </div>

            {/* 다음 문제 풀기 유도 안내 (선택 구현 사항) */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => router.push(`/sources/${id}/questions`)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              >
                문제 목록으로 이동 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
