"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/Store";
import { CartActions } from "@/store/CartSlice";
import {
  CreditCard,
  Smartphone,
  Lock,
  Loader2,
  ArrowLeft,
  MapPin,
  User,
  ShieldCheck,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const ShopProduct = () => {
  const { items } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "momo">("card");

  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const shippingCost = 0.0; // Complimentary
  const totalAmount = subtotal + shippingCost;

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const customerEmail = formData.get("customerEmail") as string;

    const orderData = {
      customerName: formData.get("customerName"),
      customerEmail: customerEmail,
      customerPhone: formData.get("customerPhone"),
      houseAddress: formData.get("houseAddress"),
      streetName: formData.get("streetName"),
      town: formData.get("town"),
      state: formData.get("state"),
      zipCode: formData.get("zipCode"),
      country: "USA",
      subtotal: subtotal,
      shippingCost: shippingCost,
      totalAmount: totalAmount,
      // THE CRITICAL MAPPING
      items: items.map((item: any) => ({
        productId: item.id,
        productName: item.name,
        productImage: item.images?.[0] || "",
        priceAtSale: item.price,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
      })),
    };

    try {
      // 1. Create the database record
      const dbRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const result = await dbRes.json();

      if (!dbRes.ok) throw new Error(result.message || "DB Save Failed");

      // 2. Create Stripe session using the ID from the record we just created
      const stripeRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items, // Pass raw items for Stripe line_items
          orderId: result.data.id,
          customerEmail: customerEmail,
        }),
      });

      const session = await stripeRes.json();
      if (session.url) window.location.href = session.url;
    } catch (error: any) {
      toast.error("Checkout Error", { description: error.message });
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#F5F2EB]">
        <div className="w-16 h-16 mb-6 rounded-full bg-white border border-gold/20 flex items-center justify-center">
          <Lock className="text-gold/30" size={24} />
        </div>
        <h1 className="mb-4 font-serif text-2xl text-ink uppercase tracking-widest">
          The selection is empty
        </h1>
        <Link
          href="/"
          className="px-10 py-4 text-[10px] font-black tracking-[0.3em] text-cream uppercase bg-ink rounded-full hover:bg-gold transition-all"
        >
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-[#F5F2EB]">
      <div className="max-w-6xl px-6 py-12 mx-auto">
        <Link
          href="/cart"
          className="flex items-center gap-2 mb-12 text-[10px] font-black tracking-[0.3em] text-gold uppercase transition hover:text-ink"
        >
          <ArrowLeft size={14} /> Back to Selection
        </Link>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          {/* LEFT: CURATION FORM */}
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            {/* Customer Identity */}
            <section className="p-8 bg-white border border-gold/10 shadow-sm rounded-lg">
              <h2 className="flex items-center gap-3 mb-10 font-serif text-xl text-ink uppercase tracking-widest">
                <User className="text-gold" size={18} /> Customer Identity
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gold uppercase tracking-widest ml-1">
                      Full Name
                    </label>
                    <input
                      name="customerName"
                      required
                      placeholder="Jane Doe"
                      className="w-full p-3 bg-cream/20 border-2 border-gold/20 rounded-lg outline-none focus:ring-1 focus:ring-gold/40 text-base font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gold uppercase tracking-widest ml-1">
                      Phone Number
                    </label>
                    <input
                      name="customerPhone"
                      required
                      placeholder="(555) 000-0000"
                      className="w-full p-3 bg-cream/20 border-2 border-gold/20 rounded-lg outline-none focus:ring-1 focus:ring-gold/40 text-base font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gold uppercase tracking-widest ml-1">
                    Email Address
                  </label>
                  <input
                    name="customerEmail"
                    type="email"
                    required
                    placeholder="curator@example.com"
                    className="w-full p-3 bg-cream/20 border-2 border-gold/20 rounded-lg outline-none focus:ring-1 focus:ring-gold/40 text-base font-medium"
                  />
                </div>
              </div>
            </section>

            {/* Logistics (US Format) */}
            <section className="p-8 bg-white border border-gold/10 shadow-sm rounded-lg">
              <h2 className="flex items-center gap-3 mb-10 font-serif text-xl text-ink uppercase tracking-widest">
                <MapPin className="text-gold" size={18} /> Delivery Address
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gold uppercase tracking-widest ml-1">
                    Street Address
                  </label>
                  <input
                    name="streetName"
                    required
                    placeholder="123 Luxury Lane"
                    className="w-full p-3 bg-cream/20 border-2 border-gold/20 rounded-lg outline-none focus:ring-1 focus:ring-gold/40 text-base font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gold uppercase tracking-widest ml-1">
                    Apartment, suite, etc. (optional)
                  </label>
                  <input
                    name="houseAddress"
                    placeholder="Apt 4B"
                    className="w-full p-3 bg-cream/20 border-2 border-gold/20 rounded-lg outline-none focus:ring-1 focus:ring-gold/40 text-base font-medium"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gold uppercase tracking-widest ml-1">
                      City
                    </label>
                    <input
                      name="town"
                      required
                      placeholder="New York"
                      className="w-full p-3 bg-cream/20 border-2 border-gold/20 rounded-lg outline-none focus:ring-1 focus:ring-gold/40 text-base font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gold uppercase tracking-widest ml-1">
                      State
                    </label>
                    <input
                      name="state"
                      required
                      placeholder="NEW YORK"
                      className="w-full p-3 bg-cream/20 border-2 border-gold/20 rounded-lg outline-none focus:ring-1 focus:ring-gold/40 text-base font-medium uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gold uppercase tracking-widest ml-1">
                      ZIP Code
                    </label>
                    <input
                      name="zipCode"
                      required
                      placeholder="10001"
                      className="w-full p-3 bg-cream/20 border-2 border-gold/20 rounded-lg outline-none focus:ring-1 focus:ring-gold/40 text-base font-medium"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className="p-8 bg-white border border-gold/10 shadow-sm rounded-lg">
              <div className="flex justify-between items-center mb-10">
                <h2 className="flex items-center gap-3 font-serif text-xl text-ink uppercase tracking-widest">
                  <ShieldCheck className="text-gold" size={18} /> Secure Vault
                </h2>
                <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                  Encrypted
                </div>
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-between p-6 rounded-[1.5rem] border-2 border-gold bg-gold/5 shadow-xl shadow-gold/5"
              >
                <div className="flex items-center gap-4">
                  <CreditCard className="text-gold" size={20} />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                    Secure Credit / Debit Card
                  </span>
                </div>
                <Globe className="text-gold/30" size={16} />
              </button>

              <p className="mt-8 text-[10px] text-ink/30 text-center font-medium uppercase tracking-[0.2em] leading-relaxed">
                Stripe Secure Checkout will initialize <br /> upon curation of
                this record.
              </p>
            </section>

            <button
              disabled={isProcessing}
              className="flex items-center justify-center w-full gap-4 py-6 text-[11px] font-black tracking-[0.4em] text-cream transition-all bg-ink rounded-full hover:bg-gold active:scale-95 disabled:bg-ink/40 uppercase shadow-2xl shadow-gold/20"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" /> Synchronizing...
                </>
              ) : (
                <>Complete Curation — ${totalAmount.toFixed(2)}</>
              )}
            </button>
          </form>

          {/* RIGHT: MANIFEST SUMMARY */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="p-8 md:p-12 text-cream bg-ink shadow-2xl rounded-lg border border-white/5 relative overflow-hidden">
              <Globe className="absolute -bottom-10 -right-10 w-48 h-48 text-white/[0.02] rotate-12" />

              <h2 className="mb-12 font-serif text-2xl uppercase tracking-[0.2em] border-b border-white/10 pb-6 text-gold">
                Order Summary
              </h2>

              <div className="space-y-8 max-h-[380px] overflow-y-auto pr-4 custom-scrollbar mb-12">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-6 pb-6 border-b border-white/5 last:border-0"
                  >
                    <div className="flex items-center gap-5">
                      <div className="relative flex-shrink-0 w-16 h-16 overflow-hidden rounded-2xl bg-white/5 border border-white/10">
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="object-contain p-2"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold tracking-wide text-white uppercase">
                          {item.name}
                        </p>
                        <p className="text-[9px] text-gold uppercase tracking-[0.3em] mt-1.5">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-serif italic text-gold text-lg">
                      ${item.totalPrice.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-5 text-[11px] font-bold uppercase tracking-[0.3em] text-cream/40">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white italic font-serif text-base tracking-normal">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Logistics</span>
                  <span className="text-gold">Complimentary</span>
                </div>
                <div className="flex justify-between pt-10 mt-6 text-2xl font-serif italic text-gold border-t border-white/10">
                  <span className="text-[11px] font-black not-italic tracking-[0.5em] text-white">
                    Grand Total
                  </span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-12 text-center border-t border-white/5 pt-8">
                <p className="text-[8px] text-white/80 uppercase tracking-[0.4em]">
                  Novarease Operations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopProduct;
