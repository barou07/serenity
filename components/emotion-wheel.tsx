"use client"

import { useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"

export interface EmotionSelection {
  primary: string
  secondary?: string
  specific?: string
}

interface EmotionWheelProps {
  onSelect: (selection: EmotionSelection) => void
  selected: EmotionSelection | null
}

const EMOTIONS = {
  Joy: {
    color: "oklch(0.85 0.12 90)",
    hoverColor: "oklch(0.88 0.14 90)",
    secondary: {
      Optimistic: ["Hopeful", "Inspired", "Open"],
      Trusting: ["Sensitive", "Intimate", "Loving"],
      Peaceful: ["Content", "Serene", "Grateful"],
      Powerful: ["Courageous", "Confident", "Proud"],
      Accepted: ["Valued", "Respected", "Fulfilled"],
    },
  },
  Sadness: {
    color: "oklch(0.72 0.08 240)",
    hoverColor: "oklch(0.76 0.10 240)",
    secondary: {
      Lonely: ["Isolated", "Abandoned", "Homesick"],
      Vulnerable: ["Fragile", "Helpless", "Exposed"],
      Despair: ["Grief", "Powerless", "Empty"],
      Guilty: ["Remorseful", "Ashamed", "Regretful"],
      Depressed: ["Inferior", "Disappointed", "Melancholy"],
    },
  },
  Fear: {
    color: "oklch(0.78 0.08 280)",
    hoverColor: "oklch(0.82 0.10 280)",
    secondary: {
      Scared: ["Frightened", "Helpless", "Panicked"],
      Anxious: ["Overwhelmed", "Worried", "Uneasy"],
      Insecure: ["Inadequate", "Inferior", "Uncertain"],
      Submissive: ["Insignificant", "Worthless", "Small"],
      Rejected: ["Excluded", "Dismissed", "Unwanted"],
    },
  },
  Anger: {
    color: "oklch(0.75 0.10 30)",
    hoverColor: "oklch(0.78 0.12 30)",
    secondary: {
      Critical: ["Skeptical", "Sarcastic", "Dismissive"],
      Distant: ["Withdrawn", "Suspicious", "Numb"],
      Frustrated: ["Infuriated", "Annoyed", "Irritated"],
      Aggressive: ["Provoked", "Hostile", "Resentful"],
      Hurt: ["Devastated", "Offended", "Betrayed"],
    },
  },
  Surprise: {
    color: "oklch(0.82 0.10 170)",
    hoverColor: "oklch(0.85 0.12 170)",
    secondary: {
      Startled: ["Shocked", "Dismayed", "Confused"],
      Amazed: ["Astonished", "Awestruck", "Speechless"],
      Excited: ["Eager", "Energetic", "Thrilled"],
      Moved: ["Touched", "Stimulated", "Stirred"],
    },
  },
  Disgust: {
    color: "oklch(0.72 0.06 150)",
    hoverColor: "oklch(0.76 0.08 150)",
    secondary: {
      Disapproval: ["Judgmental", "Embarrassed", "Critical"],
      Disappointed: ["Repelled", "Revolted", "Detestable"],
      Awful: ["Nauseated", "Uncomfortable", "Hesitant"],
      Avoidance: ["Aversion", "Reluctance", "Dread"],
    },
  },
}

type PrimaryEmotion = keyof typeof EMOTIONS

export function EmotionWheel({ onSelect, selected }: EmotionWheelProps) {
  const [mounted, setMounted] = useState(false)
  const [hoveredPrimary, setHoveredPrimary] = useState<string | null>(null)
  const [activePrimary, setActivePrimary] = useState<PrimaryEmotion | null>(null)
  const [activeSecondary, setActiveSecondary] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const primaryEmotions = Object.keys(EMOTIONS) as PrimaryEmotion[]
  const totalPrimary = primaryEmotions.length
  const anglePerPrimary = 360 / totalPrimary

  const handlePrimaryClick = useCallback((emotion: PrimaryEmotion) => {
    setActivePrimary(emotion)
    setActiveSecondary(null)
    onSelect({ primary: emotion })
  }, [onSelect])

  const handleSecondaryClick = useCallback((primary: PrimaryEmotion, secondary: string) => {
    setActiveSecondary(secondary)
    onSelect({ primary, secondary })
  }, [onSelect])

  const handleSpecificClick = useCallback((primary: PrimaryEmotion, secondary: string, specific: string) => {
    onSelect({ primary, secondary, specific })
  }, [onSelect])

  const handleBack = useCallback(() => {
    if (activeSecondary) {
      setActiveSecondary(null)
      if (activePrimary) {
        onSelect({ primary: activePrimary })
      }
    } else if (activePrimary) {
      setActivePrimary(null)
    }
  }, [activeSecondary, activePrimary, onSelect])

  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">How are you feeling?</p>
          <h3 className="font-serif text-lg font-medium text-foreground">Tap an emotion to explore</h3>
        </div>
        <div style={{ width: 320, height: 320 }} className="flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-border/40 border-t-primary/60 animate-spin" />
        </div>
      </div>
    )
  }

  // SVG wheel rendering
  const size = 320
  const center = size / 2
  const outerRadius = 140
  const innerRadius = 55

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return {
      x: Math.round((cx + r * Math.cos(rad)) * 100) / 100,
      y: Math.round((cy + r * Math.sin(rad)) * 100) / 100,
    }
  }

  function arcPath(cx: number, cy: number, rOuter: number, rInner: number, startAngle: number, endAngle: number) {
    const outerStart = polarToCartesian(cx, cy, rOuter, startAngle)
    const outerEnd = polarToCartesian(cx, cy, rOuter, endAngle)
    const innerStart = polarToCartesian(cx, cy, rInner, endAngle)
    const innerEnd = polarToCartesian(cx, cy, rInner, startAngle)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0

    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerStart.x} ${innerStart.y}`,
      `A ${rInner} ${rInner} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
      `Z`,
    ].join(" ")
  }

  // If user drilled into a specific primary emotion, show its secondary/specific views
  if (activePrimary && activeSecondary) {
    const emotionData = EMOTIONS[activePrimary]
    const secondaryData = emotionData.secondary[activeSecondary as keyof typeof emotionData.secondary]
    if (!secondaryData) return null

    return (
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
          aria-label="Go back to secondary emotions"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to {activePrimary}
        </button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Exploring</p>
          <h3 className="font-serif text-xl font-medium text-foreground">{activeSecondary}</h3>
        </div>

        <div className="flex flex-wrap justify-center gap-3 max-w-[300px]">
          {secondaryData.map((specific) => (
            <button
              key={specific}
              onClick={() => handleSpecificClick(activePrimary, activeSecondary, specific)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                "border hover:scale-105 active:scale-95",
                selected?.specific === specific
                  ? "border-primary/40 text-foreground shadow-sm"
                  : "border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/30"
              )}
              style={{
                backgroundColor: selected?.specific === specific ? emotionData.color : undefined,
                color: selected?.specific === specific ? "oklch(0.25 0.02 260)" : undefined,
              }}
              aria-label={`Select feeling: ${specific}`}
            >
              {specific}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (activePrimary) {
    const emotionData = EMOTIONS[activePrimary]
    const secondaryEmotions = Object.keys(emotionData.secondary)

    return (
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
          aria-label="Go back to primary emotions"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          All emotions
        </button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">{"You're feeling"}</p>
          <h3 className="font-serif text-xl font-medium text-foreground">{activePrimary}</h3>
        </div>

        <div className="flex flex-wrap justify-center gap-3 max-w-[300px]">
          {secondaryEmotions.map((secondary) => (
            <button
              key={secondary}
              onClick={() => handleSecondaryClick(activePrimary, secondary)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                "border hover:scale-105 active:scale-95",
                selected?.secondary === secondary
                  ? "border-primary/40 text-foreground shadow-sm"
                  : "border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/30"
              )}
              style={{
                backgroundColor: selected?.secondary === secondary ? emotionData.color : undefined,
                color: selected?.secondary === secondary ? "oklch(0.25 0.02 260)" : undefined,
              }}
              aria-label={`Select secondary emotion: ${secondary}`}
            >
              {secondary}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Primary emotion wheel view
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-1">How are you feeling?</p>
        <h3 className="font-serif text-lg font-medium text-foreground">Tap an emotion to explore</h3>
      </div>

      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="drop-shadow-sm"
          role="img"
          aria-label="Emotion wheel with primary emotions arranged in a circle"
        >
          {primaryEmotions.map((emotion, i) => {
            const startAngle = i * anglePerPrimary
            const endAngle = startAngle + anglePerPrimary
            const midAngle = startAngle + anglePerPrimary / 2
            const labelPos = polarToCartesian(center, center, (outerRadius + innerRadius) / 2, midAngle)
            const isHovered = hoveredPrimary === emotion
            const isSelected = selected?.primary === emotion
            const emotionData = EMOTIONS[emotion]

            return (
              <g key={emotion}>
                <path
                  d={arcPath(center, center, isHovered ? outerRadius + 4 : outerRadius, innerRadius, startAngle + 0.8, endAngle - 0.8)}
                  fill={isHovered || isSelected ? emotionData.hoverColor : emotionData.color}
                  stroke="oklch(0.98 0.005 250)"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200"
                  style={{
                    filter: isHovered ? "brightness(1.05)" : undefined,
                    opacity: isHovered || isSelected ? 1 : 0.85,
                  }}
                  onMouseEnter={() => setHoveredPrimary(emotion)}
                  onMouseLeave={() => setHoveredPrimary(null)}
                  onClick={() => handlePrimaryClick(emotion)}
                  role="button"
                  aria-label={`Select primary emotion: ${emotion}`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handlePrimaryClick(emotion)
                    }
                  }}
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="pointer-events-none select-none"
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    fill: "oklch(0.30 0.02 260)",
                    fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
                  }}
                >
                  {emotion}
                </text>
              </g>
            )
          })}

          {/* Center circle */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius - 6}
            fill="oklch(0.99 0.003 250)"
            stroke="oklch(0.92 0.01 250)"
            strokeWidth="1"
          />
          <text
            x={center}
            y={center - 8}
            textAnchor="middle"
            dominantBaseline="central"
            style={{
              fontSize: "11px",
              fill: "oklch(0.55 0.02 260)",
              fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
            }}
          >
            {"I feel..."}
          </text>
          <text
            x={center}
            y={center + 8}
            textAnchor="middle"
            dominantBaseline="central"
            style={{
              fontSize: "10px",
              fill: "oklch(0.65 0.015 260)",
              fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
            }}
          >
            (tap to explore)
          </text>
        </svg>
      </div>
    </div>
  )
}
