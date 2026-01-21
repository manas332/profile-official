"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import OTPVerification from "./OTPVerification";

interface EmailAuthFormProps {
  mode: "signup" | "login";
}

export default function EmailAuthForm({ mode }: EmailAuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (mode === "signup" && !name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setLoading(true);

      // Send OTP
      const response = await fetch("/api/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, purpose: mode }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send OTP");
      }

      const data = await response.json();
      // Show success message
      setError(null);
      setSuccessMessage(data.message || "OTP sent! Please check your email.");
      setShowOTP(true);
      
      // Log for debugging
      console.log("OTP sent successfully:", data.message);
    } catch (err: any) {
      console.error("OTP send error:", err);
      setError(err.message || "Failed to send OTP");
      setSuccessMessage(null);
    } finally {
      setLoading(false);
    }
  };

  if (showOTP) {
    return (
      <OTPVerification
        email={email}
        password={password}
        name={name}
        purpose={mode}
        onBack={() => setShowOTP(false)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "signup" && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-black mb-1">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-black placeholder-gray-400"
            placeholder="Enter your name"
            required
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-black placeholder-gray-400"
          placeholder="Enter your email"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-black mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-black placeholder-gray-400"
          placeholder="Enter your password"
          required
          minLength={6}
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 text-center space-y-1">
          <p>{error}</p>
          <p className="text-xs text-gray-500">Please check your email address and try again.</p>
        </div>
      )}
      
      {successMessage && !showOTP && (
        <p className="text-sm text-green-600 text-center">{successMessage}</p>
      )}

      <Button
        variant="primary"
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Sending OTP..." : mode === "signup" ? "Sign Up" : "Login"}
      </Button>
    </form>
  );
}
