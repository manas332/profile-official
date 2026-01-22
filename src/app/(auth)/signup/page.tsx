import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import EmailAuthForm from "@/components/auth/EmailAuthForm";

export default async function SignUpPage() {
  const session = await getSession();

  // If already logged in, redirect to astro
  if (session) {
    redirect("/astro");
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Create Account</h1>
          <p className="text-black">Sign up to get started</p>
        </div>

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

          <EmailAuthForm mode="signup" />

          <p className="text-center text-sm text-black">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
