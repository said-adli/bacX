"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toggleBan as toggleBanAction, manualSubscribe as manualSubscribeAction, resetDevices as resetDevicesAction } from "@/actions/admin";
import { Search, Ban, CheckCircle, MonitorX } from "lucide-react";
import { toast } from "sonner";

interface UserData {
    id: string; // firebase uid
    displayName: string;
    email: string;
    role: 'admin' | 'student' | 'guest';
    isSubscribed?: boolean;
    subscriptionExpiry?: { toDate: () => Date } | Date | null;
    banned?: boolean;
    lastLogin?: { toDate: () => Date } | Date | null;
    deviceCount?: number; // Approximate from an array if we had one, otherwise mock or leave empty for now
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    // const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Simple fetch for now - in production would need pagination and algolia/search index
    useEffect(() => {
        // fetchUsers(); // This line refers to the old fetchUsers, but the new snippet implies a different fetch mechanism
    }, []);

    const supabase = createClient();

    useEffect(() => {
        const fetchUsers = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (data) {
                const mapped = data.map((d: any) => ({
                    id: d.id,
                    displayName: d.full_name,
                    email: d.email,
                    role: d.role,
                    isSubscribed: d.is_subscribed,
                    banned: d.banned,
                    // Add other mappings if needed
                }));
                setUsers(mapped as UserData[]);
            }
        };
        fetchUsers();
    }, []);

    // async function fetchUsers() {
    //     setLoading(true);
    //     try {
    //         const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(50));
    //         const snapshot = await getDocs(q);
    //         const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData));
    //         setUsers(data);
    //     } catch (error) {
    //         console.error("Error fetching users:", error);
    //     } finally {
    //         setLoading(false);
    //     }
    // }

    const handleSearch = async (term: string) => {
        setSearchTerm(term);
        if (term.length > 2) {
            // Client side filter since Firestore search is limited without exact match or Algolia
            // In a real large app, this is bad, but for MVP < 1000 users it's okay-ish or use where('email', '>=', term)
            // We'll just filter the client state for now if users array is small
        } else if (term.length === 0) {
            // Reset
            // fetchUsers(); // Already loaded
        }
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleBan = async (user: UserData) => {
        if (!confirm(`Are you sure you want to ${user.banned ? 'unban' : 'ban'} this user?`)) return;
        try {
            await toggleBanAction(user.id, user.banned || false);
            setUsers(users.map(u => u.id === user.id ? { ...u, banned: !u.banned } : u));
            toast.success("User status updated");
        } catch {
            toast.error("Failed to update status");
        }
    };

    const manualSubscribe = async (user: UserData) => {
        if (!confirm("Activate 1 year subscription for this user?")) return;
        try {
            await manualSubscribeAction(user.id);
            setUsers(users.map(u => u.id === user.id ? { ...u, isSubscribed: true } : u));
            toast.success("Subscription activated");
        } catch {
            toast.error("Failed to activate");
        }
    };

    const resetDevices = async (user: UserData) => {
        if (!confirm("Reset active devices for this user?")) return;
        try {
            await resetDevicesAction(user.id);
            toast.success("Devices reset");
        } catch {
            toast.error("Failed to reset devices");
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
                <div className="relative w-64">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="بحث بالاسم أو البريد..."
                        className="w-full bg-[#111] border border-white/10 rounded-xl py-2 pr-10 pl-4 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-white/5 text-zinc-400">
                            <tr>
                                <th className="p-4 font-medium">المستخدم</th>
                                <th className="p-4 font-medium">الحالة</th>
                                <th className="p-4 font-medium">الاشتراك</th>
                                <th className="p-4 font-medium">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-white">{user.displayName || "Unknown"}</div>
                                        <div className="text-zinc-500 text-xs">{user.email}</div>
                                    </td>
                                    <td className="p-4">
                                        {user.banned ? (
                                            <span className="inline-flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-1 rounded-full text-xs font-bold">
                                                <Ban className="w-3 h-3" /> المحظور
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-green-500 bg-green-500/10 px-2 py-1 rounded-full text-xs font-bold">
                                                <CheckCircle className="w-3 h-3" /> نشط
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {user.isSubscribed ? (
                                            <div className="text-green-400 font-bold">Premium</div>
                                        ) : (
                                            <div className="text-zinc-500">مجاني</div>
                                        )}
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button
                                            title="تفعيل اشتراك يدوي"
                                            onClick={() => manualSubscribe(user)}
                                            className="p-2 rounded-lg hover:bg-green-500/20 text-green-500 transition-colors"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                        <button
                                            title="إعادة تعيين الأجهزة"
                                            onClick={() => resetDevices(user)}
                                            className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-500 transition-colors"
                                        >
                                            <MonitorX className="w-4 h-4" />
                                        </button>
                                        <button
                                            title={user.banned ? "إلغاء الحظر" : "حظر المستخدم"}
                                            onClick={() => toggleBan(user)}
                                            className={`p-2 rounded-lg transition-colors ${user.banned ? 'hover:bg-zinc-500/20 text-zinc-500' : 'hover:bg-red-500/20 text-red-500'}`}
                                        >
                                            <Ban className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
