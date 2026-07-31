import { prisma } from "../lib/prisma";

async function main() {
  const [students, routes, vehicles, institutes, challans, payments] = await Promise.all([
    prisma.student.count(),
    prisma.route.count(),
    prisma.vehicle.count(),
    prisma.institute.count(),
    prisma.challan.count(),
    prisma.payment.count(),
  ]);

  console.log({
    students,
    routes,
    vehicles,
    institutes,
    challans,
    payments
  });
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
