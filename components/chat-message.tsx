"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export interface Message {
  id: string
  content: string
  sender: "user" | "companion"
  timestamp: Date
  emotion?: string
}

interface ChatMessageProps {
  message: Message
}

function formatTime(date: Date): string {
  const h = date.getHours()
  const m = date.getMinutes()
  const hh = h.toString().padStart(2, "0")
  const mm = m.toString().padStart(2, "0")
  return `${hh}:${mm}`
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === "user"
  const [timeString, setTimeString] = useState<string>("")

  useEffect(() => {
    setTimeString(formatTime(message.timestamp))
  }, [message.timestamp])

  return (
    <div
      className={cn(
        "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn("flex flex-col gap-1 max-w-[80%]")}>
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-card text-card-foreground border border-border/60 rounded-bl-md"
          )}
        >
          {message.emotion && (
            <span className={cn(
              "inline-block text-xs px-2 py-0.5 rounded-full mb-1.5 font-medium",
              isUser ? "bg-primary-foreground/15 text-primary-foreground" : "bg-accent/40 text-accent-foreground"
            )}>
              {message.emotion}
            </span>
          )}
          <p>{message.content}</p>
        </div>
        {timeString && (
          <span className={cn(
            "text-[10px] text-muted-foreground px-1",
            isUser ? "text-right" : "text-left"
          )}>
            {timeString}
          </span>
        )}
      </div>
    </div>
  )
}
