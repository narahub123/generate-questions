import fs from "fs";
import path from "path";

const BASE_DIR = path.join(process.cwd(), "data", "sources");

export async function getSourceContent(id: string): Promise<string> {
  const filePath = path.join(BASE_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error("Source not found");
  }
  const fileData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // fileData 구조에 따라 원문이 들어있는 필드를 반환 (예: fileData.content 또는 fileData.text)
  return fileData.content || fileData.text || JSON.stringify(fileData);
}
