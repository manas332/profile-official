import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function Home() {
  const session = await getSession();

  // If not authenticated, redirect to login
  if (!session) {
    redirect("/login");
  }

  // Always redirect to /astro
  redirect("/astro");
}
