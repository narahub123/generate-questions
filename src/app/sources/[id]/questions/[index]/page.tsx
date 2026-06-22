import QuestionDetailClient from "./QuestionDetailClient";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; index: string }>;
}) {
  const { id, index } = await params;

  return <QuestionDetailClient id={id} index={index} />;
}
