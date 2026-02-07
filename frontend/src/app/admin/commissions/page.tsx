"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getCommissionSettings, createCommission, updateCommission, deleteCommission, CommissionSettings, Commission } from "@/lib/api";
import { Settings, Percent, Plus, Edit2, Trash2, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";

export default function AdminCommissionsPage() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [settings, setSettings] = useState<CommissionSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        rate: "",
        description: "",
        isActive: true,
        isDefault: false
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/login?redirect=/admin/commissions");
            return;
        }
        if (user?.role !== "admin") {
            router.push("/");
            return;
        }
        loadSettings();
    }, [isAuthenticated, user]);

    const loadSettings = async () => {
        try {
            const data = await getCommissionSettings();
            setSettings(data);
        } catch (err) {
            console.error("Failed to load commission settings:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async () => {
        const rateInput = parseFloat(formData.rate);
        if (!formData.name || isNaN(rateInput) || rateInput <= 0 || rateInput > 100) {
            setError("Please provide valid commission details (percentage between 0 and 100)");
            return;
        }

        const rate = rateInput / 100; // Convert to decimal for backend

        try {
            if (editingCommission) {
                await updateCommission(editingCommission.id, {
                    name: formData.name,
                    rate: rate,
                    description: formData.description || undefined,
                    isActive: formData.isActive,
                    isDefault: formData.isDefault
                });
                setSuccess("Commission updated successfully!");
            } else {
                await createCommission({
                    name: formData.name,
                    rate: rate,
                    description: formData.description || undefined,
                    isActive: formData.isActive,
                    isDefault: formData.isDefault
                });
                setSuccess("Commission created successfully!");
            }
            closeModal();
            loadSettings();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            setError(err.detail || "Failed to save commission");
        }
    };

    const handleEdit = (commission: Commission) => {
        setEditingCommission(commission);
        setFormData({
            name: commission.name,
            rate: (commission.rate * 100).toString(),
            description: commission.description || "",
            isActive: commission.isActive,
            isDefault: commission.isDefault
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this commission rate?")) return;

        try {
            await deleteCommission(id);
            setSuccess("Commission deleted successfully!");
            loadSettings();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            setError(err.detail || "Failed to delete commission");
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCommission(null);
        setFormData({
            name: "",
            rate: "",
            description: "",
            isActive: true,
            isDefault: false
        });
        setError("");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-gray-500">Loading commission settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Commission Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage vendor commission rates</p>
                </div>
                <Button
                    onClick={() => setShowModal(true)}
                    className="bg-primary text-white"
                >
                    <Plus size={18} className="mr-2" />
                    Add Commission Rate
                </Button>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <Check size={18} />
                    {success}
                </div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Default Rate Card */}
            {settings && (
                <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Default Commission Rate</p>
                            <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-5xl font-black">{(settings.defaultRate * 100).toFixed(0)}%</span>
                                <span className="text-blue-200">of each sale</span>
                            </div>
                            <p className="text-blue-100 text-sm mt-2">
                                This rate is applied to all new vendor earnings by default
                            </p>
                        </div>
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Percent size={32} />
                        </div>
                    </div>
                </div>
            )}

            {/* Commission Rates Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Commission Rates</h2>
                    <p className="text-sm text-gray-500 mt-1">Active and inactive commission rates</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Rate</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Default</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {settings?.activeCommissions && settings.activeCommissions.length > 0 ? (
                                settings.activeCommissions.map((commission) => (
                                    <tr key={commission.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-gray-900">{commission.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-lg font-black text-primary">
                                                {(commission.rate * 100).toFixed(0)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {commission.description || "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${commission.isActive
                                                    ? "text-green-600 bg-green-50"
                                                    : "text-gray-600 bg-gray-50"
                                                }`}>
                                                {commission.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {commission.isDefault ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase text-blue-600 bg-blue-50">
                                                    <Check size={14} />
                                                    Default
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(commission)}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                {!commission.isDefault && (
                                                    <button
                                                        onClick={() => handleDelete(commission.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        <Settings size={48} className="mx-auto mb-4 text-gray-200" />
                                        <p className="text-sm font-bold">No commission rates configured</p>
                                        <p className="text-xs mt-1">Add your first commission rate to get started</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Commission Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                            {editingCommission ? "Edit Commission Rate" : "Add Commission Rate"}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="e.g., Standard Rate"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Commission Rate (%)
                                </label>
                                <input
                                    type="number"
                                    value={formData.rate}
                                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="e.g., 10"
                                />
                                <p className="text-xs text-gray-500 mt-1">Enter percentage (e.g., 10 for 10%)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description (optional)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                    placeholder="Describe this commission rate..."
                                />
                            </div>

                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isDefault}
                                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                    />
                                    <span className="text-sm text-gray-700">Default Rate</span>
                                </label>
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={closeModal}
                                    className="flex-1"
                                >
                                    <X size={16} className="mr-2" />
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateOrUpdate}
                                    className="flex-1 bg-primary text-white"
                                >
                                    <Check size={16} className="mr-2" />
                                    {editingCommission ? "Update" : "Create"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
