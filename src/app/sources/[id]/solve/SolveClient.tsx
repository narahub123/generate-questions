"use client";

import { useEffect, useState } from "react";

export default function SolveClient({ id }: { id: string }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [index, setIndex] = useState(0);

  async function load() {
    const res = await fetch(`/api/questions?sourceId=${id}`);
    const data = await res.json();
    setQuestions(data.questions);
  }

  useEffect(() => {
    load();
  }, []);

  if (!questions.length) return <div>loading...</div>;

  const q = questions[index];

  return (
    <div>
      <h2>{q.question}</h2>

      <button onClick={() => setIndex((i) => i + 1)}>next</button>
    </div>
  );
}
