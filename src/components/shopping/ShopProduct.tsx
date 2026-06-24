"use client";

import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form"; // Import Hook Form
import { State, City } from "country-state-city";
import { RootState } from "@/store/Store";
import { CartActions } from "@/store/CartSlice";
import {
  CreditCard,
  Lock,
  Loader2,
  ArrowLeft,
  MapPin,
  User,
  ChevronDown,
  Phone,
  Flag,
  AlertCircle,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const ShopProduct = () => {
  const { items } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const router = useRouter();

  // 1. Initialize React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "momo">("card");
  const selectedStateCode = watch("stateCode");
  const selectedCity = watch("town");

  const allStates = useMemo(() => State.getStatesOfCountry("US"), []);
  const filteredCities = useMemo(() => {
    return selectedStateCode
      ? City.getCitiesOfState("US", selectedStateCode)
      : [];
  }, [selectedStateCode]);

  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const shippingCost = 0.0; // Complimentary
  const totalAmount = subtotal + shippingCost;

  const onFormSubmit = async (data: any) => {
    setIsProcessing(true);
    const stateObj = allStates.find((s) => s.isoCode === data.stateCode);

    const orderData = {
      orderNumber: `NVR-${Math.random().toString(36).toUpperCase().substring(2, 10)}`,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      houseAddress: data.houseAddress,
      streetName: data.streetName,
      town: data.town,
      state: stateObj?.name || "",
      zipCode: data.zipCode,
      country: "USA",
      subtotal,
      shippingCost: 0,
      totalAmount,
      currency: "USD",
      paymentStatus: "PENDING",
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
      const dbRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const result = await dbRes.json();
      if (!dbRes.ok) throw new Error(result.message);

      const stripeRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          orderId: result.data.id,
          customerEmail: data.customerEmail,
        }),
      });
      const session = await stripeRes.json();
      if (session.url) window.location.href = session.url;
    } catch (error: any) {
      toast.error("Checkout Error", { description: error.message });
      setIsProcessing(false);
    }
  };

  const inputClass = (fieldName: string) => `
    w-full p-4 bg-cream/20 border-2 rounded-xl outline-none text-sm font-medium transition-all
    ${errors[fieldName] ? "border-red-500 bg-red-50/30" : "border-gold/20 focus:border-gold/50"}
  `;

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
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
            {/* --- IDENTITY SECTION --- */}
            <section className="p-8 bg-white border border-gold/10 rounded-3xl shadow-sm">
              <h2 className="flex items-center gap-3 mb-8 font-serif text-xl text-ink uppercase tracking-widest">
                <User className="text-gold" size={18} /> Customer Identity
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gold uppercase tracking-widest ml-1">
                      Full Name
                    </label>
                    <input
                      {...register("customerName", {
                        required: "Name is required",
                      })}
                      placeholder="Jane Doe"
                      className={inputClass("customerName")}
                    />
                    {errors.customerName && (
                      <p className="text-red-500 text-[10px] font-bold uppercase mt-1 flex items-center gap-1">
                        <AlertCircle size={10} />{" "}
                        {errors.customerName.message as string}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gold uppercase tracking-widest ml-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <span
                        className={`absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold ${errors.customerPhone ? "text-red-500" : "text-ink/40"}`}
                      >
                        +1
                      </span>
                      <input
                        type="tel"
                        {...register("customerPhone", {
                          required: "Phone number is required",
                          pattern: {
                            value: /^\d{10}$/,
                            message: "Enter 10 digits",
                          },
                        })}
                        placeholder="555 000 0000"
                        className={`${inputClass("customerPhone")} pl-10`}
                      />
                    </div>
                    {errors.customerPhone && (
                      <p className="text-red-500 text-[10px] font-bold uppercase mt-1 flex items-center gap-1">
                        <AlertCircle size={10} />{" "}
                        {errors.customerPhone.message as string}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gold uppercase tracking-widest ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...register("customerEmail", {
                      required: "Email is required",
                    })}
                    placeholder="jane@usa.com"
                    className={inputClass("customerEmail")}
                  />
                  {errors.customerEmail && (
                    <p className="text-red-500 text-[10px] font-bold uppercase mt-1 flex items-center gap-1">
                      <AlertCircle size={10} />{" "}
                      {errors.customerEmail.message as string}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* --- LOGISTICS SECTION --- */}
            <section className="p-8 bg-white border border-gold/10 rounded-3xl shadow-sm">
              <h2 className="flex items-center gap-3 mb-8 font-serif text-xl text-ink uppercase tracking-widest">
                <MapPin className="text-gold" size={18} /> Shipping Logistics
              </h2>

              <div className="space-y-6">
                {/* READ ONLY COUNTRY FIELD */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gold uppercase tracking-widest ml-1">
                    Country
                  </label>
                  <div className="w-full p-4 bg-cream/10 border border-gold/10 rounded-xl text-sm font-bold text-ink/40 flex items-center gap-3 cursor-not-allowed">
                    <Flag size={14} /> United States (USA)
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gold uppercase tracking-widest ml-1">
                    Street Address
                  </label>
                  <input
                    {...register("streetName", {
                      required: "Address is required",
                    })}
                    placeholder="123 Luxury Ave"
                    className={inputClass("streetName")}
                  />
                  {errors.streetName && (
                    <p className="text-red-500 text-[10px] font-bold uppercase mt-1 flex items-center gap-1">
                      <AlertCircle size={10} />{" "}
                      {errors.streetName.message as string}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* STATE DROPDOWN */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gold uppercase tracking-widest ml-1">
                      State
                    </label>
                    <div className="relative">
                      <select
                        {...register("stateCode", {
                          required: "Select a state",
                        })}
                        onChange={(e) => {
                          setValue("stateCode", e.target.value);
                          setValue("town", ""); // Reset city
                        }}
                        className={`${inputClass("stateCode")} appearance-none cursor-pointer`}
                      >
                        <option value="">Select State</option>
                        {allStates.map((s) => (
                          <option key={s.isoCode} value={s.isoCode}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gold/60 pointer-events-none"
                        size={16}
                      />
                    </div>
                    {errors.stateCode && (
                      <p className="text-red-500 text-[10px] font-bold uppercase mt-1 flex items-center gap-1">
                        <AlertCircle size={10} />{" "}
                        {errors.stateCode.message as string}
                      </p>
                    )}
                  </div>

                  {/* CITY DROPDOWN */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gold uppercase tracking-widest ml-1">
                      City
                    </label>
                    <div className="relative">
                      <select
                        {...register("town", { required: "Select a city" })}
                        disabled={!selectedStateCode}
                        className={`${inputClass("town")} appearance-none ${!selectedStateCode ? "bg-gray-100 opacity-50" : "cursor-pointer"}`}
                      >
                        <option value="">
                          {selectedStateCode
                            ? "Select City"
                            : "Choose State First"}
                        </option>
                        {filteredCities.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gold/60 pointer-events-none"
                        size={16}
                      />
                    </div>
                    {errors.town && (
                      <p className="text-red-500 text-[10px] font-bold uppercase mt-1 flex items-center gap-1">
                        <AlertCircle size={10} />{" "}
                        {errors.town.message as string}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1 md:w-1/2">
                  <label className="text-[10px] font-bold text-gold uppercase tracking-widest ml-1">
                    ZIP Code
                  </label>
                  <input
                    {...register("zipCode", { required: "ZIP required" })}
                    placeholder="10001"
                    className={inputClass("zipCode")}
                  />
                  {errors.zipCode && (
                    <p className="text-red-500 text-[10px] font-bold uppercase mt-1 flex items-center gap-1">
                      <AlertCircle size={10} />{" "}
                      {errors.zipCode.message as string}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <button
              disabled={isProcessing}
              type="submit"
              className="w-full py-6 bg-ink text-cream rounded-full text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-gold/20 hover:bg-gold transition-all disabled:bg-ink/40"
            >
              {isProcessing ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                `Purchase Selection — $${totalAmount.toFixed(2)}`
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
