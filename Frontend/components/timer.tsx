"use client"

import { useState, useEffect } from "react"

interface TimerProps {
  isRunning: boolean
  startTime: string // ISO string, e.g., "2025-05-02T12:00:00.000Z"
  onElapsedTimeChange?: (elapsedTime: number) => void // Optional callback for parent
}

export default function Timer({ isRunning, startTime, onElapsedTimeChange }: TimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    let interval = null

    if (isRunning) {
      // Calculate initial elapsed time
      const start = new Date(startTime).getTime()
      const updateTimer = () => {
        const now = new Date().getTime()
        const elapsed = Math.floor((now - start) / 1000) // Seconds
        setElapsedTime(elapsed)
        if (onElapsedTimeChange) {
          onElapsedTimeChange(elapsed)
        }
      }

      // Update immediately
      updateTimer()
      // Update every second
      interval = setInterval(updateTimer, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, startTime, onElapsedTimeChange])

  // Format elapsed time as HH:MM:SS
  interface FormatTimeProps {
    seconds: number
  }

  const formatTime = (seconds: FormatTimeProps["seconds"]): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="text-lg font-medium text-white">
      {formatTime(elapsedTime)}
    </div>
  )
}