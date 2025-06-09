"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
    if (totalScheduled === 0) return "bg-gray-100"
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
    return `${hours}:${minutes}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">MediTrack</h1>
          <p className="text-gray-600">Loading...</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Status Bar */}
      <div className="bg-white px-4 py-2 flex justify-between items-center text-sm font-medium">
        <span>{new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-gray-900 rounded-full"></div>
            <div className="w-1 h-3 bg-gray-900 rounded-full"></div>
            <div className="w-1 h-3 bg-gray-900 rounded-full"></div>
            <div className="w-1 h-3 bg-gray-400 rounded-full"></div>
          </div>
          <div className="w-4 h-3 border border-gray-900 rounded-sm ml-2">
            <div className="w-3 h-2 bg-gray-900 rounded-sm m-0.5"></div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white px-4 py-4">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Adherence Tracking</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6">
          <Link href="/">
            <Button variant="ghost" className="rounded-full px-6 py-2 text-gray-600">
              Calendar
            </Button>
          </Link>
          <Link href="/medications">
            <Button variant="ghost" className="rounded-full px-6 py-2 text-gray-600">
              Medications
            </Button>
          </Link>
          <Button variant="default" className="rounded-full px-6 py-2 bg-gray-900 text-white">
            Tracking
          </Button>
          <Button variant="ghost" className="rounded-full px-6 py-2 text-gray-600">
            Profile
          </Button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="px-4 pb-6">
        {/* Legend */}
        <Card className="mb-4 bg-white border-0 shadow-sm">
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
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span>No medications scheduled</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
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
                        ${day.dayData ? getDayColor(day.dayData.adherenceRate, day.dayData.totalScheduled) : "bg-gray-100"}
                        ${day.dayData ? getDayTextColor(day.dayData.adherenceRate, day.dayData.totalScheduled) : "text-gray-600"}
                        hover:border-gray-300 transition-colors
                      `}
                      disabled={!day.dayData || day.dayData.totalScheduled === 0}
                    >
                      <div className="w-full h-full flex items-center justify-center font-medium">
                        {day.date.getDate()}
                      </div>
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
                          <div className="text-sm text-gray-600">
                            {day.dayData.totalTaken} of {day.dayData.totalScheduled} doses taken
                          </div>
                        </div>
                        <div className="space-y-2">
                          {day.dayData.logs.map(({ medication, log }, logIndex) => (
                            <div key={logIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <div className="font-medium">{medication.medicationName}</div>
                                <div className="text-sm text-gray-600">{formatTime(log.scheduledTime)}</div>
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
