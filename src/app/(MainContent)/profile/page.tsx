/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"
import { useSession, signOut } from "next-auth/react"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { User, AtSign, Lock, Shield, Save, AlertCircle, CheckCircle, Camera, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

export default function ProfilePage() {
    const { data: session, update: updateSession } = useSession()
    const router = useRouter()
    const [name, setName] = useState(session?.user?.name || "")
    const [username, setUsername] = useState(session?.user?.username || "")
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [image, setImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(session?.user?.image || null)
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(session?.user?.twoFactorEnabled || false)
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [twoFACode, setTwoFACode] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false) // New state for delete confirmation
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Fetch latest user data on mount
    useEffect(() => {
        const fetchUserData = async () => {
            if (session?.user?.email) {
                const res = await fetch(`/api/profile?email=${session.user.email}`)
                if (res.ok) {
                    const data = await res.json()
                    setName(data.name || session.user.name || "")
                    setUsername(data.username || session.user.username || "")
                    setImagePreview(data.image || session.user.image || null)
                    setTwoFactorEnabled(data.twoFactorEnabled || session.user.twoFactorEnabled || false)
                }
            }
        }
        fetchUserData()
    }, [session?.user?.email])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setImage(file)

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const triggerFileInput = () => {
        fileInputRef.current?.click()
    }

    const removeImage = () => {
        setImage(null)
        setImagePreview(session?.user?.image || null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        setSuccess(null)

        try {
            const formData = new FormData()
            formData.append("name", name)
            if (username) formData.append("username", username)
            if (oldPassword) formData.append("oldPassword", oldPassword)
            if (newPassword) formData.append("newPassword", newPassword)
            if (confirmPassword) formData.append("confirmPassword", confirmPassword)
            if (image) formData.append("image", image)

            const res = await fetch("/api/profile", {
                method: "POST",
                body: formData,
            })

            if (res.ok) {
                const data = await res.json()
                setSuccess("Profile updated successfully")
                // Clear password fields on success
                setOldPassword("")
                setNewPassword("")
                setConfirmPassword("")
                await updateSession()
                router.refresh()
            } else {
                const data = await res.json()
                setError(data.message || "Update failed")
            }
        } catch (err) {
            setError("An unexpected error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handle2FA = async (action: "enable" | "disable") => {
        setError(null)
        setSuccess(null)
        try {
            const res = await fetch("/api/2fa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            })
            const data = await res.json()
            if (res.ok) {
                if (action === "enable") {
                    setQrCode(data.qrCode)
                } else {
                    setTwoFactorEnabled(false)
                    setSuccess("Two-factor authentication disabled successfully")
                    await updateSession()
                    router.refresh()
                }
            } else {
                setError(data.message || `${action === "enable" ? "2FA setup" : "2FA disable"} failed`)
            }
        } catch (err) {
            setError("An unexpected error occurred")
        }
    }

    const verify2FA = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            const res = await fetch("/api/2fa/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: twoFACode }),
            })

            if (res.ok) {
                setTwoFactorEnabled(true)
                setQrCode(null)
                setSuccess("Two-factor authentication enabled successfully")
                if (session && session.user && session.user.email) {
                    console.log("2FA enabled for user:", session.user.email); // Debug
                }
                await updateSession()
                router.refresh()
            } else {
                setError("Invalid verification code")
            }
        } catch (err) {
            setError("An unexpected error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDisable2FA = () => {
        setIsConfirmDialogOpen(false)
        handle2FA("disable")
    }

    const handleDeleteAccount = async () => {
        setIsDeleteDialogOpen(false)
        setIsSubmitting(true)
        setError(null)
        setSuccess(null)

        try {
            const res = await fetch("/api/profile", {
                method: "DELETE",
            })

            if (res.ok) {
                setSuccess("Account deleted successfully")
                // Sign out the user and redirect to login page
                await signOut({ redirect: false })
                router.push("/login")
            } else {
                const data = await res.json()
                setError(data.message || "Failed to delete account")
            }
        } catch (err) {
            setError("An unexpected error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-md border-slate-700/50">
                    <CardHeader className="text-center">
                        <CardTitle className="text-white">Authentication Required</CardTitle>
                        <CardDescription>Please sign in to access your profile</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button className="w-full" onClick={() => router.push("/login")}>
                            Sign In
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

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
                        className="text-center mb-8"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                            Your Profile
                        </h1>
                        <p className="text-lg text-slate-300 max-w-2xl mx-auto">Manage your account settings and preferences</p>
                    </motion.div>

                    <div className="max-w-4xl mx-auto">
                        <Tabs defaultValue="profile" className="w-full">
                            <TabsList className="grid grid-cols-2 mb-8 bg-slate-800/50 backdrop-blur-md border border-slate-700/50">
                                <TabsTrigger value="profile" className="data-[state=active]:bg-purple-500/20 text-white">
                                    <User className="mr-2 h-4 w-4 text-white" />
                                    Profile
                                </TabsTrigger>
                                <TabsTrigger value="security" className="data-[state=active]:bg-purple-500/20 text-white">
                                    <Shield className="mr-2 h-4 w-4 text-white" />
                                    Security
                                </TabsTrigger>
                            </TabsList>

                            {/* Profile Tab */}
                            <TabsContent value="profile">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1, duration: 0.5 }}
                                >
                                    <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-xl">
                                        <CardHeader>
                                            <CardTitle className="text-white">Profile Information</CardTitle>
                                            <CardDescription>Update your personal information and profile picture</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {/* Avatar Section */}
                                            <div className="flex flex-col items-center mb-8">
                                                <div className="relative group">
                                                    <Avatar className="h-32 w-32 border-4 border-purple-500/30 shadow-lg">
                                                        <AvatarImage src={imagePreview || "/placeholder.svg?height=128&width=128"} alt="Profile" />
                                                        <AvatarFallback className="text-3xl bg-purple-900/50">
                                                            {name?.[0] || "U"}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full">
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={triggerFileInput}
                                                                className="p-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
                                                                aria-label="Upload new avatar"
                                                            >
                                                                <Camera size={18} />
                                                            </button>
                                                            {imagePreview !== session.user.image && (
                                                                <button
                                                                    type="button"
                                                                    onClick={removeImage}
                                                                    className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                                                                    aria-label="Remove selected image"
                                                                >
                                                                    <X size={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                    accept="image/*"
                                                />
                                                <p className="mt-2 text-sm text-slate-400">
                                                    Click on the avatar to change your profile picture
                                                </p>
                                            </div>

                                            {/* Status Messages */}
                                            {error && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-2 text-sm text-red-200 mb-6"
                                                >
                                                    <AlertCircle size={16} />
                                                    <span>{error}</span>
                                                </motion.div>
                                            )}

                                            {success && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="p-3 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center gap-2 text-sm text-green-200 mb-6"
                                                >
                                                    <CheckCircle size={16} />
                                                    <span>{success}</span>
                                                </motion.div>
                                            )}

                                            {/* Profile Form */}
                                            <form onSubmit={handleSubmit} className="space-y-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name" className="text-sm font-medium text-slate-300">
                                                        Full Name
                                                    </Label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                                            <User size={18} />
                                                        </div>
                                                        <Input
                                                            id="name"
                                                            type="text"
                                                            value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                            placeholder="Your full name"
                                                            className="pl-10 bg-slate-900/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="username" className="text-sm font-medium text-slate-300">
                                                        Username
                                                    </Label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                                            <AtSign size={18} />
                                                        </div>
                                                        <Input
                                                            id="username"
                                                            type="text"
                                                            value={username}
                                                            onChange={(e) => setUsername(e.target.value)}
                                                            placeholder="Choose a username"
                                                            className="pl-10 bg-slate-900/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-slate-400">This will be used for your public profile URL</p>
                                                </div>

                                                <Button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 rounded-lg font-medium shadow-lg shadow-purple-900/30"
                                                >
                                                    {isSubmitting ? (
                                                        <div className="flex items-center justify-center">
                                                            <svg
                                                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <circle
                                                                    className="opacity-25"
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                    stroke="currentColor"
                                                                    strokeWidth="4"
                                                                ></circle>
                                                                <path
                                                                    className="opacity-75"
                                                                    fill="currentColor"
                                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                ></path>
                                                            </svg>
                                                            Updating...
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center">
                                                            <Save className="mr-2 h-5 w-5" />
                                                            Save Changes
                                                        </div>
                                                    )}
                                                </Button>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </TabsContent>

                            {/* Security Tab */}
                            <TabsContent value="security">
                                <div className="grid gap-6">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1, duration: 0.5 }}
                                    >
                                        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-xl">
                                            <CardHeader>
                                                <CardTitle className="text-white">Password</CardTitle>
                                                <CardDescription>Update your password to keep your account secure</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="oldPassword" className="text-sm font-medium text-slate-300">
                                                            Old Password
                                                        </Label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                                                <Lock size={18} />
                                                            </div>
                                                            <Input
                                                                id="oldPassword"
                                                                type="password"
                                                                value={oldPassword}
                                                                onChange={(e) => setOldPassword(e.target.value)}
                                                                placeholder="Enter your current password"
                                                                className="pl-10 bg-slate-900/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="newPassword" className="text-sm font-medium text-slate-300">
                                                            New Password
                                                        </Label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                                                <Lock size={18} />
                                                            </div>
                                                            <Input
                                                                id="newPassword"
                                                                type="password"
                                                                value={newPassword}
                                                                onChange={(e) => setNewPassword(e.target.value)}
                                                                placeholder="Enter new password"
                                                                className="pl-10 bg-slate-900/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
                                                            Confirm New Password
                                                        </Label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                                                <Lock size={18} />
                                                            </div>
                                                            <Input
                                                                id="confirmPassword"
                                                                type="password"
                                                                value={confirmPassword}
                                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                                placeholder="Confirm new password"
                                                                className="pl-10 bg-slate-900/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                                                            />
                                                        </div>
                                                        <p className="text-xs text-slate-400">Ensure your new password matches the confirmation</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <Button
                                                    onClick={handleSubmit}
                                                    disabled={
                                                        isSubmitting ||
                                                        !!((oldPassword || newPassword || confirmPassword) &&
                                                            !(oldPassword && newPassword && confirmPassword))
                                                    }
                                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium shadow-lg shadow-purple-900/30"
                                                >
                                                    Update Password
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.5 }}
                                    >
                                        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-xl">
                                            <CardHeader>
                                                <CardTitle className="text-white">Two-Factor Authentication</CardTitle>
                                                <CardDescription>Add an extra layer of security to your account</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-0.5">
                                                            <Label className="text-base text-white">Two-Factor Authentication</Label>
                                                            <p className="text-sm text-slate-400">Protect your account with an authenticator app</p>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Switch
                                                                checked={twoFactorEnabled}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        handle2FA("enable")
                                                                    } else {
                                                                        setIsConfirmDialogOpen(true)
                                                                    }
                                                                }}
                                                            />
                                                            <span className={twoFactorEnabled ? "text-green-400" : "text-slate-400"}>
                                                                {twoFactorEnabled ? "Enabled" : "Disabled"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <Separator className="bg-slate-700/50" />

                                                    {qrCode && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            className="space-y-6 text-center"
                                                        >
                                                            <div>
                                                                <h3 className="text-lg font-medium mb-2 text-white">Scan QR Code</h3>
                                                                <p className="text-sm text-slate-400 mb-4">
                                                                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                                                                </p>
                                                                <div className="bg-white p-4 rounded-lg inline-block">
                                                                    <img src={qrCode} alt="2FA QR Code" className="max-w-full h-auto" />
                                                                </div>
                                                            </div>

                                                            <form onSubmit={verify2FA} className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="twoFACode" className="text-sm font-medium text-slate-300">
                                                                        Verification Code
                                                                    </Label>
                                                                    <Input
                                                                        id="twoFACode"
                                                                        type="text"
                                                                        value={twoFACode}
                                                                        onChange={(e) => setTwoFACode(e.target.value)}
                                                                        placeholder="Enter 6-digit code"
                                                                        className="bg-slate-900/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                                                                        maxLength={6}
                                                                    />
                                                                </div>
                                                                <Button
                                                                    type="submit"
                                                                    disabled={twoFACode.length !== 6 || isSubmitting}
                                                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium shadow-lg shadow-purple-900/30"
                                                                >
                                                                    {isSubmitting ? "Verifying..." : "Verify & Enable 2FA"}
                                                                </Button>
                                                            </form>
                                                        </motion.div>
                                                    )}

                                                    {!qrCode && twoFactorEnabled && (
                                                        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                                                            <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                                                            <h3 className="text-lg font-medium mb-1">Two-Factor Authentication Enabled</h3>
                                                            <p className="text-sm text-slate-300">
                                                                Your account is protected with two-factor authentication
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>

                                    {/* Delete Account Section */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                    >
                                        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-xl">
                                            <CardHeader>
                                                <CardTitle className="text-white">Delete Account</CardTitle>
                                                <CardDescription>Permanently deactivate your account. This action cannot be undone.</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
                                                    <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                                                    <h3 className="text-lg text-white font-medium mb-1">Warning</h3>
                                                    <p className="text-sm text-slate-300">
                                                        Deactivating your account will prevent you from logging in. Your data will remain in our system but marked as inactive.
                                                    </p>
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <Button
                                                    onClick={() => setIsDeleteDialogOpen(true)}
                                                    disabled={isSubmitting}
                                                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-lg shadow-red-900/30"
                                                >
                                                    <Trash2 className="mr-2 h-5 w-5" />
                                                    Delete Account
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>

            {/* Confirmation Dialog for Disabling 2FA */}
            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Are you sure you want to disable two-factor authentication? This will reduce your account's security.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="default"
                            onClick={() => setIsConfirmDialogOpen(false)}
                            className="border-slate-600 text-white hover:bg-slate-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDisable2FA}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Disable 2FA
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog for Deleting Account */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Delete Account</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Are you sure you want to delete your account? This action will deactivate your account, and you will no longer be able to log in. Your data will remain in our system but marked as inactive.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="default"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="border-slate-600 text-white hover:bg-slate-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteAccount}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete Account
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}