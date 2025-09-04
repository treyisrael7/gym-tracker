"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Set {
  reps: number | string
  weight: number | string
}

interface Exercise {
  name: string
  sets: Set[]
}

interface WorkoutLoggerProps {
  lastWorkouts: Record<string, { sets: number; reps: number; weight: number }>
}

export function WorkoutLogger({ lastWorkouts }: WorkoutLoggerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([{ name: "", sets: [{ reps: 1, weight: 0 }] }])
  const [notes, setNotes] = useState("")
  const [muscleGroup, setMuscleGroup] = useState("")
  const [customExercises, setCustomExercises] = useState<Record<string, string[]>>({
    Chest: [],
    Triceps: [],
    Legs: [],
    Biceps: [],
    Shoulders: [],
    Back: [],
  })
  const [creatingCustom, setCreatingCustom] = useState<Record<number, boolean>>({})
  const [customExerciseNames, setCustomExerciseNames] = useState<Record<number, string>>({})

  useEffect(() => {
    if (muscleGroup && exercises.some((ex) => ex.name)) {
      const workoutData = {
        muscleGroup,
        exercises: exercises.filter((ex) => ex.name),
        notes,
        customExercises,
      }
      localStorage.setItem(`workout_${muscleGroup}`, JSON.stringify(workoutData))
    }
  }, [exercises, notes, muscleGroup, customExercises])

  useEffect(() => {
    if (muscleGroup) {
      const saved = localStorage.getItem(`workout_${muscleGroup}`)
      if (saved) {
        try {
          const data = JSON.parse(saved)
          setExercises(data.exercises.length > 0 ? data.exercises : [{ name: "", sets: [{ reps: 1, weight: 0 }] }])
          setNotes(data.notes || "")
          setCustomExercises((prev) => ({ ...prev, ...data.customExercises }))
        } catch (e) {
          setExercises([{ name: "", sets: [{ reps: 1, weight: 0 }] }])
          setNotes("")
        }
      } else {
        setExercises([{ name: "", sets: [{ reps: 1, weight: 0 }] }])
        setNotes("")
      }
    }
  }, [muscleGroup])

  const exercisesByGroup = {
    Chest: [
      "Bench Press",
      "Incline Press",
      "Chest Flyes",
      "Push-ups",
      "Decline Press",
      "Cable Flyes",
      "Dumbbell Press",
    ],
    Triceps: [
      "Tricep Extensions",
      "Tricep Dips",
      "Close Grip Press",
      "Cable Pushdowns",
      "Overhead Extensions",
      "Diamond Push-ups",
    ],
    Legs: [
      "Squats",
      "Leg Press",
      "Lunges",
      "Leg Curls",
      "Calf Raises",
      "Deadlifts",
      "Leg Extensions",
      "Romanian Deadlifts",
    ],
    Biceps: ["Bicep Curls", "Hammer Curls", "Preacher Curls", "Cable Curls", "Concentration Curls", "21s"],
    Shoulders: [
      "Overhead Press",
      "Lateral Raises",
      "Front Raises",
      "Shrugs",
      "Rear Delt Flyes",
      "Arnold Press",
      "Upright Rows",
    ],
    Back: ["Pull-ups", "Lat Pulldowns", "Rows", "T-Bar Rows", "Cable Rows", "Face Pulls", "Reverse Flyes", "Deadlifts"],
  }

  const availableExercises = muscleGroup
    ? [
        ...(exercisesByGroup[muscleGroup as keyof typeof exercisesByGroup] || []),
        ...(customExercises[muscleGroup] || []),
      ]
    : []

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: [{ reps: 1, weight: 0 }] }])
  }

  const removeExercise = (index: number) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, i) => i !== index))
      const newCreatingCustom = { ...creatingCustom }
      const newCustomNames = { ...customExerciseNames }
      delete newCreatingCustom[index]
      delete newCustomNames[index]
      setCreatingCustom(newCreatingCustom)
      setCustomExerciseNames(newCustomNames)
    }
  }

  const addSet = (exerciseIndex: number) => {
    const updated = exercises.map((exercise, i) =>
      i === exerciseIndex ? { ...exercise, sets: [...exercise.sets, { reps: 1, weight: 0 }] } : exercise,
    )
    setExercises(updated)
  }

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updated = exercises.map((exercise, i) =>
      i === exerciseIndex && exercise.sets.length > 1
        ? { ...exercise, sets: exercise.sets.filter((_, si) => si !== setIndex) }
        : exercise,
    )
    setExercises(updated)
  }

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof Set, value: number | string) => {
    const updated = exercises.map((exercise, i) =>
      i === exerciseIndex
        ? {
            ...exercise,
            sets: exercise.sets.map((set, si) => (si === setIndex ? { ...set, [field]: value } : set)),
          }
        : exercise,
    )
    setExercises(updated)
  }

  const updateExerciseName = (index: number, name: string) => {
    const updated = exercises.map((exercise, i) => (i === index ? { ...exercise, name } : exercise))
    setExercises(updated)
  }

  const handleExerciseSelect = (index: number, value: string) => {
    if (value === "CREATE_CUSTOM") {
      setCreatingCustom({ ...creatingCustom, [index]: true })
      setCustomExerciseNames({ ...customExerciseNames, [index]: "" })
    } else {
      updateExerciseName(index, value)

      const lastWorkout = lastWorkouts[value]
      if (lastWorkout) {
        const updated = exercises.map((exercise, i) =>
          i === index
            ? {
                ...exercise,
                name: value,
                sets: [{ reps: lastWorkout.reps, weight: lastWorkout.weight }],
              }
            : exercise,
        )
        setExercises(updated)
      }

      const newCreatingCustom = { ...creatingCustom }
      const newCustomNames = { ...customExerciseNames }
      delete newCreatingCustom[index]
      delete newCustomNames[index]
      setCreatingCustom(newCreatingCustom)
      setCustomExerciseNames(newCustomNames)
    }
  }

  const saveCustomExercise = (index: number) => {
    const customName = customExerciseNames[index]?.trim()
    if (customName && muscleGroup) {
      setCustomExercises({
        ...customExercises,
        [muscleGroup]: [...(customExercises[muscleGroup] || []), customName],
      })

      updateExerciseName(index, customName)

      const newCreatingCustom = { ...creatingCustom }
      const newCustomNames = { ...customExerciseNames }
      delete newCreatingCustom[index]
      delete newCustomNames[index]
      setCreatingCustom(newCreatingCustom)
      setCustomExerciseNames(newCustomNames)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b p-4">
        <h1 className="text-xl font-semibold">Log Workout</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your exercises and progress</p>
      </div>

      <div className="p-4 space-y-6 pb-20">
        <Card className="border-2 shadow-sm">
          <CardContent className="p-4">
            <Label className="text-base font-medium mb-3 block">Select Muscle Group</Label>
            <Select value={muscleGroup} onValueChange={setMuscleGroup}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Choose muscle group to start logging" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Chest" className="text-base py-3">
                  Chest
                </SelectItem>
                <SelectItem value="Triceps" className="text-base py-3">
                  Triceps
                </SelectItem>
                <SelectItem value="Legs" className="text-base py-3">
                  Legs
                </SelectItem>
                <SelectItem value="Biceps" className="text-base py-3">
                  Biceps
                </SelectItem>
                <SelectItem value="Shoulders" className="text-base py-3">
                  Shoulders
                </SelectItem>
                <SelectItem value="Back" className="text-base py-3">
                  Back
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {muscleGroup && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Exercises</Label>
              <Button variant="outline" size="sm" onClick={addExercise}>
                Add Exercise
              </Button>
            </div>

            {exercises.map((exercise, index) => (
              <Card key={index} className="shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Exercise {index + 1}</span>
                    {exercises.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExercise(index)}
                        className="text-destructive"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  {exercise.name && lastWorkouts[exercise.name] && (
                    <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border-l-4 border-primary">
                      <strong>Last time:</strong> {lastWorkouts[exercise.name].sets} sets ×{" "}
                      {lastWorkouts[exercise.name].reps} reps @ {lastWorkouts[exercise.name].weight}lbs
                    </div>
                  )}

                  {creatingCustom[index] ? (
                    <div className="space-y-2">
                      <Label className="text-sm">Custom Exercise Name</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter exercise name"
                          value={customExerciseNames[index] || ""}
                          onChange={(e) =>
                            setCustomExerciseNames({
                              ...customExerciseNames,
                              [index]: e.target.value,
                            })
                          }
                        />
                        <Button
                          size="sm"
                          onClick={() => saveCustomExercise(index)}
                          disabled={!customExerciseNames[index]?.trim()}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newCreatingCustom = { ...creatingCustom }
                            const newCustomNames = { ...customExerciseNames }
                            delete newCreatingCustom[index]
                            delete newCustomNames[index]
                            setCreatingCustom(newCreatingCustom)
                            setCustomExerciseNames(newCustomNames)
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Select value={exercise.name} onValueChange={(value) => handleExerciseSelect(index, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exercise" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableExercises.map((ex) => (
                          <SelectItem key={ex} value={ex}>
                            {ex}
                          </SelectItem>
                        ))}
                        <SelectItem value="CREATE_CUSTOM" className="text-blue-600 font-medium">
                          + Create Custom Exercise
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Sets</Label>
                      <Button variant="outline" size="sm" onClick={() => addSet(index)}>
                        Add Set
                      </Button>
                    </div>

                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border">
                        <span className="text-sm font-medium w-12">Set {setIndex + 1}</span>
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Reps</Label>
                            <Input
                              type="number"
                              min="1"
                              value={set.reps}
                              onChange={(e) => {
                                const value = e.target.value === "" ? "" : Number.parseInt(e.target.value) || 1
                                updateSet(index, setIndex, "reps", value)
                              }}
                              onBlur={(e) => {
                                if (e.target.value === "" || Number.parseInt(e.target.value) < 1) {
                                  updateSet(index, setIndex, "reps", 1)
                                }
                              }}
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Weight (lbs)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="5"
                              value={set.weight === 0 ? "" : set.weight}
                              onChange={(e) => {
                                const value = e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0
                                updateSet(index, setIndex, "weight", value)
                              }}
                              className="h-8"
                            />
                          </div>
                        </div>
                        {exercise.sets.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSet(index, setIndex)}
                            className="text-destructive px-2"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
