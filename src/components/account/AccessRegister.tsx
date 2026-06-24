"use client";

import React, { useState } from "react";
import {
  User,
  ShieldPlus,
  Mail,
  Phone,
  Key,
  ArrowRight,
  Fingerprint,
} from "lucide-react";
import { Form, Input, Button, Row, Col } from "antd";
import { motion } from "framer-motion";
import { toast } from "sonner";

const AccessRegister = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Identity Curated", {
          description: "Access credentials sent via secure email.",
        });
        form.resetFields();
      } else {
        toast.error(data.error || "Curation failed");
      }
    } catch (error) {
      toast.error("Registry synchronization error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-ink/5 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full relative z-10"
      >
        {/* Branding Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-ink rounded-[1.5rem] shadow-2xl shadow-gold/20 mb-6">
            <ShieldPlus size={32} className="text-gold" />
          </div>
          <h1 className="font-serif text-4xl tracking-tight text-ink uppercase">
            Curate Access
          </h1>
          <p className="text-gold text-[10px] font-black uppercase tracking-[0.4em] mt-3">
            Personnel Initialization
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-white/40 backdrop-blur-md border border-gold/20 p-5 rounded-2xl mb-8 flex items-start gap-4">
          <Fingerprint className="text-gold shrink-0" size={20} />
          <p className="text-[10px] text-ink/60 font-bold uppercase tracking-widest leading-relaxed">
            Standard Protocol: A temporary{" "}
            <span className="text-ink">UUID Access Key</span> will be 
            generated and dispatched to the provided email identifier.
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-white/70 backdrop-blur-xl p-10 rounded-[2.5rem] border border-gold/10 shadow-2xl shadow-gold/5">
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
            className="space-y-2"
          >
            <Row gutter={20}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="firstName"
                  label={<span className="text-[9px] font-black uppercase tracking-widest text-gold ml-1">Legal Forename</span>}
                  rules={[{ required: true, message: "Forename required" }]}
                >
                  <Input
                    prefix={<User size={16} className="text-gold/40 mr-2" />}
                    placeholder="e.g. Jane"
                    className="h-14 rounded-2xl border border-gold/10 bg-[#F5F2EB]/50 hover:border-gold/40 focus:border-gold transition-all text-sm font-medium"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="lastName"
                  label={<span className="text-[9px] font-black uppercase tracking-widest text-gold ml-1">Surname</span>}
                  rules={[{ required: true, message: "Surname required" }]}
                >
                  <Input
                    prefix={<User size={16} className="text-gold/40 mr-2" />}
                    placeholder="e.g. Doe"
                    className="h-14 rounded-2xl border border-gold/10 bg-[#F5F2EB]/50 hover:border-gold/40 focus:border-gold transition-all text-sm font-medium"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="email"
              label={<span className="text-[9px] font-black uppercase tracking-widest text-gold ml-1">Registry Email</span>}
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Valid email identifier required",
                },
              ]}
            >
              <Input
                type="email"
                prefix={<Mail size={16} className="text-gold/40 mr-2" />}
                placeholder="identity@novarease.com"
                className="h-14 rounded-2xl border border-gold/10 bg-[#F5F2EB]/50 hover:border-gold/40 focus:border-gold transition-all text-sm font-medium"
              />
            </Form.Item>

            <Form.Item
              name="phoneNumber"
              label={<span className="text-[9px] font-black uppercase tracking-widest text-gold ml-1">Contact String</span>}
              rules={[{ required: true, message: "Phone number required" }]}
            >
              <Input
                prefix={<Phone size={16} className="text-gold/40 mr-2" />}
                placeholder="+1 (555) 000-0000"
                className="h-14 rounded-2xl border border-gold/10 bg-[#F5F2EB]/50 hover:border-gold/40 focus:border-gold transition-all text-sm font-medium"
              />
            </Form.Item>

            <Form.Item
              name="secretKey"
              label={<span className="text-[9px] font-black uppercase tracking-widest text-gold ml-1">Master Clearance Key</span>}
              rules={[{ required: true, message: "Secret key required" }]}
              className="mb-10"
            >
              <Input.Password
                prefix={<Key size={16} className="text-gold/40 mr-2" />}
                placeholder="Required for registry write-access"
                className="h-14 rounded-2xl border border-gold/10 bg-[#F5F2EB]/50 hover:border-gold/40 focus:border-gold transition-all text-sm font-medium"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-16 bg-ink hover:!bg-gold text-cream font-black uppercase tracking-[0.3em] text-[11px] rounded-2xl border-none shadow-xl transition-all duration-500 active:scale-95 flex items-center justify-center group"
            >
              {loading ? "INITIALIZING..." : "Authorize Registry"}
              {!loading && <ArrowRight size={16} className="ml-3 group-hover:translate-x-1 transition-transform text-gold" />}
            </Button>
          </Form>
        </div>

        <div className="text-center mt-12">
          <p className="text-[9px] font-bold text-ink/30 uppercase tracking-[0.2em] leading-relaxed italic">
            Novarease Archival Bureau &bull; Internal Personnel Onboarding System
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AccessRegister;