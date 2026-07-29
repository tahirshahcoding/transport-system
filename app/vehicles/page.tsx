import { prisma } from "@/lib/prisma";
import { VehiclesClient } from "@/components/vehicles/VehiclesClient";

export default async function VehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      _count: { select: { routes: true } },
    },
    orderBy: { registrationNumber: "asc" },
  });

  return <VehiclesClient initialVehicles={vehicles} />;
}
