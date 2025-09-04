"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play, Pause, RotateCcw, Clock } from "lucide-react"

export function WorkoutTimer() {
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [customMinutes, setCustomMinutes] = useState("")
  const [customSeconds, setCustomSeconds] = useState("")
  const [timerLabel, setTimerLabel] = useState("Rest Timer")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const presets = [
    { label: "30s", time: 30 },
    { label: "45s", time: 45 },
    { label: "1m", time: 60 },
    { label: "1:30", time: 90 },
    { label: "2m", time: 120 },
    { label: "3m", time: 180 },
    { label: "5m", time: 300 },
  ]

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            // Play notification sound when timer finishes
            if (typeof window !== 'undefined' && 'Notification' in window) {
              new Notification('Timer Complete!', {
                body: `${timerLabel} has finished`,
                icon: '/favicon.ico'
              })
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft, timerLabel])

  const startTimer = (seconds: number) => {
    setTimeLeft(seconds)
    setIsRunning(true)
    
    // Request notification permission if not already granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleCustomTimer = () => {
    const minutes = parseInt(customMinutes) || 0
    const seconds = parseInt(customSeconds) || 0
    const totalSeconds = minutes * 60 + seconds
    
    if (totalSeconds > 0) {
      startTimer(totalSeconds)
      setCustomMinutes("")
      setCustomSeconds("")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold">Workout Timer</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Track rest periods and intervals</p>
      </div>

      <div className="p-4 space-y-4 pb-20">
        {/* Main Timer Display - iPhone Clock style */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2 font-medium">{timerLabel}</div>
            <div className={`text-7xl font-mono font-light mb-6 ${isRunning ? 'text-primary' : 'text-foreground'}`}>
              {formatTime(timeLeft)}
            </div>
            
            {/* Control Buttons - iPhone style */}
            <div className="flex justify-center gap-4 mb-6">
              {!isRunning ? (
                <Button 
                  onClick={() => startTimer(timeLeft || 60)} 
                  size="lg"
                  className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90"
                  disabled={timeLeft === 0}
                >
                  <Play className="h-6 w-6 ml-1" />
                </Button>
              ) : (
                <Button 
                  onClick={pauseTimer} 
                  variant="outline" 
                  size="lg"
                  className="h-14 w-14 rounded-full border-2"
                >
                  <Pause className="h-6 w-6" />
                </Button>
              )}
              <Button 
                onClick={resetTimer} 
                variant="outline" 
                size="lg"
                className="h-14 w-14 rounded-full border-2"
              >
                <RotateCcw className="h-6 w-6" />
              </Button>
            </div>

            {/* Custom Timer Input */}
            {!isRunning && timeLeft === 0 && (
              <div className="max-w-sm mx-auto">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Label htmlFor="custom-minutes" className="text-sm text-muted-foreground">Minutes</Label>
                    <Input
                      id="custom-minutes"
                      type="number"
                      min="0"
                      max="59"
                      placeholder="0"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value)}
                      className="text-center text-xl h-12 border-2"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="custom-seconds" className="text-sm text-muted-foreground">Seconds</Label>
                    <Input
                      id="custom-seconds"
                      type="number"
                      min="0"
                      max="59"
                      placeholder="0"
                      value={customSeconds}
                      onChange={(e) => setCustomSeconds(e.target.value)}
                      className="text-center text-xl h-12 border-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (customMinutes || customSeconds)) {
                          handleCustomTimer()
                        }
                      }}
                    />
                  </div>
                  <Button 
                    onClick={handleCustomTimer}
                    disabled={(!customMinutes && !customSeconds) || (parseInt(customMinutes || "0") === 0 && parseInt(customSeconds || "0") === 0)}
                    className="h-12 px-6"
                  >
                    Set
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Presets - iPhone style grid */}
        <div className="bg-card rounded-2xl p-4 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Quick Start</h3>
          <div className="grid grid-cols-4 gap-3">
            {presets.map((preset) => (
              <Button
                key={preset.time}
                variant="outline"
                onClick={() => startTimer(preset.time)}
                className="h-12 rounded-xl border-2 font-medium"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Workout Intervals - iPhone style list */}
        <div className="bg-card rounded-2xl p-4 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Workout Intervals</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => {
                setTimerLabel("Rest Between Sets")
                startTimer(90)
              }}
              className="w-full justify-between h-14 rounded-xl border-2 text-left"
            >
              <span className="font-medium">Rest Between Sets</span>
              <span className="text-muted-foreground">1:30</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setTimerLabel("Rest Between Exercises")
                startTimer(180)
              }}
              className="w-full justify-between h-14 rounded-xl border-2 text-left"
            >
              <span className="font-medium">Rest Between Exercises</span>
              <span className="text-muted-foreground">3:00</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setTimerLabel("Circuit Rest")
                startTimer(60)
              }}
              className="w-full justify-between h-14 rounded-xl border-2 text-left"
            >
              <span className="font-medium">Circuit Rest</span>
              <span className="text-muted-foreground">1:00</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
