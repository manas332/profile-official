"use client";

import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { Hub } from "aws-amplify/utils";
import { fetchAuthSession } from "aws-amplify/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "@aws-amplify/ui-react/styles.css";

function AuthenticatorContent() {
  const router = useRouter();
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  useEffect(() => {


    // If already authenticated, redirect
    if (authStatus === "authenticated") {
      syncUserAndRedirect();
    }
  }, [authStatus]);

  useEffect(() => {
    // Listen for auth events to sync user to DynamoDB
    const unsubscribe = Hub.listen("auth", async ({ payload }) => {


      if (payload.event === "signedIn" || payload.event === "signInWithRedirect") {
        await syncUserAndRedirect();
      }
    });

    return () => unsubscribe();
  }, []);

  const syncUserAndRedirect = async () => {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      if (idToken) {
        // Sync user to DynamoDB
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
      }

      // Force hard redirect to ensure state is cleared and new session is picked up
      window.location.href = "/astro";
    } catch (error) {
      console.error("Error syncing user:", error);
      window.location.href = "/astro";
    }
  };

  if (authStatus === "authenticated") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Welcome</h1>
          <p className="text-gray-600">Sign in or create an account to continue</p>
        </div>

        <Authenticator
          socialProviders={["google"]}
          formFields={{
            signUp: {
              name: {
                label: "Full Name",
                placeholder: "Enter your full name",
                required: true,
                order: 1,
              },
              email: {
                label: "Email",
                placeholder: "Enter your email",
                order: 2,
              },
              password: {
                label: "Password",
                placeholder: "Create a password",
                order: 3,
              },
            },
            signIn: {
              username: {
                label: "Email",
                placeholder: "Enter your email",
              },
              password: {
                label: "Password",
                placeholder: "Enter your password",
              },
            },
          }}
          components={{
            Header() {
              return null; // We have our own header above
            },
          }}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <AuthenticatorContent />;
}
