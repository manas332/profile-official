import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function Home() {
  // Always redirect to /astro
  redirect("/astro");
}
