"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Target } from "lucide-react"
import { WorkoutLogger } from "@/components/workout-logger"
import { GoalTracker } from "@/components/goal-tracker"

export default function GymTracker() {
  const [activeTab, setActiveTab] = useState<"log" | "goals">("log")

  const [lastWorkouts, setLastWorkouts] = useState({})
  const [goals, setGoals] = useState([])

  useEffect(() => {
    const savedWorkouts = localStorage.getItem("gym-workouts")
    const savedGoals = localStorage.getItem("gym-goals")

    if (savedWorkouts) {
      setLastWorkouts(JSON.parse(savedWorkouts))
    }

    if (savedGoals) {
      setGoals(JSON.parse(savedGoals) || [])
    } else {
      setGoals([
        { id: 1, title: "Bench Press 200lbs", current: 135, target: 200, unit: "lbs" },
        { id: 2, title: "Workout 3x/week", current: 2, target: 3, unit: "days" },
      ])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("gym-workouts", JSON.stringify(lastWorkouts))
  }, [lastWorkouts])

  useEffect(() => {
    localStorage.setItem("gym-goals", JSON.stringify(goals))
  }, [goals])

  const addGoal = (goal: any) => {
    setGoals((prev) => [...prev, { ...goal, id: Date.now() }])
  }

  const BottomNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4">
      <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
        <Button
          variant={activeTab === "log" ? "default" : "ghost"}
          size="sm"
          className="flex flex-col gap-1 h-auto py-2"
          onClick={() => setActiveTab("log")}
        >
          <Plus className="h-5 w-5" />
          <span className="text-xs">Log</span>
        </Button>
        <Button
          variant={activeTab === "goals" ? "default" : "ghost"}
          size="sm"
          className="flex flex-col gap-1 h-auto py-2"
          onClick={() => setActiveTab("goals")}
        >
          <Target className="h-5 w-5" />
          <span className="text-xs">Goals</span>
        </Button>
      </div>
    </div>
  )

  if (activeTab === "log") {
    return (
      <div className="min-h-screen bg-background">
        <WorkoutLogger lastWorkouts={lastWorkouts} />
        <BottomNavigation />
        <div className="h-20" />
      </div>
    )
  }

  if (activeTab === "goals") {
    return (
      <div className="min-h-screen bg-background">
        <GoalTracker goals={goals} onAddGoal={addGoal} />
        <BottomNavigation />
        <div className="h-20" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <WorkoutLogger lastWorkouts={lastWorkouts} />
      <BottomNavigation />
      <div className="h-20" />
    </div>
  )
}
