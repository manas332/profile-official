import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import EmailAuthForm from "@/components/auth/EmailAuthForm";
import VerifiedMessage from "@/components/auth/VerifiedMessage";

export default async function LoginPage() {
  const session = await getSession();

  // If already logged in, redirect to astro
  if (session) {
    redirect("/astro");
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Welcome Back</h1>
          <p className="text-black">Sign in to continue to your account</p>
        </div>

        <VerifiedMessage />

        <div className="space-y-6">
          <GoogleSignInButton />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-black">Or continue with email</span>
            </div>
          </div>

          <EmailAuthForm mode="login" />

          <p className="text-center text-sm text-black">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
