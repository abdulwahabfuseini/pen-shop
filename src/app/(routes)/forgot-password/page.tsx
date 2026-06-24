import React from 'react'
import type { Metadata } from "next";
import NewPassword from '@/components/account/NewPassword';


export const metadata: Metadata = {
 title: "Perfect Man Hub - Admin Dashboard | Set New Password",
  description: "Best Beard Growth Product",
};

const ForgotPassword = () => {
  return (
    <div>
      <NewPassword />
    </div>
  )
}

export default ForgotPassword