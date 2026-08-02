import { Skeleton } from "@/components/ui/skeleton";

export default function InstitutesLoading() {
  return (
    <div className="p-4 md:p-8 md:pl-72 pb-24 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="w-full h-[180px] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
