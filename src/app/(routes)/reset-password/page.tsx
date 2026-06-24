import React, { Suspense } from 'react'
import type { Metadata } from "next";
import RecoverPassword from '@/components/account/RecoverPassword';


export const metadata: Metadata = {
 title: "YamaTech | Reset Password",
  description: "Inventory management system for YamaTech",
};

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="font-bold tracking-widest uppercase animate-pulse text-slate-400">
          Loading Security Protocol...
        </div>
      </div>
    }>
      <RecoverPassword />
    </Suspense>
  );
}