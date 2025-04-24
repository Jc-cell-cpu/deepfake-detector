/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Shield, Mail, Code, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ReactivateAccountPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [step, setStep] = useState<"request" | "verify">("request");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        // Check for empty email
        if (!email) {
            setError("Email is required.");
            setLoading(false);
            return;
        }

        // Validate email format
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            setLoading(false);
            return;
        }

        // Log the email being sent for debugging
        console.log("Sending reactivation request with email:", email);

        try {
            const res = await fetch("/api/reactivate-account/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess("A reactivation code has been sent to your email.");
                setStep("verify");
            } else {
                setError(data.message || "Failed to send reactivation code.");
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch("/api/reactivate-account/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code }),
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess("Your account has been reactivated! Redirecting to login...");
                setTimeout(() => router.push("/login"), 2000);
            } else {
                setError(data.message || "Failed to verify code.");
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-purple-900/20 to-transparent opacity-70" />
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-950 to-transparent" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 flex flex-col items-center"
            >
                <Link href="/" className="flex items-center gap-2 text-2xl font-bold mb-8">
                    <Shield className="h-8 w-8 text-purple-500" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                        Deepfake Detector
                    </span>
                </Link>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-8">
                            <h1 className="text-3xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                                Reactivate Your Account
                            </h1>
                            <p className="text-slate-300 text-center mb-8">
                                {step === "request"
                                    ? "Enter your email to receive a reactivation code."
                                    : "Enter the code sent to your email to reactivate your account."}
                            </p>

                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-2 text-sm text-red-200 mb-6"
                                    >
                                        <AlertCircle size={16} />
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="p-3 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center gap-2 text-sm text-green-200 mb-6"
                                    >
                                        <CheckCircle size={16} />
                                        <span>{success}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {step === "request" ? (
                                <form onSubmit={handleRequestCode} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium text-slate-300">
                                            Email
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                                <Mail size={18} />
                                            </div>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10 bg-slate-900/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                                                placeholder="your@email.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 rounded-lg font-medium text-lg shadow-lg shadow-purple-900/30"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Sending Code...
                                            </div>
                                        ) : (
                                            "Request Reactivation Code"
                                        )}
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyCode} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="code" className="text-sm font-medium text-slate-300">
                                            Reactivation Code
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                                <Code size={18} />
                                            </div>
                                            <Input
                                                id="code"
                                                type="text"
                                                value={code}
                                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                                className="pl-10 bg-slate-900/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                                                placeholder="Enter the 6-character code"
                                                maxLength={6}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 rounded-lg font-medium text-lg shadow-lg shadow-purple-900/30"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Verifying...
                                            </div>
                                        ) : (
                                            "Reactivate Account"
                                        )}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}