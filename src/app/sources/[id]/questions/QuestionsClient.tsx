"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  HelpCircle,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function QuestionsClient({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. 주소창에서 version 파라미터 추출
  const version = searchParams.get("version");

  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    if (!id || !version) return;

    try {
      setIsLoading(true);
      // 2. API 호출 시 sourceId와 version을 함께 전달
      const res = await fetch(
        `/api/questions?sourceId=${id}&version=${encodeURIComponent(version)}`,
      );
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error("문제를 불러오는데 실패했습니다.", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id, version]);

  // 에러 핸들링: 만약 주소창에 버전 정보가 누락된 채 진입했을 경우
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

  // 로딩 상태 UI
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-2">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm text-gray-500">
          [{version}] 버전 문제를 불러오는 중입니다...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* 상단 네비게이션 및 헤더 */}
      <div className="space-y-2">
        <button
          onClick={() => router.push(`/sources/${id}`)}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          노트 상세보기로 돌아가기
        </button>

        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-8 h-8 text-blue-600" />
            Questions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            원문을 바탕으로 생성된 총{" "}
            <span className="font-semibold text-blue-600">
              {questions.length}
            </span>
            개의 문제입니다. 클릭하여 풀이를 시작하세요.
          </p>
          {/* 현재 활성화된 버전을 상단에 가시적으로 표시 */}
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-xs font-medium text-gray-400">
              선택된 버전:
            </span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
              {version}
            </span>
          </div>
        </div>
      </div>

      {/* 문제 리스트 영역 */}
      <div className="space-y-3">
        {questions.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-300 rounded-xl text-gray-400 text-sm">
            해당 버전({version})으로 생성된 문제가 없습니다. 이전 페이지에서
            문제를 먼저 생성해주세요.
          </div>
        ) : (
          <div className="grid gap-4">
            {questions.map((q, i) => (
              <div
                key={i}
                // 3. 개별 문제를 풀러 이동할 때도 어떤 버전의 문제셋인지 쿼리 파라미터로 명시해줍니다.
                onClick={() =>
                  router.push(
                    `/sources/${id}/questions/${i}?version=${encodeURIComponent(version)}`,
                  )
                }
                className="group flex items-start justify-between p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-500 hover:shadow-md cursor-pointer transition-all duration-200"
              >
                <div className="space-y-3 pr-4 flex-1">
                  {/* 문제 타입 배지 표시 */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md tracking-wide uppercase">
                      Q {i + 1} · {q.type || "QUIZ"}
                    </span>
                  </div>

                  {/* 질문 본문 */}
                  <p className="text-gray-800 font-medium text-base leading-relaxed group-hover:text-blue-900 transition-colors">
                    {q.question}
                  </p>
                </div>

                {/* 우측 화살표/이동 아이콘 */}
                <div className="flex items-center self-center pl-2">
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
