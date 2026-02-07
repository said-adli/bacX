import { Suspense } from "react";
import { getCoupons } from "@/actions/coupons";
import { CouponsClient } from "@/app/admin/coupons/CouponsClient";

import { Loader2 } from "lucide-react";

export default async function CouponsPage() {
    const coupons = await getCoupons();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif">قسائم التخفيض</h1>
                    <p className="text-white/60 mt-1">إدارة أكواد الخصم والعروض الترويجية</p>
                </div>
            </div>

            <Suspense fallback={<CouponsLoading />}>
                <CouponsClient initialCoupons={coupons} />
            </Suspense>
        </div>
    );
}

function CouponsLoading() {
    return (
        <div className="flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
    );
}
