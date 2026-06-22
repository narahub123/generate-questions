"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Loader2,
  Sparkles,
  PlusCircle,
} from "lucide-react";

export default function SourceDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [source, setSource] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // 입력 및 선택을 위한 상태 관리
  const [versionInput, setVersionInput] = useState(""); // 생성할 버전명 입력
  const [selectedVersion, setSelectedVersion] = useState(""); // 풀이할 버전 선택

  async function load() {
    const res = await fetch(`/api/sources/${id}`);
    const data = await res.json();
    setSource(data);

    // 기본적으로 생성된 최신 버전이 있다면 첫 번째 버전을 선택 상태로 둡니다.
    if (data.versions && data.versions.length > 0) {
      setSelectedVersion(data.versions[data.versions.length - 1]);
    }
  }

  async function generate() {
    if (isGenerating) return;
    if (!versionInput.trim()) {
      alert("생성할 버전 이름을 입력해주세요. (예: v1, 2차 테스트 등)");
      return;
    }

    // 이미 존재하는 버전 이름인지 체크
    if (source?.versions?.includes(versionInput.trim())) {
      if (!confirm("이미 존재하는 버전 이름입니다. 덮어쓰시겠습니까?")) {
        return;
      }
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceId: id,
          version: versionInput.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("generate failed");
      }

      // 생성 성공 후 입력 폼 초기화 및 데이터 리로드
      setVersionInput("");
      await load();
      alert(`[${versionInput}] 버전의 문제가 성공적으로 생성되었습니다.`);
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

  // 백엔드에서 내려주는 versions 배열을 기준으로 판단합니다.
  const hasVersions = source.versions && source.versions.length > 0;

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

        {/* 하단 제어 및 액션 섹션 */}
        <div className="border-t border-gray-100 bg-gray-50/50 p-6 space-y-4">
          {/* 상단 파트: 버전 지정하여 AI 문제 생성 (항상 유지) */}
          <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center justify-between p-4 bg-white border border-gray-100 rounded-lg">
            <div className="w-full sm:w-auto flex-1 space-y-1">
              <label className="text-xs font-semibold text-gray-500 block">
                새로운 문제 버전 이름
              </label>
              <input
                type="text"
                placeholder="예: 기본 프롬프트, 심화 질문 등"
                value={versionInput}
                onChange={(e) => setVersionInput(e.target.value)}
                disabled={isGenerating}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <button
              onClick={generate}
              disabled={isGenerating || !versionInput.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-4 bg-gray-950 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition shadow-sm whitespace-nowrap"
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
          </div>

          {/* 하단 파트: 생성된 문제 풀기 (버전 선택 필수) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="flex flex-1 items-center gap-3">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                버전 선택:
              </span>
              {hasVersions ? (
                <select
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">-- 풀이할 버전을 선택하세요 --</option>
                  {source.versions.map((ver: string, idx: number) => (
                    <option key={idx} value={ver}>
                      {ver}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-2 rounded-lg w-full max-w-xs block text-center sm:text-left">
                  생성된 문제가 없습니다. 먼저 위에서 문제를 생성하세요.
                </span>
              )}
            </div>

            {/* 선택한 버전을 쿼리 파라미터로 넘겨줌 */}
            <Link
              href={
                selectedVersion
                  ? `/sources/${id}/questions?version=${encodeURIComponent(selectedVersion)}`
                  : "#"
              }
              onClick={(e) => {
                if (!selectedVersion) {
                  e.preventDefault();
                  alert("풀이할 버전을 선택해야 이동할 수 있습니다.");
                }
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-5 font-medium text-sm rounded-lg transition shadow-sm border ${
                selectedVersion
                  ? "bg-blue-600 hover:bg-blue-700 text-white border-transparent"
                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed pointer-events-none"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>선택한 버전 문제 풀기</span>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
