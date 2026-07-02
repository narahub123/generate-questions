import { NextResponse } from "next/server";
import OpenAI from "openai";
// 💡 프로젝트의 기존 Mongoose 연결 함수를 가져오세요 (예시)

import SourceChunk from "@/models/SourceChunk";
import { connectMongo } from "@/lib/db/mongoose";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 글자 수 기준 청킹 함수
function chunkText(
  text: string,
  chunkSize = 500,
  chunkOverlap = 100,
): string[] {
  const chunks: string[] = [];
  let currentPos = 0;
  if (!text) return [];

  while (currentPos < text.length) {
    let endPos = currentPos + chunkSize;
    const chunk = text.substring(currentPos, endPos);
    chunks.push(chunk);
    currentPos += chunkSize - chunkOverlap;
  }
  return chunks;
}

export async function POST(request: Request) {
  try {
    const { sourceId, content } = await request.json();

    if (!sourceId || !content) {
      return NextResponse.json(
        { error: "Missing sourceId or content" },
        { status: 400 },
      );
    }

    // 1. 텍스트 청킹
    const textChunks = chunkText(content, 500, 100);
    if (textChunks.length === 0) {
      return NextResponse.json({ message: "No content to ingest" });
    }

    // 2. OpenAI 임베딩 추출
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: textChunks,
    });

    // 3. Mongoose에 저장할 도큐먼트 객체 배열 생성
    const chunksToInsert = textChunks.map((chunk, index) => ({
      sourceId,
      content: chunk,
      embedding: embeddingResponse.data[index].embedding, // 1536차원 벡터 배열
      metadata: {
        chunkIndex: index,
        length: chunk.length,
        createdAt: new Date(),
      },
    }));

    // 4. Mongoose를 통해 DB 연결 및 저장
    await connectMongo();

    // 데이터 꼬임 방지를 위해 해당 노트의 기존 청크 데이터가 있다면 먼저 삭제
    await SourceChunk.deleteMany({ sourceId });

    // 벌크 인서트 진행
    await SourceChunk.insertMany(chunksToInsert);

    return NextResponse.json({
      success: true,
      message: `${textChunks.length}개의 청크가 Mongoose를 통해 성공적으로 임베딩 및 저장되었습니다.`,
    });
  } catch (error: any) {
    console.error("RAG Mongoose Ingest Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
