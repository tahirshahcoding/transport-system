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
        body {
          margin: 0;
          padding: 0;
          font-size: 13px;
          color: black;
          background: white;
        }
        .thermal-receipt {
          width: 384px;
          margin: 0 auto;
          background: white;
          color: black;
        }
      `}</style>
      <div className="thermal-receipt flex flex-col items-center justify-start h-fit">
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
