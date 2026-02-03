"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyAdminPassword } from "../actions";
import { Lock } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminLoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await verifyAdminPassword(password);

            if (result.success) {
                router.push("/admin");
                router.refresh();
            } else {
                setError(result.message || "Invalid password");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <Card className="w-full max-w-md bg-neutral-800 border-amber-900/30">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-amber-900/20 p-3 rounded-full w-fit mb-4">
                        <Lock className="w-8 h-8 text-amber-400" />
                    </div>
                    <CardTitle className="text-2xl text-amber-100">Admin Access</CardTitle>
                    <CardDescription className="text-amber-200/60">
                        Enter the admin password to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-neutral-900/50 border-amber-900/30 text-amber-100 placeholder:text-amber-200/30 focus:border-amber-500/50"
                            />
                        </div>
                        {error && (
                            <p className="text-red-400 text-sm text-center">{error}</p>
                        )}
                        <Button
                            type="submit"
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                            disabled={loading}
                        >
                            Access Admin Panel
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
