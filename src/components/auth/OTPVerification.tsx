"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

interface OTPVerificationProps {
  email: string;
  password?: string;
  name?: string;
  purpose: "signup" | "login";
  onBack: () => void;
}

export default function OTPVerification({
  email,
  password,
  name,
  purpose,
  onBack,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newOtp = pastedData.split("").concat(Array(6 - pastedData.length).fill(""));
    setOtp(newOtp.slice(0, 6));
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: otpString,
          password,
          name,
          purpose,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Verification failed");
      }

      const data = await response.json();
      
      // If Google user verified via OTP, they need to sign in via Google
      if (data.requiresGoogleSignIn || (data.message && data.message.includes("sign in via Google"))) {
        setError(null);
        // Show success message and redirect to login with Google option
        router.push("/login?verified=true&provider=google");
        return;
      }

      router.push("/astro");
      router.refresh();
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setError(err.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          We&apos;ve sent a 6-digit code to <span className="font-semibold">{email}</span>
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-14 text-center text-2xl font-semibold border-2 border-amber-light rounded-lg focus:border-amber-medium focus:outline-none focus:ring-2 focus:ring-amber-lightest"
            />
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        <Button
          variant="primary"
          className="w-full"
          onClick={handleVerify}
          disabled={loading || otp.join("").length !== 6}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>

        <button
          onClick={onBack}
          className="w-full text-sm text-amber-ink hover:opacity-80 text-center"
        >
          Back to {purpose === "signup" ? "Sign Up" : "Login"}
        </button>
      </div>
    </div>
  );
}
