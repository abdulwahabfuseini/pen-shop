import React, { Suspense } from "react";
import type { Metadata } from "next";
import Verification from "@/components/account/Verification";

export const metadata: Metadata = {
  title: "YamaTech | Verification",
  description: "Inventory management system for YamaTech",
};

export default function Verify() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="font-bold tracking-widest uppercase animate-pulse text-slate-400">
          Loading Security Protocol...
        </div>
      </div>
    }>
      <Verification />
    </Suspense>
  );
}
