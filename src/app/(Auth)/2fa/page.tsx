/* eslint-disable @typescript-eslint/no-unused-vars */
// app/auth/2fa/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function TwoFAVerification() {
    const { data: session, update } = useSession();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (session && !session.user?.twoFactorEnabled) {
            window.location.href = "/"; // Redirect if 2FA not required
        }
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const result = await signIn("credentials", {
            redirect: false,
            email,
            password: "", // Password already verified, only need 2FA
            twoFACode: code,
        });

        if (result?.error) {
            setError("Invalid 2FA code. Please try again.");
        } else {
            await update(); // Refresh session
            window.location.href = "/"; // Redirect to home or profile
        }

        setIsSubmitting(false);
    };

    if (!session?.user?.twoFactorEnabled) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-md border-slate-700/50">
                <CardHeader className="text-center">
                    <CardTitle className="text-white">Two-Factor Authentication</CardTitle>
                    <CardDescription>Enter the 6-digit code from your authenticator app</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-2 text-sm text-red-200">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="twoFACode" className="text-sm font-medium text-slate-300">
                                Verification Code
                            </Label>
                            <Input
                                id="twoFACode"
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Enter 6-digit code"
                                className="bg-slate-900/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                                maxLength={6}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={code.length !== 6 || isSubmitting}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium"
                        >
                            {isSubmitting ? "Verifying..." : "Verify"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
