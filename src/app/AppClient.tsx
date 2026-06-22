"use client";

import { useRouter } from "next/navigation";

export default function AppClient() {
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center p-6 space-y-8">
      {/* 헤더 영역 */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Quiz App
        </h1>
        <p className="text-sm text-gray-500">
          노트를 관리하고 나만의 퀴즈를 만들어보세요.
        </p>
      </div>

      {/* 메뉴 버튼 그룹 */}
      <div className="grid gap-4">
        {/* 노트 작성하기 버튼 */}
        <button
          onClick={() => router.push("/sources/new")}
          className="group flex flex-col items-start p-5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5"
        >
          <div className="flex justify-between items-center w-full">
            <span className="font-bold text-lg">📝 노트 작성하기</span>
            <svg
              className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
          <p className="text-xs text-gray-400 mt-1 text-left">
            새로운 학습 원문이나 아이디어를 기록합니다.
          </p>
        </button>

        {/* 노트 목록 보기 버튼 */}
        <button
          onClick={() => router.push("/sources")}
          className="group flex flex-col items-start p-5 bg-white border border-gray-200 hover:border-gray-900 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex justify-between items-center w-full">
            <span className="font-bold text-lg text-gray-800 group-hover:text-gray-900">
              🗂️ 저장된 노트 목록
            </span>
            <svg
              className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-left">
            기존에 작성한 노트들을 확인하고 관리합니다.
          </p>
        </button>
      </div>
    </div>
  );
}
