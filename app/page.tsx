"use client"

import { useState, useEffect } from "react"
import { Plus, Calendar, List, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { type Medication, type DoseLog, getTodaysMedications, markDoseAsTaken } from "@/lib/data"

export default function HomePage() {
  const [todaysMeds, setTodaysMeds] = useState<
    Array<{
      medication: Medication
      scheduledTime: string
      log: DoseLog
    }>
  >([])

  useEffect(() => {
    setTodaysMeds(getTodaysMedications())
  }, [])

  const handleMarkAsTaken = (logId: string) => {
    markDoseAsTaken(logId)
    setTodaysMeds(getTodaysMedications())
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-blue-600">MediTrack</h1>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/medications">
                <Button variant="ghost" size="sm">
                  <List className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/calendar">
                <Button variant="ghost" size="sm">
                  <Calendar className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Today's Schedule</h2>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="space-y-3 mb-20">
          {todaysMeds.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No medications scheduled for today</p>
                <Link href="/medications/add">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Medication
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            todaysMeds.map(({ medication, scheduledTime, log }) => (
              <Card key={log.logID} className={log.status === "Taken" ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={log.status === "Taken"}
                          onCheckedChange={() => handleMarkAsTaken(log.logID)}
                          className="h-5 w-5"
                        />
                        <div className={log.status === "Taken" ? "line-through" : ""}>
                          <h3 className="font-semibold">{medication.medicationName}</h3>
                          <p className="text-sm text-muted-foreground">{medication.dosage}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={log.status === "Taken" ? "default" : "secondary"}>
                        {formatTime(scheduledTime)}
                      </Badge>
                      {log.status === "Taken" && <p className="text-xs text-green-600 mt-1">✓ Taken</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Floating Action Button */}
        <Link href="/medications/add">
          <Button size="lg" className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
