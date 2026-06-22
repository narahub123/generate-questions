import SolveClient from "@/src/app/sources/[id]/solve/SolveClient";

export default function Page({ params }: any) {
  return <SolveClient id={params.id} />;
}
