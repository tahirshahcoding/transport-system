import { prisma } from "@/lib/prisma";
import { StudentsClient } from "@/components/students/StudentsClient";

export default async function StudentsPage() {
  const [students, routes, institutes] = await Promise.all([
    prisma.student.findMany({
      include: {
        institute: { select: { name: true } },
        route: { select: { name: true } },
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
    })
  ]);

  return <StudentsClient initialStudents={students} availableRoutes={routes} availableInstitutes={institutes} />;
}
