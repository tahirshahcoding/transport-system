import { prisma } from "@/lib/prisma";
import { InstitutesClient } from "@/components/institutes/InstitutesClient";

export const dynamic = "force-dynamic";

export default async function InstitutesPage() {
  const institutes = await prisma.institute.findMany({
    include: {
      _count: { select: { students: true } },
      students: {
        select: { routeId: true },
        distinct: ["routeId"],
      },
    },
    orderBy: { name: "asc" },
  });

  return <InstitutesClient initialInstitutes={institutes} />;
}
