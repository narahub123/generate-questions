"use client";

import { Question } from "@/types";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

import McqQuestion from "@/components/questions/McqQuestion";
import OxQuestion from "@/components/questions/OxQuestion";
import BlankQuestion from "@/components/questions/BlankQuestion";
import SequenceQuestion from "@/components/questions/SequenceQuestion";
import KeywordListQuestion from "@/components/questions/KeywordListQuestion";
import KeywordFindQuestion from "@/components/questions/KeywordFindQuestion";
import RecallQuestion from "@/components/questions/RecallQuestion"; // 백지 테스트 컴포넌트 추가
import { evaluateAnswer } from "@/lib/ai2/agents/evaluateAnswer";

export default function QuestionDetailClient({
  id,
  index,
}: {
  id: string;
  index: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const version = searchParams.get("version");

  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [result, setResult] = useState<null | "correct" | "wrong">(null);
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState<any | null>(null); // 평가 결과 상태 추가
  const [isLoading, setIsLoading] = useState(false);

  async function load() {
    if (!id || !version) return;

    // index가 -1이면 백지 테스트 모드로 즉시 설정
    if (index === "-1") {
      setQuestion({
        type: "recall",
        question: "학습한 내용을 바탕으로 백지 테스트를 진행해 보세요.",
        answer: "학습 내용 전체",
        explanation: "전체 내용을 자유롭게 회상하여 작성하세요.",
      } as any);

      return;
    }

    try {
      const res = await fetch(
        `/api/questions?sourceId=${id}&version=${encodeURIComponent(version)}`,
      );
      const data = await res.json();
      setQuestion(data.questions?.[Number(index)] || null);
    } catch (error) {
      console.error("문제를 불러오는데 실패했습니다.", error);
    }
  }

  useEffect(() => {
    load();
  }, [id, index, version]);

  if (!version) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3 text-gray-500">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-sm font-medium">유효하지 않은 접근입니다.</p>
        <p className="text-xs text-gray-400">
          버전 정보가 지정되지 않았습니다.
        </p>
        <button
          onClick={() => router.push(`/sources/${id}`)}
          className="text-xs text-blue-600 underline mt-2"
        >
          노트 상세보기로 돌아가기
        </button>
      </div>
    );
  }

  async function submit() {
    if (!question || !answer.trim()) return;

    setIsLoading(true);
    if (index === "-1") {
      // 백지 테스트는 API 호출을 통해 평가
      try {
        const resultData = await evaluateAnswer(id, answer);
        setEvaluation(resultData);
        setResult(resultData.isCorrect ? "correct" : "wrong");
      } catch (e) {
        console.error("평가 실패", e);
        return;
      } finally {
        setIsLoading(false);
      }
    } else {
      // 일반 문제는 로컬 비교
      let isCorrect = false;
      const normalize = (str: string) => str.toLowerCase().trim();

      if (
        ["keyword-find", "keyword-list", "sequence"].includes(question.type)
      ) {
        try {
          const userArray: string[] = JSON.parse(answer);
          const serverArray: string[] = Array.isArray(question.answer)
            ? question.answer
            : JSON.parse(question.answer as unknown as string);

          if (
            question.type === "keyword-find" ||
            question.type === "keyword-list"
          ) {
            const normalizedUser = userArray.map(normalize);
            const normalizedServer = serverArray.map(normalize);
            isCorrect =
              normalizedUser.length === normalizedServer.length &&
              normalizedServer.every((val) => normalizedUser.includes(val));
          } else if (question.type === "sequence") {
            isCorrect =
              JSON.stringify(userArray) === JSON.stringify(serverArray);
          }
        } catch (e) {
          isCorrect = false;
        }
      } else {
        isCorrect = normalize(answer) === normalize(String(question.answer));
      }
      setResult(isCorrect ? "correct" : "wrong");
    }
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

  const currentNum = Number(index) === -1 ? "Recall" : Number(index) + 1;

  const renderQuestionBody = () => {
    if (index === "-1") {
      return (
        <RecallQuestion
          answer={answer}
          setAnswer={setAnswer}
          submitted={submitted}
        />
      );
    }
    switch (question.type) {
      case "mcq":
        return (
          <McqQuestion
            question={question}
            answer={answer}
            setAnswer={setAnswer}
            submitted={submitted}
          />
        );
      case "ox":
        return (
          <OxQuestion
            answer={answer}
            setAnswer={setAnswer}
            submitted={submitted}
          />
        );
      case "blank":
        return (
          <BlankQuestion
            question={question}
            answer={answer}
            setAnswer={setAnswer}
            submitted={submitted}
          />
        );
      case "keyword-find":
        return (
          <KeywordFindQuestion
            question={question}
            answer={answer}
            setAnswer={setAnswer}
            submitted={submitted}
          />
        );
      case "keyword-list":
        return (
          <KeywordListQuestion
            question={question}
            answer={answer}
            setAnswer={setAnswer}
            submitted={submitted}
          />
        );
      case "sequence":
        return (
          <SequenceQuestion
            question={question}
            answer={answer}
            setAnswer={setAnswer}
            submitted={submitted}
          />
        );
      default:
        return (
          <p className="text-sm text-gray-500">
            지원하지 않는 유형의 문제입니다.
          </p>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <button
        onClick={() =>
          router.push(
            `/sources/${id}/questions?version=${encodeURIComponent(version)}`,
          )
        }
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> 문제 목록으로 돌아가기
      </button>

      <main className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
              {question.type} QUIZ
            </span>
          </div>
          <span className="text-sm font-semibold text-gray-500">
            Question {currentNum}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {question.type !== "blank" && (
            <h2 className="text-xl font-bold text-gray-900 leading-snug">
              {question.question}
            </h2>
          )}
          {renderQuestionBody()}

          {!submitted && (
            <button
              onClick={submit}
              disabled={!answer.trim()}
              className="w-full py-3 px-4 bg-gray-950 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-sm rounded-xl transition shadow-sm mt-4"
            >
              {index === "-1" ? "AI 채점 요청하기" : "정답 제출하기"}
            </button>
          )}
        </div>

        {submitted && (
          <div
            className={`border-t p-6 space-y-4 ${result === "correct" ? "bg-green-50/50" : "bg-red-50/50"}`}
          >
            <div className="flex items-center gap-2">
              {result === "correct" ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <h3 className="text-lg font-bold">
                {result === "correct" ? "분석 완료" : "분석 완료"}
              </h3>
            </div>

            <div className="bg-white rounded-xl p-4 border shadow-2xs space-y-2.5 text-sm">
              {index === "-1" ? (
                <div className="space-y-1">
                  <span className="font-bold text-gray-500 block">
                    AI 피드백:
                  </span>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {evaluation?.feedback || "평가가 완료되었습니다."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-gray-500">정답:</span>
                    <span className="font-semibold">{question.answer}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-gray-500">작성 답안:</span>
                    <span
                      className={`font-semibold ${result === "correct" ? "text-green-600" : "text-red-600"}`}
                    >
                      {answer}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-gray-500 block">해설:</span>
                    <p className="text-gray-700 text-sm">
                      {question.explanation}
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() =>
                  router.push(
                    `/sources/${id}/questions?version=${encodeURIComponent(version)}`,
                  )
                }
                className="text-sm font-semibold text-gray-700"
              >
                목록으로 <ArrowRight className="w-4 h-4 inline" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
