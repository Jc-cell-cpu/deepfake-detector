/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Shield, Mail, Lock, ArrowRight, AlertCircle, Fingerprint, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { debounce } from "lodash";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [twoFACode, setTwoFACode] = useState("");
    const [show2FA, setShow2FA] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<React.ReactNode>("");
    const [showPassword, setShowPassword] = useState(false);
    const [formFocused, setFormFocused] = useState(false);
    const [checking2FA, setChecking2FA] = useState(false);

    // For the animated background
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    // Check 2FA status when email changes
    useEffect(() => {
        const check2FA = async () => {
            if (!email) {
                setShow2FA(false);
                setChecking2FA(false);
                return;
            }
            setChecking2FA(true);
            try {
                const res = await fetch("/api/check-2fa", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });
                const data = await res.json();
                if (res.ok) {
                    setShow2FA(data.twoFactorEnabled);
                } else {
                    setShow2FA(false);
                }
            } catch (err) {
                console.error("Failed to check 2FA status:", err);
                setShow2FA(false);
            } finally {
                setChecking2FA(false);
            }
        };
        check2FA();
    }, [email]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
                twoFACode: show2FA ? twoFACode : undefined,
            });

            if (res?.ok) {
                router.push("/"); // Redirect on success
            } else if (res?.error) {
                switch (res.error) {
                    case "MISSING_CREDENTIALS":
                        setError("Please provide both email and password.");
                        break;
                    case "USER_NOT_FOUND":
                    case "INVALID_CREDENTIALS":
                        setError("Invalid email or password.");
                        break;
                    case "2FA_REQUIRED":
                        setShow2FA(true);
                        setError("Two-factor authentication is required. Please enter your 2FA code.");
                        break;
                    case "INVALID_2FA_CODE":
                        setError("Invalid 2FA code. Please try again.");
                        break;
                    case "ACCOUNT_INACTIVE":
                        setError(
                            <>
                                Your account is inactive. To reactivate your account,{" "}
                                <Link href="/reactivate-account" className="text-purple-400 hover:text-purple-300 underline">
                                    click here
                                </Link>.
                            </>
                        );
                        break;
                    default:
                        setError("An unexpected error occurred. Please try again.");
                }
            } else {
                setError("An unexpected error occurred. Please try again.");
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

                {/* Animated gradient background that follows mouse */}
                <motion.div
                    className="absolute inset-0 bg-gradient-radial from-purple-600/30 to-transparent"
                    style={{
                        background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.15) 0%, rgba(0, 0, 0, 0) 60%)`,
                    }}
                />

                {/* Floating orbs */}
                {/* {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-purple-500/10"
                        initial={{
                            width: Math.random() * 300 + 50,
                            height: Math.random() * 300 + 50,
                            x: Math.random() * 100 - 50 + "%",
                            y: Math.random() * 100 - 50 + "%",
                            opacity: 0.1 + Math.random() * 0.2,
                        }}
                        animate={{
                            x: Math.random() * 100 - 50 + "%",
                            y: Math.random() * 100 - 50 + "%",
                            opacity: [0.1 + Math.random() * 0.2, 0.2 + Math.random() * 0.3, 0.1 + Math.random() * 0.2],
                        }}
                        transition={{
                            duration: Math.random() * 20 + 10,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                        }}
                    />
                ))} */}
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
                    <div
                        className={`bg-slate-800/50 backdrop-blur-md border ${formFocused ? "border-purple-500/50" : "border-slate-700/50"} rounded-2xl shadow-xl overflow-hidden transition-all duration-300`}
                    >
                        <div
                            className={`h-1 w-full bg-gradient-to-r from-purple-600 to-pink-600 transform origin-left transition-transform duration-500 ease-out ${formFocused ? "scale-x-100" : "scale-x-0"}`}
                        />

                        <div className="p-8">
                            <h1 className="text-3xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                                Welcome Back
                            </h1>
                            <p className="text-slate-300 text-center mb-8">Sign in to your account to continue</p>

                            <form
                                onSubmit={handleLogin}
                                className="space-y-6"
                                onFocus={() => setFormFocused(true)}
                                onBlur={(e) => {
                                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                        setFormFocused(false);
                                    }
                                }}
                            >
                                <AnimatePresence mode="wait">
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-2 text-sm text-red-200"
                                        >
                                            <AlertCircle size={16} />
                                            <span>{error}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

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

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                                            Password
                                        </Label>
                                        <Link
                                            href="/forgot-password"
                                            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                            <Lock size={18} />
                                        </div>
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10 pr-10 bg-slate-900/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-300"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {show2FA && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-2"
                                        >
                                            <Label htmlFor="twoFACode" className="text-sm font-medium text-slate-300">
                                                Two-Factor Authentication Code
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                                    <Fingerprint size={18} />
                                                </div>
                                                <Input
                                                    id="twoFACode"
                                                    type="text"
                                                    value={twoFACode}
                                                    onChange={(e) => setTwoFACode(e.target.value)}
                                                    className="pl-10 bg-slate-900/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                                                    placeholder="Enter 6-digit code"
                                                    maxLength={6}
                                                    required={show2FA}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 rounded-lg font-medium text-lg shadow-lg shadow-purple-900/30"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Signing in...
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center">
                                                Sign In
                                                <ArrowRight className="ml-2 w-5 h-5" />
                                            </div>
                                        )}
                                    </Button>
                                </motion.div>
                            </form>

                            <div className="mt-8 text-center">
                                <p className="text-slate-300">
                                    Don't have an account?{" "}
                                    <Link href="/signup" className="text-purple-400 hover:text-purple-300 transition-colors">
                                        Sign Up
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Social login options */}
                    {/* <div className="mt-8">
                        <div className="relative flex items-center justify-center">
                            <div className="border-t border-slate-700/50 w-full absolute"></div>
                            <span className="bg-slate-900 px-4 text-sm text-slate-400 relative z-10">Or continue with</span>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex justify-center items-center py-2.5 px-4 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/50 transition-colors"
                            >
                                <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.0003 2C6.47731 2 2.00031 6.477 2.00031 12C2.00031 16.991 5.65731 21.128 10.4383 21.879V14.89H7.89831V12H10.4383V9.797C10.4383 7.291 11.9323 5.907 14.2153 5.907C15.3103 5.907 16.4543 6.102 16.4543 6.102V8.562H15.1923C13.9503 8.562 13.5623 9.333 13.5623 10.124V12H16.3363L15.8933 14.89H13.5623V21.879C18.3433 21.129 22.0003 16.99 22.0003 12C22.0003 6.477 17.5233 2 12.0003 2Z" />
                                </svg>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex justify-center items-center py-2.5 px-4 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/50 transition-colors"
                            >
                                <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.167 8.839 21.65C9.339 21.75 9.5 21.442 9.5 21.177C9.5 20.943 9.492 20.053 9.489 19.192C6.726 19.79 6.139 17.819 6.139 17.819C5.684 16.665 5.029 16.356 5.029 16.356C4.121 15.727 5.098 15.74 5.098 15.74C6.101 15.812 6.639 16.786 6.639 16.786C7.535 18.294 8.969 17.868 9.519 17.611C9.619 17.001 9.889 16.575 10.189 16.341C7.979 16.103 5.659 15.272 5.659 11.5C5.659 10.39 6.059 9.484 6.659 8.778C6.549 8.525 6.199 7.51 6.759 6.138C6.759 6.138 7.599 5.869 9.479 7.159C10.29 6.938 11.15 6.827 12 6.823C12.85 6.827 13.71 6.938 14.52 7.159C16.4 5.868 17.24 6.138 17.24 6.138C17.8 7.51 17.45 8.525 17.34 8.778C17.94 9.484 18.34 10.39 18.34 11.5C18.34 15.283 16.02 16.1 13.8 16.333C14.17 16.625 14.5 17.2 14.5 18.079C14.5 19.329 14.49 20.85 14.49 21.177C14.49 21.445 14.65 21.755 15.16 21.65C19.135 20.165 22 16.418 22 12C22 6.477 17.523 2 12 2Z" />
                                </svg>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex justify-center items-center py-2.5 px-4 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/50 transition-colors"
                            >
                                <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M21.35 11.1H12.18V13.83H18.69C18.36 17.64 15.19 19.27 12.19 19.27C8.36 19.27 5.22 16.25 5.22 12.27C5.22 8.29 8.36 5.27 12.19 5.27C15.68 5.27 17.16 7.13 17.16 7.13L19 5.27C19 5.27 16.71 2.63 12.18 2.63C6.84 2.63 2.85 7.06 2.85 12.27C2.85 17.48 6.84 21.91 12.18 21.91C17.71 21.91 21.35 18.4 21.35 13.24C21.35 12.24 21.35 11.1 21.35 11.1Z" />
                                </svg>
                            </motion.button>
                        </div>
                    </div> */}

                    <div className="mt-8 text-center text-sm text-slate-400">
                        <p>
                            By signing in, you agree to our{" "}
                            <Link href="/terms" className="text-purple-400 hover:text-purple-300 transition-colors">
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors">
                                Privacy Policy
                            </Link>.
                        </p>
                    </div>
                </motion.div>
            </motion.div>

            {/* Decorative elements */}
            <div className="absolute top-10 left-10 w-20 h-20 border border-purple-500/20 rounded-full animate-pulse opacity-30"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 border border-pink-500/20 rounded-full animate-pulse opacity-30"></div>

            {checking2FA && (
                <div className="text-slate-300 text-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking 2FA status...
                </div>
            )}
        </div>
    );
}