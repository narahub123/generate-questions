"use client";

interface ShortQuestionProps {
  answer: string;
  setAnswer: (val: string) => void;
  submitted: boolean;
}

export default function ShortQuestion({
  answer,
  setAnswer,
  submitted,
}: ShortQuestionProps) {
  return (
    <div className="space-y-1">
      <input
        disabled={submitted}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="정답을 입력하세요"
        className="w-full border border-gray-300 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-50 disabled:text-gray-500"
      />
    </div>
  );
}
