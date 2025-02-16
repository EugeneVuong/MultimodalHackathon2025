"use client"

import type React from "react"

import { useState } from "react"
import { Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Message {
  id: number
  sender: string
  content: string
  timestamp: string
  isAI?: boolean
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "System",
      content: "Welcome to the security monitoring chat. How can I assist you?",
      timestamp: "12:00 PM",
      isAI: true,
    },
  ])
  const [input, setInput] = useState("")

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage: Message = {
      id: Date.now(),
      sender: "You",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, newMessage])
    setInput("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        sender: "AI Assistant",
        content: "I've noted your message. I'll monitor the cameras for any suspicious activity.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isAI: true,
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 mb-4 ${message.isAI ? "flex-row" : "flex-row-reverse"}`}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.isAI ? "/placeholder.svg?height=32&width=32" : ""} />
              <AvatarFallback>{message.isAI ? "AI" : <User className="h-4 w-4" />}</AvatarFallback>
            </Avatar>
            <div className={`flex flex-col ${message.isAI ? "items-start" : "items-end"}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{message.sender}</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">{message.timestamp}</span>
              </div>
              <div
                className={`mt-1 rounded-lg px-3 py-2 text-sm ${
                  message.isAI ? "bg-neutral-100 dark:bg-neutral-800" : "bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900"
                }`}
              >
                {message.content}
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}

