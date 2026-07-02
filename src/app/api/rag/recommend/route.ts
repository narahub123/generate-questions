import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/db/mongoose";
import SourceChunk from "@/models/SourceChunk";
import fs from "fs";
import path from "path";

const BASE_DIR = path.join(process.cwd(), "data", "sources");
const LIST_PATH = path.join(BASE_DIR, "source-list.json");

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get("sourceId"); // 현재 보고 있는 노트 ID

    if (!sourceId) {
      return NextResponse.json({ error: "Missing sourceId" }, { status: 400 });
    }

    await connectMongo();

    // 1. 현재 노트의 대표 청크를 하나 가져옵니다. (첫 번째 청크의 임베딩 활용)
    const currentChunk = await SourceChunk.findOne({ sourceId }).sort({
      "metadata.chunkIndex": 1,
    });

    if (!currentChunk || !currentChunk.embedding) {
      return NextResponse.json({
        message: "현재 노트의 임베딩 데이터가 없습니다.",
        recommendations: [],
      });
    }

    // 2. 💡 MongoDB Atlas Vector Search 실행
    // 현재 노트의 벡터와 가장 유사한 다른 노트의 청크들을 찾아냅니다.
    const similarChunks = await SourceChunk.aggregate([
      {
        $vectorSearch: {
          index: "vector_index", // Atlas 웹 콘솔에서 만든 인덱스 이름
          path: "embedding", // 벡터가 저장된 필드명
          queryVector: currentChunk.embedding, // 비교 대상이 될 현재 노트의 벡터
          numCandidates: 20, // 내부적으로 후보군으로 삼을 개수
          limit: 5, // 최종적으로 가져올 매칭 청크 개수
        },
      },
      // 현재 보고 있는 자기 자신의 노트 청크는 제외합니다.
      {
        $match: {
          sourceId: { $ne: sourceId },
        },
      },
      // 💡 [수정] $project 단계를 사용해 점수(Score)를 올바른 Mongoose 타입 규격으로 추출합니다.
      {
        $project: {
          sourceId: 1,
          content: 1,
          score: { $meta: "vectorSearchScore" }, // Atlas Vector Search의 스코어 추출 표준 문법
        },
      },
      // sourceId별로 그룹화하여 중복 노트를 제거합니다. (한 노트에서 여러 청크가 걸릴 수 있으므로)
      {
        $group: {
          _id: "$sourceId",
          maxScore: { $max: "$score" },
          matchedContent: { $first: "$content" }, // 연관 이유를 보여주고 싶다면 활용
        },
      },
      // 유사도 점수가 높은 순으로 정렬
      {
        $sort: { maxScore: -1 },
      },
    ]);

    // 3. 기존 로직인 로kt 파일 데이터(`source-list.json`)와 매핑하여 타이틀 정보를 채워줍니다.
    if (!fs.existsSync(LIST_PATH)) {
      return NextResponse.json({ recommendations: [] });
    }
    const localSources = JSON.parse(fs.readFileSync(LIST_PATH, "utf-8"));

    const recommendations = similarChunks
      .map((chunk) => {
        // 로컬 파일 리스트에서 매칭되는 원문 정보 찾기
        const matchedSource = localSources.find((s: any) => s.id === chunk._id);

        // 💡 [수정] 마크다운 특수 기호 및 테이블 구분선 제거용 정규식 패턴
        const cleanText = chunk.matchedContent
          .replace(/\|[\s\-\|]*\|/g, "") // 마크다운 테이블 구분선 (|---|---|) 제거
          .replace(/[#*`_\[\]()|]/g, "") // 제목(#), 볼드(*), 코드(`), 링크([]), 테이블 세로선(|) 제거
          .replace(/\s+/g, " ") // 연속된 공백 및 줄바꿈을 한 칸 공백으로 압축
          .trim();

        return {
          id: chunk._id,
          title: matchedSource ? matchedSource.title : "제목 없는 노트",
          score: chunk.maxScore,
          preview: cleanText.substring(0, 90) + "...", // 찌꺼기 없는 순수 텍스트 미리보기
        };
      })
      .filter((item) => item.id);

    return NextResponse.json({
      success: true,
      recommendations, // 프론트엔드에 넘겨줄 연관 노트 리스트
    });
  } catch (error: any) {
    console.error("RAG Recommendation Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
