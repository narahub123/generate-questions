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

  return Response.json({ id });
}
