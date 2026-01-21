import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token");

  // If not authenticated, redirect to login
  if (!sessionToken) {
    redirect("/login");
  }

  // Always redirect to /astro
  redirect("/astro");
}
