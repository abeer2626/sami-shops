"use client";

import { useEffect, useState } from "react";
import { getAdminUsers, deleteUser, User } from "@/lib/api";
import { Loader2, Mail, Shield, User as UserIcon } from "lucide-react";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await getAdminUsers();
            setUsers(data);
        } catch (err) {
            setError("Failed to fetch users");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user? Action cannot be undone.")) return;

        try {
            await deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
        } catch (err: any) {
            alert(err.message || "Failed to delete user");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Users Management</h1>
                <p className="text-sm text-gray-500 mt-1">View and manage registered users</p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => {
                                const isSuperAdmin = user.email === "samijee24@gmail.com";
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                    <UserIcon size={14} />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-gray-900 block">{user.full_name || user.username || "N/A"}</span>
                                                    {isSuperAdmin && <span className="text-[10px] text-purple-600 font-black uppercase tracking-widest">★ Super Admin</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                user.role === 'vendor' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                <Shield size={10} />
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Mail size={14} />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {!isSuperAdmin ? (
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all text-xs font-bold"
                                                >
                                                    Delete
                                                </button>
                                            ) : (
                                                <span className="text-gray-300 text-xs font-bold px-2 py-1">Protected</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                        No users found
                    </div>
                )}
            </div>
        </div>
    );
}
