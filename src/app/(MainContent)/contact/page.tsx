"use client"

import { motion } from "framer-motion"
import { Mail, MessageSquare, Phone, MapPin, Send } from 'lucide-react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export default function Contact() {
    const [formState, setFormState] = useState({
        name: "",
        email: "",
        message: "",
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate form submission
        setTimeout(() => {
            setIsSubmitting(false)
            setSubmitted(true)
            setFormState({ name: "", email: "", message: "" })

            // Reset success message after 5 seconds
            setTimeout(() => setSubmitted(false), 5000)
        }, 1500)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormState({
            ...formState,
            [e.target.name]: e.target.value,
        })
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
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                            Contact Us
                        </h1>
                        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                            Have questions or feedback? We&apos;d love to hear from you.
                        </p>
                    </motion.div>

                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                            {/* Contact Form */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                            >
                                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 md:p-8 shadow-xl">
                                    <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>

                                    {submitted ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-green-500/20 border border-green-500/30 rounded-lg p-6 text-center"
                                        >
                                            <div className="flex justify-center mb-4">
                                                <div className="rounded-full bg-green-500/20 p-3">
                                                    <Send className="h-6 w-6 text-green-400" />
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-medium mb-2">Message Sent!</h3>
                                            <p className="text-slate-300">
                                                Thank you for reaching out. We&apos;ll get back to you as soon as possible.
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
                                                    Your Name
                                                </label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={formState.name}
                                                    onChange={handleChange}
                                                    className="bg-slate-900/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                                                    placeholder="John Doe"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                                                    Email Address
                                                </label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={formState.email}
                                                    onChange={handleChange}
                                                    className="bg-slate-900/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                                                    placeholder="your@email.com"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-1">
                                                    Message
                                                </label>
                                                <Textarea
                                                    id="message"
                                                    name="message"
                                                    value={formState.message}
                                                    onChange={handleChange}
                                                    className="bg-slate-900/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500 min-h-[150px]"
                                                    placeholder="How can we help you?"
                                                    required
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 rounded-lg font-medium shadow-lg shadow-purple-900/30"
                                            >
                                                {isSubmitting ? (
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
                                                        Sending...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center">
                                                        Send Message
                                                        <Send className="ml-2 h-5 w-5" />
                                                    </div>
                                                )}
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            </motion.div>

                            {/* Contact Info */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="space-y-8"
                            >
                                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 md:p-8 shadow-xl">
                                    <h2 className="text-2xl font-semibold mb-6">Get in touch</h2>

                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="rounded-full bg-purple-500/20 p-3 mt-1">
                                                <Mail className="h-5 w-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium mb-1">Email</h3>
                                                <a
                                                    href="mailto:support@deepfakedetector.com"
                                                    className="text-purple-400 hover:text-purple-300 transition-colors"
                                                >
                                                    support@DefakeZone.com
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="rounded-full bg-purple-500/20 p-3 mt-1">
                                                <Phone className="h-5 w-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium mb-1">Phone</h3>
                                                <p className="text-slate-300">+91 9348506369</p>
                                                <p className="text-sm text-slate-400">Monday-Friday, 9AM-5PM EST</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="rounded-full bg-purple-500/20 p-3 mt-1">
                                                <MapPin className="h-5 w-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium mb-1">Location</h3>
                                                <p className="text-slate-300">New Delhi</p>
                                                <p className="text-slate-300">India</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 md:p-8 shadow-xl">
                                    <h2 className="text-2xl font-semibold mb-6">FAQ</h2>
                                    <p className="text-slate-300 mb-4">
                                        Have general questions about our service?
                                    </p>
                                    <Link href="/faq">
                                        <Button
                                            variant="default"
                                            className="w-full border-purple-500/50 text-white hover:bg-purple-500/10"
                                        >
                                            <MessageSquare className="mr-2 h-4 w-4" />
                                            Visit our FAQ
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
