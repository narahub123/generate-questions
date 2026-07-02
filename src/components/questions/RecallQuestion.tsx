"use client";

interface RecallQuestionProps {
  answer: string;
  setAnswer: (val: string) => void;
  submitted: boolean;
}

export default function RecallQuestion({
  answer,
  setAnswer,
  submitted,
}: RecallQuestionProps) {
  return (
    <div className="space-y-4">
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={submitted}
        className="w-full h-64 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:bg-gray-50"
        placeholder="학습한 내용을 상세히 적어보세요..."
      />
    </div>
  );
}
