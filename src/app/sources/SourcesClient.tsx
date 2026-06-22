"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  SlidersHorizontal,
  Plus,
  Loader2,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

// 정렬 타입 정의
type SortOption = "latest" | "oldest" | "title";

export default function SourcesClient() {
  const router = useRouter();
  const [list, setList] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("latest"); // 기본값: 최신순
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/sources");
      const data = await res.json();
      setList(data || []);
    } catch (error) {
      console.error("데이터를 불러오는데 실패했습니다.", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // 🔥 실제 데이터 규격(createdAt, title)에 맞춘 정렬 로직
  const getSortedList = () => {
    return [...list].sort((a, b) => {
      if (sortBy === "latest") {
        // 최신순: 날짜 타임스탬프 값이 큰 것(최근)이 위로 오도록 b - a
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      if (sortBy === "oldest") {
        // 오래된순: 날짜 타임스탬프 값이 작은 것(과거)이 위로 오도록 a - b
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      if (sortBy === "title") {
        // 제목순: 한국어/영어 가나다 정렬
        return a.title.localeCompare(b.title, "ko");
      }
      return 0;
    });
  };

  const sortedList = getSortedList();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* 상단 헤더 및 작성 버튼 */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Sources
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            저장된 노트와 원문 목록입니다.
          </p>
        </div>

        {/* 새 노트 작성 버튼 */}
        <button
          onClick={() => router.push("/sources/new")}
          className="flex items-center gap-1.5 py-2 px-4 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm rounded-lg transition-colors duration-200 shadow-sm"
        >
          <Plus className="w-4 h-4" /> 새 노트 작성
        </button>
      </div>

      {/* 정렬 필터 바 영역 */}
      {list.length > 0 && (
        <div className="flex justify-end items-center gap-2 text-sm text-gray-600">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="title">제목순 (가나다)</option>
          </select>
        </div>
      )}

      {/* 리스트 및 로딩 상태 영역 */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
            <p className="text-sm text-gray-500">목록을 불러오는 중...</p>
          </div>
        ) : sortedList.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-300 rounded-xl text-gray-400 text-sm">
            등록된 소스가 없습니다. 첫 번째 소스를 추가해보세요!
          </div>
        ) : (
          <ul className="grid gap-3">
            {sortedList.map((item) => (
              <li key={item.id}>
                <Link
                  href={`sources/${item.id}`}
                  className="block p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </span>
                      {/* 데이터에 기반한 문제 생성 상태 배지 (hasQuestions 활용) */}
                      {item.hasQuestions && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 w-fit px-1.5 py-0.5 rounded">
                          <HelpCircle className="w-3 h-3" /> 문제{" "}
                          {item.questionCount || 0}개 생성됨
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors transform group-hover:translate-x-1 duration-200" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
