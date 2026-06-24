"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Form, Input, Button } from "antd";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

const AccessLogin = () => {
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "authenticated" && session?.user) {
    router.replace("/");
    return null;
  }

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: values.identifier,
          password: values.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const params = new URLSearchParams({
          id: data.userId || "",
          em: data.email || "",
          fn: data.firstName || "Personnel",
          ln: data.lastName || "",
        }).toString();

        if (data.nextStep === "SET_NEW_PASSWORD") {
          router.push(`/setup-password?${params}`);
          toast.success("Please set up your new password");
        } else if (data.nextStep === "VERIFY_2FA") {
          router.push(`/verify?${params}`);
          toast.success("2FA code sent to your email");
        }
      } else {
        toast.error(data.error || "Authentication failed");
      }
    } catch (err) {
      toast.error("System synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 font-sans">
      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-slate-200/50 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[400px] w-full relative z-10">
        {/* --- BRANDING HEADER --- */}
        <div className="text-center mb-5">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tighter uppercase leading-none">
            NOVAR<span className="text-blue-600">EASE</span>
          </h1>

          {/* Ghana National Accent Line */}
          <div className="flex justify-center items-center gap-1 mt-4 mb-2">
            <div className="h-1 w-6 rounded-full bg-[#EF4444]" />
            <div className="h-1 w-6 rounded-full bg-[#FACC15]" />
            <div className="h-1 w-6 rounded-full bg-[#22C55E]" />
          </div>

          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
            Identity Management Portal
          </p>
        </div>

        {/* --- LOGIN CARD --- */}
        <div className="bg-white p-8 rounded-lg border-2 border-gray-200 shadow-2xl shadow-slate-200/50">
          <Form onFinish={onFinish} layout="vertical" requiredMark={false}>
            <div className="space-y-1 mb-6 text-center">
              <h3 className="text-lg font-bold text-slate-800">
                Secure Sign In
              </h3>
              <p className="text-sm text-slate-600 font-medium">
                Authorized personnel only
              </p>
            </div>

            <Form.Item
              label="Email"
              name="identifier"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Invalid email address",
                },
              ]}
              className="mb-4"
            >
              <Input
                type="email"
                prefix={<Mail size={18} className="text-slate-400 mr-2" />}
                placeholder="Enter Email Address"
                className="h-12 border-2 rounded-lg border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white transition-all text-base font-semibold"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Password required" }]}
              className="mb-2"
            >
              <Input.Password
                prefix={<Lock size={18} className="text-slate-400 mr-2" />}
                placeholder="Enter Password"
                className="h-12 border-2 rounded-lg border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white transition-all text-base font-semibold"
              />
            </Form.Item>

            <div className="flex justify-end mt-1 mb-8">
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 bg-blue-700 hover:!bg-black text-white font-bold uppercase tracking-[0.2em] text-sm rounded-lg border-none shadow-lg shadow-slate-200 flex items-center justify-center group"
            >
              {loading ? "Verifying..." : "Access Dashboard"}
              {!loading && (
                <ArrowRight
                  size={18}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              )}
            </Button>
          </Form>
        </div>

        <div className="text-center mt-5">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
            &copy; {new Date().getFullYear()} Yamatech Ghana Ltd.
            <br />
            All rights reserved. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessLogin;
