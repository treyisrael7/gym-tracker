"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Goal {
  id: number
  title: string
  current: number
  target: number
  unit: string
}

interface GoalTrackerProps {
  goals: Goal[]
  onAddGoal: (goal: Omit<Goal, "id">) => void
}

export function GoalTracker({ goals, onAddGoal }: GoalTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: "",
    current: 0,
    target: 0,
    unit: "lbs",
  })

  const safeGoals = Array.isArray(goals) ? goals : []

  const handleAddGoal = () => {
    if (newGoal.title && newGoal.target > 0) {
      onAddGoal(newGoal)
      setNewGoal({ title: "", current: 0, target: 0, unit: "lbs" })
      setShowAddForm(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b p-4">
        <h1 className="text-xl font-semibold">Goals</h1>
      </div>

      <div className="p-4 space-y-4 pb-20">
        {/* Add Goal Button */}
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} className="w-full" size="lg">
            Add New Goal
          </Button>
        )}

        {/* Add Goal Form */}
        {showAddForm && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">New Goal</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal-title">Goal Title</Label>
                <Input
                  id="goal-title"
                  placeholder="e.g., Bench Press 200lbs"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="current">Current</Label>
                  <Input
                    id="current"
                    type="number"
                    min="0"
                    value={newGoal.current}
                    onChange={(e) => setNewGoal({ ...newGoal, current: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Target</Label>
                  <Input
                    id="target"
                    type="number"
                    min="1"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select value={newGoal.unit} onValueChange={(value) => setNewGoal({ ...newGoal, unit: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lbs">lbs</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="days">days</SelectItem>
                    <SelectItem value="reps">reps</SelectItem>
                    <SelectItem value="minutes">minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddGoal} className="flex-1">
                  Add Goal
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goals List */}
        <div className="space-y-4">
          {safeGoals.map((goal) => {
            const progress = Math.min((goal.current / goal.target) * 100, 100)
            const isCompleted = progress >= 100

            return (
              <Card key={goal.id} className={isCompleted ? "border-primary bg-primary/5" : ""}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-balance">{goal.title}</h3>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {goal.current}/{goal.target} {goal.unit} ({Math.round(progress)}%)
                        </span>
                      </div>

                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            isCompleted ? "bg-primary" : "bg-accent"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {isCompleted && <div className="text-center text-primary font-medium text-sm">Goal Achieved!</div>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {safeGoals.length === 0 && !showAddForm && (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="font-semibold mb-2">No Goals Yet</h3>
              <p className="text-muted-foreground text-sm text-balance">
                Set your first fitness goal to start tracking your progress!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
