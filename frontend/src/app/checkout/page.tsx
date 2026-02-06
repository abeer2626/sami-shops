"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  useCart,
  useCartItems,
  useCartSummary,
  formatPrice,
} from "@/store/cart.store";
import { useAuthStore } from "@/store/useAuthStore";
import {
  MapPin,
  CreditCard,
  Truck,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface CreateOrderData {
  userId?: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  notes?: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  street?: string;
  city?: string;
  zipCode?: string;
  general?: string;
}

// ============================================================================
// Payment Methods Configuration
// ============================================================================

const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay when you receive your order",
    icon: Truck,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    description: "Secure online payment",
    icon: CreditCard,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "jazzcash",
    label: "JazzCash / EasyPaisa",
    description: "Mobile wallet payment",
    icon: Smartphone,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
];

const CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
];

// ============================================================================
// Checkout Page Component
// ============================================================================

export default function CheckoutPage() {
  const router = useRouter();

  // Cart state
  const cartItems = useCartItems();
  const cartSummary = useCartSummary();
  const { clearCart, isEmpty } = useCart();

  // Auth state
  const { user, token, isAuthenticated } = useAuthStore();

  // UI state
  const [step, setStep] = useState<"details" | "review" | "payment" | "success">("details");
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [orderError, setOrderError] = useState<string | null>(null);

  // Form state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: user?.name || "",
    phone: "",
    email: user?.email || "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [notes, setNotes] = useState("");

  // ============================================================================
  // Effects
  // ============================================================================

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (!isAuthenticated()) {
        router.push("/login?redirect=/checkout");
      } else if (isEmpty()) {
        router.push("/cart");
      }
    }
  }, [isMounted, isAuthenticated, isEmpty, router]);

  // ============================================================================
  // Validation
  // ============================================================================

  const validateShippingDetails = (): boolean => {
    const newErrors: FormErrors = {};

    if (!shippingAddress.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!shippingAddress.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^(\+92|0)?[0-9]{10,11}$/.test(shippingAddress.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Invalid phone number format";
    }
    if (!shippingAddress.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!shippingAddress.street.trim()) {
      newErrors.street = "Street address is required";
    }
    if (!shippingAddress.city) {
      newErrors.city = "City is required";
    }
    if (!shippingAddress.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================================
  // Order Submission
  // ============================================================================

  const handleSubmitOrder = async () => {
    if (!validateShippingDetails()) {
      return;
    }

    setLoading(true);
    setOrderError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const orderData: CreateOrderData = {
        userId: user?.id,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        totalAmount: cartSummary.total,
        shippingAddress,
        paymentMethod,
        notes: notes.trim() || undefined,
      };

      const response = await fetch(`${apiUrl}/api/v1/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "Failed to place order");
      }

      // Clear cart on success
      clearCart();

      // Show success screen
      setStep("success");
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "An unexpected error occurred");
      setErrors({ general: orderError || "Failed to place order. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // Render Helpers
  // ============================================================================

  if (!isMounted || !isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (step === "success") {
    return <SuccessScreen onContinue={() => router.push("/account/orders")} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors"
          >
            <ChevronLeft size={18} />
            Back to Cart
          </Link>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {[
              { key: "details", label: "Shipping", icon: MapPin },
              { key: "review", label: "Review", icon: CheckCircle2 },
              { key: "payment", label: "Payment", icon: CreditCard },
            ].map((s, index) => {
              const isActive = step === s.key;
              const isComplete = ["review", "payment"].includes(step) && index < 1;
              const isPaymentComplete = step === "payment" && index < 2;

              return (
                <div key={s.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isActive || isComplete || isPaymentComplete
                          ? "bg-primary text-white shadow-lg"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isComplete || isPaymentComplete ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <s.icon size={20} />
                      )}
                    </div>
                    <span
                      className={`text-xs font-black uppercase mt-2 tracking-wider ${
                        isActive || isComplete || isPaymentComplete
                          ? "text-primary"
                          : "text-gray-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {index < 2 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        isComplete || isPaymentComplete ? "bg-primary" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Error Alert */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-800">{errors.general}</p>
                  <button
                    onClick={() => setErrors({ ...errors, general: undefined })}
                    className="text-xs font-bold text-red-600 mt-2 hover:underline"
                  >
                    Dismiss
                  </button>
                </div>
                <button
                  onClick={() => setErrors({ ...errors, general: undefined })}
                  className="text-red-400 hover:text-red-600"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Shipping Details Step */}
            {step === "details" && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                    Shipping Details
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter your delivery information
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Name */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.fullName}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                        }
                        className={`w-full px-4 py-3 rounded-xl border font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                          errors.fullName
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-primary"
                        }`}
                        placeholder="John Doe"
                      />
                      {errors.fullName && (
                        <p className="text-xs text-red-500 font-medium">{errors.fullName}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, phone: e.target.value })
                        }
                        className={`w-full px-4 py-3 rounded-xl border font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                          errors.phone
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-primary"
                        }`}
                        placeholder="+92 3XX XXXXXXX"
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-500 font-medium">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, email: e.target.value })
                      }
                      className={`w-full px-4 py-3 rounded-xl border font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                        errors.email
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-primary"
                      }`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 font-medium">{errors.email}</p>
                    )}
                  </div>

                  {/* Street Address */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.street}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, street: e.target.value })
                      }
                      className={`w-full px-4 py-3 rounded-xl border font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                        errors.street
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-primary"
                      }`}
                      placeholder="House 123, Street 45, Area"
                    />
                    {errors.street && (
                      <p className="text-xs text-red-500 font-medium">{errors.street}</p>
                    )}
                  </div>

                  {/* City and ZIP */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
                        City *
                      </label>
                      <select
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, city: e.target.value })
                        }
                        className={`w-full px-4 py-3 rounded-xl border font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none bg-white ${
                          errors.city
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-primary"
                        }`}
                      >
                        <option value="">Select City</option>
                        {CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      {errors.city && (
                        <p className="text-xs text-red-500 font-medium">{errors.city}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.zipCode}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, zipCode: e.target.value })
                        }
                        className={`w-full px-4 py-3 rounded-xl border font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                          errors.zipCode
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-primary"
                        }`}
                        placeholder="75500"
                      />
                      {errors.zipCode && (
                        <p className="text-xs text-red-500 font-medium">{errors.zipCode}</p>
                      )}
                    </div>
                  </div>

                  {/* Notes (Optional) */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      placeholder="Any special instructions for delivery..."
                    />
                  </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => {
                      if (validateShippingDetails()) setStep("review");
                    }}
                    className="flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-primary transition-all"
                  >
                    Continue to Review
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Review Step */}
            {step === "review" && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                    Review Order
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Verify your order details before proceeding
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Shipping Address Review */}
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">
                      Shipping Address
                    </h3>
                    <p className="text-sm text-gray-700">
                      {shippingAddress.fullName}
                      <br />
                      {shippingAddress.phone}
                      <br />
                      {shippingAddress.email}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {shippingAddress.street}
                      <br />
                      {shippingAddress.city}, {shippingAddress.zipCode}
                    </p>
                  </div>

                  {/* Order Items Review */}
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">
                      Order Items ({cartSummary.itemCount})
                    </h3>
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                        >
                          <div className="w-16 h-16 relative rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 uppercase truncate">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Qty: {item.quantity} × {formatPrice(item.product.price)}
                            </p>
                          </div>
                          <p className="text-sm font-black text-primary">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between">
                  <button
                    onClick={() => setStep("details")}
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <ChevronLeft size={18} />
                    Back
                  </button>
                  <button
                    onClick={() => setStep("payment")}
                    className="flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-primary transition-all"
                  >
                    Continue to Payment
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Payment Step */}
            {step === "payment" && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                    Payment Method
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Select your preferred payment option
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.id;

                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isSelected ? "bg-primary text-white" : method.bgColor + " " + method.color
                          }`}
                        >
                          <Icon size={24} />
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-sm font-black uppercase ${
                              isSelected ? "text-primary" : "text-gray-900"
                            }`}
                          >
                            {method.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <CheckCircle2 size={14} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between">
                  <button
                    onClick={() => setStep("review")}
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <ChevronLeft size={18} />
                    Back
                  </button>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={loading}
                    className="flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Processing...
                      </>
                    ) : (
                      <>Place Order</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-6">
                Order Summary
              </h2>

              {/* Cart Items Preview */}
              <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-900 uppercase truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-primary">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold text-gray-900">{formatPrice(cartSummary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span
                    className={`font-bold ${
                      cartSummary.shipping === 0 ? "text-green-600" : "text-gray-900"
                    }`}
                  >
                    {cartSummary.shipping === 0 ? "FREE" : formatPrice(cartSummary.shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax (18%)</span>
                  <span className="font-bold text-gray-900">{formatPrice(cartSummary.tax)}</span>
                </div>

                {/* Free Shipping Progress */}
                {cartSummary.subtotal < 5000 && (
                  <div className="bg-blue-50 rounded-xl p-3 mt-4">
                    <p className="text-xs font-bold text-blue-800">
                      Add {formatPrice(5000 - cartSummary.subtotal)} more for free shipping!
                    </p>
                    <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${(cartSummary.subtotal / 5000) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                  <span className="text-base font-black text-gray-900 uppercase">Total</span>
                  <span className="text-2xl font-black text-primary">
                    {formatPrice(cartSummary.total)}
                  </span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-1">
                    <Truck size={18} className="text-green-600" />
                  </div>
                  <p className="text-[9px] font-black text-gray-600 uppercase">Free Ship</p>
                </div>
                <div>
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-1">
                    <CheckCircle2 size={18} className="text-primary" />
                  </div>
                  <p className="text-[9px] font-black text-gray-600 uppercase">Secure</p>
                </div>
                <div>
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-1">
                    <AlertCircle size={18} className="text-accent" />
                  </div>
                  <p className="text-[9px] font-black text-gray-600 uppercase">Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Success Screen Component
// ============================================================================

function SuccessScreen({ onContinue }: { onContinue: () => void }) {
  const [orderId] = useState(`ORD-${Date.now().toString(36).toUpperCase()}`);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 max-w-md w-full text-center animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">
          Order Placed!
        </h1>
        <p className="text-gray-500 mb-6">
          Thank you for your order. We'll send you a confirmation email shortly.
        </p>

        <div className="bg-gray-50 rounded-2xl p-4 mb-8">
          <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">
            Order Number
          </p>
          <p className="text-lg font-black text-primary">{orderId}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onContinue}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-primary transition-all"
          >
            View Orders
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full bg-gray-100 text-gray-900 py-4 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-gray-200 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
