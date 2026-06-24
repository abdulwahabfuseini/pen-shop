"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, ShieldQuestion } from "lucide-react";
import { message, Form, Input, Button } from "antd";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: { identifier: string }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: values.identifier }),
      });
      const data = await res.json();
      if (res.ok) {
        message.success("Security code dispatched to your email.");
        router.push(
          `/reset-password?email=${encodeURIComponent(values.identifier)}`,
        );
      } else {
        message.error(data.error);
      }
    } catch (err) {
      message.error("Link to secure server failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:min-h-screen pt-16 bg-zinc-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-zinc-950 text-amber-500 rounded-3xl mb-6 shadow-xl">
            <ShieldQuestion size={40} />
          </div>
          <h1 className="text-3xl font-black text-black uppercase tracking-tighter">
            Account Recovery
          </h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2 ">
            Enter email to receive security code
          </p>
        </div>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item
            name="identifier"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input
              prefix={<Mail size={18} className="mr-2 text-zinc-400" />}
              placeholder="Email Address"
              className="h-14 rounded-2xl border-2 font-bold text-base"
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={loading}
            className="w-full h-14 bg-black hover:!bg-amber-500 text-white font-black uppercase tracking-widest rounded-2xl border-none"
          >
            {loading ? (
              "Requesting..."
            ) : (
              <span>
                Request Reset Code{" "}
                <ArrowRight size={16} className="ml-2 inline" />
              </span>
            )}
          </Button>
        </Form>
      </div>
    </div>
  );
};
export default ForgotPassword;
