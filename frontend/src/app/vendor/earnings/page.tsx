"use client";

import { useEffect, useState } from "react";
import { Wallet, TrendingUp, Clock, CheckCircle, ArrowUpRight, Download, AlertCircle } from "lucide-react";
import { getVendorEarnings, getVendorEarningsHistory, requestPayout, getVendorPayouts, VendorEarningSummary, VendorEarning, VendorPayout } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export default function VendorEarningsPage() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [summary, setSummary] = useState<VendorEarningSummary | null>(null);
    const [earnings, setEarnings] = useState<VendorEarning[]>([]);
    const [payouts, setPayouts] = useState<VendorPayout[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/login?redirect=/vendor/earnings");
            return;
        }
        if (user?.role !== "vendor") {
            router.push("/");
            return;
        }
        loadData();
    }, [isAuthenticated, user]);

    const loadData = async () => {
        try {
            const [summaryData, earningsData, payoutsData] = await Promise.all([
                getVendorEarnings(),
                getVendorEarningsHistory(),
                getVendorPayouts()
            ]);
            setSummary(summaryData);
            setEarnings(earningsData);
            setPayouts(payoutsData);
        } catch (err) {
            console.error("Failed to load earnings data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePayoutRequest = async () => {
        const amount = parseFloat(payoutAmount);
        if (!amount || amount <= 0) {
            setError("Please enter a valid amount");
            return;
        }
        if (!summary || amount > summary.availableBalance) {
            setError(`Maximum payout amount is Rs. ${summary?.availableBalance.toLocaleString()}`);
            return;
        }

        try {
            await requestPayout({
                amount,
                paymentMethod: "bank_transfer",
                notes: "Payout request via vendor dashboard"
            });
            setSuccess("Payout request submitted successfully!");
            setPayoutAmount("");
            setShowPayoutModal(false);
            loadData();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            setError(err.detail || "Failed to submit payout request");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "available":
            case "completed":
                return "text-green-600 bg-green-50 border-green-200";
            case "pending":
            case "processing":
                return "text-yellow-600 bg-yellow-50 border-yellow-200";
            case "rejected":
            case "failed":
                return "text-red-600 bg-red-50 border-red-200";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    const getPayoutStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "text-green-600 bg-green-50";
            case "pending":
                return "text-yellow-600 bg-yellow-50";
            case "processing":
                return "text-blue-600 bg-blue-50";
            case "rejected":
            case "failed":
                return "text-red-600 bg-red-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-gray-500">Loading earnings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Earnings</h1>
                    <p className="text-sm text-gray-500 mt-1">Track your sales revenue and payouts</p>
                </div>
                {summary && summary.availableBalance > 0 && (
                    <Button
                        onClick={() => setShowPayoutModal(true)}
                        className="bg-primary text-white"
                    >
                        <Wallet size={18} className="mr-2" />
                        Request Payout
                    </Button>
                )}
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

            {/* Stats Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Available Balance */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <Wallet className="text-green-600" size={24} />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Available Balance</p>
                        <p className="text-3xl font-black text-gray-900 mt-2">
                            Rs. {summary.availableBalance.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">Ready for payout</p>
                    </div>

                    {/* Total Earnings */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="text-blue-600" size={24} />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Total Earnings</p>
                        <p className="text-3xl font-black text-gray-900 mt-2">
                            Rs. {summary.totalEarnings.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">All time earnings</p>
                    </div>

                    {/* Pending Earnings */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <Clock className="text-yellow-600" size={24} />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Pending</p>
                        <p className="text-3xl font-black text-gray-900 mt-2">
                            Rs. {summary.pendingEarnings.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">Awaiting delivery</p>
                    </div>

                    {/* Paid Amount */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="text-purple-600" size={24} />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Paid Out</p>
                        <p className="text-3xl font-black text-gray-900 mt-2">
                            Rs. {summary.paidAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">Total payouts received</p>
                    </div>
                </div>
            )}

            {/* Recent Earnings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Recent Earnings</h2>
                    <p className="text-sm text-gray-500 mt-1">Your latest sales earnings</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Order</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Order Amount</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Commission</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Your Earning</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {earnings.length > 0 ? (
                                earnings.map((earning) => (
                                    <tr key={earning.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-gray-900 text-sm">
                                                #{earning.orderId.slice(-8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {new Date(earning.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-gray-900">
                                                Rs. {earning.orderAmount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {(earning.commissionRate * 100).toFixed(0)}%
                                                <span className="text-gray-400 ml-1">
                                                    (Rs. {earning.commissionAmount.toLocaleString()})
                                                </span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-primary">
                                                Rs. {earning.vendorAmount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(earning.status)}`}>
                                                {earning.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        <Wallet size={48} className="mx-auto mb-4 text-gray-200" />
                                        <p className="text-sm font-bold">No earnings yet</p>
                                        <p className="text-xs mt-1">Start selling to see your earnings here</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payout History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Payout History</h2>
                    <p className="text-sm text-gray-500 mt-1">Your payout requests and status</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Method</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Transaction ID</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payouts.length > 0 ? (
                                payouts.map((payout) => (
                                    <tr key={payout.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {new Date(payout.requestedAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-primary">
                                                Rs. {payout.amount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600 capitalize">
                                                {payout.paymentMethod?.replace("_", " ") || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-mono text-gray-600">
                                                {payout.transactionId || "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${getPayoutStatusColor(payout.status)}`}>
                                                {payout.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        <Download size={48} className="mx-auto mb-4 text-gray-200" />
                                        <p className="text-sm font-bold">No payouts yet</p>
                                        <p className="text-xs mt-1">Request your first payout when you have available balance</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payout Request Modal */}
            {showPayoutModal && summary && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Request Payout</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Available balance: <span className="font-bold text-primary">Rs. {summary.availableBalance.toLocaleString()}</span>
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount (Rs.)
                                </label>
                                <input
                                    type="number"
                                    value={payoutAmount}
                                    onChange={(e) => {
                                        setPayoutAmount(e.target.value);
                                        setError("");
                                    }}
                                    max={summary.availableBalance}
                                    min={1}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="Enter amount"
                                />
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowPayoutModal(false);
                                        setPayoutAmount("");
                                        setError("");
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handlePayoutRequest}
                                    className="flex-1 bg-primary text-white"
                                >
                                    Submit Request
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
