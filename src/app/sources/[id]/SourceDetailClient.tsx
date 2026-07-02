"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, FileText, Loader2, Sparkles } from "lucide-react";

// 마크다운 뷰어를 위한 라이브러리 로드
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

/* ==========================================
   1단계에서 정의한 마크다운 뷰어 서브 컴포넌트
   ========================================== */
function MarkdownViewer({ content }: { content: string }) {
  return (
    <div className="prose max-w-none text-sm text-gray-800 leading-relaxed space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");

            return !inline && match ? (
              <div className="rounded-lg overflow-hidden my-3 border border-gray-800">
                <SyntaxHighlighter
                  PreTag="div"
                  language={match[1]}
                  style={vscDarkPlus}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className="bg-gray-100 text-rose-600 px-1.5 py-0.5 rounded font-mono text-xs font-semibold"
                {...props}
              >
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 border border-gray-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-100">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-gray-50/50 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 font-medium border-r border-gray-200 last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 text-gray-600 border-r border-gray-200 last:border-r-0">
              {children}
            </td>
          ),
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-gray-900 mt-5 mb-2 border-b border-gray-100 pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium text-gray-900 mt-3 mb-1.5">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mb-2 text-gray-700">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-3 space-y-1 text-gray-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-3 space-y-1 text-gray-700">
              {children}
            </ol>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

interface Recommendation {
  id: string;
  title: string;
  score: number;
  preview: string;
}

/* ==========================================
   메인 소스 상세 클라이언트 컴포넌트
   ========================================== */
export default function SourceDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [source, setSource] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isRecommendLoading, setIsRecommendLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [versionInput, setVersionInput] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("");

  async function load() {
    setIsRecommendLoading(true); // 추천 로딩 시작
    try {
      // 1) 기존 원문 데이터 로드
      const res = await fetch(`/api/sources/${id}`);
      const data = await res.json();
      setSource(data);

      if (data.versions && data.versions.length > 0) {
        setSelectedVersion(data.versions[data.versions.length - 1]);
      }

      /* ========================================================
         💡 [RAG 추가] 원문 로드 성공 후 연관 추천 노트 가져오기
         ======================================================== */
      try {
        const recommendRes = await fetch(`/api/rag/recommend?sourceId=${id}`);
        if (recommendRes.ok) {
          const recommendData = await recommendRes.json();
          if (recommendData.success) {
            setRecommendations(recommendData.recommendations || []);
          }
        }
      } catch (recommendError) {
        // 추천 API 오류가 원문 데이터 표시를 방해하지 않도록 에러 격리
        console.error("추천 데이터를 가져오는 중 오류 발생:", recommendError);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setIsRecommendLoading(false); // 추천 로딩 종료
    }
  }

  async function generate() {
    if (isGenerating) return;
    if (!versionInput.trim()) {
      alert("생성할 버전 이름을 입력해주세요. (예: v1, 2차 테스트 등)");
      return;
    }

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

  const hasVersions = source.versions && source.versions.length > 0;
  const targetHref = selectedVersion
    ? `/sources/${id}/questions?version=${encodeURIComponent(selectedVersion)}`
    : "#";

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
          <MarkdownViewer content={source.content || ""} />
        </div>

        {/* ========================================================
         💡 [RAG 추가] 이어서 공부하면 좋은 연관 노트 섹션
         ======================================================== */}
        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            🔗 이 노트와 함께 연결해서 공부하면 좋은 노트
          </h3>

          {isRecommendLoading ? (
            // 로딩 상태 스켈레톤 UI
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 animate-pulse h-24"
                />
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            // 연관 문서가 없는 경우 (데이터가 부족하거나 첫 문서일 때)
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              아직 연관된 다른 지식 노트가 없습니다. 노트를 더 추가하시면
              유기적으로 지식을 연결해 드립니다.
            </p>
          ) : (
            // 연관 문서 리스트 렌더링
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((item) => (
                <Link
                  key={item.id}
                  href={`/sources/${item.id}`}
                  className="block w-full min-w-0 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-sm transition-all group"
                >
                  {/* 타이틀 영역 */}
                  <div className="flex justify-between items-start gap-4 mb-2 min-w-0">
                    <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate min-w-0 flex-1">
                      {item.title}
                    </h4>
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md shrink-0">
                      {Math.round(item.score * 100)}% 연관
                    </span>
                  </div>

                  {/* 미리보기 본문 영역 */}
                  {/* 💡 테이블이나 마크다운 특수문자가 들어와도 카드 밖으로 탈출하지 못하도록 overflow-x-auto와 오버플로우 방지 속성을 부여합니다 */}
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 w-full overflow-x-auto break-words whitespace-pre-wrap line-clamp-2 cleaner-preview">
                    {item.preview}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 하단 제어 및 액션 섹션 */}
        <div className="border-t border-gray-100 bg-gray-50/50 p-6 space-y-4">
          {/* 상단 파트: 버전 지정하여 AI 문제 생성 */}
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

          {/* 하단 파트: 생성된 문제 풀기 */}
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

            <Link
              href={targetHref}
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
