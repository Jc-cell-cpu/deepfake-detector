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
import { debounce } from "lodash"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [twoFACode, setTwoFACode] = useState("")
    const [show2FA, setShow2FA] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<React.ReactNode>("")
    const [showPassword, setShowPassword] = useState(false)
    const [formFocused, setFormFocused] = useState(false)
    const [checking2FA, setChecking2FA] = useState(false)

    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    const debouncedCheck2FA = debounce(async (email: string) => {
        if (!email.trim()) {
            setShow2FA(false)
            setChecking2FA(false)
            return
        }
        setChecking2FA(true)
        try {
            const res = await fetch("/api/check-2fa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })
            const data = await res.json()
            if (res.ok) {
                setShow2FA(data.twoFactorEnabled)
            } else {
                setShow2FA(false)
                console.error("2FA check failed:", data.error)
            }
        } catch (err) {
            console.error("Failed to check 2FA status:", err)
            setShow2FA(false)
        } finally {
            setChecking2FA(false)
        }
    }, 300)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY })
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    useEffect(() => {
        debouncedCheck2FA(email)
        return () => debouncedCheck2FA.cancel()
    }, [email])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            console.log("Attempting to sign in with:", { email, password, twoFACode, show2FA })
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
                twoFACode: show2FA ? twoFACode : undefined,
            })

            console.log("Sign-in response:", res)

            if (res?.ok) {
                console.log("Login successful, redirecting to /")
                router.push("/")
            } else if (res?.error) {
                console.log("Login error:", res.error)
                switch (res.error) {
                    case "MISSING_CREDENTIALS":
                        setError("Please provide both email and password.")
                        break
                    case "USER_NOT_FOUND":
                    case "INVALID_CREDENTIALS":
                        setError("Invalid email or password.")
                        break
                    case "2FA_REQUIRED":
                        setShow2FA(true)
                        setError("Two-factor authentication is required. Please enter your 2FA code.")
                        break
                    case "INVALID_2FA_CODE":
                        setError("Invalid 2FA code. Please try again.")
                        break
                    case "ACCOUNT_INACTIVE":
                        setError(
                            <>
                                Your account is inactive. To reactivate your account,{" "}
                                <Link href="/reactivate-account" className="text-purple-400 hover:text-purple-300 underline">
                                    click here
                                </Link>
                            </>
                        )
                        break
                    default:
                        setError("An unexpected error occurred. Please try again.")
                }
            } else {
                console.log("Unexpected sign-in response:", res)
                setError("An unexpected error occurred. Please try again.")
            }
        } catch (err) {
            console.error("Login error caught:", err)
            setError("An unexpected error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-purple-900/20 to-transparent opacity-70" />
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-950 to-transparent" />

                <motion.div
                    className="absolute inset-0 bg-gradient-radial from-purple-600/30 to-transparent"
                    style={{
                        background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.15) 0%, rgba(0, 0, 0, 0) 60%)`,
                    }}
                />
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
                                        setFormFocused(false)
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

                    <div className="mt-8 text-center text-sm text-slate-400">
                        <p>
                            By signing in, you agree to our{" "}
                            <Link href="/terms" className="text-purple-400 hover:text-purple-300 transition-colors">
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors">
                                Privacy Policy
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </motion.div>

            <div className="absolute top-10 left-10 w-20 h-20 border border-purple-500/20 rounded-full animate-pulse opacity-30"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 border border-pink-500/20 rounded-full animate-pulse opacity-30"></div>

            {checking2FA && (
                <div className="text-slate-300 text-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking 2FA status...
                </div>
            )}
        </div>
    )
}