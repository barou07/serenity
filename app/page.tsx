"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { ChatHeader } from "@/components/chat-header"
import { ChatMessage, type Message } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { EmotionWheel, type EmotionSelection } from "@/components/emotion-wheel"

const COMPANION_RESPONSES: Record<string, string[]> = {
  Joy: [
    "It sounds like you're in a good place right now. What's bringing you this feeling of joy?",
    "That's wonderful to hear. Savoring positive emotions can help build resilience over time.",
    "Joy is a beautiful emotion. Take a moment to really sit with this feeling.",
  ],
  Sadness: [
    "It takes courage to acknowledge sadness. I'm here to listen whenever you're ready to share more.",
    "Sadness is a natural part of being human. There's no rush to feel differently than you do right now.",
    "Thank you for sharing that with me. Would you like to explore what might be underneath this feeling?",
  ],
  Fear: [
    "Fear can feel overwhelming, but naming it is already a brave step. What feels most present for you?",
    "It's okay to feel afraid. Let's take a breath together and explore this at your pace.",
    "Acknowledging fear takes strength. What would feel most supportive for you right now?",
  ],
  Anger: [
    "Anger often points to something important to us. What feels like it needs to be heard right now?",
    "It's completely valid to feel angry. Let's sit with this feeling without judgment.",
    "Anger can carry a lot of energy. How is this feeling showing up in your body right now?",
  ],
  Surprise: [
    "Unexpected moments can shake our sense of stability. How are you processing this?",
    "Surprise can be disorienting. Take your time making sense of what you're experiencing.",
    "That sounds like quite an unexpected turn. What feelings are coming up alongside the surprise?",
  ],
  Disgust: [
    "That sounds like a strong reaction. What feels most uncomfortable about this situation?",
    "Disgust can be a protective emotion. It often signals that a boundary has been crossed.",
    "Thank you for being honest about how you feel. Let's explore this together.",
  ],
  default: [
    "Thank you for sharing. I'm here to listen and support you. Would you like to use the emotion wheel to explore how you're feeling?",
    "I hear you. Sometimes just putting thoughts into words can bring a sense of clarity.",
    "Take your time. There's no pressure here. This is a safe space for whatever you need to express.",
    "I appreciate you opening up. Would you like to explore your emotions using the wheel on the right?",
  ],
}

function getCompanionResponse(emotion: EmotionSelection | null): string {
  if (emotion?.primary) {
    const responses = COMPANION_RESPONSES[emotion.primary] || COMPANION_RESPONSES.default
    return responses[Math.floor(Math.random() * responses.length)]
  }
  return COMPANION_RESPONSES.default[Math.floor(Math.random() * COMPANION_RESPONSES.default.length)]
}

function createInitialMessages(): Message[] {
  const now = Date.now()
  return [
    {
      id: "welcome-1",
      content: "Welcome to Serenity. This is a safe, private space where you can explore your thoughts and feelings at your own pace.",
      sender: "companion",
      timestamp: new Date(now - 60000),
    },
    {
      id: "welcome-2",
      content: "You can share whatever is on your mind, or use the emotion wheel to help identify what you're feeling. There's no right or wrong here.",
      sender: "companion",
      timestamp: new Date(now - 30000),
    },
  ]
}

