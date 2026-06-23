import { generateQuestions } from "@/lib/ai/generateQuestions";
import fs from "fs";
import path from "path";

const SOURCE_DIR = path.join(process.cwd(), "data", "sources");
const QUESTION_DIR = path.join(process.cwd(), "data", "questions");

export async function POST(req: Request) {
  const { sourceId, version } = await req.json();

  if (!version || typeof version !== "string") {
    return Response.json(
      { ok: false, error: "버전명이 필요합니다." },
      { status: 400 },
    );
  }

  const sourcePath = path.join(SOURCE_DIR, `${sourceId}.json`);
  const sourceQuestionDir = path.join(QUESTION_DIR, sourceId);

  if (!fs.existsSync(sourceQuestionDir)) {
    fs.mkdirSync(sourceQuestionDir, { recursive: true });
  }

  const questionPath = path.join(sourceQuestionDir, `${version.trim()}.json`);

  const source = JSON.parse(fs.readFileSync(sourcePath, "utf-8"));

  // =========================
  // AI 실행 (멀티 에이전트)
  // =========================
  const result = await generateQuestions(source.content);

  const { questions, trace } = result;

  // =========================
  // 1. 문제 저장 (trace 포함)
  // =========================
  fs.writeFileSync(
    questionPath,
    JSON.stringify(
      {
        sourceId,
        version: version.trim(),
        questions,
        trace, // 👈 핵심 추가
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  // =========================
  // 2. source 메타 업데이트
  // =========================
  const currentVersions: string[] = source.versions || [];

  if (!currentVersions.includes(version.trim())) {
    currentVersions.push(version.trim());
  }

  const updatedSource = {
    ...source,
    hasQuestions: true,
    versions: currentVersions,
  };

  fs.writeFileSync(sourcePath, JSON.stringify(updatedSource, null, 2));

  // =========================
  // 3. source-list 업데이트
  // =========================
  const listPath = path.join(SOURCE_DIR, "source-list.json");
  const list = JSON.parse(fs.readFileSync(listPath, "utf-8"));

  const newList = list.map((s: any) => (s.id === sourceId ? updatedSource : s));

  fs.writeFileSync(listPath, JSON.stringify(newList, null, 2));

  // =========================
  // RESPONSE
  // =========================
  return Response.json({
    ok: true,
    version: version.trim(),
    questionCount: questions.length,
    trace, // 👈 디버깅용 (필요하면 dev에서만)
  });
}
