"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Form,
  Input,
  Button,
  Typography,
  message,
  Spin,
  ConfigProvider,
  theme as antdTheme,
} from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  ShieldCheck,
  Lock,
  User as UserIcon,
  Fingerprint,
} from "lucide-react";
import { toast } from "sonner";

const { Title } = Typography;

// --- Sub-component: Requirement Item ---
const PolicyItem = ({ text, isValid }: { text: string; isValid: boolean }) => (
  <div
    className={`flex items-center gap-2 transition-colors duration-300 ${
      isValid ? "text-emerald-500" : "text-slate-400"
    }`}
  >
    {isValid ? <CheckCircle2 size={14} /> : <Circle size={14} />}
    <span className="text-[10px] font-bold uppercase tracking-wider">
      {text}
    </span>
  </div>
);

const SetupPasswordContent = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();

  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmFocused, setIsConfirmFocused] = useState(false);

  // --- URL Parameters (From User Email Link) ---

const urlUserId = searchParams.get("id");
const urlFirstName = searchParams.get("fn") || "User";
const urlEmail = searchParams.get("em") || searchParams.get("id"); 

  // --- Form Watchers ---
  const newPassword = Form.useWatch("newPassword", form) || "";
  const confirmPassword = Form.useWatch("confirmPassword", form) || "";

  // --- Password Complexity Logic ---
  const passChecks = useMemo(
    () => ({
      length: newPassword.length >= 8,
      case: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
      number: /\d/.test(newPassword),
      symbol: /[@$!%*?&_#-]/.test(newPassword),
    }),
    [newPassword]
  );

  const isPasswordValid = Object.values(passChecks).every(Boolean);
  const isMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isTyping = newPassword.length > 0;
  const showRequirements = isTyping && !isMatch && !isConfirmFocused;

  // --- Security Gate ---
useEffect(() => {
  if (status === "authenticated" && session?.user?.passwordChanged === true) {
    router.replace("/signin");
    return;
  }
  if (status === "unauthenticated" && !urlUserId) {
    router.replace("/signin");
  }
}, [status, session, router, urlUserId]);

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    const toastId = toast.loading("Finalizing security profile...");

    try {
      // 1. Update Password in Database
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword: values.newPassword,
          userId: urlUserId,
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Update failed");

      toast.success("Security key established! Signing in...", { id: toastId });

      // 2. Auto-Login using NextAuth
      const loginResult = await signIn("credentials", {
        identifier: urlEmail,
        password: values.newPassword,
        redirect: false,
      });

      if (loginResult?.ok) {
        router.replace("/signin");
      } else {
        router.replace("/signin");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred during activation", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-slate-200/50 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="text-center mb-5">
          <div className="inline-flex relative mb-6">
            <div className="absolute inset-0 bg-blue-600 blur-xl opacity-20 animate-pulse" />
          
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tighter uppercase leading-none">
            NOVAR<span className="text-blue-600">EASE</span>
          </h1>
          <p className="mt-3 text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
            Credential Initialization
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg border-2 border-gray-200 shadow-2xl shadow-slate-200/50">
          <div className="mb-8 text-center">
            <Title level={4} className="!m-0 !font-bold uppercase tracking-tight">
              Secure Your Account
            </Title>
            <p className="mt-1 text-xs text-slate-400 font-medium">
              Hello <span className="text-blue-600 font-bold">{urlFirstName || "Personnel"}</span>, set your permanent password.
            </p>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            {/* Account Identity (Read-only) */}
            <Form.Item
              label={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Account Identity</span>}
            >
              <Input
                disabled
                prefix={<UserIcon size={14} className="text-slate-300" />}
                value={urlEmail || "Encrypted User ID"}
                className="h-12 font-bold border-slate-200 bg-slate-50 text-slate-500 rounded-xl"
              />
            </Form.Item>

            {/* Password Input */}
            <Form.Item
              label={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">New Password</span>}
              name="newPassword"
              className={showRequirements ? "mb-4" : "mb-6"}
            >
              <Input.Password
                prefix={<Lock size={14} className="text-slate-300" />}
                placeholder="Enter Password"
                className="h-12 rounded-lg border-2 border-slate-200 hover:border-blue-200 focus:border-blue-500 transition-all text-base font-semibold"
              />
            </Form.Item>

            {/* Animated Requirements Policy */}
            <AnimatePresence>
              {showRequirements && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="p-5 rounded-lg border-2 border-blue-50 bg-blue-50/30">
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldCheck size={14} className="text-blue-600" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                        Security Policy
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-y-2.5">
                      <PolicyItem text="8+ Characters" isValid={passChecks.length} />
                      <PolicyItem text="Uppercase & Lowercase" isValid={passChecks.case} />
                      <PolicyItem text="Numeric Digit" isValid={passChecks.number} />
                      <PolicyItem text="Special Symbol (@$!%*?&)" isValid={passChecks.symbol} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Confirm Password */}
            <Form.Item
              label={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Confirm Password</span>}
              name="confirmPassword"
              className="mb-6"
              validateStatus={confirmPassword && !isMatch ? "error" : ""}
            >
              <Input.Password
                prefix={<Lock size={14} className="text-slate-300" />}
                placeholder="Repeat Password"
                className="h-12 rounded-lg border-2 border-slate-200"
                onFocus={() => setIsConfirmFocused(true)}
                onBlur={() => setIsConfirmFocused(false)}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              disabled={!isPasswordValid || !isMatch || isLoading}
              className="h-12 bg-slate-900 hover:!bg-blue-600 text-white font-bold uppercase tracking-[0.2em] rounded-lg border-none shadow-lg disabled:opacity-20 transition-all active:scale-95"
            >
              {isLoading ? "AUTHORIZING..." : "Activate Account"}
            </Button>
          </Form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Yamatech Security Handshake
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// Main Export with Suspense
const SetupPassword = () => {
  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: "#2563eb", borderRadius: 16 },
      }}
    >
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-white">
            <Spin size="large" />
          </div>
        }
      >
        <SetupPasswordContent />
      </Suspense>
    </ConfigProvider>
  );
};

export default SetupPassword;