"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Code, Shield, Zap, Globe, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"

export default function Api() {
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

        // Only compute animation data after mounting to ensure consistency
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

    return (
        <div className="min-h-screen flex flex-col bg-slate-950 text-white">
            {/* Hero Section */}
            <section ref={ref} className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-20">
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
                        <Code className="h-16 w-16 text-purple-500" />
                    </motion.div>

                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 leading-tight">
                        Integrate DefakeZone with Our API
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        Seamlessly add deepfake detection to your applications with the DefakeZone API.
                    </p>
                </motion.div>
            </section>

            {/* API Features Section */}
            <section className="py-24 px-4 bg-slate-950 relative">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 whitespace-normal">
                                Why Use the DefakeZone API?
                            </h2>
                            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                                Enhance your applications with powerful deepfake detection capabilities.
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Seamless Integration",
                                description: "Easily integrate deepfake detection into your applications with our well-documented API.",
                                icon: <Globe className="w-8 h-8 text-purple-500" />,
                                delay: 0,
                            },
                            {
                                title: "High Performance",
                                description: "Process images quickly with our optimized API, designed for speed and accuracy.",
                                icon: <Zap className="w-8 h-8 text-purple-500" />,
                                delay: 0.2,
                            },
                            {
                                title: "Scalable Solutions",
                                description: "Scale your usage with flexible plans tailored to your needs, from startups to enterprises.",
                                icon: <Shield className="w-8 h-8 text-purple-500" />,
                                delay: 0.4,
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ delay: feature.delay, duration: 0.6 }}
                            >
                                <Card className="bg-slate-800/70 border-slate-700/50 backdrop-blur-md shadow-xl h-full">
                                    <CardContent className="p-6 flex flex-col items-start space-y-4">
                                        <div className="bg-slate-900/80 rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-purple-900/20">
                                            {feature.icon}
                                        </div>
                                        <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                                        <p className="text-slate-300">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Code Snippet Section */}
            <section className="py-24 px-4 bg-slate-950 relative">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 whitespace-normal">
                            Get Started with a Sample API Call
                        </h2>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                            See how easy it is to integrate DefakeZone’s deepfake detection into your application.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                    >
                        <Card className="bg-slate-800/70 border-slate-700/50 backdrop-blur-md shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-white">Sample API Request</CardTitle>
                                <CardDescription className="text-slate-300">
                                    Use this example to analyze an image for deepfake detection.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-slate-900 rounded-lg p-4 text-sm text-slate-300 font-mono overflow-x-auto">
                                    <pre>
                                        curl -X POST https://api.defakezone.com/v1/detect \
                                        -H &quot;Authorization: Bearer YOUR_API_KEY&quot; \
                                        -H &quot;Content-Type: multipart/form-data&quot; \
                                        -F &quot;image=@/path/to/your/image.jpg&quot;
                                    </pre>
                                </div>
                                <p className="mt-4 text-slate-400">
                                    This is a placeholder example. For full API documentation and to get your API key, visit the official API page.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
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
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Integrate?</h2>
                            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                                Explore the full API documentation and start building with DefakeZone today.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="https://x.ai/api">
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 px-8 rounded-lg font-medium text-lg shadow-lg shadow-purple-900/30"
                                >
                                    View API Documentation
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