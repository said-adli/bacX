import { getPendingPayments } from "@/actions/admin-payment-actions";
import { PaymentReviewCard } from "@/components/admin/payments/PaymentReviewCard";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { CheckCircle2 } from "lucide-react";

export const metadata = {
    title: "Admin - Finance",
};

export default async function PaymentsPage() {
    const { payments } = await getPendingPayments();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Financial Clearing House</h1>
                    <p className="text-gray-400">Review and approve student payments</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    {payments.length} Pending Requests
                </div>
            </div>

            {payments.length === 0 ? (
                <AdminEmptyState
                    title="All Caught Up!"
                    description="There are no pending payments to review at this time."
                    icon="layout" // Could use a check icon ideally
                />
            ) : (
                <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-2">
                    {payments.map((payment) => (
                        <PaymentReviewCard key={payment.id} payment={payment} />
                    ))}
                </div>
            )}
        </div>
    );
}
