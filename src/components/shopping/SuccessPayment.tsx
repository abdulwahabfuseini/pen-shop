"use client";

import React, { useEffect, useState, Suspense } from "react";
import {
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { CartActions } from "@/store/CartSlice";

const SuccessContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const dispatch = useDispatch();

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying",
  );
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      const verifyPayment = async () => {
        try {
          const res = await fetch(
            `/api/checkout/verify?session_id=${sessionId}`,
          );
          const data = await res.json();

          if (data.success) {
            setOrderId(data.order);
            setStatus("success");

            // 4. CLEAR THE CART IMMEDIATELY ON SUCCESS
            dispatch(CartActions.clearCart());
          } else {
            setStatus("error");
          }
        } catch (err) {
          setStatus("error");
        }
      };
      verifyPayment();
    }
  }, [sessionId, dispatch]);

  if (status === "verifying") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F2EB] gap-4">
        <Loader2 className="animate-spin text-gold" size={40} />
        <p className="text-[10px] font-bold text-gold uppercase tracking-[0.4em] animate-pulse">
          Authenticating Transaction
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-xl w-full  border-2 border-gold/30 p-12 rounded-lg shadow-2xl shadow-gold/5 text-center">
        <div className="w-24 h-24 bg-gold/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
          <CheckCircle2 className="text-gold" size={48} strokeWidth={1.5} />
        </div>

        <h1 className="font-serif text-4xl text-ink mb-4 uppercase tracking-tight">
          Order Confirmed
        </h1>
        <p className="text-sm text-ink/40 font-medium tracking-wide mb-10 leading-relaxed">
          Your payment has been successfully encrypted and processed. Your Order
          is now entering the final stage of preparation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 py-4 text-[10px] font-black text-cream tracking-[0.2em] uppercase bg-ink rounded-2xl hover:bg-gold transition-all"
          >
            <ShoppingBag size={16} /> Back to Shop
          </Link>

          {orderId && (
            <button
              onClick={() => router.push(`/checkout/receipt/${orderId}`)}
              className="flex items-center justify-center gap-2 py-4 text-[10px] font-black text-ink tracking-[0.2em] uppercase bg-white border-2 border-gold/20 rounded-2xl hover:bg-cream transition-all"
            >
              View Receipt <ArrowRight size={16} />
            </button>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-gold/5 flex items-center justify-center gap-2 text-[9px] font-bold text-gold uppercase tracking-widest">
          <ShieldCheck size={12} /> Verified Order Record
        </div>
      </div>
    </div>
  );
};

export default function SuccessPayment() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
