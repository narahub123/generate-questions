import mongoose, { Schema, Document } from "mongoose";

export interface ISourceChunk extends Document {
  sourceId: string;
  content: string;
  embedding: number[];
  metadata: {
    chunkIndex: number;
    length: number;
    createdAt: Date;
  };
}

const SourceChunkSchema: Schema = new Schema({
  sourceId: { type: String, required: true }, // 관계 매핑용 ID
  content: { type: String, required: true }, // 쪼개진 텍스트 조각
  embedding: { type: [Number], required: true }, // 💡 벡터 배열 저장 ([0.123, -0.456, ...])
  metadata: {
    chunkIndex: { type: Number, required: true },
    length: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
});

// 이미 컴파일된 모델이 있으면 쓰고, 없으면 새로 생성 (Next.js 핫 리로딩 대응)
export default mongoose.models.SourceChunk ||
  mongoose.model<ISourceChunk>(
    "SourceChunk",
    SourceChunkSchema,
    "source_chunks",
  );
