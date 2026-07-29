import { prisma } from "@/lib/prisma";
import { VehiclesClient } from "@/components/vehicles/VehiclesClient";

export default async function VehiclesPage() {
  const [vehicles, routes] = await Promise.all([
    prisma.vehicle.findMany({
      include: {
        _count: { select: { students: true } },
        route: { select: { name: true } },
      },
      orderBy: { registrationNumber: "asc" },
    }),
    prisma.route.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <VehiclesClient initialVehicles={vehicles} availableRoutes={routes} />;
}
