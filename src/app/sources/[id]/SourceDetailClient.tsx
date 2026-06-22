"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// lucide-react에서 필요한 아이콘 임포트
import { ArrowLeft, BookOpen, FileText, Loader2, Sparkles } from "lucide-react";

export default function SourceDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [source, setSource] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function load() {
    const res = await fetch(`/api/sources/${id}`);
    const data = await res.json();
    setSource(data);
  }

  async function generate() {
    if (isGenerating) return; // 이미 생성 중이면 중복 실행 방지

    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sourceId: id }),
      });

      if (!res.ok) {
        throw new Error("generate failed");
      }

      // 생성 성공 후 데이터를 다시 로드하여 source.hasQuestions 상태를 갱신하거나 페이지를 새로고침합니다.
      await load();

      // 즉시 이동하고 싶다면 아래 주석을 해제하세요.
      // router.push(`/sources/${id}/questions`);
    } catch (error) {
      console.error("문제 생성 실패", error);
      alert("문제 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    load();
  }, [id]);

  if (!source) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-2">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm text-gray-500">노트를 불러오는 중입니다...</p>
      </div>
    );
  }

  // 백엔드 API 설계에 따라 source.hasQuestions 또는 source.questions?.length > 0 등으로 조건을 맞춰주세요.
  const isQuestionGenerated =
    source.hasQuestions || (source.questions && source.questions.length > 0);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* 상단 네비게이션 */}
      <button
        onClick={() => router.push("/sources")}
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors gap-1"
      >
        <ArrowLeft className="w-4 h-4" />
        목록으로 가기
      </button>

      {/* 노트 상세 카드 */}
      <article className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* 카드 헤더 */}
        <div className="border-b border-gray-100 bg-gray-50/50 p-5 flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-gray-500" />
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            {source.title}
          </h1>
        </div>

        {/* 카드 본문 */}
        <div className="p-6">
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {source.content}
          </p>
        </div>

        {/* 하단 액션 바 */}
        <div className="border-t border-gray-100 bg-gray-50/50 p-4 flex justify-end gap-3">
          {/* 1. 문제가 생성되지 않았을 때만 '문제 생성' 버튼 노출 */}
          {!isQuestionGenerated && (
            <button
              onClick={generate}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 py-2.5 px-5 bg-gray-950 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition shadow-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI 문제 생성 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>AI 문제 생성</span>
                </>
              )}
            </button>
          )}

          {/* 2. 문제가 이미 생성되어 있을 때만 '문제 풀기' 버튼 노출 */}
          {isQuestionGenerated && (
            <Link
              href={`/sources/${id}/questions`}
              className="flex items-center justify-center gap-2 py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>생성된 문제 풀기</span>
            </Link>
          )}
        </div>
      </article>
    </div>
  );
}
