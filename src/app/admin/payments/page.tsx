import { getPendingPayments } from "@/actions/admin-payments";
import PaymentQueueClient from "@/components/admin/payments/PaymentQueueClient";

export const metadata = {
  title: "إدارة المدفوعات",
};


export default async function PaymentsPage() {
    const payments = await getPendingPayments();

    return <PaymentQueueClient payments={payments || []} />;
}
