import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      <p className="text-sm text-slate-500 font-medium animate-pulse">Loading...</p>
    </div>
  );
}
