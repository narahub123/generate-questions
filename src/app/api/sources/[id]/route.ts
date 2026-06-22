import fs from "fs";
import path from "path";

const BASE_DIR = path.join(process.cwd(), "data", "sources");

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const filePath = path.join(BASE_DIR, `${id}.json`);

  if (!fs.existsSync(filePath)) {
    return Response.json({ error: "source not found" }, { status: 404 });
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  return Response.json(data);
}
