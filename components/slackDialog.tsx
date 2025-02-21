"use client"
import { useState, useEffect, useRef } from "react"
import { LinkIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

interface Channel {
    id: string
    name: string
}

interface SlackDialogProps {
    postToSlack: (channelIds: string[]) => Promise<void>
    channels: Channel[]
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function SlackDialog({ postToSlack, channels, isOpen, onOpenChange }: SlackDialogProps) {
    const suggestedChannels = ["new-channel", "all-texpertz-solutions", "social"]
    const [selectedChannels, setSelectedChannels] = useState<Channel[]>([])
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isOpen) {
            setSelectedChannels([])
            setIsDropdownOpen(false)
        }
    }, [isOpen])

    // Close the dropdown if clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if the click is outside the dropdown container
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleChannelSelect = (channelName: string) => {
        const channel = channels.find(c => c.name === channelName)
        if (channel && !selectedChannels.some(sc => sc.id === channel.id)) {
            setSelectedChannels([...selectedChannels, channel])
        }
        setIsDropdownOpen(false)
    }

    const handlePostClick = async () => {
        if (selectedChannels.length > 0) {
            const selectedChannelIds = selectedChannels.map(channel => channel.id);
            await postToSlack(selectedChannelIds);
            onOpenChange(false);
        } else {
            console.log("Please select a Slack channel to post.");
        }
    };

    const handleRemoveChannel = (channelToRemove: string) => {
        setSelectedChannels(selectedChannels.filter(channel => channel.name !== channelToRemove))
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[45%]">
                <DialogHeader className="flex flex-row items-start justify-between">
                    <div className="flex items-center gap-x-2">
                        <Image
                            src="/slack_icon.svg"
                            alt="Slack"
                            width={20}
                            height={20}
                        />
                        <DialogTitle className="text-lg">Post meeting summaries to Slack</DialogTitle>
                    </div>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-[15px] text-muted-foreground mb-4">
                        Choose Slack channel(s) to share the conversation and post meeting summaries.
                    </p>
                    
                    {/* Channel Selection Input */}
                    <div className="flex gap-2">
                        {/* Wrap the input and dropdown in a ref container */}
                        <div className="relative flex-1" ref={dropdownRef}>
                            <div 
                                className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md cursor-text"
                                onClick={() => setIsDropdownOpen(true)}
                            >
                                {selectedChannels.map((channel) => (
                                    <div key={channel.id} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 rounded">
                                        # {channel.name}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleRemoveChannel(channel.name)
                                            }}
                                            className="ml-1"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                <input 
                                    type="text"
                                    placeholder={selectedChannels.length === 0 ? "Add Slack channel" : ""}
                                    className="flex-1 outline-none min-w-[120px]"
                                    onFocus={() => setIsDropdownOpen(false)}
                                />
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-10">
                                    <div className="py-2">
                                        {channels.map((channel) => (
                                            <button
                                                key={channel.id}
                                                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                                                onClick={() => handleChannelSelect(channel.name)}
                                            >
                                                <span className="text-gray-500">#</span>
                                                {channel.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handlePostClick}>Post</Button>
                    </div>
                    
                    {/* Suggested Channels */}
                    <div className="mt-6">
                        <p className="text-sm text-muted-foreground mb-3">Suggested channels</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestedChannels
                                .filter(suggestedChannel => 
                                    !selectedChannels.some(channel => channel.name === suggestedChannel)
                                )
                                .map((channel) => (
                                    <button
                                        key={channel}
                                        onClick={() => handleChannelSelect(channel)}
                                        className="px-3 py-1 bg-slate-100 rounded-md text-sm flex items-center gap-1 hover:bg-slate-200"
                                    >
                                        <span className="text-slate-500">#</span>
                                        <span>{channel}</span>
                                    </button>
                                ))}
                        </div>
                    </div>

                    <Button variant="outline" size="sm" className="mt-6 text-blue-600 font-normal">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Copy link
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default SlackDialog
