import Link from "next/link"
import { Shield, Github, Twitter, Linkedin } from "lucide-react"

export default function Footer() {
    return (
        <footer className="relative z-10 mt-auto border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
                            <Shield className="h-6 w-6 text-purple-500" />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                                DefakeZone
                            </span>
                        </Link>
                        <p className="text-slate-400 text-sm max-w-xs">
                            Advanced AI technology to detect manipulated and AI-generated images with high accuracy.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors" aria-label="GitHub">
                                <Github size={20} />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors" aria-label="Twitter">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors" aria-label="LinkedIn">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Product</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/features" className="text-slate-400 hover:text-purple-400 transition-colors">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="text-slate-400 hover:text-purple-400 transition-colors">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/apis" className="text-slate-400 hover:text-purple-400 transition-colors">
                                    API
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-slate-400 hover:text-purple-400 transition-colors">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Company</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/about" className="text-slate-400 hover:text-purple-400 transition-colors">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-slate-400 hover:text-purple-400 transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/careers" className="text-slate-400 hover:text-purple-400 transition-colors">
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-slate-400 hover:text-purple-400 transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Legal</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/terms" className="text-slate-400 hover:text-purple-400 transition-colors">
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-slate-400 hover:text-purple-400 transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/cookies" className="text-slate-400 hover:text-purple-400 transition-colors">
                                    Cookie Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-sm">© {new Date().getFullYear()} DefakeZone. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/terms" className="text-slate-400 text-sm hover:text-purple-400 transition-colors">
                            Terms
                        </Link>
                        <Link href="/privacy" className="text-slate-400 text-sm hover:text-purple-400 transition-colors">
                            Privacy
                        </Link>
                        <Link href="/cookies" className="text-slate-400 text-sm hover:text-purple-400 transition-colors">
                            Cookies
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
