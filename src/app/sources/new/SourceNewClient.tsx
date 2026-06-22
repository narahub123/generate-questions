"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
              rows={8}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
          </div>
        </div>

        {/* 하단 버튼 제어 */}
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
