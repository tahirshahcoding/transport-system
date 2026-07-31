import { prisma } from "@/lib/prisma";
import { RoutesClient } from "@/components/routes/RoutesClient";

export const dynamic = "force-dynamic";

export default async function RoutesPage() {
  const routes = await prisma.route.findMany({
    include: {
      _count: { select: { students: true, vehicles: true } },
    },
    orderBy: { name: "asc" },
  });

  return <RoutesClient initialRoutes={routes} />;
}
