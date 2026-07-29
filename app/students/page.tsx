import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { StudentsClient } from "@/components/students/StudentsClient";

export default async function StudentsPage() {
  const [students, routes, institutes, vehicles] = await Promise.all([
    prisma.student.findMany({
      include: {
        institute: { select: { name: true } },
        route: { select: { name: true } },
        vehicle: { select: { registrationNumber: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.route.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.institute.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.vehicle.findMany({
      select: { id: true, registrationNumber: true, routeId: true },
      orderBy: { registrationNumber: "asc" },
    })
  ]);

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Students...</div>}>
      <StudentsClient initialStudents={students} availableRoutes={routes} availableInstitutes={institutes} availableVehicles={vehicles} />
    </Suspense>
  );
}
