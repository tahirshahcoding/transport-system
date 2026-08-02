import { Skeleton } from "@/components/ui/skeleton";

export default function FinanceLoading() {
  return (
    <div className="p-4 md:p-8 md:pl-72 pb-24 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="w-full h-32 rounded-2xl" />
        ))}
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>

      <div className="space-y-4 mt-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="w-full h-[140px] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
