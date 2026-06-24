"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  ArrowRight,
  Eraser,
  Fingerprint,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Form, Input, Button } from "antd";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "authenticated") {
    router.replace("/admin/dashboard");
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
        if (data.role !== "ADMIN") {
          toast.error("Access Denied", {
            description:
              "Administrative privileges are required for this sector.",
          });
          setLoading(false);
          return;
        }

        const params = new URLSearchParams({
          id: data.userId || "",
          em: data.email || "",
          fn: data.firstName || "",
          ln: data.lastName || "",
        }).toString();

        if (data.nextStep === "SET_NEW_PASSWORD") {
          router.push(`/setup-password?${params}`);
          toast.success("Identity Verified", {
            description: "Initialize your master password.",
          });
        } else if (data.nextStep === "VERIFY_2FA") {
          router.push(`/verify?${params}`);
          toast.success("Security Clearance", {
            description: "Verification code dispatched to your secure email.",
          });
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
    <div className="min-h-screen bg-[#F5F2EB] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-ink/5 rounded-full blur-[120px]" />

      <div className="max-w-[420px] w-full relative z-10">
        {/* Luxury Branding */}
        <div className="text-center mb-7 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center justify-center p-4 bg-ink rounded-[1.5rem] shadow-2xl shadow-gold/20 mb-6">
            <Eraser className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-serif text-4xl tracking-[0.1em] text-ink uppercase">
            Novarease
          </h1>
          <p className="text-gold text-[10px] font-black uppercase tracking-[0.4em] mt-3">
            Admin Portal
          </p>
        </div>

        {/* Access Card */}
        <div className="bg-white/70 backdrop-blur-xl p-10 rounded-lg border border-gold/10 shadow-2xl shadow-gold/5 relative overflow-hidden">
          <Form onFinish={onFinish} layout="vertical" requiredMark={false}>
            <div className="space-y-1 mb-4 text-center">
              <h3 className="font-serif text-xl text-ink uppercase tracking-wider">
                Access Dashboard
              </h3>
              <div className="h-px w-12 bg-gold/30 mx-auto mt-4" />
            </div>

            <div className="space-y-6">
              <Form.Item
                name="identifier"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Email required",
                  },
                ]}
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gold uppercase tracking-widest ml-1">
                    Email Identifier
                  </label>
                  <Input
                    prefix={<Mail size={16} className="text-gold/40 mr-2" />}
                    placeholder="curator@novarease.com"
                    className="h-12 border-2 border-gold/10 rounded-lg bg-[#F5F2EB]/50 hover:border-gold/40 focus:border-gold transition-all text-base font-medium"
                  />
                </div>
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "Security key required" }]}
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gold uppercase tracking-widest ml-1">
                    Password
                  </label>
                  <Input.Password
                    prefix={<Lock size={16} className="text-gold/40 mr-2" />}
                    placeholder="••••••••"
                    className="h-12 border-2 border-gold/10 rounded-lg bg-[#F5F2EB]/50 hover:border-gold/40 focus:border-gold transition-all text-base font-medium"
                  />
                </div>
              </Form.Item>
            </div>

            <div className="flex justify-right mt-6 mb-10">
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/30 hover:text-gold transition-colors"
              >
                Forgot Password
              </button>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 bg-ink hover:!bg-gold text-cream font-bold uppercase tracking-[0.3-2em] text-[11px] rounded-lg border-none shadow-xl flex items-center justify-center group transition-all duration-500"
            >
              {!loading && "Authorize Session"}
              {loading && "Verifying Archival Rights..."}
              {!loading && (
                <ArrowRight
                  size={16}
                  className="ml-3 group-hover:translate-x-1 transition-transform text-gold"
                />
              )}
            </Button>
          </Form>
        </div>

        {/* Secure Footer */}
        <div className="text-center mt-12 space-y-4">
          <p className="text-[9px] font-medium text-ink/30 uppercase tracking-[0.2em] leading-relaxed">
            © {new Date().getFullYear()} Novarease Archival Bureau.
            <br />
            Unauthorized access attempts are logged and reported.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
