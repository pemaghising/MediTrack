"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getAdherenceForMonth, type DoseLog, type Medication } from "@/lib/data"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface DayAdherence {
  date: Date
  totalScheduled: number
  totalTaken: number
  adherenceRate: number
  logs: Array<{
    medication: Medication
    log: DoseLog
  }>
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [monthData, setMonthData] = useState<DayAdherence[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setMonthData(getAdherenceForMonth(currentDate))
    setIsLoading(false)
  }, [currentDate])

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const getDayColor = (adherenceRate: number, totalScheduled: number) => {
    if (totalScheduled === 0) return "bg-gray-50"
    if (adherenceRate === 1) return "bg-green-100 border-green-300"
    if (adherenceRate > 0) return "bg-yellow-100 border-yellow-300"
    return "bg-red-100 border-red-300"
  }

  const getDayTextColor = (adherenceRate: number, totalScheduled: number) => {
    if (totalScheduled === 0) return "text-gray-600"
    if (adherenceRate === 1) return "text-green-800"
    if (adherenceRate > 0) return "text-yellow-800"
    return "text-red-800"
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-600 mb-4">MediTrack</h1>
          <p className="text-muted-foreground">Loading your calendar...</p>
        </div>
      </div>
    )
  }

  // Generate calendar grid
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const startDate = new Date(firstDayOfMonth)
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay())

  const calendarDays = []
  const currentCalendarDate = new Date(startDate)

  for (let i = 0; i < 42; i++) {
    const dayData = monthData.find((d) => d.date.toDateString() === currentCalendarDate.toDateString())

    calendarDays.push({
      date: new Date(currentCalendarDate),
      isCurrentMonth: currentCalendarDate.getMonth() === currentDate.getMonth(),
      dayData,
    })

    currentCalendarDate.setDate(currentCalendarDate.getDate() + 1)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">My Adherence Log</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <Button variant="ghost" onClick={() => navigateMonth("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Legend */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span>All medications taken</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                <span>Some medications taken</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span>No medications taken</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-50 rounded"></div>
                <span>No medications scheduled</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <Dialog key={index}>
                  <DialogTrigger asChild>
                    <button
                      className={`
                        aspect-square p-1 text-sm rounded border-2 border-transparent
                        ${day.isCurrentMonth ? "" : "opacity-30"}
                        ${day.dayData ? getDayColor(day.dayData.adherenceRate, day.dayData.totalScheduled) : "bg-gray-50"}
                        ${day.dayData ? getDayTextColor(day.dayData.adherenceRate, day.dayData.totalScheduled) : "text-gray-600"}
                        hover:border-blue-300 transition-colors
                      `}
                      disabled={!day.dayData || day.dayData.totalScheduled === 0}
                    >
                      <div className="w-full h-full flex items-center justify-center">{day.date.getDate()}</div>
                    </button>
                  </DialogTrigger>
                  {day.dayData && day.dayData.totalScheduled > 0 && (
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {day.date.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{Math.round(day.dayData.adherenceRate * 100)}%</div>
                          <div className="text-sm text-muted-foreground">
                            {day.dayData.totalTaken} of {day.dayData.totalScheduled} doses taken
                          </div>
                        </div>
                        <div className="space-y-2">
                          {day.dayData.logs.map(({ medication, log }, logIndex) => (
                            <div key={logIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <div className="font-medium">{medication.medicationName}</div>
                                <div className="text-sm text-muted-foreground">{formatTime(log.scheduledTime)}</div>
                              </div>
                              <Badge
                                variant={
                                  log.status === "Taken"
                                    ? "default"
                                    : log.status === "Missed"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {log.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  )}
                </Dialog>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
