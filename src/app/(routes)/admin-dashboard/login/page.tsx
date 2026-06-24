import React from 'react'
import type { Metadata } from "next";
import AdminLogin from '@/components/account/AdminLogin';

export const metadata: Metadata = {
 title: "YamaTech | Access Dashboard",
  description: "Inventory management system for YamaTech",
};
const Login = () => {
  return (
    <div>
      <AdminLogin />
    </div>
  )
}

export default Login