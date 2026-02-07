"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Wallet, Search, Filter, CheckCircle, XCircle, Clock, RefreshCw, AlertCircle, Check, X } from "lucide-react";
import { getAllPayouts, processPayout, VendorPayout } from "@/lib/api";
import { Button } from "@/components/ui";

export default function AdminPayoutsPage() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [payouts, setPayouts] = useState<VendorPayout[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedPayout, setSelectedPayout] = useState<VendorPayout | null>(null);
    const [transactionId, setTransactionId] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/login?redirect=/admin/payouts");
            return;
        }
        if (user?.role !== "admin") {
            router.push("/");
            return;
        }
        loadPayouts();
    }, [isAuthenticated, user]);

    const loadPayouts = async () => {
        try {
            const data = await getAllPayouts();
            setPayouts(data);
        } catch (err) {
            console.error("Failed to load payouts:", err);
            setError("Failed to load payouts");
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPayout = async (status: "completed" | "rejected") => {
        if (!selectedPayout || !user) return;

        if (status === "completed" && !transactionId.trim()) {
            setError("Please enter a transaction ID");
            return;
        }

        if (status === "rejected" && !rejectionReason.trim()) {
            setError("Please provide a rejection reason");
            return;
        }

        setProcessingId(selectedPayout.id);
        try {
            await processPayout(selectedPayout.id, {
                status,
                processedBy: user.id,
                transactionId: status === "completed" ? transactionId : undefined,
                rejectionReason: status === "rejected" ? rejectionReason : undefined
            });
            setSuccess(`Payout ${status} successfully!`);
            closeModal();
            loadPayouts();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            setError(err.detail || "Failed to process payout");
        } finally {
            setProcessingId(null);
        }
    };

    const openModal = (payout: VendorPayout) => {
        setSelectedPayout(payout);
        setShowModal(true);
        setError("");
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPayout(null);
        setTransactionId("");
        setRejectionReason("");
        setError("");
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-700 border-green-200";
            case "pending":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "processing":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "rejected":
            case "failed":
                return "bg-red-100 text-red-700 border-red-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const filteredPayouts = payouts.filter(payout => {
        const matchesSearch = payout.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (payout.transactionId && payout.transactionId.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === "all" || payout.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Calculate stats
    const stats = {
        total: payouts.length,
        pending: payouts.filter(p => p.status === "pending").length,
        processing: payouts.filter(p => p.status === "processing").length,
        completed: payouts.filter(p => p.status === "completed").length,
        totalAmount: payouts.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0)
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-gray-500">Loading payouts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Payouts Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Process vendor payout requests</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">Total Requests</span>
                        <Wallet size={20} className="text-gray-400" />
                    </div>
                    <p className="text-3xl font-black text-gray-900">{stats.total}</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">Pending</span>
                        <Clock size={20} className="text-yellow-500" />
                    </div>
                    <p className="text-3xl font-black text-yellow-600">{stats.pending}</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">Processing</span>
                        <RefreshCw size={20} className="text-blue-500" />
                    </div>
                    <p className="text-3xl font-black text-blue-600">{stats.processing}</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">Paid Out</span>
                        <CheckCircle size={20} className="text-green-500" />
                    </div>
                    <p className="text-3xl font-black text-green-600">Rs. {stats.totalAmount.toLocaleString()}</p>
                </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <CheckCircle size={18} />
                    {success}
                </div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by payout ID or transaction ID..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                    <option value="all">All Payouts</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                    <option value="failed">Failed</option>
                </select>
            </div>

            {/* Payouts Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Payout ID</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Store ID</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Method</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Requested</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Transaction ID</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPayouts.map((payout) => {
                                const isProcessing = processingId === payout.id;

                                return (
                                    <tr key={payout.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-gray-900 text-sm">
                                                #{payout.id.slice(-8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600 font-mono">
                                                {payout.storeId.slice(-8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-lg font-black text-primary">
                                                Rs. {payout.amount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600 capitalize">
                                                {payout.paymentMethod?.replace("_", " ") || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {new Date(payout.requestedAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-mono text-gray-600">
                                                {payout.transactionId || "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(payout.status)}`}>
                                                {payout.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {payout.status === "pending" && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-green-600 hover:bg-green-50"
                                                        onClick={() => openModal(payout)}
                                                    >
                                                        <Check size={14} className="mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 hover:bg-red-50"
                                                        onClick={() => {
                                                            setSelectedPayout(payout);
                                                            setShowModal(true);
                                                        }}
                                                    >
                                                        <X size={14} className="mr-1" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                            {payout.status === "processing" && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-blue-600 hover:bg-blue-50"
                                                    onClick={() => openModal(payout)}
                                                    disabled={isProcessing}
                                                >
                                                    {isProcessing ? (
                                                        <RefreshCw size={14} className="animate-spin" />
                                                    ) : (
                                                        "Complete"
                                                    )}
                                                </Button>
                                            )}
                                            {payout.status === "completed" && (
                                                <span className="text-xs text-gray-400">Completed</span>
                                            )}
                                            {payout.status === "rejected" && payout.rejectionReason && (
                                                <span className="text-xs text-red-500 max-w-[200px] block truncate" title={payout.rejectionReason}>
                                                    {payout.rejectionReason}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredPayouts.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                        <Wallet size={48} className="mx-auto mb-4 text-gray-200" />
                        <p className="text-sm font-bold">No payouts found</p>
                        <p className="text-xs mt-1">Try adjusting your filters or search query</p>
                    </div>
                )}
            </div>

            {/* Processing Modal */}
            {showModal && selectedPayout && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Process Payout Request
                        </h3>

                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-500">Amount</span>
                                    <span className="text-lg font-black text-primary">
                                        Rs. {selectedPayout.amount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Method</span>
                                    <span className="text-sm font-bold text-gray-900 capitalize">
                                        {selectedPayout.paymentMethod?.replace("_", " ") || "N/A"}
                                    </span>
                                </div>
                            </div>

                            {selectedPayout.notes && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Notes</label>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                                        {selectedPayout.notes}
                                    </p>
                                </div>
                            )}

                            {selectedPayout.paymentDetails && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Details</label>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl font-mono">
                                        {selectedPayout.paymentDetails}
                                    </p>
                                </div>
                            )}
                        </div>

                        {selectedPayout.status === "pending" || selectedPayout.status === "processing" ? (
                            <>
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Transaction ID
                                        </label>
                                        <input
                                            type="text"
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            placeholder="Enter transaction/reference ID"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={closeModal}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => handleProcessPayout("completed")}
                                        className="flex-1 bg-green-600 text-white hover:bg-green-700"
                                        disabled={processingId === selectedPayout.id}
                                    >
                                        {processingId === selectedPayout.id ? (
                                            <RefreshCw size={16} className="animate-spin mx-auto" />
                                        ) : (
                                            <>
                                                <Check size={16} className="mr-2" />
                                                Approve & Complete
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rejection Reason
                                        </label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                            placeholder="Explain why this payout is being rejected..."
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={closeModal}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => handleProcessPayout("rejected")}
                                        className="flex-1 bg-red-600 text-white hover:bg-red-700"
                                        disabled={processingId === selectedPayout.id}
                                    >
                                        {processingId === selectedPayout.id ? (
                                            <RefreshCw size={16} className="animate-spin mx-auto" />
                                        ) : (
                                            <>
                                                <X size={16} className="mr-2" />
                                                Reject Payout
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