export default function SerenityChat() {
  const [messages, setMessages] = useState<Message[]>(() => createInitialMessages())
  const [isWheelOpen, setIsWheelOpen] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<EmotionSelection | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = useCallback((content: string) => {
    const emotionLabel = currentEmotion
      ? [currentEmotion.primary, currentEmotion.secondary, currentEmotion.specific]
          .filter(Boolean)
          .join(" / ")
      : undefined

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      sender: "user",
      timestamp: new Date(),
      emotion: emotionLabel,
    }

    setMessages((prev) => [...prev, userMessage])

     //Simulate companion response
    ;(async () => {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: content,
      emotion: currentEmotion?.primary || "neutral",
    }),
  })

  const data = await res.json()

  const response: Message = {
    id: `companion-${Date.now()}`,
    content: data.reply,
    sender: "companion",
    timestamp: new Date(),
  }

  setMessages((prev) => [...prev, response])
})()
  }, [currentEmotion])

  const handleEmotionSelect = useCallback((selection: EmotionSelection) => {
    setCurrentEmotion(selection)

    // Add a subtle system-like message acknowledging the emotion selection
    if (selection.specific) {
      const acknowledgment: Message = {
        id: `emotion-${Date.now()}`,
        content: `I can see you're identifying as feeling ${selection.specific.toLowerCase()}. That's a really specific insight into your emotional state. Would you like to tell me more about what's bringing up this feeling?`,
        sender: "companion",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, acknowledgment])
    }
  }, [])

  const handleToggleWheel = useCallback(() => {
    setIsWheelOpen((prev) => !prev)
  }, [])

  return (
    <main className="flex h-dvh w-full bg-background overflow-hidden">
      {/* Chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        <ChatHeader currentEmotion={currentEmotion} />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="flex flex-col gap-4 max-w-2xl mx-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <ChatInput
          onSend={handleSend}
          onToggleWheel={handleToggleWheel}
          isWheelOpen={isWheelOpen}
          placeholder={
            currentEmotion?.specific
              ? `Tell me more about feeling ${currentEmotion.specific.toLowerCase()}...`
              : currentEmotion?.primary
                ? `Share what's on your mind about ${currentEmotion.primary.toLowerCase()}...`
                : "Share what's on your mind..."
          }
        />
      </div>

      {/* Emotion wheel slide-in panel (desktop only) */}
      <div
        className={cn(
          "hidden md:block flex-shrink-0 border-l border-border/40 bg-card/60 backdrop-blur-sm",
          "transition-all duration-300 ease-out overflow-hidden",
          isWheelOpen ? "w-[380px] opacity-100" : "w-0 opacity-0"
        )}
        role="complementary"
        aria-label="Emotion wheel panel"
      >
        <div className="w-[380px] h-full flex flex-col">
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
            <div>
              <h2 className="font-serif text-sm font-medium text-foreground">Emotion Wheel</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Explore how you feel</p>
            </div>
            <button
              onClick={handleToggleWheel}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200"
              aria-label="Close emotion wheel"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Wheel content */}
          <div className="flex-1 overflow-y-auto flex items-center justify-center p-6">
            <EmotionWheel onSelect={handleEmotionSelect} selected={currentEmotion} />
          </div>

          {/* Current selection display */}
          {currentEmotion && (
            <div className="px-5 py-4 border-t border-border/40 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-xs text-muted-foreground mb-2">Current feeling</p>
              <div className="flex flex-wrap gap-2">
                {[currentEmotion.primary, currentEmotion.secondary, currentEmotion.specific]
                  .filter(Boolean)
                  .map((label, i) => (
                    <span
                      key={i}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full font-medium",
                        i === 0 ? "bg-primary/10 text-primary" :
                        i === 1 ? "bg-accent/20 text-accent-foreground" :
                        "bg-secondary text-secondary-foreground"
                      )}
                    >
                      {label}
                    </span>
                  ))}
              </div>
              <button
                onClick={() => setCurrentEmotion(null)}
                className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 underline underline-offset-2"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay for emotion wheel */}
      {isWheelOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={handleToggleWheel}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-[380px] bg-card border-l border-border/40 animate-in slide-in-from-right duration-300 flex flex-col">
            {/* Mobile panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div>
                <h2 className="font-serif text-sm font-medium text-foreground">Emotion Wheel</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Explore how you feel</p>
              </div>
              <button
                onClick={handleToggleWheel}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200"
                aria-label="Close emotion wheel"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Mobile wheel content */}
            <div className="flex-1 overflow-y-auto flex items-center justify-center p-6">
              <EmotionWheel onSelect={handleEmotionSelect} selected={currentEmotion} />
            </div>

            {/* Mobile current selection */}
            {currentEmotion && (
              <div className="px-5 py-4 border-t border-border/40">
                <p className="text-xs text-muted-foreground mb-2">Current feeling</p>
                <div className="flex flex-wrap gap-2">
                  {[currentEmotion.primary, currentEmotion.secondary, currentEmotion.specific]
                    .filter(Boolean)
                    .map((label, i) => (
                      <span
                        key={i}
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-full font-medium",
                          i === 0 ? "bg-primary/10 text-primary" :
                          i === 1 ? "bg-accent/20 text-accent-foreground" :
                          "bg-secondary text-secondary-foreground"
                        )}
                      >
                        {label}
                      </span>
                    ))}
                </div>
                <button
                  onClick={() => setCurrentEmotion(null)}
                  className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 underline underline-offset-2"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
