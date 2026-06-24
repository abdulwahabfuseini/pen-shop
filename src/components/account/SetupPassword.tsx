"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, Input, Button, Typography, Spin, ConfigProvider } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ShieldCheck,
  Lock,
  User as UserIcon,
  Eraser,
  Dot,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const { Title } = Typography;

// --- Sub-component: Requirement Item ---
const PolicyItem = ({ text, isValid }: { text: string; isValid: boolean }) => (
  <div
    className={`flex items-center gap-3 transition-all duration-500 ${
      isValid ? "text-[#B8973A]" : "text-ink/30"
    }`}
  >
    {isValid ? (
      <CheckCircle2 size={14} className="animate-in zoom-in" />
    ) : (
      <Dot size={14} />
    )}
    <span className="text-[9px] font-black uppercase tracking-[0.15em]">
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

  const urlUserId = searchParams.get("id");
  const urlFirstName = searchParams.get("fn") || "Curator";
  const urlEmail = searchParams.get("em") || "Archives Identity";

  const newPassword = Form.useWatch("newPassword", form) || "";
  const confirmPassword = Form.useWatch("confirmPassword", form) || "";

  const passChecks = useMemo(
    () => ({
      length: newPassword.length >= 8,
      case: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
      number: /\d/.test(newPassword),
      symbol: /[@$!%*?&_#-]/.test(newPassword),
    }),
    [newPassword],
  );

  const isPasswordValid = Object.values(passChecks).every(Boolean);
  const isMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isTyping = newPassword.length > 0;
  const showRequirements = isTyping && !isMatch && !isConfirmFocused;

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
    const toastId = toast.loading("Encrypting archival access...");

    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword: values.newPassword,
          userId: urlUserId,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Curation failed");

      toast.success("Security Clearance Established", { id: toastId });
      router.replace("/signin");
    } catch (err: any) {
      toast.error(err.message || "Archive synchronization error", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-ink/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-ink rounded-2xl shadow-xl shadow-gold/10 mb-6">
            <Eraser className="w-6 h-6 text-gold" />
          </div>
          <h1 className="font-serif text-3xl tracking-[0.1em] text-ink uppercase">
            Novarease
          </h1>
          <p className="mt-2 text-gold text-[9px] font-black uppercase tracking-[0.4em]">
            Access Key Initialization
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-10 rounded-[2.5rem] border border-gold/10 shadow-2xl shadow-gold/5">
          <div className="mb-10 text-center">
            <h2 className="font-serif text-2xl text-ink uppercase tracking-wider">
              Establish Security
            </h2>
            <p className="mt-2 text-[11px] text-ink/40 font-medium tracking-wide uppercase">
              Greetings,{" "}
              <span className="text-gold font-bold">{urlFirstName}</span>.
              Please define your master key.
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            {/* Account Identity */}
            <Form.Item
              label={
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gold ml-1">
                  Archive ID
                </span>
              }
            >
              <Input
                disabled
                prefix={<UserIcon size={14} className="text-gold/40 mr-2" />}
                value={urlEmail}
                className="h-14 border border-gold/10 bg-cream/30 text-ink/60 rounded-2xl font-bold italic"
              />
            </Form.Item>

            {/* Password Input */}
            <Form.Item
              label={
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gold ml-1">
                  New Access Key
                </span>
              }
              name="newPassword"
              className="mb-4"
            >
              <Input.Password
                prefix={<Lock size={14} className="text-gold/40 mr-2" />}
                placeholder="Enter Secure Key"
                className="h-14 rounded-2xl border border-gold/10 bg-white hover:border-gold/40 focus:border-gold transition-all text-base font-medium"
              />
            </Form.Item>

            {/* Animated Requirements */}
            <AnimatePresence>
              {showRequirements && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="p-6 rounded-2xl border border-gold/10 bg-cream/40 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck size={14} className="text-gold" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gold">
                        Archival Encryption Policy
                      </span>
                    </div>
                    <div className="space-y-2">
                      <PolicyItem
                        text="Minimum 8 Characters"
                        isValid={passChecks.length}
                      />
                      <PolicyItem
                        text="Mixed Case Complexity"
                        isValid={passChecks.case}
                      />
                      <PolicyItem
                        text="Numeric Variable"
                        isValid={passChecks.number}
                      />
                      <PolicyItem
                        text="Symbolic Identifier (@$!%*?&)"
                        isValid={passChecks.symbol}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Confirm Password */}
            <Form.Item
              label={
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gold ml-1">
                  Verify Key
                </span>
              }
              name="confirmPassword"
              className="mb-10"
              validateStatus={confirmPassword && !isMatch ? "error" : ""}
            >
              <Input.Password
                prefix={<Lock size={14} className="text-gold/40 mr-2" />}
                placeholder="Confirm Secure Key"
                className="h-14 rounded-2xl border border-gold/10 bg-white hover:border-gold/40 focus:border-gold transition-all text-base font-medium"
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
              className="h-16 bg-ink hover:!bg-gold text-cream font-black uppercase tracking-[0.3em] text-[11px] rounded-2xl border-none shadow-xl transition-all duration-500 active:scale-95 disabled:opacity-20"
            >
              {isLoading ? "AUTHORIZING ARCHIVES..." : "Finalize Clearance"}
            </Button>
          </Form>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[9px] font-bold text-ink/30 uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} Novarease Security Protocols
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const SetupPassword = () => {
  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: "#B8973A", borderRadius: 16 },
      }}
    >
      <Suspense
        fallback={
          <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F2EB]">
            <Loader2 className="animate-spin text-gold" size={32} />
          </div>
        }
      >
        <SetupPasswordContent />
      </Suspense>
    </ConfigProvider>
  );
};

export default SetupPassword;
