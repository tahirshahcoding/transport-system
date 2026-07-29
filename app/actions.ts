"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addStudent(data: { name: string; fatherName: string; mobileNumber: string; class: string; routeId?: string; instituteId?: string; vehicleId?: string }) {
  // Find or create default institute if none provided
  let instituteId = data.instituteId;
  if (!instituteId) {
    let defaultInstitute = await prisma.institute.findFirst();
    if (!defaultInstitute) {
      defaultInstitute = await prisma.institute.create({
        data: { name: "Default Institute" }
      });
    }
    instituteId = defaultInstitute.id;
  }

  await prisma.student.create({
    data: {
      name: data.name,
      fatherName: data.fatherName,
      mobileNumber: data.mobileNumber,
      class: data.class,
      instituteId: instituteId,
      routeId: data.routeId || null,
      vehicleId: data.vehicleId || null,
    }
  });

  revalidatePath("/students");
  revalidatePath("/");
}

export async function toggleStudentStatus(studentId: string, currentStatus: string) {
  await prisma.student.update({
    where: { id: studentId },
    data: { status: currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
  });

  revalidatePath("/students");
  revalidatePath("/");
}

export async function generateIndividualChallan(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { route: true }
  });

  if (!student || !student.route) throw new Error("Student not found or has no assigned route");

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const monthName = nextMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 15);

  const existing = await prisma.challan.findFirst({
    where: { studentId: student.id, month: monthName }
  });

  if (!existing) {
    // Check for previous arrears
    const pendingChallans = await prisma.challan.findMany({
      where: { 
        studentId: student.id,
        status: { in: ["UNPAID", "PARTIAL"] }
      }
    });

    const totalArrears = pendingChallans.reduce((sum, c) => {
      // If it's a partial payment, we'd ideally calculate amount - payments.
      // For simplicity in this step, if UNPAID we add full amount + its arrears.
      // If PARTIAL, we'd need to subtract total paid. 
      // We'll refine arrears calculation later in the finance module.
      return sum + c.amount + c.arrears;
    }, 0);

    // To prevent double counting if we haven't implemented precise partial logic yet,
    // we'll just sum up what is technically unpaid. 
    // Actually, let's keep arrears logic simple in bulk for now, but we add the field.

    await prisma.challan.create({
      data: {
        studentId: student.id,
        amount: student.route.feeAmount,
        arrears: 0, // We will implement accurate arrears calculation in generateChallans
        month: monthName,
        dueDate: dueDate,
        status: "UNPAID"
      }
    });
  }

  revalidatePath("/students");
  revalidatePath("/finance");
}

export async function addVehicle(data: { registration: string; capacity: number; routeId?: string }) {
  await prisma.vehicle.create({
    data: {
      registrationNumber: data.registration,
      capacity: data.capacity,
      routeId: data.routeId || null,
    }
  });

  revalidatePath("/vehicles");
  revalidatePath("/");
}

export async function deleteVehicle(id: string) {
  // First nullify any students attached to this vehicle
  await prisma.student.updateMany({
    where: { vehicleId: id },
    data: { vehicleId: null }
  });

  await prisma.vehicle.delete({
    where: { id }
  });

  revalidatePath("/vehicles");
  revalidatePath("/routes");
  revalidatePath("/");
}

export async function addInstitute(data: { name: string }) {
  await prisma.institute.create({
    data: {
      name: data.name,
    }
  });

  revalidatePath("/institutes");
  revalidatePath("/");
}

export async function addRoute(data: { name: string; fee: number }) {
  await prisma.route.create({
    data: {
      name: data.name,
      feeAmount: data.fee,
    }
  });

  revalidatePath("/routes");
  revalidatePath("/");
}

export async function deleteRoute(id: string) {
  // Nullify route in vehicles
  await prisma.vehicle.updateMany({
    where: { routeId: id },
    data: { routeId: null }
  });

  // Nullify route and vehicle in students
  await prisma.student.updateMany({
    where: { routeId: id },
    data: { routeId: null, vehicleId: null }
  });

  await prisma.route.delete({
    where: { id }
  });

  revalidatePath("/routes");
  revalidatePath("/students");
  revalidatePath("/");
}

