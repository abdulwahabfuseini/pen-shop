/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Table,
  Button,
  Avatar,
  Popconfirm,
  Modal,
  Form,
  Input,
  Select,
  Tooltip,
  Drawer,
  Tag,
  Divider,
  Space,
} from "antd";
import {
  UserPlus,
  Trash2,
  Key,
  Eye,
  Edit3,
  ShieldCheck,
  Users,
  UserCog,
  Briefcase,
  Mail,
  Phone,
  Search,
  User as UserIcon,
  Activity,
  UserCheck,
  Tag as TagIcon,
  Router,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { UserManagementSkeleton } from "./LoadingSkeleton";

// --- Advanced User Stat Component ---
const UserStat = ({ label, value, icon, color }: any) => {
  const themes: any = {
    blue: { accent: "bg-blue-600", iconBg: "bg-blue-50 text-blue-600" },
    orange: { accent: "bg-orange-500", iconBg: "bg-orange-50 text-orange-600" },
    green: {
      accent: "bg-emerald-500",
      iconBg: "bg-emerald-50 text-emerald-600",
    },
  };
  const theme = themes[color] || themes.blue;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white p-5 rounded-lg border-2 border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden transition-all hover:shadow-md"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.accent}`} />
      <div className={`p-3 rounded-lg ${theme.iconBg}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest leading-none mb-1">
          {label}
        </p>
        <p className="text-xl font-bold text-slate-900 leading-none">{value}</p>
      </div>
    </motion.div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const router = useRouter();
  // Modal & Drawer States
  const [modalMode, setModalMode] = useState<{
    open: boolean;
    type: "create" | "edit";
    record: any | null;
  }>({
    open: false,
    type: "create",
    record: null,
  });
  const [viewUser, setViewUser] = useState<any | null>(null);

  const [form] = Form.useForm();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register");
      const data = await res.json();
      setUsers(data.data || []);
    } catch (error) {
      toast.error("Cloud registry sync failed");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // --- Search & Filter Logic ---
  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      `${u.firstName} ${u.lastName} ${u.email} ${u.role}`
        .toLowerCase()
        .includes(searchText.toLowerCase()),
    );
  }, [users, searchText]);

  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((u) => u.role === "ADMIN").length,
      staff: users.filter((u) => u.role === "STAFF").length,
    }),
    [users],
  );

  // --- Actions ---
  const handleOpenModal = (type: "create" | "edit", record: any = null) => {
    setModalMode({ open: true, type, record });
    if (type === "edit" && record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
  };

  const onFinish = async (values: any) => {
    const isEdit = modalMode.type === "edit";
    const toastId = toast.loading(
      isEdit ? "Updating security profile..." : "Provisioning new account...",
    );

    try {
      const url = isEdit
        ? `/api/auth/register/${modalMode.record.id}`
        : "/api/auth/register";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        toast.success(isEdit ? "Credentials updated" : "Personnel onboarded", {
          id: toastId,
        });
        setModalMode({ open: false, type: "create", record: null });
        fetchUsers();
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || "System rejected operation", { id: toastId });
      }
    } catch (err) {
      toast.error("Network synchronization failed", { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    const toastId = toast.loading("Terminating session and access...");
    try {
      const res = await fetch(`/api/auth/register/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Access revoked successfully", { id: toastId });
        fetchUsers();
      }
    } catch (err) {
      toast.error("Revocation failed", { id: toastId });
    }
  };

  const columns = [
    {
      title: "STAFF IDENTITY",
      key: "name",
      width: 350,
      render: (r: any) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            className="bg-slate-900 border-2 border-white shadow-sm font-bold uppercase"
          >
            {r.firstName[0]}
            {r.lastName[0]}
          </Avatar>
          <div className="flex flex-col">
            <b className="text-slate-900 uppercase text-[12px] tracking-tight">
              {r.firstName} {r.lastName}
            </b>
            <span
              className={`text-[9px] font-bold uppercase tracking-widest ${r.passwordChanged ? "text-emerald-500" : "text-orange-400 animate-pulse"}`}
            >
              {r.passwordChanged ? "Active Session" : "Awaiting Setup"}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "ACCESS ROLE",
      dataIndex: "role",
      render: (role: string) => (
        <Tag
          color={role === "ADMIN" ? "volcano" : "blue"}
          className="font-bold border-none px-3 rounded-full text-[9px] uppercase tracking-widest"
        >
          {role === "ADMIN" ? (
            <ShieldCheck size={10} className="inline mr-1 mb-0.5" />
          ) : (
            <Briefcase size={10} className="inline mr-1 mb-0.5" />
          )}
          {role}
        </Tag>
      ),
    },
    {
      title: "CONTACT CHANNEL",
      key: "contact",
      render: (r: any) => (
        <div className="flex flex-col text-[11px] font-bold text-slate-500">
          <a
            href={`mailto:${r.email}`}
            className="text-blue-500 flex items-center gap-1 hover:underline"
          >
            <Mail size={10} /> {r.email}
          </a>
          <span className="flex items-center gap-1 text-slate-400">
            <Phone size={10} /> {r.phoneNumber}
          </span>
        </div>
      ),
    },
    {
      title: "ACTIONS",
      align: "right" as const,
      render: (r: any) => (
        <Space>
          <Tooltip title="View Intelligence">
            <Button
              shape="circle"
              icon={<Eye size={14} className="text-slate-400" />}
              onClick={() => setViewUser(r)}
            />
          </Tooltip>
          <Tooltip title="Edit Permissions">
            <Button
              shape="circle"
              className="text-blue-600"
              icon={<Edit3 size={14} />}
              onClick={() => handleOpenModal("edit", r)}
            />
          </Tooltip>
          <Popconfirm
            title="Revoke all system access?"
            onConfirm={() => handleDelete(r.id)}
            okText="Revoke"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              shape="circle"
              icon={<Trash2 size={14} />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return <UserManagementSkeleton />;
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      {/* 1. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <UserStat
          label="Total Users"
          value={stats.total}
          icon={<Users size={18} />}
          color="blue"
        />
        <UserStat
          label="System Administrators"
          value={stats.admins}
          icon={<ShieldCheck size={18} />}
          color="orange"
        />
        <UserStat
          label="Staff Personnel"
          value={stats.staff}
          icon={<UserCheck size={18} />}
          color="green"
        />
      </div>

      {/* 2. Professional Toolbar */}
      <div className="bg-white p-3 rounded-lg border-2 border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Search by Name, Role or Email..."
            prefix={<Search size={16} className="text-slate-300 mr-2" />}
            className="h-11 rounded-lg border-2 border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white transition-all text-sm font-bold"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <TagIcon size={14} className="text-slate-300 hidden md:block" />
          <Button
            type="primary"
            onClick={() => handleOpenModal("create")}
            className="bg-blue-900 hover:!bg-slate-800 font-bold uppercase text-[10px] h-10 px-4 rounded-lg border-none shadow-lg shadow-slate-200 transition-all flex items-center gap-2"
            icon={<UserPlus size={16} />}
          >
            Add New User
          </Button>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <div className="bg-white rounded-lg border-2 border-slate-200 overflow-hidden shadow-sm">
        <div className="px-4 md:px-6 py-4 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] m-0 italic">
            User Registry
          </h3>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
            Authenticated Access Only
          </span>
        </div>
        <Table
          dataSource={filteredUsers}
          columns={columns}
          loading={loading}
          bordered
          rowKey="id"
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 6 }}
        />
      </div>

      {/* 4. Unified Onboarding/Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 py-2 border-b border-slate-50">
            <div
              className={`p-2 rounded-lg ${modalMode.type === "create" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}
            >
              {modalMode.type === "create" ? (
                <UserPlus size={20} />
              ) : (
                <UserCog size={20} />
              )}
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-tight text-slate-800 m-0">
                {modalMode.type === "create"
                  ? "User Creation"
                  : "Profile Modification"}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                Yamatech Identity Layer
              </p>
            </div>
          </div>
        }
        open={modalMode.open}
        onOk={() => form.submit()}
        onCancel={() => setModalMode({ ...modalMode, open: false })}
        okText={modalMode.type === "create" ? "Create User" : "Update Profile"}
        okButtonProps={{
          className: "bg-slate-900 font-bold h-10 px-8 rounded-lg",
        }}
        width={450}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="mt-6"
          requiredMark={false}
        >
          <div className="grid grid-cols-2 gap-x-2">
            <Form.Item
              name="firstName"
              label={<Label text="First Name" />}
              rules={[{ required: true }]}
            >
              <Input
                className="h-11 border-2 rounded-lg focus:border-blue-800"
                placeholder="John"
              />
            </Form.Item>
            <Form.Item
              name="lastName"
              label={<Label text="Last Name" />}
              rules={[{ required: true }]}
            >
              <Input
                className="h-11 border-2 rounded-lg focus:border-blue-800"
                placeholder="Doe"
              />
            </Form.Item>
          </div>
          <Form.Item
            name="email"
            label={<Label text="Email (Primary Key)" />}
            rules={[{ required: true, type: "email" }]}
          >
            <Input
              type="email"
              className="h-11 border-2 rounded-lg focus:border-blue-800"
              placeholder="j.doe@yamatech.com"
            />
          </Form.Item>
          <div className="grid md:grid-cols-2 gap-x-2">
            <Form.Item
              name="phoneNumber"
              label={<Label text="Phone Numeber" />}
              rules={[{ required: true }]}
            >
              <Input
                className="h-11 border-2 rounded-lg focus:border-blue-800"
                placeholder="+233 00 000 0000"
              />
            </Form.Item>
            <Form.Item
              name="role"
              label={<Label text="Clearance Level" />}
              initialValue="STAFF"
            >
              <Select
                bordered={false}
                className="h-11 border-2 rounded-lg focus:border-blue-800"
                options={[
                  { value: "STAFF", label: "STAFF PERSONNEL" },
                  { value: "ADMIN", label: "SYSTEM ADMIN" },
                ]}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* 5. Deep Intelligence Intelligence Profile */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-900 rounded-lg text-white">
              <ShieldCheck size={16} />
            </div>{" "}
            <span className="font-bold uppercase tracking-tight text-sm">
              Personnel Profile
            </span>
          </div>
        }
        placement="right"
        onClose={() => setViewUser(null)}
        open={!!viewUser}
        width={450}
        styles={{ body: { padding: 0 } }}
      >
        {viewUser && (
          <div className="flex flex-col h-full bg-[#fcfcfc]">
            <div className="p-8 bg-slate-950 text-white text-center relative overflow-hidden">
              <div className="relative z-10">
                <Avatar
                  size={90}
                  className="bg-blue-600 border-4 border-slate-800 shadow-2xl mb-4 font-bold text-3xl uppercase"
                >
                  {viewUser.firstName[0]}
                </Avatar>
                <h2 className="text-3xl font-bold uppercase tracking-tighter m-0">
                  {viewUser.firstName} {viewUser.lastName}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Tag
                    color="blue"
                    className="border-none font-bold uppercase text-[9px] px-3"
                  >
                    {viewUser.role}
                  </Tag>
                  <Tag
                    color={viewUser.passwordChanged ? "green" : "orange"}
                    className="border-none font-bold uppercase text-[9px] px-3"
                  >
                    {viewUser.passwordChanged ? "SECURE" : "AWAITING SETUP"}
                  </Tag>
                </div>
              </div>
              <Users className="absolute -right-16 -bottom-16 opacity-5 w-64 h-64 text-white" />
            </div>

            <div className="p-6 space-y-8 flex-1 overflow-y-auto">
              <section>
                <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2">
                  <UserCog size={14} className="text-blue-600" /> Infrastructure
                  Metadata
                </h4>
                <div className="space-y-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                  {/* <DetailRow
                    label="System Identifier"
                    value={viewUser.id}
                    mono
                  /> */}
                  <DetailRow
                    label="Onboarding Date"
                    value={dayjs(viewUser.createdAt).format("DD MMMM YYYY")}
                  />
                  <DetailRow
                    label="Auth Verification"
                    value={viewUser.passwordChanged ? "SUCCESS" : "PENDING"}
                    highlight={!viewUser.passwordChanged}
                  />
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2">
                  <Activity size={14} className="text-emerald-500" />{" "}
                  Communications
                </h4>
                <div className="space-y-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                  <DetailRow label="Email Address" value={viewUser.email} />
                  <DetailRow
                    label="Emergency Contact"
                    value={viewUser.phoneNumber}
                  />
                </div>
              </section>
            </div>

            <div className="mt-auto p-6 bg-white border-t border-slate-200 flex justify-between gap-4">
              <Button
                type="primary"
                className="h-10 rounded-lg font-bold bg-slate-900 border-none "
                icon={<Edit3 size={16} />}
                onClick={() => {
                  setViewUser(null);
                  handleOpenModal("edit", viewUser);
                }}
              >
                Update Profile
              </Button>
              <Popconfirm
                title="Delete all access?"
                onConfirm={() => {
                  handleDelete(viewUser.id);
                  setViewUser(null);
                }}
              >
                <Button
                  danger
                  type="primary"
                  className="h-10 rounded-lg flex items-center justify-center border-none bg-red-50 text-red-600"
                  icon={<Trash2 size={20} />}
                >
                  Delete
                </Button>
              </Popconfirm>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

// --- Helper Components ---
const Label = ({ text }: { text: string }) => (
  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
    {text}
  </span>
);

const DetailRow = ({ label, value, mono, highlight }: any) => (
  <div className="flex justify-between items-center group">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider italic">
      {label}
    </span>
    <span
      className={`text-[11px] font-bold ${mono ? "font-mono opacity-50" : ""} ${highlight ? "text-orange-500 underline" : "text-slate-800"}`}
    >
      {value}
    </span>
  </div>
);

export default UserManagement;
