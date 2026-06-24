"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { message, Form, Input, Button, Progress } from "antd";
import { ShieldAlert, Lock, Check, X, Hash } from "lucide-react";

export default function RecoverPassword() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const router = useRouter();

  const requirements = [
    { label: "At least 8 characters", met: passwordValue.length >= 8 },
    {
      label: "At least one uppercase letter",
      met: /[A-Z]/.test(passwordValue),
    },
    { label: "At least one number", met: /[0-9]/.test(passwordValue) },
    {
      label: "At least one special character (@$!%*?&#)",
      met: /[@$!%*?&#]/.test(passwordValue),
    },
  ];

  const strengthScore =
    (requirements.filter((req) => req.met).length / requirements.length) * 100;

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: values.code,
          newPassword: values.newPassword,
        }),
      });

      if (res.ok) {
        message.success("Protocol Secure. Password updated.");
        router.push("/signin");
      } else {
        const data = await res.json();
        message.error(data.error || "Reset failed. Check your code.");
      }
    } catch (err) {
      message.error("System error during security update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:min-h-screen pt-16 pb-20 bg-zinc-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-black text-amber-500 rounded-3xl mb-6 shadow-xl">
            <ShieldAlert size={40} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-black leading-none">
            Security Protocol
          </h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-3">
            Reset Administrative Credentials
          </p>
        </div>

        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
          onValuesChange={(changed) =>
            changed.newPassword !== undefined &&
            setPasswordValue(changed.newPassword)
          }
        >
          {/* 6-DIGIT CODE FIELD */}
          <Form.Item
            name="code"
            rules={[{ required: true, message: "Enter 6-digit code" }]}
          >
            <Input
              prefix={<Hash size={18} className="text-zinc-400 mr-2" />}
              placeholder="6-Digit Code"
              className="h-14 rounded-2xl font-black border-2 text-black text-center text-base tracking-[0.5em]"
              maxLength={6}
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            rules={[{ required: true, message: "New password required" }]}
          >
            <Input.Password
              prefix={<Lock size={18} className="text-zinc-400 mr-2" />}
              placeholder="New Secure Password"
              className="h-14 rounded-2xl font-bold border-2 text-black text-base"
            />
          </Form.Item>

          {/* Strength Indicator */}
          <div className="mb-6 p-4 bg-blue-50 rounded-2xl border-2 border-gray-100 ">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                Strength Level
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">
                {strengthScore === 100 ? "Elite Security" : "Standard"}
              </span>
            </div>
            <Progress
              percent={strengthScore}
              showInfo={false}
              strokeColor={strengthScore === 100 ? "#10b981" : "#f59e0b"}
              size="small"
              className="mb-4"
            />
            <div className="space-y-2">
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {req.met ? (
                    <Check size={12} className="text-emerald-500" />
                  ) : (
                    <X size={12} className="text-zinc-300" />
                  )}
                  <span
                    className={`text-[10px] font-bold uppercase tracking-tight ${req.met ? "text-emerald-600" : "text-zinc-400"}`}
                  >
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Form.Item
            name="confirm"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value)
                    return Promise.resolve();
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<Lock size={18} className="text-zinc-400 mr-2" />}
              placeholder="Confirm Password"
              className="h-14 rounded-2xl font-bold border-2 text-black text-base"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={loading}
            className="w-full h-14 bg-black text-white font-black uppercase tracking-widest rounded-2xl border-none mt-4 hover:!bg-amber-500 disabled:opacity-30"
          >
            {loading ? "Authorizing..." : "Authorize Update"}
          </Button>
        </Form>
      </div>
    </div>
  );
}
