/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Shield, Upload, Cpu, FileCheck, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import UploadForm from "@/components/UploadForm"
import { useEffect, useRef, useState } from "react"

export default function Home() {
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 100])
  const opacity = useTransform(scrollYProgress, [0, 5], [2, 0])

  const [animationData, setAnimationData] = useState<{
    orbs: { x: string; y: string; opacity: number; size: number }[]
    particles: { x: string; y: string; scale: number; color: string; shadow: string }[]
    shapes: { x: string; y: string; rotate: number; opacity: number; clipPath: string; size: number }[]
    beams: { x: string; y: string; rotate: number; opacity: number; height: number }[]
  }>({
    orbs: [],
    particles: [],
    shapes: [],
    beams: [],
  })

  useEffect(() => {
    setMounted(true)

    setAnimationData({
      orbs: Array.from({ length: 15 }).map(() => ({
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * 100}%`,
        opacity: 0.1 + Math.random() * 0.3,
        size: Math.random() * 300 + 100,
      })),
      particles: Array.from({ length: 30 }).map(() => ({
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * 100}%`,
        scale: Math.random() * 0.5 + 0.5,
        color: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 100 + 155)}, ${0.3 + Math.random() * 0.7})`,
        shadow: `0 0 ${Math.random() * 10 + 5}px rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 100 + 155)}, 0.5)`,
      })),
      shapes: Array.from({ length: 8 }).map(() => {
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
      beams: Array.from({ length: 5 }).map(() => ({
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * 50}%`,
        rotate: Math.random() * 360,
        opacity: 0.1 + Math.random() * 0.3,
        height: Math.random() * 300 + 200,
      })),
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      {/* Hero Section with Parallax Effect */}
      <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0 bg-slate-950">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent opacity-70" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950 to-transparent" />

          {mounted &&
            animationData.orbs.map((orb, i) => (
              <motion.div
                key={`orb-${i}`}
                className="absolute rounded-full blur-xl"
                style={{
                  width: `${orb.size}px`,
                  height: `${orb.size}px`,
                  background: `radial-gradient(circle, rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 100 + 155)}, 0.15) 0%, rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 100 + 155)}, 0.05) 70%)`,
                  filter: "blur(8px)",
                  x: orb.x,
                  y: orb.y,
                  opacity: orb.opacity,
                }}
                animate={{
                  x: [orb.x, `${Math.random() * 100}%`, orb.x],
                  y: [orb.y, `${Math.random() * 100}%`, orb.y],
                  opacity: [orb.opacity, 0.2 + Math.random() * 0.4, orb.opacity],
                }}
                transition={{
                  duration: Math.random() * 30 + 20,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
            ))}

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

          {mounted &&
            animationData.beams.map((beam, i) => (
              <motion.div
                key={`beam-${i}`}
                className="absolute origin-center"
                style={{
                  width: `${Math.random() * 2 + 1}px`,
                  height: `${beam.height}px`,
                  background: `linear-gradient(to bottom, rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 100 + 155)}, 0.3) 0%, rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 100 + 155)}, 0) 100%)`,
                  filter: "blur(3px)",
                  x: beam.x,
                  y: beam.y,
                  rotate: beam.rotate,
                  opacity: beam.opacity,
                }}
                animate={{
                  rotate: [beam.rotate, beam.rotate + 45, beam.rotate + 90],
                  opacity: [beam.opacity, 0.3 + Math.random() * 0.4, beam.opacity],
                }}
                transition={{
                  duration: Math.random() * 30 + 20,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
            ))}
        </div>

        <motion.div style={{ y, opacity }} className="container mx-auto px-4 relative z-10 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-8 inline-flex justify-center"
            >
              <Shield className="h-16 w-16 text-purple-500" />
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 leading-tight">
              Detect Deepfakes with AI Precision
            </h1>

            <p className="text-xl md:text-2xl mb-10 text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Our cutting-edge AI technology analyzes images to detect manipulation and deepfakes with industry-leading
              accuracy.
            </p>

            {session ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="max-w-7xl mx-auto w-full" // Adjusted to match UploadForm width
              >
                <Card className="bg-slate-800/70 border-slate-700/50 backdrop-blur-md shadow-xl">
                  <CardContent className="p-8">
                    <UploadForm />
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 px-8 rounded-lg font-medium text-lg shadow-lg shadow-purple-900/30"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button
                    variant="default"
                    size="lg"
                    className="border-purple-500/50 text-white hover:bg-purple-500/10 py-6 px-8 rounded-lg font-medium text-lg"
                  >
                    See Demo
                  </Button>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 bg-slate-950 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/5 to-slate-950/5 z-0" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                How It Works
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Our advanced AI technology analyzes images to detect signs of manipulation or deepfake creation.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600/0 via-purple-600/50 to-purple-600/0 hidden md:block -translate-y-1/2 z-0" />

            {[
              {
                title: "Upload Image",
                description: "Upload any suspicious image you want to analyze for potential manipulation.",
                icon: <Upload className="w-10 h-10 text-purple-500" />,
                delay: 0,
              },
              {
                title: "AI Analysis",
                description: "Our advanced algorithms analyze pixel patterns, metadata, and visual inconsistencies.",
                icon: <Cpu className="w-10 h-10 text-purple-500" />,
                delay: 0.2,
              },
              {
                title: "Get Results",
                description: "Receive a detailed analysis showing the probability of the image being manipulated.",
                icon: <FileCheck className="w-10 h-10 text-purple-500" />,
                delay: 0.4,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: item.delay, duration: 0.6 }}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 backdrop-blur-sm shadow-xl relative z-10"
              >
                <div className="bg-slate-900/80 rounded-full w-16 h-16 flex items-center justify-center mb-6 shadow-lg shadow-purple-900/20">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                <p className="text-slate-300">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-slate-950 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                Advanced Detection Features
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Our technology uses multiple detection methods to provide comprehensive analysis.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Facial Inconsistency Detection",
                description: "Identifies unnatural facial features, lighting inconsistencies, and blending artifacts.",
                icon: <CheckCircle className="w-6 h-6 text-green-500" />,
                delay: 0,
              },
              {
                title: "Metadata Analysis",
                description: "Examines image metadata for signs of editing or generation by AI tools.",
                icon: <CheckCircle className="w-6 h-6 text-green-500" />,
                delay: 0.1,
              },
              {
                title: "Pixel Pattern Recognition",
                description: "Analyzes pixel-level patterns that are characteristic of AI-generated images.",
                icon: <CheckCircle className="w-6 h-6 text-green-500" />,
                delay: 0.2,
              },
              {
                title: "Noise Analysis",
                description: "Detects inconsistent noise patterns that indicate image manipulation.",
                icon: <CheckCircle className="w-6 h-6 text-green-500" />,
                delay: 0.3,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: item.delay, duration: 0.6 }}
                className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm"
              >
                <div className="flex gap-4">
                  <div className="mt-1">{item.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-slate-300">{item.description}</p>
                  </div>
                </div>
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
                Join thousands of users who trust our technology to verify image authenticity.
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