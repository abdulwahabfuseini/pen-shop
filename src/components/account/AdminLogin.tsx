"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, ShieldAlert, Fingerprint } from "lucide-react";
import { Form, Input, Button } from "antd";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "authenticated") {
    router.replace("/admin-dashboard");
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
        // --- CRITICAL ROLE CHECK ---
        // Verify the user is an Admin before allowing them to move forward
        if (data.role !== "ADMIN") {
          toast.error("Access Denied: Administrative privileges required.");
          setLoading(false);
          return;
        }

        const params = new URLSearchParams({
          id: data.userId || "",
          em: data.email || "",
          fn: data.firstName || "Personnel",
          ln: data.lastName || "",
          target: "admin", // Flag to tell the next page where to redirect
        }).toString();

        if (data.nextStep === "SET_NEW_PASSWORD") {
          router.push(`/setup-password?${params}`);
          toast.success("Identity verified. Please set your admin password.");
        } else if (data.nextStep === "VERIFY_2FA") {
          router.push(`/verify?${params}`);
          toast.success("Security code dispatched to admin email.");
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
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-slate-200/50 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[400px] w-full relative z-10">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tighter uppercase leading-none">
            YAMA<span className="text-blue-600">TECH</span>
          </h1>

          <div className="flex justify-center items-center gap-1 mt-4 mb-2">
            <div className="h-1 w-6 rounded-full bg-[#EF4444]" />
            <div className="h-1 w-6 rounded-full bg-[#FACC15]" />
            <div className="h-1 w-6 rounded-full bg-[#22C55E]" />
          </div>

          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
            Admin Control Center
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-lg border-2 border-slate-200 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
          {/* Subtle Security Badge */}
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldAlert size={50} />
          </div>

          <Form onFinish={onFinish} layout="vertical" requiredMark={false}>
            <div className="space-y-1 mb-8 text-center">
              <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
                Admin Access
              </h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                Authorized Admin Personnel Only
              </p>
            </div>

            <Form.Item
              label="Email"
              name="identifier"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Admin email required",
                },
              ]}
              className="mb-4"
            >
              <Input
                type="email"
                prefix={<Mail size={18} className="text-slate-400 mr-2" />}
                placeholder="Admin Email"
                className="h-12 border-2 rounded-lg border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white transition-all text-base font-semibold"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Security key required" }]}
              className="mb-2"
            >
              <Input.Password
                prefix={<Lock size={18} className="text-slate-400 mr-2" />}
                placeholder="Access Password"
                className="h-12 border-2 rounded-lg border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white transition-all text-base font-semibold"
              />
            </Form.Item>

            <div className="flex justify-end mt-2 mb-8">
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 bg-blue-900 hover:!bg-slate-900 text-white font-bold uppercase tracking-[0.2em2 border-2 rounded-lg border-none shadow-lg flex items-center justify-center group"
            >
              {loading ? "Authenticating..." : "Access Dashboard"}
              {!loading && (
                <ArrowRight
                  size={18}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              )}
            </Button>
          </Form>
        </div>

        <div className="text-center mt-8">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-relaxed">
            &copy; {new Date().getFullYear()} Yamatech Ghana Ltd.
            <br />
            AES-256 Encrypted Session
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
