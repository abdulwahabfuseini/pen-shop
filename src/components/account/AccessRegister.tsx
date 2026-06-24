"use client";

import React, { useState } from "react";
import {
  User,
  ShieldPlus,
  Mail,
  Phone,
  Key,
  ArrowRight,
  Info,
} from "lucide-react";
import { Form, Input, Button, Row, Col, message } from "antd";

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
        message.success("Account created. UUID password sent to user's email.");
        form.resetFields();
      } else {
        message.error(data.error || "Registration failed");
      }
    } catch (error) {
      message.error("System synchronization error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-blue-700 text-white rounded-3xl mb-6 shadow-lg">
            <ShieldPlus size={40} />
          </div>
          <h1 className="text-3xl font-bold text-black uppercase tracking-tighter">
            Register User
          </h1>
          <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest mt-2">
            Initialize User Profile
          </p>
        </div>

        <div className="bg-zinc-50 border-2 border-gray-200 p-4 rounded-lg mb-8 flex gap-3">
          <Info className="text-blue-700 shrink-0" size={18} />
          <p className="text-[10px] text-zinc-700 font-medium uppercase tracking-wider">
            A temporary{" "}
            <span className="text-blue-700 font-semibold">
              UUID Command Key
            </span>{" "}
            will be emailed upon success.
          </p>
        </div>

        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="firstName"
                rules={[{ required: true, message: "First name required" }]}
              >
                <Input
                  prefix={<User size={18} className="text-zinc-400 mr-2" />}
                  placeholder="First Name"
                  className="h-12 rounded-lg text-base border-2 font-bold text-black"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="lastName"
                rules={[{ required: true, message: "Last name required" }]}
              >
                <Input
                  prefix={<User size={18} className="text-zinc-400 mr-2" />}
                  placeholder="Last Name"
                  className="h-12 rounded-lg text-base border-2 font-bold text-black"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Please enter a valid email",
              },
            ]}
          >
            <Input
              type="email"
              prefix={<Mail size={18} className="text-zinc-400 mr-2" />}
              placeholder="Email Address"
              className="h-12 rounded-lg border-2 text-base font-bold"
            />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            rules={[{ required: true, message: "Please enter phone number" }]}
          >
            <Input
              prefix={<Phone size={18} className="text-zinc-400 mr-2" />}
              placeholder="Phone Number"
              className="h-12 rounded-lg border-2 text-base font-bold"
            />
          </Form.Item>

          <Form.Item
            name="secretKey"
            rules={[{ required: true, message: "Secret key required" }]}
          >
            <Input.Password
              prefix={<Key size={18} className="text-blue-700/50 mr-2" />}
              placeholder="System Secret Key"
              className="h-12 rounded-lg border-2 text-base font-bold"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full h-12 bg-blue-700 hover:bg-black text-white font-bold uppercase tracking-widest rounded-lg border-none flex items-center justify-center gap-2"
          >
            {loading ? "Creating User..." : "Create Profile"}{" "}
            <ArrowRight size={16} />
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default AccessRegister;
