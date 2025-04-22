/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Shield, Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Signup() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            await axios.post("/api/signup", { email, password, name })
            router.push("/login")
        } catch (err) {
            setError("Failed to create account. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-purple-900/20 to-transparent opacity-70" />
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-950 to-transparent" />

                {/* Glowing orbs */}
                {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                        key={`orb-${i}`}
                        className="absolute rounded-full blur-xl"
                        style={{
                            width: `${Math.random() * 300 + 100}px`,
                            height: `${Math.random() * 300 + 100}px`,
                            background: `radial-gradient(circle, rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 100 + 155)}, 0.15) 0%, rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 100 + 155)}, 0.05) 70%)`,
                            filter: "blur(8px)",
                        }}
                        initial={{
                            x: `${Math.random() * 100}%`,
                            y: `${Math.random() * 100}%`,
                            opacity: 0.1 + Math.random() * 0.3,
                        }}
                        animate={{
                            x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`, `${Math.random() * 100}%`],
                            y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`, `${Math.random() * 100}%`],
                            opacity: [0.1 + Math.random() * 0.3, 0.2 + Math.random() * 0.4, 0.1 + Math.random() * 0.3],
                        }}
                        transition={{
                            duration: Math.random() * 30 + 20,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                            ease: "easeInOut",
                        }}
                    />
                ))}

                {/* Floating particles */}
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={`particle-${i}`}
                        className="absolute rounded-full"
                        style={{
                            width: `${Math.random() * 6 + 2}px`,
                            height: `${Math.random() * 6 + 2}px`,
                            backgroundColor: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 100 + 155)}, ${0.3 + Math.random() * 0.7})`,
                            boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 100 + 155)}, 0.5)`,
                        }}
                        initial={{
                            x: `${Math.random() * 100}%`,
                            y: `${Math.random() * 100}%`,
                            scale: Math.random() * 0.5 + 0.5,
                        }}
                        animate={{
                            x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`, `${Math.random() * 100}%`],
                            y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`, `${Math.random() * 100}%`],
                            opacity: [0.4, 1, 0.4],
                        }}
                        transition={{
                            duration: Math.random() * 20 + 10,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                            ease: "easeInOut",
                        }}
                    />
                ))}
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
                                Create Account
                            </h1>
                            <p className="text-slate-300 text-center mb-8">Sign up to start detecting deepfakes</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium text-slate-300">
                                        Full Name
                                    </Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                            <User size={18} />
                                        </div>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="pl-10 bg-slate-900/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                </div>

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
                                    <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                            <Lock size={18} />
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10 bg-slate-900/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-2 text-sm text-red-200"
                                    >
                                        <AlertCircle size={16} />
                                        <span>{error}</span>
                                    </motion.div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 rounded-lg font-medium text-lg shadow-lg shadow-purple-900/30"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Creating account...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            Create Account
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </div>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-8 text-center">
                                <p className="text-slate-300">
                                    Already have an account?{" "}
                                    <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                                        Sign In
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-sm text-slate-400">
                        <p>
                            By signing up, you agree to our{" "}
                            <Link href="/terms" className="text-purple-400 hover:text-purple-300 transition-colors">
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors">
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}
