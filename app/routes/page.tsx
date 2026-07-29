import { prisma } from "@/lib/prisma";
import { RoutesClient } from "@/components/routes/RoutesClient";

export default async function RoutesPage() {
  const [routes, vehicles] = await Promise.all([
    prisma.route.findMany({
      include: {
        vehicle: true,
        _count: { select: { students: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.vehicle.findMany({
      select: { id: true, registrationNumber: true },
      orderBy: { registrationNumber: "asc" },
    })
  ]);

  return <RoutesClient initialRoutes={routes} availableVehicles={vehicles} />;
}
