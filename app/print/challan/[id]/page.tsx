import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PrintableChallan } from "@/components/finance/PrintableChallan";

export default async function PrintChallanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const challan = await prisma.challan.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          institute: true,
          route: true,
        },
      },
    },
  });

  if (!challan) {
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
        <PrintableChallan
          studentName={challan.student.name}
          fatherName={challan.student.fatherName || "—"}
          studentClass={challan.student.class}
          instituteName={challan.student.institute?.name || "General Campus"}
          route={challan.student.route?.name || "N/A"}
          month={challan.month}
          fee={challan.amount}
          arrears={challan.arrears}
          status={challan.status}
          receiptNo={`CH-${challan.id.slice(-6).toUpperCase()}`}
        />
      </div>
    </>
  );
}
