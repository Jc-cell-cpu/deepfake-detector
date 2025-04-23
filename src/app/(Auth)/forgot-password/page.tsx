/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [step, setStep] = useState<"email" | "verify" | "reset">("email")
    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) {
            setError("Email is required")
            return
        }
        setIsSubmitting(true)
        setError(null)
        setSuccess(null)

        try {
            const res = await fetch("/api/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            if (res.ok) {
                setSuccess("Verification code sent to your email")
                setStep("verify")
            } else {
                const data = await res.json()
                setError(data.message || "Failed to send verification code")
            }
        } catch (err) {
            setError("An unexpected error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCodeVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!code.trim()) {
            setError("Verification code is required")
            return
        }
        if (code.length !== 6) {
            setError("Verification code must be 6 digits")
            return
        }
        setIsSubmitting(true)
        setError(null)
        setSuccess(null)

        try {
            const res = await fetch("/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code }),
            })

            if (res.ok) {
                setSuccess("Code verified successfully")
                setStep("reset")
            } else {
                const data = await res.json()
                setError(data.message || "Invalid or expired code")
            }
        } catch (err) {
            setError("An unexpected error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newPassword.trim() || !confirmPassword.trim()) {
            setError("Both password fields are required")
            return
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match")
            return
        }
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long")
            return
        }
        setIsSubmitting(true)
        setError(null)
        setSuccess(null)

        try {
            const res = await fetch("/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, newPassword, confirmPassword }),
            })

            if (res.ok) {
                setSuccess("Password updated successfully. Redirecting to login...")
                setTimeout(() => {
                    router.push("/login")
                }, 3000)
            } else {
                const data = await res.json()
                setError(data.message || "Failed to update password")
            }
        } catch (err) {
            setError("An unexpected error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col pt-24 pb-12">
            {/* Background elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-purple-900/20 to-transparent opacity-70" />
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-950 to-transparent" />
                {[...Array(8)].map((_, i) => (
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
                ))}
            </div>

            <main className="flex-grow relative z-10">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-8"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                            Forgot Password
                        </h1>
                        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                            Follow the steps to reset your password
                        </p>
                    </motion.div>

                    <div className="max-w-md mx-auto">
                        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-white">
                                    {step === "email" && "Enter Your Email"}
                                    {step === "verify" && "Verify Code"}
                                    {step === "reset" && "Reset Password"}
                                </CardTitle>
                                <CardDescription>
                                    {step === "email" && "We’ll send a verification code to your email"}
                                    {step === "verify" && "Enter the code sent to your email"}
                                    {step === "reset" && "Set your new password"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Status Messages */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
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
                                        className="p-3 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center gap-2 text-sm text-green-200 mb-6"
                                    >
                                        <CheckCircle size={16} />
                                        <span>{success}</span>
                                    </motion.div>
                                )}

                                {/* Step 1: Email Entry */}
                                {step === "email" && (
                                    <form onSubmit={handleEmailSubmit} className="space-y-6">
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
                                                    placeholder="Enter your email"
                                                    className="pl-10 bg-slate-900/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting || !email.trim()}
                                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium shadow-lg shadow-purple-900/30"
                                        >
                                            {isSubmitting ? "Sending..." : "Send Verification Code"}
                                        </Button>
                                    </form>
                                )}

                                {/* Step 2: Code Verification */}
                                {step === "verify" && (
                                    <form onSubmit={handleCodeVerify} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="code" className="text-sm font-medium text-slate-300">
                                                Verification Code
                                            </Label>
                                            <Input
                                                id="code"
                                                type="text"
                                                value={code}
                                                onChange={(e) => setCode(e.target.value)}
                                                placeholder="Enter 6-digit code"
                                                className="bg-slate-900/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                                                maxLength={6}
                                                required
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting || code.length !== 6}
                                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium shadow-lg shadow-purple-900/30"
                                        >
                                            {isSubmitting ? "Verifying..." : "Verify Code"}
                                        </Button>
                                    </form>
                                )}

                                {/* Step 3: Password Reset */}
                                {step === "reset" && (
                                    <form onSubmit={handlePasswordReset} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword" className="text-sm font-medium text-slate-300">
                                                New Password
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                                    <Lock size={18} />
                                                </div>
                                                <Input
                                                    id="newPassword"
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Enter new password"
                                                    className="pl-10 bg-slate-900/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
                                                Confirm Password
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                                    <Lock size={18} />
                                                </div>
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Confirm new password"
                                                    className="pl-10 bg-slate-900/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting || !newPassword.trim() || !confirmPassword.trim()}
                                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium shadow-lg shadow-purple-900/30"
                                        >
                                            {isSubmitting ? "Updating..." : "Update Password"}
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                            <CardFooter className="justify-center">
                                <Button
                                    variant="link"
                                    onClick={() => router.push("/login")}
                                    className="text-slate-400 hover:text-purple-400"
                                >
                                    Back to Login
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}