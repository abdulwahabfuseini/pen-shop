"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { RotateCcw, ShieldAlert, Eraser } from "lucide-react";
import { Button, Input, Statistic, type InputRef, Tag } from "antd";
import { motion, AnimatePresence } from "framer-motion";
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
      localStorage.setItem(`otp_deadline_${identifier}`, newDeadline.toString());
      setCanResend(false);
    }
  }, [identifier, router]);

  const isOtpComplete = otp.every((digit) => digit !== "");

  const maskEmail = (em: string | null) => {
    if (!em) return "your official email";
    const [name, domain] = em.split("@");
    return `${name.substring(0, 3)}***@${domain}`;
  };

  const handleChange = (index: number, value: string) => {
    const lastChar = value.substring(value.length - 1);
    if (isNaN(Number(lastChar))) return;
    const newOtp = [...otp];
    newOtp[index] = lastChar;
    setOtp(newOtp);
    if (lastChar && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
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
        toast.success("Security Clearance Reset", { description: "A new token has been dispatched." });
        const newDeadline = Date.now() + 1000 * 60 * 10;
        setDeadline(newDeadline);
        localStorage.setItem(`otp_deadline_${identifier}`, newDeadline.toString());
        setCanResend(false);
      }
    } catch (error) {
      toast.error("Protocol Error", { description: "Failed to regenerate token." });
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async () => {
    if (!isOtpComplete) return;
    const target = searchParams.get("target");
    setLoading(true);
    setErrors("");

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
          toast.success("Access Authorized", { description: "Welcome back, Curator." });
          router.replace(target === "admin" ? "/admin/dashboard" : "/");
        } else {
          setErrors(result?.error || "Session handshake failed.");
        }
      } else {
        setErrors(verifyData.error || "The provided token is invalid.");
      }
    } catch (error) {
      setErrors("Security synchronization failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-ink/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-[460px] relative z-10">
        
        {/* Branding */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center justify-center p-3 bg-ink rounded-2xl shadow-xl shadow-gold/10 mb-6">
            <Eraser className="w-6 h-6 text-gold" />
          </div>
          <h1 className="font-serif text-3xl tracking-[0.1em] text-ink uppercase">
            Novarease
          </h1>
          <p className="text-gold text-[9px] font-black uppercase tracking-[0.4em] mt-2">
            Identity Authorization
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-10 rounded-[2.5rem] border border-gold/10 shadow-2xl shadow-gold/5 relative overflow-hidden">
          
          <AnimatePresence>
            {errors && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-100 p-4 mb-8 rounded-2xl flex items-center gap-4"
              >
                <ShieldAlert className="text-red-600 shrink-0" size={18} />
                <div>
                  <p className="text-red-800 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Authorization Denied</p>
                  <p className="text-red-700 text-xs font-medium">{errors}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-5 bg-cream/40 border border-gold/10 rounded-2xl mb-10 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-ink/30 mb-1">
                Active Session
              </span>
              <span className="text-sm font-black text-ink">
                {firstName} {lastName}
              </span>
            </div>
            <Tag className="m-0 border-gold/20 bg-white text-gold font-black uppercase text-[8px] px-3 py-0.5 rounded-full tracking-tighter shadow-sm">
              ENCRYPTED
            </Tag>
          </div>

          <div className="text-center mb-10">
            <p className="text-xs text-ink/50 font-medium uppercase tracking-widest leading-relaxed">
              Enter the 6-digit access token <br /> 
              dispatched to <span className="text-gold font-bold">{maskEmail(email)}</span>
            </p>
          </div>

          <div className="flex justify-center gap-3 mb-10">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="h-16 w-full sm:h-20 sm:w-16 text-center font-serif text-3xl rounded-2xl border border-gold/10 transition-all bg-white hover:border-gold/40 focus:border-gold shadow-sm"
              />
            ))}
          </div>

          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={loading || !isOtpComplete}
            className="w-full h-16 bg-ink hover:!bg-gold text-cream font-black text-[11px] tracking-[0.3em] uppercase rounded-2xl border-none shadow-xl transition-all duration-500 active:scale-95 disabled:opacity-20"
          >
            {loading ? "VALIDATING..." : "Authorize Access"}
          </Button>

          <div className="mt-10 text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-[10px] font-black text-gold uppercase tracking-[0.2em] flex items-center gap-2 mx-auto hover:text-ink transition-colors"
              >
                <RotateCcw size={12} />
                {resending ? "Generating..." : "Request New Token"}
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="text-[9px] font-bold text-ink/30 uppercase tracking-[0.3em]">Next token available in</span>
                {deadline > 0 && (
                  <div className="flex items-center gap-2 bg-cream/40 px-4 py-1.5 rounded-full border border-gold/10">
                    <Countdown
                      value={deadline}
                      onFinish={() => setCanResend(true)}
                      format="mm:ss"
                      valueStyle={{ fontSize: "12px", fontWeight: "900", color: "#B8973A", letterSpacing: "1px" }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-12">
            <p className="text-[9px] font-bold text-ink/30 uppercase tracking-[0.3em] leading-relaxed">
              © {new Date().getFullYear()} Novarease Security Protocols
              <br/>
              Session ID: <span className="text-gold/40 font-mono italic">{identifier?.slice(0, 12)}</span>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Verification;