import { redirect } from "next/navigation";

// Signup is now handled by the Authenticator component on the login page
// The Authenticator has built-in tabs for Sign In and Create Account
export default function SignUpPage() {
  redirect("/login");
}
