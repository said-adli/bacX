"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    UserPen,
    Trash2,
    Check,
    X,
    AlertTriangle,
    User,
    Calendar,
    MessageSquare,
    Loader2
} from "lucide-react";
import { StudentRequest, handleRequest } from "@/lib/actions/requests";
// Deferring this edit until viewing page.tsx

interface RequestTabsProps {
    requests: StudentRequest[];
}

export default function RequestTabs({ requests }: RequestTabsProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"profile" | "deletion">("profile");
    const [isProcessing, setIsProcessing] = useState(false);

    // Rejection Modal State
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<StudentRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    // Delete Confirmation
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Filter requests by type
    const profileRequests = requests.filter(r => r.request_type === "UPDATE_PROFILE");
    const deletionRequests = requests.filter(r => r.request_type === "DELETE_ACCOUNT");

    const handleApprove = async (request: StudentRequest) => {
        if (request.request_type === "DELETE_ACCOUNT") {
            setSelectedRequest(request);
            setShowDeleteConfirm(true);
            return;
        }

        setIsProcessing(true);
        try {
            const result = await handleRequest(request.id, "approve");
            if (result.success) {
                toast.success(result.success);
                router.refresh();
            } else {
                toast.error(result.error || "فشلت العملية");
            }
        } catch (e) {
            toast.error("حدث خطأ غير متوقع");
        } finally {
            setIsProcessing(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedRequest) return;

        setIsProcessing(true);
        try {
            const result = await handleRequest(selectedRequest.id, "approve");
            if (result.success) {
                toast.success(result.success);
                router.refresh();
            } else {
                toast.error(result.error || "فشل حذف الحساب");
            }
        } catch (e) {
            toast.error("حدث خطأ غير متوقع");
        } finally {
            setIsProcessing(false);
            setShowDeleteConfirm(false);
            setSelectedRequest(null);
        }
    };

    const openRejectModal = (request: StudentRequest) => {
        setSelectedRequest(request);
        setRejectionReason("");
        setShowRejectModal(true);
    };

    const confirmReject = async () => {
        if (!selectedRequest) return;
        if (!rejectionReason.trim()) {
            toast.error("يرجى كتابة سبب الرفض");
            return;
        }

        setIsProcessing(true);
        try {
            const result = await handleRequest(selectedRequest.id, "reject", rejectionReason);
            if (result.success) {
                toast.success(result.success);
                router.refresh();
            } else {
                toast.error(result.error || "فشل رفض الطلب");
            }
        } catch (e) {
            toast.error("حدث خطأ غير متوقع");
        } finally {
            setIsProcessing(false);
            setShowRejectModal(false);
            setSelectedRequest(null);
            setRejectionReason("");
        }
    };

    return (
        <div className="container mx-auto max-w-7xl p-6">
            <h2 className="text-3xl font-bold text-white mb-8">إدارة الطلبات</h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-8">
                <button
                    onClick={() => setActiveTab("profile")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "profile"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                >
                    <UserPen size={18} />
                    تعديل الملف الشخصي
                    {profileRequests.length > 0 && (
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                            {profileRequests.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("deletion")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "deletion"
                        ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                        : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                >
                    <Trash2 size={18} />
                    طلبات الحذف
                    {deletionRequests.length > 0 && (
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                            {deletionRequests.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
                {activeTab === "profile" && (
                    <>
                        {profileRequests.length === 0 ? (
                            <EmptyState message="لا توجد طلبات تعديل معلقة" />
                        ) : (
                            profileRequests.map(request => (
                                <ProfileRequestCard
                                    key={request.id}
                                    request={request}
                                    onApprove={() => handleApprove(request)}
                                    onReject={() => openRejectModal(request)}
                                    isProcessing={isProcessing}
                                />
                            ))
                        )}
                    </>
                )}

                {activeTab === "deletion" && (
                    <>
                        {deletionRequests.length === 0 ? (
                            <EmptyState message="لا توجد طلبات حذف معلقة" />
                        ) : (
                            deletionRequests.map(request => (
                                <DeletionRequestCard
                                    key={request.id}
                                    request={request}
                                    onConfirm={() => handleApprove(request)}
                                    isProcessing={isProcessing}
                                />
                            ))
                        )}
                    </>
                )}
            </div>

            {/* Rejection Modal */}
            {showRejectModal && (
                <Modal onClose={() => setShowRejectModal(false)}>
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <MessageSquare size={20} className="text-red-400" />
                            سبب الرفض
                        </h3>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="اكتب سبب رفض الطلب..."
                            className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-4 text-white resize-none focus:outline-none focus:border-red-500/50"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-bold transition-all"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={confirmReject}
                                disabled={isProcessing}
                                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <X size={18} />}
                                تأكيد الرفض
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <Modal onClose={() => setShowDeleteConfirm(false)}>
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            تأكيد الحذف النهائي
                        </h3>
                        <p className="text-white/60 mb-6">
                            سيتم حذف حساب <span className="text-white font-bold">{selectedRequest?.profiles?.full_name}</span> نهائياً من قاعدة البيانات. هذا الإجراء لا يمكن التراجع عنه.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-bold transition-all"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isProcessing}
                                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                حذف نهائي
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ========== Sub-Components ==========

function EmptyState({ message }: { message: string }) {
    return (
        <div className="bg-black/20 border border-white/5 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-emerald-500" />
            </div>
            <p className="text-white/50">{message}</p>
        </div>
    );
}

function ProfileRequestCard({
    request,
    onApprove,
    onReject,
    isProcessing
}: {
    request: StudentRequest;
    onApprove: () => void;
    onReject: () => void;
    isProcessing: boolean;
}) {
    const payload = request.payload || {};
    const profile = request.profiles;

    return (
        <div className="bg-black/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <User size={24} className="text-blue-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white">{profile?.full_name || "مستخدم"}</h4>
                        <p className="text-sm text-white/50">{profile?.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/40">
                    <Calendar size={14} />
                    {new Date(request.created_at).toLocaleDateString("ar-DZ")}
                </div>
            </div>

            {/* Changes Comparison */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {payload.full_name && (
                    <ComparisonRow
                        label="الاسم"
                        oldValue={profile?.full_name || "-"}
                        newValue={payload.full_name}
                    />
                )}
                {payload.wilaya && (
                    <ComparisonRow
                        label="الولاية"
                        oldValue={profile?.wilaya || "-"}
                        newValue={payload.wilaya}
                    />
                )}
                {payload.branch_id && (
                    <ComparisonRow
                        label="الشعبة"
                        oldValue={profile?.branch_id || "-"}
                        newValue={payload.branch_id}
                    />
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={onReject}
                    disabled={isProcessing}
                    className="flex-1 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <X size={18} />
                    رفض
                </button>
                <button
                    onClick={onApprove}
                    disabled={isProcessing}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <Check size={18} />
                    موافقة
                </button>
            </div>
        </div>
    );
}

function ComparisonRow({ label, oldValue, newValue }: { label: string; oldValue: string; newValue: string }) {
    const hasChanged = oldValue !== newValue;

    return (
        <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-white/40 mb-2">{label}</p>
            <div className="flex items-center gap-2">
                <span className={`text-sm ${hasChanged ? "text-white/40 line-through" : "text-white"}`}>
                    {oldValue}
                </span>
                {hasChanged && (
                    <>
                        <span className="text-white/20">→</span>
                        <span className="text-emerald-400 font-bold">{newValue}</span>
                    </>
                )}
            </div>
        </div>
    );
}

function DeletionRequestCard({
    request,
    onConfirm,
    isProcessing
}: {
    request: StudentRequest;
    onConfirm: () => void;
    isProcessing: boolean;
}) {
    const profile = request.profiles;

    return (
        <div className="bg-black/40 border border-red-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                        <Trash2 size={24} className="text-red-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white">{profile?.full_name || "مستخدم"}</h4>
                        <p className="text-sm text-white/50">{profile?.email}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs text-white/40">تاريخ الطلب</p>
                        <p className="text-sm text-white/70">
                            {new Date(request.created_at).toLocaleDateString("ar-DZ")}
                        </p>
                    </div>
                    <button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <Trash2 size={18} />
                        تأكيد الحذف
                    </button>
                </div>
            </div>
        </div>
    );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
                {children}
            </div>
        </div>
    );
}
