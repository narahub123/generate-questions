import fs from "fs";
import path from "path";

const QUESTION_DIR = path.join(process.cwd(), "data", "questions");

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sourceId = searchParams.get("sourceId");

  if (!sourceId) {
    return Response.json({ error: "sourceId required" }, { status: 400 });
  }

  const filePath = path.join(QUESTION_DIR, `${sourceId}.json`);

  // 1) 파일 존재 체크
  if (!fs.existsSync(filePath)) {
    return Response.json({
      sourceId,
      questions: [],
      message: "No questions found",
    });
  }

  // 2) 파일 읽기
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  return Response.json({
    sourceId,
    questions: data.questions || [],
    createdAt: data.createdAt,
  });
}
