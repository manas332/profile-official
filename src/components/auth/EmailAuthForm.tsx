"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import OTPVerification from "./OTPVerification";

interface EmailAuthFormProps {
  mode: "signup" | "login";
}

export default function EmailAuthForm({ mode }: EmailAuthFormProps) {
  const router = useRouter();
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

      if (mode === "login") {
        // For login: Try direct email/password first, or use OTP if needed
        const response = await fetch("/api/auth/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "login",
            email,
            password,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          
          // If user doesn't exist, redirect to signup
          if (response.status === 404 || data.error?.includes("not found") || data.error?.includes("No account")) {
            if (data.shouldRedirect && data.redirectTo) {
              router.push(data.redirectTo);
              return;
            }
            setError(`No account found with this email. Click here to sign up.`);
            return;
          }
          
          // If user registered via Google, show OTP option
          if (response.status === 403 && data.provider === "google" && data.allowOTP) {
            setError("You signed up via Google. You can either continue with Google sign-in or verify your email via OTP.");
            setSuccessMessage("Click the Google button above to sign in directly, or click 'Send OTP' below to verify your email.");
            // Don't auto-show OTP, let user choose
            return;
          }
          
          // For other errors (like invalid password), allow OTP as alternative
          if (response.status === 401) {
            setError(data.error || "Invalid email or password. You can also verify your email via OTP.");
            setSuccessMessage("Click 'Send OTP' below to verify your email and login.");
            return;
          }
          
          throw new Error(data.error || "Login failed");
        }

        const data = await response.json();
        // Login successful, redirect
        router.push("/astro");
        router.refresh();
      } else {
        // For signup: Send OTP first
        const response = await fetch("/api/resend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, purpose: mode }),
        });

        if (!response.ok) {
          // Check if response is JSON before parsing
          const contentType = response.headers.get("content-type");
          let errorMessage = "Failed to send OTP";
          
          if (contentType && contentType.includes("application/json")) {
            try {
              const data = await response.json();
              errorMessage = data.error || errorMessage;
              // If server suggests redirect, show error with link
              if (data.shouldRedirect && data.redirectTo) {
                const errorMsg = data.error || "Account issue detected";
                setError(`${errorMsg} Click here to ${data.redirectTo === "/signup" ? "sign up" : "login"}.`);
                setSuccessMessage(null);
                return; // Don't throw, just return early
              }
            } catch (parseError) {
              console.error("Failed to parse error response:", parseError);
              errorMessage = `Server error (${response.status}). Please try again.`;
            }
          } else {
            // Response is not JSON (likely HTML error page)
            const text = await response.text();
            console.error("Non-JSON error response:", text.substring(0, 100));
            errorMessage = `Server error (${response.status}). Please try again.`;
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        // Show success message
        setError(null);
        setSuccessMessage(data.message || "OTP sent! Please check your email.");
        setShowOTP(true);
        
        // Log for debugging
        console.log("OTP sent successfully:", data.message);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      // Only set error if we haven't already set one with redirect link
      if (!error || !error.includes("Click here")) {
        setError(err.message || (mode === "login" ? "Login failed" : "Failed to send OTP"));
      }
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
          <p>
            {error.includes("Click here") ? (
              <>
                {error.split("Click here")[0]}
                <a
                  href={error.includes("sign up") ? "/signup" : "/login"}
                  className="text-blue-600 hover:text-blue-700 font-semibold underline ml-1"
                >
                  Click here
                </a>
                {error.split("Click here")[1]}
              </>
            ) : (
              error
            )}
          </p>
          {!error.includes("Click here") && (
            <p className="text-xs text-gray-500">Please check your email address and try again.</p>
          )}
        </div>
      )}
      
      {successMessage && !showOTP && (
        <p className="text-sm text-green-600 text-center">{successMessage}</p>
      )}

      <div className="space-y-3">
        <Button
          variant="primary"
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? (mode === "login" ? "Logging in..." : "Sending OTP...") : mode === "signup" ? "Sign Up" : "Login"}
        </Button>
        
        {mode === "login" && !showOTP && (
          <button
            type="button"
            onClick={async () => {
              if (!email) {
                setError("Please enter your email address first");
                return;
              }
              
              setError(null);
              setSuccessMessage(null);
              setLoading(true);
              
              try {
                const response = await fetch("/api/resend", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ email, purpose: "login" }),
                });

                if (!response.ok) {
                  const data = await response.json();
                  throw new Error(data.error || "Failed to send OTP");
                }

                const data = await response.json();
                setError(null);
                setSuccessMessage(data.message || "OTP sent! Please check your email.");
                setShowOTP(true);
              } catch (err: any) {
                console.error("OTP send error:", err);
                setError(err.message || "Failed to send OTP");
                setSuccessMessage(null);
              } finally {
                setLoading(false);
              }
            }}
            className="w-full text-sm text-blue-600 hover:text-blue-700 underline disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !email}
          >
            Or verify via OTP instead
          </button>
        )}
      </div>
    </form>
  );
}
