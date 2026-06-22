"use client";

interface OxQuestionProps {
  answer: string;
  setAnswer: (val: string) => void;
  submitted: boolean;
}

export default function OxQuestion({
  answer,
  setAnswer,
  submitted,
}: OxQuestionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {["O", "X"].map((option) => {
        const isSelected = answer === option;
        return (
          <button
            key={option}
            disabled={submitted}
            onClick={() => setAnswer(option)}
            className={`p-6 rounded-xl border text-2xl font-bold transition-all
              ${
                isSelected
                  ? option === "O"
                    ? "border-green-500 bg-green-50 text-green-600 ring-2 ring-green-500/20"
                    : "border-red-500 bg-red-50 text-red-600 ring-2 ring-red-500/20"
                  : "border-gray-200 hover:bg-gray-50 text-gray-400"
              } disabled:cursor-not-allowed`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
