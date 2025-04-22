"use client"

import { motion } from "framer-motion"
import { HelpCircle, Search } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// FAQ data
const faqItems = [
    {
        question: "What is DefakeZone?",
        answer:
            "DefakeZone is an AI-powered tool to identify whether an image is real or a deepfake, using advanced machine learning models.",
    },
    {
        question: "How accurate is the detection?",
        answer: "Our model achieves approximately 85% accuracy, depending on the image quality and dataset.",
    },
    {
        question: "Is my data secure?",
        answer: "Yes, we prioritize user privacy and store images securely. See our Terms & Conditions for details.",
    },
    {
        question: "What file formats are supported?",
        answer: "We support common image formats including JPG, PNG, WEBP, and GIF. The maximum file size is 10MB.",
    },
    {
        question: "How long does the analysis take?",
        answer: "Most images are analyzed within seconds. For complex images, it may take up to 30 seconds.",
    },
    {
        question: "Can I use this for video?",
        answer: "Currently, we only support image analysis. Video analysis is planned for a future update.",
    },
    {
        question: "Do you offer an API?",
        answer:
            "Yes, we offer an API for developers who want to integrate our deepfake detection into their applications. Contact us for details.",
    },
    {
        question: "What technology powers the detection?",
        answer:
            "We use a combination of convolutional neural networks and specialized image forensics algorithms to detect manipulation patterns.",
    },
]

export default function FAQ() {
    const [searchTerm, setSearchTerm] = useState("")

    const filteredFAQs = faqItems.filter(
        (item) =>
            item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchTerm.toLowerCase()),
    )

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
                            Frequently Asked Questions
                        </h1>
                        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                            Find answers to common questions about our Deepfake Detector service.
                        </p>
                    </motion.div>

                    <div className="max-w-3xl mx-auto">
                        {/* Search */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="mb-10"
                        >
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                    <Search size={18} />
                                </div>
                                <Input
                                    type="search"
                                    placeholder="Search questions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-slate-800/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                        </motion.div>

                        {/* FAQ Accordion */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="space-y-4"
                        >
                            {filteredFAQs.length > 0 ? (
                                <Accordion type="single" collapsible className="space-y-4">
                                    {filteredFAQs.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * index, duration: 0.4 }}
                                        >
                                            <AccordionItem
                                                value={`item-${index}`}
                                                className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl overflow-hidden shadow-md"
                                            >
                                                <AccordionTrigger className="px-6 py-4 text-left text-lg font-medium hover:bg-slate-700/30 transition-colors">
                                                    {item.question}
                                                </AccordionTrigger>
                                                <AccordionContent className="px-6 py-4 text-slate-300">{item.answer}</AccordionContent>
                                            </AccordionItem>
                                        </motion.div>
                                    ))}
                                </Accordion>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-8 text-center"
                                >
                                    <HelpCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-medium mb-2">No results found</h3>
                                    <p className="text-slate-400">
                                        We couldn&apos;t find any FAQs matching your search. Try different keywords or{" "}
                                        <a href="/contact" className="text-purple-400 hover:text-purple-300 transition-colors">
                                            contact us
                                        </a>{" "}
                                        for more help.
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Contact CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="mt-12 text-center"
                        >
                            <p className="text-slate-300 mb-4">Still have questions? We&apos;re here to help.</p>
                            <a
                                href="/contact"
                                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-lg font-medium shadow-lg shadow-purple-900/30 transition-all"
                            >
                                Contact Support
                            </a>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    )
}
