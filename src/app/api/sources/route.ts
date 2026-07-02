import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const BASE_DIR = path.join(process.cwd(), "data", "sources");
const LIST_PATH = path.join(BASE_DIR, "source-list.json");

function ensureDir() {
  if (!fs.existsSync(BASE_DIR)) {
    fs.mkdirSync(BASE_DIR, { recursive: true });
  }

  if (!fs.existsSync(LIST_PATH)) {
    fs.writeFileSync(LIST_PATH, JSON.stringify([], null, 2));
  }
}

export async function GET() {
  ensureDir();

  const list = JSON.parse(fs.readFileSync(LIST_PATH, "utf-8"));

  return Response.json(list);
}

export async function POST(req: Request) {
  ensureDir();

  const { title, content } = await req.json();

  const id = randomUUID();

  const newSource = {
    id,
    title,
    content,
    createdAt: new Date().toISOString(),
  };

  // 1) 리스트 업데이트
  const list = JSON.parse(fs.readFileSync(LIST_PATH, "utf-8"));
  list.push(newSource);

  fs.writeFileSync(LIST_PATH, JSON.stringify(list, null, 2));

  // 2) 개별 파일 저장
  fs.writeFileSync(
    path.join(BASE_DIR, `${id}.json`),
    JSON.stringify(newSource, null, 2),
  );

  /* ==========================================
     💡 [RAG 추가] 로컬 저장 성공 후 MongoDB에 청킹/임베딩 주입
     ========================================== */
  try {
    // 배포 환경 및 로컬 개발 환경의 도메인 추출 (없으면 기본값 localhost)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 비동기로 MongoDB 적재 API 호출
    const ingestResponse = await fetch(`${baseUrl}/api/rag/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourceId: id, // 발급된 파일 uuid를 매핑용 sourceId로 전달
        content: content, // 전체 마크다운 본문
      }),
    });

    if (!ingestResponse.ok) {
      console.error("❌ RAG Ingest 실패: 백엔드 처리 중 오류 발생");
    }
  } catch (ragError) {
    // 실험 단계이므로 RAG 실패가 원문 파일 저장의 실패로 이어지지 않도록 에러 격리 처리
    console.error("❌ RAG Ingest 네트워크/연결 오류:", ragError);
  }

  // 기존 반환 형태 유지
  return Response.json({ id });
}
