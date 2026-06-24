"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { RotateCcw, ArrowRight, TriangleAlert } from "lucide-react";
import { Button, Input, Statistic, type InputRef, Tag } from "antd";
import { motion } from "framer-motion";
import { toast } from "sonner";

const { Countdown } = Statistic;

const Verification = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const identifier = searchParams.get("id");
  const firstName = searchParams.get("fn");
  const lastName = searchParams.get("ln");
  const email = searchParams.get("em");

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(InputRef | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [errors, setErrors] = useState("");
  const [attemptMsg, setAttemptMsg] = useState("");

  const [deadline, setDeadline] = useState<number>(0);

  useEffect(() => {
    if (!identifier) {
      router.replace("/signin");
      return;
    }

    const savedDeadline = localStorage.getItem(`otp_deadline_${identifier}`);
    const now = Date.now();

    if (savedDeadline && parseInt(savedDeadline) > now) {
      setDeadline(parseInt(savedDeadline));
      setCanResend(false);
    } else {
      const newDeadline = now + 1000 * 60 * 10;
      setDeadline(newDeadline);
      localStorage.setItem(
        `otp_deadline_${identifier}`,
        newDeadline.toString(),
      );
      setCanResend(false);
    }
  }, [identifier, router]);

  const isOtpComplete = otp.every((digit) => digit !== "");

  const maskEmail = (em: string | null) => {
    if (!em) return "your official email";
    const [name, domain] = em.split("@");
    return `${name.substring(0, 5)}***@${domain}`;
  };

  const handleChange = (index: number, value: string) => {
    const lastChar = value.substring(value.length - 1);
    if (isNaN(Number(lastChar))) return;
    const newOtp = [...otp];
    newOtp[index] = lastChar;
    setOtp(newOtp);
    if (lastChar && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && isOtpComplete) {
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    const digits = pastedData.replace(/\D/g, "").split("").slice(0, 6);
    if (digits.length === 0) return;
    const newOtp = [...otp];
    digits.forEach((digit, index) => {
      if (index < 6) newOtp[index] = digit;
    });
    setOtp(newOtp);
    const nextFocusIndex = digits.length < 6 ? digits.length : 5;
    inputRefs.current[nextFocusIndex]?.focus();
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch("/api/auth/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      if (res.ok) {
        toast.success("New security code sent.");
        const newDeadline = Date.now() + 1000 * 60 * 10;
        setDeadline(newDeadline);
        localStorage.setItem(
          `otp_deadline_${identifier}`,
          newDeadline.toString(),
        );
        setCanResend(false);
      }
    } catch (error) {
      toast.error("Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async () => {
    if (!isOtpComplete) return;
    const target = searchParams.get("target");
    setLoading(true);
    setErrors("");
    setAttemptMsg("");

    try {
      const verifyRes = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, code: otp.join("") }),
      });
      const verifyData = await verifyRes.json();

      if (verifyRes.ok) {
        const result = await signIn("credentials", {
          identifier,
          password: "VERIFIED_VIA_CODE",
          redirect: false,
        });

        if (result?.ok) {
          localStorage.removeItem(`otp_deadline_${identifier}`);
          toast.success("Identity validated.");
          if (target === "admin") {
            router.replace("/admin-dashboard");
          } else {
            router.replace("/");
          }
        } else {
          setErrors(result?.error || "Session initialization failed.");
        }
      } else {
        setErrors(verifyData.error || "Invalid or expired code.");
      }
    } catch (error) {
      setErrors("Security protocol error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:min-h-screen transition-colors duration-300 flex flex-col py-16 items-start md:pt-0 md:items-center justify-center p-4 md:bg-[#f8fafc]">
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center mb-6 text-center">
          <h2 className="text-xl font-bold uppercase mt-4 text-[#1e3a8a]">
            Identity Validation
          </h2>
          <h4 className="text-sm font-black uppercase text-gray-400">
            NOVEREASE Security
          </h4>
        </div>

        <div className="py-5 px-5 md:px-8 rounded-2xl shadow-sm border-2 transition-colors duration-300 bg-white border-grey">
          {/* Security Alert Box */}
          {errors && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-1">
                <TriangleAlert className="text-red-600" size={16} />
                <span className="font-black text-red-800 uppercase text-[10px]">
                  Security Warning
                </span>
              </div>
              <p className="text-red-700 text-xs font-bold mb-0.5">{errors}</p>
              {attemptMsg && (
                <p className="text-red-600 text-[10px] italic m-0">
                  {attemptMsg}
                </p>
              )}
            </motion.div>
          )}

          <div className="border rounded-xl py-4 px-2.5 mb-6 flex items-center justify-between bg-slate-50 border-grey">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase  text-slate-400">
                Verifying Session:
              </span>
              <span className="text-sm font-black capitalize text-slate-700">
                {firstName} {lastName}
              </span>
            </div>
            <Tag
              color="blue"
              className="m-0 border-none font-bold uppercase text-[10px]"
            >
              SECURE
            </Tag>
          </div>

          <p className="text-base text-center mb-5">
            Enter the 6-digit token sent to <br />
            <span className="text-brown font-semibold">{maskEmail(email)}</span>
          </p>

          <div className="flex justify-center gap-2 mb-8">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="h-16 w-full sm:h-20 sm:w-14 text-center font-black text-3xl rounded-xl border-2 transition-all bg-white border-slate-200 focus:border-[#1e3a8a]"
              />
            ))}
          </div>

          <Button
            type="primary"
            htmlType="submit"
            onClick={handleSubmit}
            loading={loading}
            disabled={loading || !isOtpComplete}
            className="w-full h-12 bg-brown hover:bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-3 border-none"
          >
            {loading ? "Validating..." : "Validate Identity"}
            <ArrowRight size={18} />
          </Button>

          <div className="mt-8 text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-xs font-bold text-amber-600 flex items-center gap-2 mx-auto hover:opacity-80"
              >
                <RotateCcw size={14} />
                {resending ? "Sending..." : "Resend Code"}
              </button>
            ) : (
              <div className="text-[10px] font-bold flex items-center justify-center gap-2 text-slate-400">
                New code available in
                {deadline > 0 && (
                  <Countdown
                    value={deadline}
                    onFinish={() => setCanResend(true)}
                    format="mm:ss"
                    valueStyle={{
                      fontSize: "11px",
                      fontWeight: "900",
                      color: "#1e3a8a",
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verification;
