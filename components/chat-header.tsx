"use client"

import type { EmotionSelection } from "@/components/emotion-wheel"

interface ChatHeaderProps {
  currentEmotion: EmotionSelection | null
}

export function ChatHeader({ currentEmotion }: ChatHeaderProps) {
  const emotionLabel = currentEmotion
    ? [currentEmotion.primary, currentEmotion.secondary, currentEmotion.specific]
        .filter(Boolean)
        .join(" / ")
    : null

  return (
    <header className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
            <path d="M12 3C7.03 3 3 6.58 3 11C3 13.42 4.26 15.58 6.25 17L5.5 21L9.47 18.83C10.28 18.94 11.13 19 12 19C16.97 19 21 15.42 21 11C21 6.58 16.97 3 12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="8.5" cy="11" r="1" fill="currentColor"/>
            <circle cx="12" cy="11" r="1" fill="currentColor"/>
            <circle cx="15.5" cy="11" r="1" fill="currentColor"/>
          </svg>
        </div>
        <div>
          <h1 className="font-serif text-base font-medium text-foreground leading-tight">Serenity</h1>
          <p className="text-xs text-muted-foreground">Your mindful companion</p>
        </div>
      </div>

      {emotionLabel && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/20 border border-accent/20 animate-in fade-in duration-300">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-xs text-accent-foreground font-medium">{emotionLabel}</span>
        </div>
      )}
    </header>
  )
}
