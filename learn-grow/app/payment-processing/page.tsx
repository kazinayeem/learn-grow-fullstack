"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { CheckCircle, AlertCircle } from "lucide-react";
import { API_CONFIG } from "@/config/apiConfig";

interface ProcessingState {
  stage: "processing" | "success" | "error";
  message: string;
  countdown: number;
}

function PaymentProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [state, setState] = useState<ProcessingState>({
    stage: "processing",
    message: "Processing your payment securely...",
    countdown: 10,
  });
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => {
    const cookieToken = Cookies.get("accessToken");
    if (cookieToken) return cookieToken;
    if (typeof window !== "undefined") {
      return localStorage.getItem("token") || "";
    }
    return "";
  };

  // Handle countdown timer
  useEffect(() => {
    if (state.stage === "success" && state.countdown > 0) {
      const timer = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          countdown: prev.countdown - 1,
        }));
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (state.stage === "success" && state.countdown === 0) {
      router.push("/student/orders");
    }
  }, [state, router]);

  // Process payment
  useEffect(() => {
    if (!orderId) {
      setError("Order ID not found");
      return;
    }

    const processPayment = async () => {
      try {
        // Simulate payment processing delay (3-5 seconds)
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Order was successfully created - just show success
        // No need to fetch order details since students can't access individual orders
        setOrderDetails({ _id: orderId });
        setState({
          stage: "success",
          message: "Order submitted successfully! Admin will review your payment.",
          countdown: 10,
        });
        toast.success("Order submitted! Wait for admin approval.");
      } catch (error: any) {
        console.error("Payment processing error:", error);
        const errorMessage =
          error.response?.data?.message || error.message || "Failed to process order";
        setError(errorMessage);
        setState({
          stage: "error",
          message: errorMessage,
          countdown: 0,
        });
        toast.error(errorMessage);
      }
    };

    processPayment();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Processing Stage */}
        {state.stage === "processing" && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Animated Spinner */}
            <div className="mb-6 flex justify-center">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin" />
                <div className="absolute inset-4 rounded-full border-2 border-blue-50 flex items-center justify-center text-2xl animate-pulse">
                  🔒
                </div>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              Processing Payment / পেমেন্ট প্রসেস হচ্ছে
            </h1>

            <p className="text-slate-600 mb-8">
              {state.message}
            </p>

            {/* Processing Steps */}
            <div className="space-y-3 mb-8 text-left">
              <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-lg">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-sm text-slate-700">Order verified / অর্ডার যাচাই হয়েছে</span>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-lg animate-pulse">
                <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                </div>
                <span className="text-sm text-slate-700">Processing payment / পেমেন্ট প্রসেস হচ্ছে</span>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg opacity-50">
                <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                <span className="text-sm text-slate-500">Redirecting / রিডাইরেক্ট হচ্ছে</span>
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-xs text-green-800 font-medium flex items-center justify-center gap-2">
                <span>🔐</span>
                Secure SSL encrypted transaction / নিরাপদ SSL এনক্রিপ্টেড লেনদেন
              </p>
            </div>

            {/* Loading text animation */}
            <p className="text-slate-500 text-sm font-medium">
              Please do not close or refresh this page... / অনুগ্রহ করে এই পেজটি বন্ধ বা রিফ্রেশ করবেন না...
            </p>
          </div>
        )}

        {/* Success Stage */}
        {state.stage === "success" && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Success Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
                <CheckCircle size={48} className="text-green-600" />
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              Order Submitted Successfully! ✓ / অর্ডার সফলভাবে সাবমিট হয়েছে!
            </h1>

            <p className="text-slate-600 mb-6">
              Your order has been submitted. Admin will review and approve your payment. / আপনার অর্ডার সাবমিট হয়েছে। অ্যাডমিন আপনার পেমেন্ট যাচাই করে অনুমোদন করবেন।
            </p>

            {/* Order Details */}
            {orderDetails && (
              <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Order ID / অর্ডার আইডি:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {orderDetails._id?.substring(0, 12)}...
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Status / স্ট্যাটাস:</span>
                  <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                    Pending Approval / অনুমোদনের অপেক্ষায়
                  </span>
                </div>
                
              </div>
            )}

            {/* Admin Approval Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">⏳</span>
                <div className="text-left">
                  <p className="text-blue-900 font-semibold text-sm mb-1">
                    Waiting for Admin Approval / অ্যাডমিন অনুমোদনের অপেক্ষায়
                  </p>
                  <p className="text-xs text-blue-700">
                    An administrator will review your payment and approve your order. You'll receive access once approved. / একজন অ্যাডমিনিস্ট্রেটর আপনার পেমেন্ট যাচাই করবেন এবং অর্ডার অনুমোদন করবেন। অনুমোদনের পর আপনি এক্সেস পাবেন।
                  </p>
                </div>
              </div>
            </div>

            {/* Countdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
              <p className="text-slate-700 font-medium text-sm mb-2">
                Redirecting to orders page / অর্ডার পেজে নিয়ে যাওয়া হচ্ছে
              </p>
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-3xl font-bold text-blue-600">{state.countdown}</span>
              </div>
              <p className="text-xs text-slate-600">Check your order status in the dashboard / ড্যাশবোর্ডে আপনার অর্ডার স্ট্যাটাস দেখুন</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-1 mb-6 overflow-hidden">
              <div
                className="h-full bg-green-600 transition-all ease-linear"
                style={{
                  width: `${(state.countdown / 10) * 100}%`,
                  transitionDuration: "1s",
                }}
              />
            </div>

            <p className="text-slate-500 text-sm">
              You will be redirected automatically... / আপনাকে স্বয়ংক্রিয়ভাবে নিয়ে যাওয়া হবে...
            </p>
          </div>
        )}

        {/* Error Stage */}
        {state.stage === "error" && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Error Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle size={48} className="text-red-600" />
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              Payment Failed / পেমেন্ট ব্যর্থ হয়েছে
            </h1>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{error || state.message}</p>
            </div>

            <p className="text-slate-600 text-sm mb-6">
              Please try again or contact support for assistance. / অনুগ্রহ করে আবার চেষ্টা করুন বা সাহায্যের জন্য সাপোর্টে যোগাযোগ করুন।
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition active:scale-95"
              >
                Try Again / আবার চেষ্টা করুন
              </button>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full px-6 py-3 bg-slate-100 text-slate-900 font-semibold rounded-lg hover:bg-slate-200 transition"
              >
                Back to Checkout / চেকআউটে ফিরে যান
              </button>

              <a
                href="/help"
                className="inline-block px-6 py-3 text-blue-600 font-semibold hover:text-blue-700 transition"
              >
                Contact Support / সাপোর্টে যোগাযোগ করুন →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentProcessingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading...</p>
          </div>
        </div>
      }
    >
      <PaymentProcessingContent />
    </Suspense>
  );
}
