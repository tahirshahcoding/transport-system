import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { VehiclesClient } from "@/components/vehicles/VehiclesClient";

export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  const [vehicles, routes] = await Promise.all([
    prisma.vehicle.findMany({
      include: {
        _count: { select: { students: true } },
        route: { select: { id: true, name: true } },
      },
      orderBy: { registrationNumber: "asc" },
    }),
    prisma.route.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Vehicles...</div>}>
      <VehiclesClient initialVehicles={vehicles} availableRoutes={routes} />
    </Suspense>
  );
}
