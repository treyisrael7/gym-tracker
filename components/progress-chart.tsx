"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BarChart3, Calendar } from "lucide-react"

interface Exercise {
  name: string
  sets: number
  reps: number
  weight: number
}

interface Workout {
  id: number
  date: string
  exercises: Exercise[]
}

interface ProgressChartProps {
  workouts: Workout[]
  onBack: () => void
  activeUser: "trey" | "gavin"
}

export function ProgressChart({ workouts, onBack, activeUser }: ProgressChartProps) {
  // Get unique exercises
  const exercises = Array.from(new Set(workouts.flatMap((w) => w.exercises.map((e) => e.name))))

  // Calculate progress for each exercise
  const getExerciseProgress = (exerciseName: string) => {
    const exerciseWorkouts = workouts
      .filter((w) => w.exercises.some((e) => e.name === exerciseName))
      .map((w) => ({
        date: w.date,
        exercise: w.exercises.find((e) => e.name === exerciseName)!,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return exerciseWorkouts
  }

  const getWorkoutFrequency = () => {
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)

    const recentWorkouts = workouts.filter((w) => new Date(w.date) >= last30Days)

    return recentWorkouts.length
  }

  const getTotalVolume = () => {
    return workouts.reduce((total, workout) => {
      return (
        total +
        workout.exercises.reduce((workoutTotal, exercise) => {
          return workoutTotal + exercise.sets * exercise.reps * exercise.weight
        }, 0)
      )
    }, 0)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b p-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Progress</h1>
          <p className="text-sm text-muted-foreground capitalize">{activeUser}'s progress</p>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-20">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{workouts.length}</div>
              <div className="text-sm text-muted-foreground">Total Workouts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{getWorkoutFrequency()}</div>
              <div className="text-sm text-muted-foreground">Last 30 Days</div>
            </CardContent>
          </Card>
        </div>

        {/* Total Volume */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Total Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <div className="text-3xl font-bold">{getTotalVolume().toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">lbs lifted (sets × reps × weight)</div>
            </div>
          </CardContent>
        </Card>

        {/* Exercise Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Exercise Progress</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {exercises.length > 0 ? (
              exercises.map((exerciseName) => {
                const progress = getExerciseProgress(exerciseName)
                const latest = progress[progress.length - 1]
                const first = progress[0]
                const improvement = latest && first ? latest.exercise.weight - first.exercise.weight : 0

                return (
                  <div key={exerciseName} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{exerciseName}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{latest?.exercise.weight || 0} lbs</div>
                        {improvement > 0 && <div className="text-xs text-primary">+{improvement} lbs</div>}
                      </div>
                    </div>

                    {/* Simple progress visualization */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Sessions: {progress.length}</span>
                        <span>Latest: {latest ? new Date(latest.date).toLocaleDateString() : "N/A"}</span>
                      </div>

                      {/* Weight progression dots */}
                      <div className="flex items-center gap-1 overflow-x-auto">
                        {progress.slice(-10).map((session, idx) => (
                          <div
                            key={idx}
                            className="flex-shrink-0 w-3 h-3 rounded-full bg-primary/20 relative"
                            title={`${session.exercise.weight}lbs on ${new Date(session.date).toLocaleDateString()}`}
                          >
                            <div
                              className="absolute inset-0 rounded-full bg-primary transition-all"
                              style={{
                                transform: `scale(${Math.min(session.exercise.weight / (latest?.exercise.weight || 1), 1)})`,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Data Yet</h3>
                <p className="text-muted-foreground text-sm text-balance">
                  Log some workouts to see your progress charts!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {workouts
              .slice(-5)
              .reverse()
              .map((workout) => (
                <div key={workout.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">{new Date(workout.date).toLocaleDateString()}</div>
                    <div className="text-sm text-muted-foreground">{workout.exercises.length} exercises</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {workout.exercises.reduce((total, ex) => total + ex.sets * ex.reps * ex.weight, 0)} lbs
                    </div>
                    <div className="text-xs text-muted-foreground">total volume</div>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
