/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import {
    Calendar,
    Filter,
    Search,
    ImageIcon,
    Clock,
    AlertTriangle,
    CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"

type Image = {
    id: number
    filePath: string
    result: string
    probability: number
    createdAt: string
}

export default function History() {
    const { data: session } = useSession()
    const [images, setImages] = useState<Image[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [filterResult, setFilterResult] = useState("all")
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [limit] = useState(5)
    const [totalPages, setTotalPages] = useState(1)
    const [deleteId, setDeleteId] = useState<number | null>(null) // Track the ID to delete
    const [viewImage, setViewImage] = useState<Image | null>(null) // Track the image to view

    useEffect(() => {
        if (session?.user?.id) {
            const fetchImages = async () => {
                try {
                    const response = await axios.get("/api/images", {
                        params: { page, limit },
                    })

                    setImages(response.data.data)
                    setTotalPages(response.data.pagination.totalPages)
                    setError(null)
                } catch (err) {
                    setError("Failed to load history")
                }
            }

            fetchImages()
        }
    }, [session, page, limit])

    const filteredHistory = images.filter((item) => {
        const filename = item.filePath.split("/").pop() || item.filePath
        const matchesSearch = filename
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        const matchesResult =
            filterResult === "all" ||
            (filterResult === "authentic" && item.result === "Real") ||
            (filterResult === "deepfake" && item.result === "Deepfake")
        return matchesSearch && matchesResult
    })

    const handleDelete = async (id: number) => {
        setDeleteId(id) // Open delete dialog
    }

    const confirmDelete = async () => {
        if (!deleteId) return

        try {
            await axios.delete(`/api/images/${deleteId}`)
            const refreshed = await axios.get("/api/images", {
                params: { page, limit },
            })
            setImages((prev) => prev.filter((img) => img.id !== deleteId))
            setDeleteId(null) // Close dialog after success
        } catch (error) {
            alert("Failed to delete image.")
        }
    }

    const cancelDelete = () => {
        setDeleteId(null) // Close delete dialog
    }

    const handleView = (image: Image) => {
        setViewImage(image) // Open view dialog with selected image
    }

    const closeView = () => {
        setViewImage(null) // Close view dialog
    }

    return (
        <div className="min-h-screen flex flex-col pt-24 pb-12">
            {/* Background animation */}
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
                            opacity: [
                                0.1 + Math.random() * 0.2,
                                0.2 + Math.random() * 0.3,
                                0.1 + Math.random() * 0.2,
                            ],
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
                            Analysis History
                        </h1>
                        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                            View and manage your previous image analysis results.
                        </p>
                    </motion.div>

                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl mb-8"
                        >
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                        <Search size={18} />
                                    </div>
                                    <Input
                                        type="search"
                                        placeholder="Search by filename..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="pl-10 bg-slate-900/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>

                                <div className="w-full md:w-48">
                                    <Select
                                        value={filterResult}
                                        onValueChange={setFilterResult}
                                    >
                                        <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500">
                                            <div className="flex items-center">
                                                <Filter size={16} className="mr-2" />
                                                <SelectValue placeholder="Filter results" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                            <SelectItem value="all">
                                                All Results
                                            </SelectItem>
                                            <SelectItem value="authentic">
                                                Real
                                            </SelectItem>
                                            <SelectItem value="deepfake">
                                                Deepfake
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    variant="default"
                                    className="w-full md:w-auto border-slate-700 text-white hover:bg-slate-700/50"
                                >
                                    <Calendar size={16} className="mr-2" />
                                    Date Range
                                </Button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl"
                        >
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-700 hover:bg-slate-700/30">
                                            <TableHead className="text-slate-300">
                                                Image
                                            </TableHead>
                                            <TableHead className="text-slate-300">
                                                Filename
                                            </TableHead>
                                            <TableHead className="text-slate-300">
                                                Date & Time
                                            </TableHead>
                                            <TableHead className="text-slate-300">
                                                Result
                                            </TableHead>
                                            <TableHead className="text-slate-300">
                                                Confidence
                                            </TableHead>
                                            <TableHead className="text-slate-300 text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredHistory.length > 0 ? (
                                            filteredHistory.map((item) => {
                                                const filename =
                                                    item.filePath.split("/").pop() ||
                                                    item.filePath
                                                const [date, time] =
                                                    new Date(
                                                        item.createdAt
                                                    )
                                                        .toLocaleString("en-US", {
                                                            dateStyle: "medium",
                                                            timeStyle: "short",
                                                        })
                                                        .split(", ")

                                                return (
                                                    <TableRow
                                                        key={item.id}
                                                        className="border-slate-700 hover:bg-slate-700/30"
                                                    >
                                                        <TableCell>
                                                            <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-700">
                                                                <img
                                                                    src={`/uploads/${filename}`}
                                                                    alt={filename}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        ; (
                                                                            e.target as HTMLImageElement
                                                                        ).src =
                                                                            "/placeholder.svg"
                                                                    }}
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium text-white">
                                                            <div className="flex items-center">
                                                                <ImageIcon
                                                                    size={16}
                                                                    className="mr-2 text-slate-400"
                                                                />
                                                                {filename}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-slate-300">
                                                            <div className="flex items-center">
                                                                <Clock
                                                                    size={16}
                                                                    className="mr-2 text-slate-400"
                                                                />
                                                                <div>
                                                                    <div>{date}</div>
                                                                    <div className="text-sm text-slate-400">
                                                                        {time}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div
                                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${item.result ===
                                                                    "Real"
                                                                    ? "bg-green-500 text-white"
                                                                    : "bg-red-500 text-white"
                                                                    }`}
                                                            >
                                                                {item.result ===
                                                                    "Real" ? (
                                                                    <CheckCircle
                                                                        size={14}
                                                                        className="mr-1"
                                                                    />
                                                                ) : (
                                                                    <AlertTriangle
                                                                        size={14}
                                                                        className="mr-1"
                                                                    />
                                                                )}
                                                                {item.result}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="w-full bg-slate-700 rounded-full h-2.5">
                                                                <div
                                                                    className={`h-2.5 rounded-full ${item.result ===
                                                                        "Real"
                                                                        ? "bg-green-500"
                                                                        : "bg-red-500"
                                                                        }`}
                                                                    style={{
                                                                        width: `${item.probability *
                                                                            100
                                                                            }%`,
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <div className="text-xs text-slate-400 mt-1">
                                                                {(
                                                                    item.probability *
                                                                    100
                                                                ).toFixed(
                                                                    2
                                                                )}
                                                                % confidence
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                className="border-slate-700 text-white hover:bg-slate-700/50 mr-2"
                                                                onClick={() => handleView(item)}
                                                            >
                                                                View
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                className="border-red-500/30 text-white hover:bg-red-700"
                                                                onClick={() => handleDelete(item.id)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    className="h-24 text-center"
                                                >
                                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                                        <Search
                                                            size={24}
                                                            className="mb-2"
                                                        />
                                                        <p>No results found</p>
                                                        <p className="text-sm">
                                                            Try adjusting your
                                                            search or filters
                                                        </p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex justify-between items-center p-4">
                                <Button
                                    variant="ghost"
                                    onClick={() =>
                                        setPage((prev) =>
                                            Math.max(prev - 1, 1)
                                        )
                                    }
                                    disabled={page === 1}
                                    className="text-white hover:bg-slate-700/50"
                                >
                                    Previous
                                </Button>
                                <span className="text-slate-300">
                                    Page {page} of {totalPages}
                                </span>
                                <Button
                                    variant="ghost"
                                    onClick={() =>
                                        setPage((prev) =>
                                            Math.min(prev + 1, totalPages)
                                        )
                                    }
                                    disabled={page === totalPages}
                                    className="text-white hover:bg-slate-700/50"
                                >
                                    Next
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteId !== null} onOpenChange={cancelDelete}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-slate-300">
                            Are you sure you want to delete this image? This action is <span className="text-red-500 font-semibold">irreversible</span> and will permanently remove the image and its analysis data.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="default" onClick={cancelDelete} className="mr-2 text-white hover:bg-slate-700/50">
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} className="hover:bg-red-700">
                            Confirm Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Details Dialog */}
            <Dialog open={viewImage !== null} onOpenChange={closeView}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Image Details</DialogTitle>
                    </DialogHeader>
                    {viewImage && (
                        <div className="py-6 space-y-6">
                            <div className="flex justify-center">
                                <div className="w-64 h-64 rounded-lg overflow-hidden bg-slate-700">
                                    <img
                                        src={`/uploads/${viewImage.filePath.split("/").pop()}`}
                                        alt={viewImage.filePath}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            ; (e.target as HTMLImageElement).src = "/placeholder.svg"
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-400">Filename</p>
                                    <p className="text-white font-medium">{viewImage.filePath.split("/").pop()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Date & Time</p>
                                    <p className="text-white font-medium">
                                        {new Date(viewImage.createdAt)
                                            .toLocaleString("en-US", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Result</p>
                                    <div
                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${viewImage.result === "Real"
                                            ? "bg-green-500 text-white"
                                            : "bg-red-500 text-white"
                                            }`}
                                    >
                                        {viewImage.result === "Real" ? (
                                            <CheckCircle size={14} className="mr-1" />
                                        ) : (
                                            <AlertTriangle size={14} className="mr-1" />
                                        )}
                                        {viewImage.result}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Confidence</p>
                                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                                        <div
                                            className={`h-2.5 rounded-full ${viewImage.result === "Real" ? "bg-green-500" : "bg-red-500"}`}
                                            style={{ width: `${viewImage.probability * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {(viewImage.probability * 100).toFixed(2)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="default" onClick={closeView} className="text-white hover:bg-slate-700/50">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}