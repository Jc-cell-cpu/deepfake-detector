/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import { motion } from "framer-motion";
import { Upload, CheckCircle, AlertCircle, History, ArrowRight, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function UploadForm() {
    const { data: session } = useSession();
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<{ result: string; probability: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
            const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

            if (!ALLOWED_TYPES.includes(selectedFile.type)) {
                setError("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
                setFile(null);
                setPreviewUrl(null);
                return;
            }
            if (selectedFile.size > MAX_FILE_SIZE) {
                setError("File size exceeds 10MB limit.");
                setFile(null);
                setPreviewUrl(null);
                return;
            }

            setFile(selectedFile);
            const fileUrl = URL.createObjectURL(selectedFile);
            setPreviewUrl(fileUrl);
            setResult(null);
            setError(null);
        }
    };

    const handleClearImage = () => {
        setFile(null);
        setPreviewUrl(null);
        setResult(null);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Please select an image file");
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setResult({
                result: response.data.result,
                probability: response.data.probability,
            });
            setError(null);
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || "Failed to process image. Please try again.";
            setError(errorMsg);
            setResult(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid md:grid-cols-2 gap-8 items-start max-w-5xl mx-auto"
        >
            <Card className="bg-slate-700 border-slate-700 overflow-hidden">
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-purple-500 transition-colors"
                            >
                                <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
                                <p className="text-slate-300 mb-2">Drag and drop your image here</p>
                                <p className="text-slate-400 text-sm">or click to browse (max 10MB)</p>
                            </motion.div>
                        </div>

                        {previewUrl && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-4 rounded-lg overflow-hidden relative"
                            >
                                <img
                                    src={previewUrl || "/placeholder.svg"}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={handleClearImage}
                                    className="absolute top-2 right-2 bg-slate-700 text-white rounded-full p-2 hover:bg-red-500 transition-colors"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </motion.div>
                        )}

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                type="submit"
                                disabled={!file || isLoading}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-medium"
                            >
                                {isLoading ? "Analyzing..." : "Analyze Image"}
                            </Button>
                        </motion.div>
                    </form>

                    {isLoading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                            <p className="text-center text-slate-300 mb-2">Analyzing image...</p>
                            <Progress
                                value={100}
                                className="h-2 bg-slate-700"
                                indicatorClassName="bg-gradient-to-r from-purple-500 to-pink-500"
                            />
                        </motion.div>
                    )}

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 flex items-center p-4 bg-red-500/20 rounded-lg"
                        >
                            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                            <p className="text-red-400">{error}</p>
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6"
                    >
                        <Link
                            href="/history"
                            className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            <History className="w-4 h-4 mr-2" />
                            View Upload History
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </motion.div>
                </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-700 backdrop-blur-sm h-full">
                <CardContent className="p-6">
                    {result ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="mb-6">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                    className="w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-gradient-to-r from-purple-600/20 to-pink-600/20"
                                >
                                    <CheckCircle className="w-10 h-10 text-green-500" />
                                </motion.div>
                            </div>

                            <h3 className="text-2xl font-bold mb-2">Analysis Complete</h3>
                            <p className="text-slate-300 mb-6">Here&apos;s what our AI detected:</p>

                            <div className="bg-slate-700/50 rounded-lg p-6 mb-6">
                                <p className="text-xl font-semibold mb-2">
                                    {result.result === "real" || result.result === "Real"
                                        ? "Likely Authentic"
                                        : "Likely Deepfake"}
                                </p>
                                <div className="w-full bg-slate-600 rounded-full h-4 mb-2">
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
                                <p className="text-slate-300">Confidence: {(result.probability * 100).toFixed(2)}%</p>
                            </div>

                            <div className="text-left text-slate-300 text-sm">
                                <p className="mb-2">
                                    <span className="font-semibold">What this means:</span> Our AI has analyzed the image and
                                    determined it&apos;s {result.result === "real" || result.result === "Real" ? "likely authentic" : "likely manipulated"}.
                                </p>
                                <p>
                                    Remember that no detection system is 100% accurate. For critical decisions, always verify
                                    through multiple sources.
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-center p-6"
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
                                            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 20C7.02944 20 4 15.9706 4 12C4 8.02944 7.02944 4 12 4C16.9706 4 20 8.02944 20 12C20 15.9706 16.9706 20 12 20Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </motion.div>
                            </div>

                            <p className="text-slate-300 text-sm">Upload an image to begin analysis</p>
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