export async function seedDatabase() {
  // Create an institute
  const institute = await prisma.institute.create({
    data: { name: "ABC Grammar School" }
  });

  // Create Routes first
  const r1 = await prisma.route.create({ data: { name: "Mingora Central", feeAmount: 2500 } });
  const r2 = await prisma.route.create({ data: { name: "Saidu Sharif", feeAmount: 3000 } });
  const r3 = await prisma.route.create({ data: { name: "Kabal Road", feeAmount: 3500 } });

  // Create Vehicles and attach to routes
  const v1 = await prisma.vehicle.create({ data: { registrationNumber: "LES-1234", capacity: 40, routeId: r1.id } });
  const v2 = await prisma.vehicle.create({ data: { registrationNumber: "CAG-5678", capacity: 25, routeId: r2.id } });
  const v3 = await prisma.vehicle.create({ data: { registrationNumber: "RIS-2345", capacity: 52, routeId: r3.id } });
  const v4 = await prisma.vehicle.create({ data: { registrationNumber: "BNS-9999", capacity: 15, routeId: r1.id } });

  // Create Students
  const students = await Promise.all([
    prisma.student.create({ data: { name: "Ali Khan", fatherName: "Mehboob Khan", mobileNumber: "923001234567", class: "7th", instituteId: institute.id, routeId: r1.id, vehicleId: v1.id } }),
    prisma.student.create({ data: { name: "Ahmad Shah", fatherName: "Nawab Shah", mobileNumber: "923009876543", class: "9th", instituteId: institute.id, routeId: r2.id, vehicleId: v2.id } }),
    prisma.student.create({ data: { name: "Umar Farooq", fatherName: "Farooq Ahmad", mobileNumber: "923451112233", class: "10th", instituteId: institute.id, routeId: r1.id, vehicleId: v4.id } }),
    prisma.student.create({ data: { name: "Zainab Bibi", fatherName: "Abdul Karim", mobileNumber: "923331234567", class: "5th", instituteId: institute.id, routeId: r2.id, vehicleId: v2.id } }),
    prisma.student.create({ data: { name: "Hassan Ali", fatherName: "Sher Ali", mobileNumber: "923124445566", class: "8th", instituteId: institute.id, routeId: r3.id, vehicleId: v3.id } }),
    prisma.student.create({ data: { name: "Sara Khan", fatherName: "Rehman Khan", mobileNumber: "923007778899", class: "6th", instituteId: institute.id, routeId: r1.id, vehicleId: v1.id } }),
    prisma.student.create({ data: { name: "Irfan Shah", fatherName: "Zahid Shah", mobileNumber: "923469990011", class: "10th", instituteId: institute.id, routeId: r3.id, vehicleId: v3.id } }),
  ]);

  // Generate Challans
  for (const student of students) {
    const fee = student.routeId === r1.id ? 2500 : student.routeId === r2.id ? 3000 : 3500;
    await prisma.challan.create({
      data: {
        studentId: student.id,
        amount: fee,
        month: "August 2026",
        dueDate: new Date("2026-08-15"),
        status: "UNPAID"
      }
    });
  }

  // Create a couple of payments (mark 2 students as paid)
  const paidChallans = await prisma.challan.findMany({ take: 2 });
  for (const challan of paidChallans) {
    await prisma.payment.create({
      data: {
        studentId: challan.studentId,
        challanId: challan.id,
        amount: challan.amount,
        method: "Cash",
      }
    });
    await prisma.challan.update({ where: { id: challan.id }, data: { status: "PAID" } });
  }

  revalidatePath("/");
  revalidatePath("/students");
  revalidatePath("/routes");
  revalidatePath("/vehicles");
  revalidatePath("/finance");
}

export async function generateChallans() {
  const students = await prisma.student.findMany({
    where: { routeId: { not: null }, status: "ACTIVE" },
    include: { route: true }
  });

  // Use the current month (not next month) for more intuitive behavior
  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  // Due date: 15th of next month
  const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 15);

  let created = 0;
  let skipped = 0;

  for (const student of students) {
    if (!student.route) continue;

    // Duplicate check: skip if challan already exists for this student + month
    const existing = await prisma.challan.findFirst({
      where: { studentId: student.id, month: monthName }
    });

    if (existing) {
      skipped++;
      continue;
    }

    // Calculate arrears from ALL previous unpaid/partial challans
    const pendingChallans = await prisma.challan.findMany({
      where: {
        studentId: student.id,
        status: { in: ["UNPAID", "PARTIAL"] },
      },
      include: { payments: true }
    });

    let calculatedArrears = 0;
    for (const pc of pendingChallans) {
      const totalPaid = pc.payments.reduce((sum, p) => sum + p.amount, 0);
      const totalDue = pc.amount + pc.arrears;
      calculatedArrears += (totalDue - totalPaid);
    }

    // Use a transaction to create the challan atomically
    await prisma.$transaction(async (tx) => {
      await tx.challan.create({
        data: {
          studentId: student.id,
          amount: student.route!.feeAmount,
          arrears: calculatedArrears,
          month: monthName,
          dueDate: dueDate,
          status: "UNPAID"
        }
      });
    });

    created++;
  }

  revalidatePath("/");
  revalidatePath("/finance");

  return { created, skipped, month: monthName };
}

export async function receivePayment(challanId: string, amount: number, method: string = "Cash") {
  // Use transaction for atomic payment + status update
  await prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({
      where: { id: challanId },
      include: { payments: true }
    });

    if (!challan) throw new Error("Challan not found");
    if (challan.status === "PAID") throw new Error("This challan is already fully paid.");

    const totalPreviouslyPaid = challan.payments.reduce((sum, p) => sum + p.amount, 0);
    const totalDue = challan.amount + challan.arrears;
    const remaining = totalDue - totalPreviouslyPaid;

    if (amount > remaining) {
      throw new Error(`Payment of Rs ${amount} exceeds remaining due of Rs ${remaining}.`);
    }

    await tx.payment.create({
      data: {
        studentId: challan.studentId,
        challanId: challan.id,
        amount: amount,
        method: method,
      }
    });

    const totalPaidNow = totalPreviouslyPaid + amount;
    const newStatus = totalPaidNow >= totalDue ? "PAID" : "PARTIAL";

    await tx.challan.update({
      where: { id: challanId },
      data: { status: newStatus }
    });
  });

  revalidatePath("/");
  revalidatePath("/finance");
}
