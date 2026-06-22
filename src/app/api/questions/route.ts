import fs from "fs";
import path from "path";

const QUESTION_DIR = path.join(process.cwd(), "data", "questions");

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sourceId = searchParams.get("sourceId");
  const version = searchParams.get("version");

  // sourceId와 version 둘 다 필수 항목입니다.
  if (!sourceId || !version) {
    return Response.json(
      { error: "sourceId와 version 파라미터가 모두 필요합니다." },
      { status: 400 },
    );
  }

  // 변경된 경로: data/questions/[sourceId]/[version].json
  const filePath = path.join(QUESTION_DIR, sourceId, `${version.trim()}.json`);

  // 1) 파일 존재 체크
  if (!fs.existsSync(filePath)) {
    return Response.json({
      sourceId,
      version,
      questions: [],
      message: `해당 버전(${version})의 문제를 찾을 수 없습니다.`,
    });
  }

  // 2) 파일 읽기
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  return Response.json({
    sourceId,
    version: data.version || version,
    questions: data.questions || [],
    createdAt: data.createdAt,
  });
}
