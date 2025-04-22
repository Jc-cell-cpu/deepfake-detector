/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
    Upload,
    CheckCircle,
    AlertCircle,
    History,
    ArrowRight,
    XCircle,
    ImageIcon,
    Loader2,
    Shield,
    FileWarning,
    Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

export default function UploadForm() {
    const { data: session } = useSession()
    const [file, setFile] = useState<File | null>(null)
    const [result, setResult] = useState<{ result: string; probability: number } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0])
        }
    }

    const processFile = (selectedFile: File) => {
        const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
        const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

        if (!ALLOWED_TYPES.includes(selectedFile.type)) {
            setError("Invalid file type. Only JPEG, PNG, and WebP are allowed.")
            setFile(null)
            setPreviewUrl(null)
            return
        }
        if (selectedFile.size > MAX_FILE_SIZE) {
            setError("File size exceeds 10MB limit.")
            setFile(null)
            setPreviewUrl(null)
            return
        }

        setFile(selectedFile)
        const fileUrl = URL.createObjectURL(selectedFile)
        setPreviewUrl(fileUrl)
        setResult(null)
        setError(null)
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0])
        }
    }

    const handleClearImage = () => {
        setFile(null)
        setPreviewUrl(null)
        setResult(null)
        setError(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) {
            setError("Please select an image file")
            return
        }

        setIsLoading(true)
        setUploadProgress(0)
        const formData = new FormData()
        formData.append("file", file)

        try {
            // Simulate progress for demo purposes
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    const newProgress = prev + Math.random() * 15
                    return newProgress > 90 ? 90 : newProgress
                })
            }, 300)

            const response = await axios.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })

            clearInterval(progressInterval)
            setUploadProgress(100)

            // Slight delay to show 100% progress before showing results
            setTimeout(() => {
                setResult({
                    result: response.data.result,
                    probability: response.data.probability,
                })
                setError(null)
                setIsLoading(false)
            }, 500)
        } catch (err: any) {
            setUploadProgress(0)
            const errorMsg = err.response?.data?.error || "Failed to process image. Please try again."
            setError(errorMsg)
            setResult(null)
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid md:grid-cols-2 gap-8 items-start max-w-5xl mx-auto"
        >
            {/* Upload Card */}
            <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-xl overflow-hidden">
                <CardHeader className="pb-0">
                    <CardTitle className="text-2xl text-white font-bold flex items-center gap-2">
                        <Upload className="h-5 w-5 text-purple-400" />
                        Image Upload
                    </CardTitle>
                    <CardDescription>Upload an image to analyze for deepfake detection</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div
                            className="relative group"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging
                                    ? "border-purple-500 bg-purple-500/10"
                                    : "border-slate-600 hover:border-purple-500 hover:bg-purple-500/5"
                                    }`}
                            >
                                <div className="mb-4">
                                    <motion.div
                                        animate={{
                                            y: [0, -5, 0],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Number.POSITIVE_INFINITY,
                                            repeatType: "reverse",
                                        }}
                                        className="w-16 h-16 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center"
                                    >
                                        <ImageIcon className="w-8 h-8 text-purple-400" />
                                    </motion.div>
                                </div>
                                <p className="text-slate-300 mb-2 font-medium">Drag and drop your image here</p>
                                <p className="text-slate-400 text-sm mb-4">or click to browse files</p>
                                <div className="flex flex-wrap justify-center gap-2 text-xs">
                                    <Badge variant="outline" className="bg-slate-700/50 text-slate-300">
                                        JPEG
                                    </Badge>
                                    <Badge variant="outline" className="bg-slate-700/50 text-slate-300">
                                        PNG
                                    </Badge>
                                    <Badge variant="outline" className="bg-slate-700/50 text-slate-300">
                                        WebP
                                    </Badge>
                                    <Badge variant="outline" className="bg-slate-700/50 text-slate-300">
                                        Max 10MB
                                    </Badge>
                                </div>
                            </motion.div>
                        </div>

                        <AnimatePresence>
                            {previewUrl && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="rounded-lg overflow-hidden relative"
                                >
                                    <div className="relative group">
                                        <img
                                            src={previewUrl || "/placeholder.svg"}
                                            alt="Preview"
                                            className="w-full h-48 object-cover rounded-lg border border-slate-700/50"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white text-sm">{file?.name}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleClearImage}
                                            className="absolute top-2 right-2 bg-slate-800/80 text-white rounded-full p-1.5 hover:bg-red-500 transition-colors"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                type="submit"
                                disabled={!file || isLoading}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 rounded-lg font-medium shadow-lg shadow-purple-900/30"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Analyzing...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <Shield className="mr-2 h-5 w-5" />
                                        Analyze Image
                                    </div>
                                )}
                            </Button>
                        </motion.div>
                    </form>

                    <AnimatePresence>
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-6"
                            >
                                <div className="flex justify-between text-sm text-slate-400 mb-1.5">
                                    <span>Analyzing image...</span>
                                    <span>{Math.round(uploadProgress)}%</span>
                                </div>
                                <Progress
                                    value={uploadProgress}
                                    className="h-2 bg-slate-700"
                                    indicatorClassName="bg-gradient-to-r from-purple-500 to-pink-500"
                                />
                                <div className="mt-4 text-center">
                                    <div className="flex justify-center space-x-1">
                                        {[...Array(3)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="w-2 h-2 rounded-full bg-purple-500"
                                                animate={{
                                                    y: [0, -5, 0],
                                                }}
                                                transition={{
                                                    duration: 0.5,
                                                    repeat: Number.POSITIVE_INFINITY,
                                                    repeatType: "reverse",
                                                    delay: i * 0.1,
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">Our AI is examining the image for manipulation signs</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-6 flex items-start p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
                            >
                                <FileWarning className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-red-300 font-medium">Upload Error</p>
                                    <p className="text-red-200/80 text-sm">{error}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 flex justify-between items-center"
                    >
                        <Link
                            href="/history"
                            className="flex items-center text-purple-400 hover:text-purple-300 transition-colors text-sm"
                        >
                            <History className="w-4 h-4 mr-1.5" />
                            View Upload History
                            <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                        <Info className="h-4 w-4 text-slate-400" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-800 border-slate-700 text-slate-300 max-w-xs">
                                    <p className="text-xs">
                                        Our AI analyzes images for signs of manipulation. Results are provided with a confidence score.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </motion.div>
                </CardContent>
            </Card>

            {/* Results Card */}
            <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-xl h-full">
                <CardHeader className="pb-0">
                    <CardTitle className="text-2xl text-white font-bold flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-400" />
                        Analysis Results
                    </CardTitle>
                    <CardDescription>View the deepfake detection analysis for your image</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <AnimatePresence mode="wait">
                        {result ? (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="text-center"
                            >
                                <div className="mb-6">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                        className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${result.result === "real" || result.result === "Real" ? "bg-green-500/20" : "bg-red-500/20"
                                            }`}
                                    >
                                        {result.result === "real" || result.result === "Real" ? (
                                            <CheckCircle className="w-10 h-10 text-green-500" />
                                        ) : (
                                            <AlertCircle className="w-10 h-10 text-red-500" />
                                        )}
                                    </motion.div>
                                </div>

                                <h3 className="text-2xl font-bold mb-2">Analysis Complete</h3>
                                <p className="text-slate-300 mb-6">Here&apos;s what our AI detected:</p>

                                <div className="bg-slate-800/80 border border-slate-700/50 rounded-lg p-6 mb-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <p className="text-xl font-semibold">
                                            {result.result === "real" || result.result === "Real" ? "Likely Authentic" : "Likely Deepfake"}
                                        </p>
                                        <Badge
                                            className={`${result.result === "real" || result.result === "Real"
                                                ? "bg-green-500/20 text-green-300 hover:bg-green-500/30"
                                                : "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                                                }`}
                                        >
                                            {result.result === "real" || result.result === "Real" ? "AUTHENTIC" : "DEEPFAKE"}
                                        </Badge>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-4 mb-2 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${result.probability * 100}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className={`h-4 rounded-full ${result.result === "real" || result.result === "Real"
                                                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                                : "bg-gradient-to-r from-orange-500 to-red-500"
                                                }`}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <p className="text-slate-300">Confidence Score</p>
                                        <p className="text-slate-200 font-medium">{(result.probability * 100).toFixed(2)}%</p>
                                    </div>
                                </div>

                                <div className="text-left space-y-4">
                                    <div className="bg-slate-800/80 border border-slate-700/50 rounded-lg p-4">
                                        <h4 className="font-medium mb-2 text-slate-200">What this means:</h4>
                                        <p className="text-slate-300 text-sm">
                                            Our AI has analyzed the image and determined it&apos;s{" "}
                                            {result.result === "real" || result.result === "Real" ? (
                                                <span className="text-green-400 font-medium">likely authentic</span>
                                            ) : (
                                                <span className="text-red-400 font-medium">likely manipulated</span>
                                            )}
                                            . The confidence score indicates how certain the AI is about this assessment.
                                        </p>
                                    </div>

                                    <div className="bg-slate-800/80 border border-slate-700/50 rounded-lg p-4">
                                        <h4 className="font-medium mb-2 text-slate-200">Important Note:</h4>
                                        <p className="text-slate-300 text-sm">
                                            Remember that no detection system is 100% accurate. For critical decisions, always verify through
                                            multiple sources and methods.
                                        </p>
                                    </div>

                                    <div className="flex justify-center mt-4">
                                        <Button
                                            onClick={handleClearImage}
                                            variant="outline"
                                            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                                        >
                                            Analyze Another Image
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center text-center p-6 min-h-[400px]"
                            >
                                <div className="mb-6 opacity-70">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.05, 1],
                                            opacity: [0.7, 1, 0.7],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Number.POSITIVE_INFINITY,
                                            repeatType: "reverse",
                                        }}
                                        className="w-24 h-24 mx-auto"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-full h-full text-purple-400"
                                        >
                                            <path
                                                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M8.5 12.5L10.5 14.5L15.5 9.5"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </motion.div>
                                </div>

                                <h3 className="text-xl font-medium mb-3 text-slate-200">Ready to Analyze</h3>
                                <p className="text-slate-400 max-w-xs mx-auto">
                                    Upload an image to begin the deepfake detection analysis. Our AI will examine the image for signs of
                                    manipulation.
                                </p>

                                <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-xs">
                                    {[...Array(3)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0.3 }}
                                            animate={{ opacity: [0.3, 0.7, 0.3] }}
                                            transition={{
                                                duration: 2,
                                                repeat: Number.POSITIVE_INFINITY,
                                                repeatType: "reverse",
                                                delay: i * 0.5,
                                            }}
                                            className="aspect-square rounded-lg bg-purple-500/10"
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </motion.div>
    )
}
