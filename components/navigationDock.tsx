"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Bot, Import, Video, Mic, LinkIcon, X, Send, CircleArrowUp } from "lucide-react"
import { Dock, DockIcon } from "./magicui/dock"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { ImportDialog } from "./importDialog"
import { MediaLibraryDialog } from "./mediaLibraryDialog"
import { VideoPreview } from "./videoPreview"
import { useRouter } from "next/navigation"

export type IconProps = React.HTMLAttributes<SVGElement>

const Icons = {
    bot: (props: IconProps) => <Bot {...props} />,
    download: (props: IconProps) => <Import {...props} />,
    video: (props: IconProps) => <Video {...props} />,
    mic: (props: IconProps) => <Mic {...props} />,
    link: (props: IconProps) => <LinkIcon {...props} />,
}

interface MediaFile {
    id: string
    name: string
    type: string
    url: string
    date: Date
}

export function NavigationDock() {
    const router = useRouter()
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false)
    const [isVideoRecording, setIsVideoRecording] = useState(false)
    const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
    const [inputMessage, setInputMessage] = useState("")
    const [dragActive, setDragActive] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([])
    const [recordings, setRecordings] = useState<MediaFile[]>([])
    const [mediaType, setMediaType] = useState<"audio" | "video">("audio")
    const videoRef = useRef<HTMLVideoElement>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const handleChatToggle = () => setIsChatOpen(!isChatOpen)

    const handleImportToggle = () => setIsImportOpen(!isImportOpen)

    const startRecording = async () => {
        try {
            const constraints = {
                video: true,
                audio: true,
            }

            const stream = await navigator.mediaDevices.getUserMedia(constraints)

            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }

            const recorder = new MediaRecorder(stream)
            const chunks: BlobPart[] = []

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data)
                }
            }

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: "video/webm" })
                const url = URL.createObjectURL(blob)
                const newRecording: MediaFile = {
                    id: Date.now().toString(),
                    name: `Recording_${new Date().toLocaleString()}`,
                    url: url,
                    date: new Date(),
                    type: "video",
                }
                setRecordings((prev) => [...prev, newRecording])
            }

            recorder.start()
            setMediaRecorder(recorder)
            setIsVideoRecording(true)
        } catch (err) {
            console.error("Error accessing video devices:", err)
        }
    }

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop()
            mediaRecorder.stream.getTracks().forEach((track) => track.stop())
            setIsVideoRecording(false)
            if (videoRef.current) {
                videoRef.current.srcObject = null
            }
        }
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files)
        }
    }

    const handleFiles = (files: FileList) => {
        const newFiles: MediaFile[] = Array.from(files).map((file) => ({
            id: Date.now().toString(),
            name: file.name,
            type: file.type.includes("video") ? "video" : "audio",
            url: URL.createObjectURL(file),
            date: new Date(),
        }))
        setUploadedFiles((prev) => [...prev, ...newFiles])
    }

    const deleteFile = (id: string, isRecording: boolean) => {
        if (isRecording) {
            setRecordings((prev) => prev.filter((rec) => rec.id !== id))
        } else {
            setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
        }
    }

    const handlePasteLink = () => {
        navigator.clipboard
            .readText()
            .then((clipText) => {
                const isValidUrl = (str: string | URL) => {
                    try {
                        new URL(str)
                        return true
                    } catch (_) {
                        return false
                    }
                }

                if (isValidUrl(clipText)) {
                    console.log("Pasted content: ", clipText)
                    setSuccessMessage(`Coppied link: ${clipText}`)
                } else {
                    setErrorMessage("Invalid link! Please paste a valid URL.")
                }
            })
            .catch((err) => {
                console.error("Failed to read clipboard contents: ", err)
                setErrorMessage("Failed to read clipboard content. Please try again.")
            })
    }

    useEffect(() => {
        if (errorMessage || successMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(null)
                setSuccessMessage(null)
            }, 2000)

            return () => clearTimeout(timer)
        }
    }, [errorMessage, successMessage])

    const handleChatSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (inputMessage.trim()) {
            setChatMessages([...chatMessages, { role: "user", content: inputMessage }])
            setInputMessage("")
        }
    }

    return (
        <div className="relative bottom-4 left-4 right-4 z-50">
            <TooltipProvider>
                <Dock direction="middle" className="bg-white">
                    <DockIcon>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={handleChatToggle}
                                    aria-label="Chat"
                                    className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-12 rounded-full")}
                                >
                                    <Icons.bot className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Chat</p>
                            </TooltipContent>
                        </Tooltip>
                    </DockIcon>
                    <DockIcon>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={handleImportToggle}
                                    aria-label="Import"
                                    className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-12 rounded-full")}
                                >
                                    <Icons.download className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Import</p>
                            </TooltipContent>
                        </Tooltip>
                    </DockIcon>
                    <Separator orientation="vertical" className="h-full" />
                    <DockIcon>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={() => isVideoRecording ? stopRecording() : startRecording()}
                                    aria-label="Video Record"
                                    className={cn(
                                        buttonVariants({ variant: "ghost", size: "icon" }),
                                        "size-12 rounded-full",
                                        isVideoRecording && "text-red-500",
                                    )}
                                >
                                    <Icons.video className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Video Record</p>
                            </TooltipContent>
                        </Tooltip>
                    </DockIcon>
                    <DockIcon>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={() => router.push('/note')}
                                    aria-label="Audio Record"
                                    className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-12 rounded-full")}
                                >
                                    <Icons.mic className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Audio Record</p>
                            </TooltipContent>
                        </Tooltip>
                    </DockIcon>
                    <Separator orientation="vertical" className="h-full" />
                    <DockIcon>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={handlePasteLink}
                                    aria-label="Paste Link"
                                    className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-12 rounded-full")}
                                >
                                    <Icons.link className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Paste Link</p>
                            </TooltipContent>
                        </Tooltip>
                    </DockIcon>
                </Dock>
            </TooltipProvider>

            {isChatOpen && (
                <Card className="fixed bottom-20 left-4 right-4 h-96 overflow-hidden max-w-md mx-auto">
                    <CardContent className="h-full p-0">
                        <div className="absolute right-2 top-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsChatOpen(false)}
                                className="h-8 w-8 hover:bg-muted"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close chat</span>
                            </Button>
                        </div>
                        <div className="flex h-full flex-col">
                            <div className="flex-1 overflow-auto p-4 space-y-4">
                                {chatMessages.map((message, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                                            message.role === "user"
                                                ? "ml-auto bg-primary text-primary-foreground"
                                                : "bg-muted"
                                        )}
                                    >
                                        {message.content}
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleChatSubmit} className="border-t p-4">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Ask anything about your conversations..."
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button type="submit" size="icon">
                                        <CircleArrowUp className="h-7 w-7" />
                                        <span className="sr-only">Send message</span>
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isVideoRecording && (
                <VideoPreview
                    videoRef={videoRef}
                    onStop={() => stopRecording()}
                />
            )}

            <ImportDialog
                isOpen={isImportOpen}
                onOpenChange={setIsImportOpen}
                dragActive={dragActive}
                onDrag={handleDrag}
                onDrop={handleDrop}
                uploadedFiles={uploadedFiles}
                onFileSelect={handleFiles}
                onDelete={deleteFile}
            />

            <MediaLibraryDialog
                isOpen={isMediaLibraryOpen}
                onOpenChange={setIsMediaLibraryOpen}
                mediaType={mediaType}
                onMediaTypeChange={(value: "audio" | "video") => setMediaType(value)}
                recordings={recordings}
                uploadedFiles={uploadedFiles}
                onDelete={deleteFile}
            />
             {(errorMessage) && (
                <div className="fixed bottom-4 right-8 bg-red-500 text-white p-4 rounded-lg shadow-lg">
                    {errorMessage}
                </div>
            )}
            {(successMessage) && (
               <div className="fixed bottom-4 right-8 bg-purple-600 text-white p-4 rounded-lg shadow-lg">
                   {successMessage}
               </div>
           )}
        </div>
    )
}