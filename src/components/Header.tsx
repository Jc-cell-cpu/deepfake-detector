/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, Shield, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@/components/ui/avatar"

export default function Header() {
    const { data: session, update } = useSession()
    const isMobile = useMobile()
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(session?.user?.image || "/placeholder.svg")

    useEffect(() => {
        console.log("Session data:", session); // Debug
        const fetchUserData = async () => {
            if (session?.user?.email) {
                const res = await fetch(`/api/profile?email=${session.user.email}`)
                if (res.ok) {
                    const data = await res.json()
                    setImagePreview(data.image || session.user.image || "/placeholder.svg")
                }
            }
        }
        fetchUserData()
    }, [session?.user?.email, session?.user?.image])

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const toggleMenu = () => setIsOpen(!isOpen)
    const closeMenu = () => setIsOpen(false)

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-slate-900/95 backdrop-blur-md shadow-lg py-3" : "bg-transparent py-5"
                }`}
        >
            <div className="container mx-auto px-4 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                    <Shield className="h-7 w-7 text-purple-500" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                        DefakeZone
                    </span>
                </Link>

                {isMobile ? (
                    <button
                        onClick={toggleMenu}
                        className="p-2 text-white focus:outline-none"
                        aria-label={isOpen ? "Close menu" : "Open menu"}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                ) : (
                    <div className="flex gap-6 items-center">
                        <NavLinks session={session} signOut={signOut} />
                        {session && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="cursor-pointer">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage
                                                src={imagePreview || ""}
                                                alt={session.user?.name || session.user?.email || "User"}
                                                onError={(e) => {
                                                    console.error("Image failed to load:", e);
                                                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                                                }}
                                            />
                                            <AvatarFallback>
                                                {session.user?.name
                                                    ?.split(" ")
                                                    .map((n: string) => n[0])
                                                    .join("") || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white mt-2">
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="w-full" onClick={closeMenu}>
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            signOut()
                                            closeMenu()
                                        }}
                                    >
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                        {!session && (
                            <>
                                <Link href="/login" className="font-medium hover:text-purple-400 transition-colors" onClick={closeMenu}>
                                    Login
                                </Link>
                                <Link href="/signup" onClick={closeMenu}>
                                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all">
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                )}

                <AnimatePresence>
                    {isMobile && isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 top-16 bg-slate-900/95 backdrop-blur-md z-40"
                        >
                            <nav className="flex flex-col items-center pt-10 gap-6">
                                <NavLinks session={session} signOut={signOut} mobile={true} closeMenu={closeMenu} />
                                {session && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="border-purple-500 text-white hover:bg-purple-500/20 flex items-center gap-2 w-full">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage
                                                        src={imagePreview || ""}
                                                        alt={session.user?.name || session.user?.email || "User"}
                                                        onError={(e) => {
                                                            console.error("Image failed to load:", e);
                                                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                                                        }}
                                                    />
                                                    <AvatarFallback>
                                                        {session.user?.name
                                                            ?.split(" ")
                                                            .map((n: string) => n[0])
                                                            .join("") || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {session.user?.name || session.user?.email || "Profile"}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white mt-2 w-full">
                                            <DropdownMenuItem asChild>
                                                <Link href="/profile" className="w-full" onClick={closeMenu}>
                                                    Profile
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    signOut()
                                                    closeMenu()
                                                }}
                                            >
                                                Logout
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                                {!session && (
                                    <>
                                        <Link href="/login" className="font-medium text-xl py-3 hover:text-purple-400 transition-colors" onClick={closeMenu}>
                                            Login
                                        </Link>
                                        <Link href="/signup" onClick={closeMenu}>
                                            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all w-full">
                                                Sign Up
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    )
}

function NavLinks({
    session,
    signOut,
    mobile = false,
    closeMenu = () => { },
}: {
    session: any
    signOut: any
    mobile?: boolean
    closeMenu?: () => void
}) {
    const linkClass = `relative font-medium ${mobile ? "text-xl py-3" : ""} hover:text-purple-400 transition-colors after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-purple-500 after:transition-all hover:after:w-full`

    return (
        <>
            <Link href="/" className={linkClass} onClick={closeMenu}>
                Home
            </Link>
            {session && (
                <Link href="/history" className={linkClass} onClick={closeMenu}>
                    History
                </Link>
            )}
            <Link href="/faq" className={linkClass} onClick={closeMenu}>
                FAQ
            </Link>
            <Link href="/terms" className={linkClass} onClick={closeMenu}>
                Terms
            </Link>
        </>
    )
}