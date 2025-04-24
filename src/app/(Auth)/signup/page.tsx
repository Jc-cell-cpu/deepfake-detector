/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useEffect, useState } from "react"
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

    // For the animated background
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const router = useRouter()

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

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

                {/* Animated gradient background that follows mouse */}
                <motion.div
                    className="absolute inset-0 bg-gradient-radial from-purple-600/30 to-transparent"
                    style={{
                        background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.15) 0%, rgba(0, 0, 0, 0) 60%)`,
                    }}
                />

                {/* Glowing orbs */}
                {/* {Array.from({ length: 15 }).map((_, i) => (
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
                ))} */}

                {/* Floating particles */}
                {/* {Array.from({ length: 20 }).map((_, i) => (
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
