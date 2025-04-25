"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle, DollarSign, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"

export default function Pricing() {
    const [mounted, setMounted] = useState(false)
    const ref = useRef(null)

    // Precompute animation data for background elements
    const [animationData, setAnimationData] = useState<{
        particles: { x: string; y: string; scale: number; color: string; shadow: string }[]
        shapes: { x: string; y: string; rotate: number; opacity: number; clipPath: string; size: number }[]
    }>({
        particles: [],
        shapes: [],
    })

    useEffect(() => {
        setMounted(true)

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
    }, [])

    return (
        <div className="min-h-screen flex flex-col bg-slate-950 text-white">
            {/* Hero Section */}
            <section ref={ref} className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-20">
                {/* Animated background elements */}
                <div className="absolute inset-0 z-0 bg-slate-950">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent opacity-70" />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950 to-transparent" />

                    {/* Floating particles */}
                    {mounted &&
                        animationData.particles.map((particle, i) => (
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

                    {/* Geometric shapes */}
                    {mounted &&
                        animationData.shapes.map((shape, i) => (
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
                        <DollarSign className="h-16 w-16 text-purple-500" />
                    </motion.div>

                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 leading-tight">
                        Pricing Plans for Every Need
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        Choose the perfect plan to start detecting deepfakes with DefakeZone’s advanced AI technology.
                    </p>
                </motion.div>
            </section>

            {/* Pricing Cards Section */}
            <section className="py-24 px-4 bg-slate-950 relative">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Free Plan",
                                description: "Get started with limited usage quotas to explore DefakeZone’s capabilities.",
                                price: "Free",
                                features: [
                                    "Limited image uploads per month",
                                    "Basic deepfake detection",
                                    "Standard support",
                                ],
                                buttonText: "Get Started",
                                buttonLink: "/faq",
                                delay: 0,
                                highlight: false,
                            },
                            {
                                title: "Pro Plan",
                                description: "Unlock higher usage quotas and advanced features for serious users.",
                                price: "See Details",
                                priceLink: "/faq",
                                features: [
                                    "Higher usage quotas",
                                    "Advanced deepfake detection",
                                    "Priority support",
                                    "Access on multiple platforms",
                                ],
                                buttonText: "Learn More",
                                buttonLink: "/faq",
                                delay: 0.2,
                                highlight: true,
                            },
                            {
                                title: "Enterprise Plan",
                                description: "Custom solutions for businesses with API access and dedicated support.",
                                price: "Contact Sales",
                                priceLink: "/contact",
                                features: [
                                    "Unlimited usage",
                                    "API access",
                                    "Dedicated support",
                                    "Custom integrations",
                                ],
                                buttonText: "Contact Sales",
                                buttonLink: "/contact",
                                delay: 0.4,
                                highlight: false,
                            },
                        ].map((plan, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ delay: plan.delay, duration: 0.6 }}
                            >
                                <Card
                                    className={`bg-slate-800/70 border-slate-700/50 backdrop-blur-md shadow-xl h-full relative ${plan.highlight ? "border-purple-500/50 shadow-purple-900/30" : ""
                                        }`}
                                >
                                    {plan.highlight && (
                                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                                                Most Popular
                                            </span>
                                        </div>
                                    )}
                                    <CardHeader>
                                        <CardTitle className="text-2xl font-bold text-white">{plan.title}</CardTitle>
                                        <CardDescription className="text-slate-300">{plan.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-start space-y-4">
                                        <div className="text-3xl font-bold mb-4">
                                            {plan.priceLink ? (
                                                <Link
                                                    href={plan.priceLink}
                                                    className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 hover:underline"
                                                >
                                                    {plan.price}
                                                </Link>
                                            ) : (
                                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                                                    {plan.price}
                                                </span>
                                            )}
                                        </div>
                                        <ul className="space-y-2 mb-6">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-center text-slate-300">
                                                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <Link href={plan.buttonLink} className="w-full">
                                            <Button
                                                className={`w-full ${plan.highlight
                                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                                    : "border-purple-500/50 text-white hover:bg-purple-500/10"
                                                    } py-4 rounded-lg font-medium shadow-lg ${plan.highlight ? "shadow-purple-900/30" : ""
                                                    }`}
                                            >
                                                {plan.buttonText}
                                                <ArrowRight className="ml-2 w-5 h-5" />
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 bg-slate-950 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-slate-950/10 z-0" />

                <div className="container mx-auto max-w-5xl relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-2xl p-12 backdrop-blur-md shadow-xl"
                    >
                        <div className="text-center mb-10">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Detect Deepfakes?</h2>
                            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                                Choose a plan and start using DefakeZone’s advanced AI technology today.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/signup">
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 px-8 rounded-lg font-medium text-lg shadow-lg shadow-purple-900/30"
                                >
                                    Get Started Free
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button
                                    variant="default"
                                    size="lg"
                                    className="border-purple-500/50 text-white hover:bg-purple-500/10 py-6 px-8 rounded-lg font-medium text-lg"
                                >
                                    Contact Sales
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}