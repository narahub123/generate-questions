import fs from "fs";
import path from "path";
import { generateQuestions } from "@/lib/generateQuestions";

const SOURCE_DIR = path.join(process.cwd(), "data", "sources");
const QUESTION_DIR = path.join(process.cwd(), "data", "questions");

export async function POST(req: Request) {
  const { sourceId } = await req.json();

  const sourcePath = path.join(SOURCE_DIR, `${sourceId}.json`);
  const questionPath = path.join(QUESTION_DIR, `${sourceId}.json`);

  const source = JSON.parse(fs.readFileSync(sourcePath, "utf-8"));

  const result = await generateQuestions(source.content);

  // 1. 문제 저장
  fs.writeFileSync(
    questionPath,
    JSON.stringify(
      {
        sourceId,
        questions: result.questions,
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  // 2. source 업데이트 (핵심)
  const updatedSource = {
    ...source,
    hasQuestions: true,
    questionCount: result.questions.length,
  };

  fs.writeFileSync(sourcePath, JSON.stringify(updatedSource, null, 2));

  // 3. 리스트도 업데이트 필요
  const listPath = path.join(SOURCE_DIR, "source-list.json");
  const list = JSON.parse(fs.readFileSync(listPath, "utf-8"));

  const newList = list.map((s: any) => (s.id === sourceId ? updatedSource : s));

  fs.writeFileSync(listPath, JSON.stringify(newList, null, 2));

  return Response.json({
    ok: true,
    questionCount: result.questions.length,
  });
}
