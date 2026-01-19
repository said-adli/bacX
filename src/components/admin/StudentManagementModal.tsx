"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Save, Clock, ShieldAlert, LogOut, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/GlassCard";
import { AdminStudentProp, updateStudentProfile, extendSubscription, toggleStudentBan, logoutStudent } from "@/actions/admin-student-management";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StudentManagementModalProps {
    student: AdminStudentProp | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void; // Trigger refresh
}

export function StudentManagementModal({ student, isOpen, onClose, onUpdate }: StudentManagementModalProps) {
    const [loading, setLoading] = useState(false);

    // Edit Form State
    const [formData, setFormData] = useState({
        full_name: student?.full_name || "",
        wilaya: student?.wilaya || ""
    });

    if (!student) return null;

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            await updateStudentProfile(student.id, formData);
            toast.success("Profile updated successfully");
            onUpdate();
        } catch (e) {
            toast.error("Failed to update profile");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleExtend = async (days: number) => {
        if (!confirm(`Add ${days} days to subscription?`)) return;
        setLoading(true);
        try {
            await extendSubscription(student.id, days);
            toast.success(`Added ${days} days`);
            onUpdate();
        } catch (e) {
            toast.error("Failed to extend");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleBan = async () => {
        const action = student.banned ? "Unban" : "Ban";
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;

        setLoading(true);
        try {
            await toggleStudentBan(student.id, student.banned);
            toast.success(`User ${action}ned`);
            onUpdate();
            onClose(); // Close on ban usually
        } catch (e) {
            toast.error("Action failed");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        if (!confirm("Force logout user from all devices?")) return;
        setLoading(true);
        try {
            await logoutStudent(student.id);
            toast.success("User logged out");
        } catch (e) {
            toast.error("Action failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
                <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-2xl z-50 outline-none">
                    <GlassCard className="p-0 overflow-hidden border-white/10 shadow-2xl bg-[#0a0a0f]">
                        {/* HEADER */}
                        <div className="p-6 border-b border-white/5 flex items-start justify-between bg-white/5">
                            <div>
                                <h2 className="text-2xl font-bold text-white font-tajawal">{student.full_name}</h2>
                                <p className="text-zinc-400 font-mono text-sm">{student.email}</p>
                                <div className="flex gap-2 mt-2">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-xs border",
                                        student.is_subscribed
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : "bg-zinc-800 text-zinc-400 border-white/5"
                                    )}>
                                        {student.is_subscribed ? "Premium" : "Free Tier"}
                                    </span>
                                    {student.banned && (
                                        <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-500 border border-red-500/20">
                                            BANNED
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">

                            {/* 1. EDIT PROFILE */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                    <Save size={14} /> Profile Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-500">Full Name</label>
                                        <Input
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            className="bg-black/20"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-500">State (Wilaya)</label>
                                        <Input
                                            value={formData.wilaya}
                                            onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                                            className="bg-black/20"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button size="sm" onClick={handleUpdateProfile} disabled={loading} className="bg-blue-600">
                                        Update Details
                                    </Button>
                                </div>
                            </section>

                            <div className="h-px bg-white/5" />

                            {/* 2. SUBSCRIPTION */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                    <Clock size={14} /> Subscription Control
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                        <p className="text-xs text-zinc-500 mb-1">Days Remaining</p>
                                        <p className="text-3xl font-mono text-white mb-1">
                                            {student.days_remaining} <span className="text-sm text-zinc-500">days</span>
                                        </p>
                                        <p className="text-xs text-zinc-600">
                                            Ends: {student.subscription_end ? new Date(student.subscription_end).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2 justify-center">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleExtend(30)}
                                            disabled={loading}
                                            className="justify-start border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-400"
                                        >
                                            <CheckCircle2 size={16} className="mr-2" />
                                            Add 30 Days (+1 Month)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleExtend(120)}
                                            disabled={loading}
                                            className="justify-start border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-400"
                                        >
                                            <CheckCircle2 size={16} className="mr-2" />
                                            Add 120 Days (+1 Semester)
                                        </Button>
                                    </div>
                                </div>
                            </section>

                            <div className="h-px bg-white/5" />

                            {/* 3. DANGER ZONE */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider flex items-center gap-2">
                                    <ShieldAlert size={14} /> Danger Zone
                                </h3>
                                <div className="border border-red-900/30 bg-red-900/5 rounded-xl p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-medium">Ban User</h4>
                                            <p className="text-xs text-zinc-500">Prevent this user from logging in.</p>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleBan}
                                            disabled={loading}
                                        >
                                            {student.banned ? "Unban Account" : "Ban Account"}
                                        </Button>
                                    </div>

                                    <div className="h-px bg-red-900/20" />

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-medium">Force Logout</h4>
                                            <p className="text-xs text-zinc-500">Sign out from all active sessions.</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleLogout}
                                            disabled={loading}
                                            className="border-red-900/30 text-red-400 hover:bg-red-900/20"
                                        >
                                            <LogOut size={14} className="mr-2" />
                                            Logout
                                        </Button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </GlassCard>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
