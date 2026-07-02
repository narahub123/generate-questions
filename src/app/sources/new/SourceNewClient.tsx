"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function SourceNewClient() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function save() {
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/sources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      // 저장 성공 후 목록 페이지로 이동
      router.push("/sources");
      router.refresh();
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* 뒤로 가기 링크 및 헤더 */}
      <div className="space-y-2">
        <Link
          href="/sources"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          목록으로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          새 노트 작성
        </h1>
      </div>

      {/* 입력 폼 영역 */}
      <main className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
        <div className="space-y-4">
          {/* Title 입력란 (기존 유지) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Content 입력란 (Textarea에서 Monaco Editor로 교체) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Content
            </label>
            <div className="w-full border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition">
              <Editor
                height="350px"
                language="markdown" // 마크다운 문법 하이라이팅 활성화
                theme="vs-dark" // 개발자들이 선호하는 다크 테마 (라이트 테마를 원하시면 지우거나 'vs'로 변경)
                value={content}
                // 모나코 에디터의 onChange는 e.target.value가 아니라 문자열(string) 자체가 첫 번째 인자로 옵니다.
                onChange={(val) => setContent(val || "")}
                options={{
                  minimap: { enabled: false }, // 우측 미니맵 비활성화로 깔끔하게 처리
                  fontSize: 14,
                  wordWrap: "on", // 창 크기에 맞게 자동 줄바꿈
                  lineNumbers: "off", // 라인 넘버가 거슬린다면 off, 필요하면 on
                  scrollbar: {
                    vertical: "visible",
                    horizontal: "hidden",
                  },
                  tabSize: 2,
                }}
                // 에디터 로딩 중에 보여줄 대체 UI
                loading={
                  <div className="h-[350px] flex items-center justify-center text-sm text-gray-400 bg-gray-900">
                    에디터 로딩 중...
                  </div>
                }
              />
            </div>
          </div>
        </div>

        {/* 하단 버튼 제어 (기존 유지) */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => router.push("/sources")}
            className="flex-1 py-2.5 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-lg transition"
          >
            취소
          </button>
          <button
            onClick={save}
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="flex-1 py-2.5 px-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition shadow-sm"
          >
            {isSubmitting ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </main>
    </div>
  );
}
