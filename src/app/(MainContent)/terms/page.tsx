"use client"

import { motion } from "framer-motion"
import { FileText, Shield, Lock } from "lucide-react"

export default function Terms() {
    const sections = [
        {
            id: "acceptance",
            title: "1. Acceptance of Terms",
            content: "By using Deepfake Detector, you agree to these Terms & Conditions and our Privacy Policy.",
            icon: <FileText className="h-6 w-6 text-purple-400" />,
        },
        {
            id: "responsibilities",
            title: "2. User Responsibilities",
            content: "You are responsible for the images you upload and must not upload illegal or harmful content.",
            icon: <Shield className="h-6 w-6 text-purple-400" />,
        },
        {
            id: "privacy",
            title: "3. Data Privacy",
            content: "Uploaded images are stored securely and used only for detection purposes.",
            icon: <Lock className="h-6 w-6 text-purple-400" />,
        },
        {
            id: "service",
            title: "4. Service Description",
            content:
                "Deepfake Detector provides AI-powered analysis to detect manipulated images. Results are provided on a best-effort basis and should not be considered definitive proof.",
            icon: <FileText className="h-6 w-6 text-purple-400" />,
        },
        {
            id: "limitations",
            title: "5. Limitations of Liability",
            content:
                "We provide this service as-is without warranties. We are not liable for any damages arising from your use of the service or inability to use it.",
            icon: <Shield className="h-6 w-6 text-purple-400" />,
        },
        {
            id: "intellectual",
            title: "6. Intellectual Property",
            content:
                "All content, features, and functionality of Deepfake Detector are owned by us and protected by international copyright, trademark, and other intellectual property laws.",
            icon: <FileText className="h-6 w-6 text-purple-400" />,
        },
        {
            id: "termination",
            title: "7. Termination",
            content:
                "We reserve the right to terminate or suspend your account and access to our services at our sole discretion, without notice, for conduct that we believe violates these Terms.",
            icon: <Shield className="h-6 w-6 text-purple-400" />,
        },
        {
            id: "changes",
            title: "8. Changes to Terms",
            content:
                "We may revise these terms at any time. By continuing to use Deepfake Detector after changes become effective, you agree to be bound by the revised terms.",
            icon: <FileText className="h-6 w-6 text-purple-400" />,
        },
    ]

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
                            Terms & Conditions
                        </h1>
                        <p className="text-lg text-slate-300 max-w-2xl mx-auto">Last updated: April 21, 2025</p>
                    </motion.div>

                    <div className="max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 md:p-8 shadow-xl mb-8"
                        >
                            <p className="text-slate-300">
                                Please read these Terms & Conditions carefully before using the Deepfake Detector service. By accessing
                                or using our service, you agree to be bound by these terms.
                            </p>
                        </motion.div>

                        <div className="space-y-6">
                            {sections.map((section, index) => (
                                <motion.div
                                    key={section.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index + 0.3, duration: 0.5 }}
                                    className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl overflow-hidden shadow-md"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="rounded-full bg-purple-500/20 p-3 mt-1">{section.icon}</div>
                                            <div>
                                                <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
                                                <p className="text-slate-300">{section.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                            className="mt-12 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 md:p-8 shadow-xl"
                        >
                            <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
                            <p className="text-slate-300 mb-4">
                                If you have any questions about these Terms & Conditions, please contact us at:
                            </p>
                            <a
                                href="mailto:legal@deepfakedetector.com"
                                className="text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                legal@DefakeZone.com
                            </a>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    )
}
