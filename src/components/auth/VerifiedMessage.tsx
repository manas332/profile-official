"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifiedMessage() {
  const searchParams = useSearchParams();
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const verified = searchParams.get("verified");
    const provider = searchParams.get("provider");
    if (verified === "true" && provider === "google") {
      setShowMessage(true);
      // Clear the query params from URL after showing message
      setTimeout(() => {
        window.history.replaceState({}, "", "/login");
      }, 100);
    }
  }, [searchParams]);

  if (!showMessage) return null;

  return (
    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-sm text-green-800 text-center">
        ✓ Email verified successfully! Please sign in via Google to continue.
      </p>
    </div>
  );
}
