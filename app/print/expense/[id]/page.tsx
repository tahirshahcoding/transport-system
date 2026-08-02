import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PrintableSalaryVoucher } from "@/components/expenses/PrintableSalaryVoucher";

export default async function PrintExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const expense = await prisma.expense.findUnique({
    where: { id },
    include: {
      vehicle: true,
    },
  });

  if (!expense) {
    return notFound();
  }

  return (
    <>
      <style>{`
        @page {
          size: 58mm auto;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
        }
      `}</style>
      <div className="flex flex-col items-center justify-start h-fit bg-white">
        <PrintableSalaryVoucher
          title={expense.title}
          category={expense.category}
          amount={expense.amount}
          month={expense.month}
          date={expense.date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          vehicleNumber={expense.vehicle?.registrationNumber}
          notes={expense.notes || undefined}
          voucherNo={`VCH-${expense.id.slice(-6).toUpperCase()}`}
        />
      </div>
    </>
  );
}
