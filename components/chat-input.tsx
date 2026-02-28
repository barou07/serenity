"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSend: (message: string) => void
  onToggleWheel: () => void
  isWheelOpen: boolean
  placeholder?: string
}

export function ChatInput({ onSend, onToggleWheel, isWheelOpen, placeholder }: ChatInputProps) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px"
    }
  }, [value])

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-3 p-4 border-t border-border/40 bg-card/80 backdrop-blur-sm">
      {/* Emotion wheel toggle */}
      <button
        onClick={onToggleWheel}
        className={cn(
          "flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
          "border hover:scale-105 active:scale-95",
          isWheelOpen
            ? "bg-primary/10 border-primary/30 text-primary"
            : "bg-muted/50 border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/20"
        )}
        aria-label={isWheelOpen ? "Close emotion wheel" : "Open emotion wheel"}
        title="Emotion Wheel"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M12 16V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M2 12H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M16 12H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Text input */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Share what's on your mind..."}
          rows={1}
          className={cn(
            "w-full resize-none rounded-xl border border-border/60 bg-background px-4 py-2.5",
            "text-sm text-foreground placeholder:text-muted-foreground/60",
            "focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary/30",
            "transition-all duration-200 leading-relaxed"
          )}
          aria-label="Chat message input"
        />
      </div>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!value.trim()}
        className={cn(
          "flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
          "hover:scale-105 active:scale-95",
          value.trim()
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-muted/50 text-muted-foreground/40 cursor-not-allowed"
        )}
        aria-label="Send message"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 2L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}
