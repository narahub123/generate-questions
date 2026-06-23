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

// 각각 분리된 독립 컴포넌트들을 default import로 가져옵니다.
import McqQuestion from "@/components/questions/McqQuestion";
import OxQuestion from "@/components/questions/OxQuestion";
import BlankQuestion from "@/components/questions/BlankQuestion";
import SequenceQuestion from "@/components/questions/SequenceQuestion";
import KeywordListQuestion from "@/components/questions/KeywordListQuestion";
import KeywordFindQuestion from "@/components/questions/KeywordFindQuestion";

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

  async function load() {
    if (!id || !version) return;

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

  function submit() {
    if (!question || !answer.trim()) return;

    let isCorrect = false;

    // 공통 정규화 함수 (소문자 변환 + 양옆 공백 제거)
    const normalize = (str: string) => str.toLowerCase().trim();

    if (["keyword-find", "keyword-list", "sequence"].includes(question.type)) {
      try {
        const userArray: string[] = JSON.parse(answer);
        const serverArray: string[] = Array.isArray(question.answer)
          ? question.answer
          : JSON.parse(question.answer as unknown as string);

        if (
          question.type === "keyword-find" ||
          question.type === "keyword-list"
        ) {
          // [수정됨] 대소문자 무시 비교 로직
          const normalizedUser = userArray.map(normalize);
          const normalizedServer = serverArray.map(normalize);

          isCorrect =
            normalizedUser.length === normalizedServer.length &&
            normalizedServer.every((val) => normalizedUser.includes(val));
        } else if (question.type === "sequence") {
          // 순서 맞추기는 인덱스 순서와 대소문자까지 동일해야 한다면 아래와 같이 유지
          isCorrect = JSON.stringify(userArray) === JSON.stringify(serverArray);
        }
      } catch (e) {
        isCorrect = false;
      }
    } else {
      // [수정됨] 단일 매칭도 대소문자 무시 고려가 필요할 수 있음
      isCorrect = normalize(answer) === normalize(String(question.answer));
    }

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

  // 독립 파일 컴포넌트를 타입에 맞게 매핑 분기 처리
  const renderQuestionBody = () => {
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
      // 3. 신규 컴포넌트 라우팅 스위치 케이스 등록
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
        <ArrowLeft className="w-4 h-4" />
        문제 목록으로 돌아가기
      </button>

      <main className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
              {question.type} QUIZ
            </span>
            <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
              버전: {version}
            </span>
          </div>
          <span className="text-sm font-semibold text-gray-500">
            Question {currentNum}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* 빈칸 채우기 유형이 아닐 때만 공통 질문 텍스트 출력 */}
          {question.type !== "blank" && (
            <h2 className="text-xl font-bold text-gray-900 leading-snug">
              {question.question}
            </h2>
          )}

          {/* 컴포넌트 렌더링 함수 실행 */}
          {renderQuestionBody()}

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

            <div className="flex justify-end pt-2">
              <button
                onClick={() =>
                  router.push(
                    `/sources/${id}/questions?version=${encodeURIComponent(version)}`,
                  )
                }
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
