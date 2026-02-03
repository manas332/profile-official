import { redirect } from "next/navigation";
import { checkAdminSession } from "./actions";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
    const customAdminSession = await checkAdminSession();

    if (!customAdminSession) {
        redirect("/admin/login");
    }

    return <AdminDashboard />;
}
