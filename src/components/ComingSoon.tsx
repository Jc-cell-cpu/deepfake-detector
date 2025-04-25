/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, Mail, ArrowRight, ArrowLeft, Twitter, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"

interface ComingSoonProps {
    targetDate?: string // Optional custom target date (ISO format, e.g., "2025-05-15T00:00:00Z")
    message?: string // Optional custom message
}

export default function ComingSoon({ targetDate = "2025-05-15T00:00:00Z", message }: ComingSoonProps) {
    const [mounted, setMounted] = useState(false)
    const ref = useRef(null)
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    })

    const targetDateTime = new Date(targetDate).getTime()

    useEffect(() => {
        setMounted(true)

        const timer = setInterval(() => {
            const now = new Date().getTime()
            const distance = targetDateTime - now

            if (distance > 0) {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000),
                })
            } else {
                clearInterval(timer)
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [targetDateTime])

    // Precompute animation data for background elements
    const [animationData, setAnimationData] = useState<{
        particles: { x: string; y: string; scale: number; color: string; shadow: string }[]
        shapes: { x: string; y: string; rotate: number; opacity: number; clipPath: string; size: number }[]
    }>({
        particles: [],
        shapes: [],
    })

    useEffect(() => {
        if (mounted) {
            setAnimationData({
                particles: Array.from({ length: 20 }).map(() => ({
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    scale: Math.random() * 0.5 + 0.5,
                    color: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 100 + 155)}, ${0.3 + Math.random() * 0.7})`,
                    shadow: `0 0 ${Math.random() * 10 + 5}px rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 100 + 155)}, 0.5)`,
                })),
                shapes: Array.from({ length: 5 }).map(() => {
                    const shapes = [
                        "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
                        "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                        "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                    ]
                    return {
                        x: `${Math.random() * 100}%`,
                        y: `${Math.random() * 100}%`,
                        rotate: Math.random() * 360,
                        opacity: 0.1 + Math.random() * 0.2,
                        clipPath: shapes[Math.floor(Math.random() * shapes.length)],
                        size: Math.random() * 100 + 50,
                    }
                }),
            })
        }
    }, [mounted])

    const handleBackToHome = () => {
        window.location.href = "/"
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-950 text-white">
            {/* Hero Section */}
            <section ref={ref} className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-20">
                {/* Animated background elements */}
                <div className="absolute inset-0 z-0 bg-slate-950">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent opacity-70" />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950 to-transparent" />

                    {/* Floating particles - Render only after mount */}
                    {mounted && animationData.particles.length > 0 && animationData.particles.map((particle, i) => (
                        <motion.div
                            key={`particle-${i}`}
                            className="absolute rounded-full"
                            style={{
                                width: `${Math.random() * 6 + 2}px`,
                                height: `${Math.random() * 6 + 2}px`,
                                backgroundColor: particle.color,
                                boxShadow: particle.shadow,
                                x: particle.x,
                                y: particle.y,
                                scale: particle.scale,
                            }}
                            initial={{ opacity: 0 }}
                            animate={{
                                x: [particle.x, `${Math.random() * 100}%`, particle.x],
                                y: [particle.y, `${Math.random() * 100}%`, particle.y],
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

                    {/* Geometric shapes - Render only after mount */}
                    {mounted && animationData.shapes.length > 0 && animationData.shapes.map((shape, i) => (
                        <motion.div
                            key={`shape-${i}`}
                            className="absolute"
                            style={{
                                width: `${shape.size}px`,
                                height: `${shape.size}px`,
                                clipPath: shape.clipPath,
                                background: `linear-gradient(135deg, rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 100 + 155)}, 0.1) 0%, rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 100 + 155)}, 0.05) 100%)`,
                                border: `1px solid rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 100 + 155)}, 0.2)`,
                                x: shape.x,
                                y: shape.y,
                                rotate: shape.rotate,
                                opacity: shape.opacity,
                            }}
                            initial={{ opacity: 0 }}
                            animate={{
                                x: shape.x,
                                y: shape.y,
                                rotate: [shape.rotate, shape.rotate + 180, shape.rotate + 360],
                                opacity: [shape.opacity, 0.2 + Math.random() * 0.3, shape.opacity],
                            }}
                            transition={{
                                duration: Math.random() * 40 + 20,
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
                    transition={{ duration: 0.8 }}
                    className="container mx-auto px-4 relative z-10 text-center max-w-4xl"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="mb-8 inline-flex justify-center"
                    >
                        <Clock className="h-16 w-16 text-purple-500" />
                    </motion.div>

                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 leading-tight">
                        Coming Soon
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                        {message || "Exciting updates are on the way! DefakeZone is working hard to bring you the next big thing in deepfake detection."}
                    </p>

                    {/* <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-12">
                        {["days", "hours", "minutes", "seconds"].map((unit) => (
                            <motion.div
                                key={unit}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * (["days", "hours", "minutes", "seconds"].indexOf(unit)), duration: 0.6 }}
                                className="bg-slate-800/70 border border-slate-700/50 rounded-lg p-4 text-center"
                            >
                                <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                                    {timeLeft[unit].toString().padStart(2, "0")}
                                </div>
                                <div className="text-sm text-slate-400 uppercase">{unit}</div>
                            </motion.div>
                        ))}
                    </div> */}
                    {/* <Link href="/" className="inline-flex items-center text-white hover:text-purple-400 transition-colors mb-6">
                        <ArrowLeft className="w-6 h-6 mr-2" />
                        Back to Home
                    </Link> */}
                    <Button
                        onClick={handleBackToHome}
                        className="inline-flex items-center text-white hover:text-purple-400 transition-colors mb-6"
                        variant="default" // Use 'link' variant to mimic Link's appearance
                    >
                        <ArrowLeft className="w-6 h-6 mr-2" />
                        Back to Home
                    </Button>
                </motion.div>
            </section>

            {/* Subscription Form Section */}
            {/* <section className="py-24 px-4 bg-slate-950 relative">
                <div className="container mx-auto max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 whitespace-normal">
                            Stay Updated
                        </h2>
                        <p className="text-xl text-slate-300 max-w-xl mx-auto mb-8">
                            Subscribe to get notified when we launch. Don’t miss out!
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full sm:max-w-sm bg-slate-800/70 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <Button
                                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 rounded-lg font-medium shadow-lg shadow-purple-900/30"
                                style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                            >
                                Subscribe
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>



                    </motion.div>
                </div>
            </section> */}

            {/* CTA Section */}
            <section className="py-24 px-4 bg-slate-950 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-slate-950/10 z-0" />

                <div className="container mx-auto max-w-5xl relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-2xl p-12 backdrop-blur-md shadow-xl"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Follow Us</h2>
                        <p className="text-xl text-slate-300 max-w-xl mx-auto mb-8">
                            Stay connected for the latest updates on DefakeZone.
                        </p>
                        <div className="flex justify-center gap-6">
                            <Link href="" className="text-purple-400 hover:text-pink-500">
                                <Twitter />
                            </Link>
                            <Link href="" className="text-purple-400 hover:text-pink-500">
                                <Linkedin />
                            </Link>
                            <Link href="mailto:" className="text-purple-400 hover:text-pink-500">
                                <Mail />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}