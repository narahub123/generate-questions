import fs from "fs";
import path from "path";
import { generateQuestions } from "@/lib/generateQuestions";

const SOURCE_DIR = path.join(process.cwd(), "data", "sources");
const QUESTION_DIR = path.join(process.cwd(), "data", "questions");

export async function POST(req: Request) {
  // 프론트엔드로부터 sourceId와 함께 지정한 version명을 전달받음
  const { sourceId, version } = await req.json();

  if (!version || typeof version !== "string") {
    return Response.json(
      { ok: false, error: "버전명이 필요합니다." },
      { status: 400 },
    );
  }

  const sourcePath = path.join(SOURCE_DIR, `${sourceId}.json`);

  // 특정 소스의 버전별 문제를 저장할 폴더 생성 (data/questions/[sourceId]/)
  const sourceQuestionDir = path.join(QUESTION_DIR, sourceId);
  if (!fs.existsSync(sourceQuestionDir)) {
    fs.mkdirSync(sourceQuestionDir, { recursive: true });
  }

  // 파일명 예시: data/questions/[sourceId]/v1.json
  const questionPath = path.join(sourceQuestionDir, `${version.trim()}.json`);

  // 원본 소스 로드
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf-8"));

  // AI 문제 생성 진행
  const result = await generateQuestions(source.content);

  // 1. 버전별 문제 데이터 저장
  fs.writeFileSync(
    questionPath,
    JSON.stringify(
      {
        sourceId,
        version: version.trim(),
        questions: result.questions,
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  // 2. source 메타데이터 업데이트 (기존 버전 목록 유지하며 중복 없이 추가)
  const currentVersions: string[] = source.versions || [];
  if (!currentVersions.includes(version.trim())) {
    currentVersions.push(version.trim());
  }

  const updatedSource = {
    ...source,
    hasQuestions: true,
    versions: currentVersions, // 프론트엔드에서 참조할 버전 리스트 추가
  };

  fs.writeFileSync(sourcePath, JSON.stringify(updatedSource, null, 2));

  // 3. source-list.json 업데이트
  const listPath = path.join(SOURCE_DIR, "source-list.json");
  const list = JSON.parse(fs.readFileSync(listPath, "utf-8"));

  const newList = list.map((s: any) => (s.id === sourceId ? updatedSource : s));

  fs.writeFileSync(listPath, JSON.stringify(newList, null, 2));

  return Response.json({
    ok: true,
    version: version.trim(),
    questionCount: result.questions.length,
  });
}
