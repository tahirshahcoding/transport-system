"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getAdminCredentials() {
  const usernameSetting = await prisma.settings.findUnique({ where: { key: "admin_username" } });
  const passwordSetting = await prisma.settings.findUnique({ where: { key: "admin_password" } });

  return {
    username: usernameSetting?.value || "admin",
    password: passwordSetting?.value || "admin123",
  };
}

export async function loginUser(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const creds = await getAdminCredentials();

  if (username !== creds.username || password !== creds.password) {
    return { error: "Invalid username or password" };
  }

  const cookieStore = await cookies();
  cookieStore.set("transport_session", "authenticated", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return { success: true };
}

export async function checkSessionAction() {
  const cookieStore = await cookies();
  return cookieStore.get("transport_session")?.value === "authenticated";
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("transport_session");
  redirect("/login");
}

export async function updateUsername(newUsername: string) {
  if (!newUsername || newUsername.trim().length < 3) {
    throw new Error("Username must be at least 3 characters long.");
  }

  await prisma.settings.upsert({
    where: { key: "admin_username" },
    update: { value: newUsername.trim() },
    create: { key: "admin_username", value: newUsername.trim() },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  const creds = await getAdminCredentials();

  if (currentPassword !== creds.password) {
    throw new Error("Current password is incorrect.");
  }

  if (!newPassword || newPassword.length < 4) {
    throw new Error("New password must be at least 4 characters long.");
  }

  await prisma.settings.upsert({
    where: { key: "admin_password" },
    update: { value: newPassword },
    create: { key: "admin_password", value: newPassword },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function addStudent(data: { name: string; fatherName: string; mobileNumber: string; class: string; routeId?: string; instituteId?: string; vehicleId?: string; monthlyFee?: number | null }) {
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
      monthlyFee: data.monthlyFee || null,
    }
  });

  revalidatePath("/students");
  revalidatePath("/");
}

export async function updateStudent(id: string, data: { name: string; fatherName: string; mobileNumber: string; class: string; routeId?: string; instituteId?: string; vehicleId?: string; monthlyFee?: number | null }) {
  await prisma.student.update({
    where: { id },
    data: {
      name: data.name,
      fatherName: data.fatherName,
      mobileNumber: data.mobileNumber,
      class: data.class,
      instituteId: data.instituteId,
      routeId: data.routeId || null,
      vehicleId: data.vehicleId || null,
      monthlyFee: data.monthlyFee || null,
    }
  });

  revalidatePath("/students");
  revalidatePath("/");
}

export async function deleteStudent(id: string) {
  await prisma.$transaction(async (tx) => {
    // Delete student's payments and challans first
    await tx.payment.deleteMany({ where: { studentId: id } });
    await tx.challan.deleteMany({ where: { studentId: id } });
    await tx.student.delete({ where: { id } });
  });

  revalidatePath("/students");
  revalidatePath("/finance");
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

export async function generateIndividualChallan(studentId: string, targetMonth?: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { route: true }
  });

  if (!student || !student.route) throw new Error("Student not found or has no assigned route");

  const now = new Date();
  const monthName = targetMonth || now.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  let dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 15);
  if (targetMonth) {
    const parts = targetMonth.split(" ");
    if (parts.length === 2) {
      const mIndex = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(parts[0]);
      const yearNum = parseInt(parts[1], 10);
      if (mIndex !== -1 && !isNaN(yearNum)) {
        dueDate = new Date(yearNum, mIndex, 15);
      }
    }
  }

  const existing = await prisma.challan.findFirst({
    where: { studentId: student.id, month: monthName }
  });

  if (!existing) {
    // Check for previous arrears from past unpaid or partial challans
    const pendingChallans = await prisma.challan.findMany({
      where: { 
        studentId: student.id,
        status: { in: ["UNPAID", "PARTIAL"] },
        month: { not: monthName },
      },
      include: { payments: { select: { amount: true } } }
    });

    const totalArrears = pendingChallans.reduce((sum, pc) => {
      const totalPaid = pc.payments.reduce((pSum, p) => pSum + p.amount, 0);
      const remaining = (pc.amount + pc.arrears) - totalPaid;
      return sum + Math.max(0, remaining);
    }, 0);

    const billedAmount = student.monthlyFee !== null ? student.monthlyFee : student.route.feeAmount;

    await prisma.challan.create({
      data: {
        studentId: student.id,
        amount: billedAmount,
        arrears: totalArrears,
        month: monthName,
        dueDate: dueDate,
        status: "UNPAID"
      }
    });

    revalidatePath("/");
    revalidatePath("/finance");
    return { created: true, month: monthName };
  }

  return { created: false, month: monthName, message: `Challan for ${monthName} already exists.` };
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
  revalidatePath("/students");
  revalidatePath("/");
}

export async function updateVehicle(id: string, data: { registration: string; capacity: number; routeId?: string }) {
  await prisma.vehicle.update({
    where: { id },
    data: {
      registrationNumber: data.registration,
      capacity: data.capacity,
      routeId: data.routeId || null,
    }
  });

  revalidatePath("/vehicles");
  revalidatePath("/routes");
  revalidatePath("/students");
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
  revalidatePath("/students");
  revalidatePath("/");
}

export async function addInstitute(data: { name: string }) {
  await prisma.institute.create({
    data: {
      name: data.name,
    }
  });

  revalidatePath("/institutes");
  revalidatePath("/students");
  revalidatePath("/");
}

export async function updateInstitute(id: string, data: { name: string }) {
  await prisma.institute.update({
    where: { id },
    data: { name: data.name }
  });

  revalidatePath("/institutes");
  revalidatePath("/students");
  revalidatePath("/");
}

export async function deleteInstitute(id: string) {
  // First find or create default institute for reassignment
  let defaultInstitute = await prisma.institute.findFirst({
    where: { NOT: { id } }
  });

  const studentsAttached = await prisma.student.count({ where: { instituteId: id } });

  if (studentsAttached > 0) {
    if (!defaultInstitute) {
      defaultInstitute = await prisma.institute.create({
        data: { name: "General Campus" }
      });
    }

    await prisma.student.updateMany({
      where: { instituteId: id },
      data: { instituteId: defaultInstitute.id }
    });
  }

  await prisma.institute.delete({ where: { id } });

  revalidatePath("/institutes");
  revalidatePath("/students");
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
  revalidatePath("/students");
  revalidatePath("/");
}

export async function updateRoute(id: string, data: { name: string; fee: number }) {
  await prisma.route.update({
    where: { id },
    data: {
      name: data.name,
      feeAmount: data.fee,
    }
  });

  revalidatePath("/routes");
  revalidatePath("/students");
  revalidatePath("/vehicles");
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
  const seedNow = new Date();
  const seedMonth = seedNow.toLocaleString('default', { month: 'long', year: 'numeric' });
  const seedDueDate = new Date(seedNow.getFullYear(), seedNow.getMonth(), 15);
  for (const student of students) {
    const fee = student.routeId === r1.id ? 2500 : student.routeId === r2.id ? 3000 : 3500;
    await prisma.challan.create({
      data: {
        studentId: student.id,
        amount: fee,
        month: seedMonth,
        dueDate: seedDueDate,
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

export async function generateChallans(targetMonth?: string) {
  const now = new Date();
  const monthName = targetMonth || now.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  // Calculate due date based on target month/year (default: 15th of that month)
  let dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 15);
  if (targetMonth) {
    const parts = targetMonth.split(" ");
    if (parts.length === 2) {
      const mIndex = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(parts[0]);
      const yearNum = parseInt(parts[1], 10);
      if (mIndex !== -1 && !isNaN(yearNum)) {
        dueDate = new Date(yearNum, mIndex, 15);
      }
    }
  }

  // 1. Fetch active students with assigned routes (1 query)
  const students = await prisma.student.findMany({
    where: { routeId: { not: null }, status: "ACTIVE" },
    include: { route: true }
  });

  if (students.length === 0) {
    return { created: 0, skipped: 0, month: monthName };
  }

  const studentIds = students.map(s => s.id);

  // 2. Fetch existing challans for this month in BATCH (1 query)
  const existingChallans = await prisma.challan.findMany({
    where: {
      studentId: { in: studentIds },
      month: monthName,
    },
    select: { studentId: true }
  });
  const existingStudentIds = new Set(existingChallans.map(c => c.studentId));

  // 3. Fetch all pending/partial challans with payments for arrears calculation in BATCH (1 query)
  const pendingChallans = await prisma.challan.findMany({
    where: {
      studentId: { in: studentIds },
      status: { in: ["UNPAID", "PARTIAL"] },
      month: { not: monthName },
    },
    include: { payments: { select: { amount: true } } }
  });

  // Pre-calculate arrears per student in memory
  const arrearsMap = new Map<string, number>();
  for (const pc of pendingChallans) {
    const totalPaid = pc.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = (pc.amount + pc.arrears) - totalPaid;
    if (remaining > 0) {
      arrearsMap.set(pc.studentId, (arrearsMap.get(pc.studentId) || 0) + remaining);
    }
  }

  // Build new challans payload in memory
  const newChallans = [];
  let skipped = 0;

  for (const student of students) {
    if (!student.route) continue;

    if (existingStudentIds.has(student.id)) {
      skipped++;
      continue;
    }

    const arrears = arrearsMap.get(student.id) || 0;
    const billedAmount = student.monthlyFee !== null ? student.monthlyFee : student.route.feeAmount;

    newChallans.push({
      studentId: student.id,
      amount: billedAmount,
      arrears: arrears,
      month: monthName,
      dueDate: dueDate,
      status: "UNPAID",
    });
  }

  // 4. Bulk insert all new challans in 1 SINGLE DB call
  if (newChallans.length > 0) {
    await prisma.challan.createMany({
      data: newChallans,
    });
  }

  revalidatePath("/");
  revalidatePath("/finance");

  return { created: newChallans.length, skipped, month: monthName };
}

export async function receivePayment(challanId: string, amount: number, method: string = "Cash") {
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

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

export async function deleteChallan(id: string) {
  await prisma.$transaction(async (tx) => {
    await tx.payment.deleteMany({ where: { challanId: id } });
    await tx.challan.delete({ where: { id } });
  });

  revalidatePath("/");
  revalidatePath("/finance");
  revalidatePath("/students");
}

export async function addExpense(data: {
  title: string;
  category: string;
  amount: number;
  month?: string;
  vehicleId?: string;
  notes?: string;
  date?: string;
}) {
  if (!data.title || data.title.trim().length === 0) {
    throw new Error("Expense title is required.");
  }
  if (isNaN(data.amount) || data.amount <= 0) {
    throw new Error("Amount must be greater than zero.");
  }

  const now = data.date ? new Date(data.date) : new Date();
  const monthName = data.month || now.toLocaleString('default', { month: 'long', year: 'numeric' });

  await prisma.expense.create({
    data: {
      title: data.title.trim(),
      category: data.category || "Maintenance",
      amount: data.amount,
      month: monthName,
      date: now,
      vehicleId: data.vehicleId || null,
      notes: data.notes?.trim() || "",
    }
  });

  revalidatePath("/");
  revalidatePath("/finance");
  revalidatePath("/expenses");
}

export async function updateExpense(id: string, data: {
  title: string;
  category: string;
  amount: number;
  month?: string;
  vehicleId?: string;
  notes?: string;
  date?: string;
}) {
  if (!data.title || data.title.trim().length === 0) {
    throw new Error("Expense title is required.");
  }
  if (isNaN(data.amount) || data.amount <= 0) {
    throw new Error("Amount must be greater than zero.");
  }

  const updatePayload: {
    title: string;
    category: string;
    amount: number;
    vehicleId: string | null;
    notes: string;
    month?: string;
    date?: Date;
  } = {
    title: data.title.trim(),
    category: data.category || "Maintenance",
    amount: data.amount,
    vehicleId: data.vehicleId || null,
    notes: data.notes?.trim() || "",
  };

  if (data.month) updatePayload.month = data.month;
  if (data.date) updatePayload.date = new Date(data.date);

  await prisma.expense.update({
    where: { id },
    data: updatePayload,
  });

  revalidatePath("/");
  revalidatePath("/finance");
  revalidatePath("/expenses");
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/finance");
  revalidatePath("/expenses");
}
