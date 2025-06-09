"use client"

import { useState, useEffect } from "react"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { type Medication, type DoseLog, getTodaysMedications, markDoseAsTaken, updateMissedDoses } from "@/lib/data"

export default function HomePage() {
  const [todaysMeds, setTodaysMeds] = useState<
    Array<{
      medication: Medication
      scheduledTime: string
      log: DoseLog
    }>
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    updateMissedDoses()
    setTodaysMeds(getTodaysMedications())
    setIsLoading(false)
  }, [])

  const handleMarkAsTaken = (logId: string) => {
    markDoseAsTaken(logId)
    setTodaysMeds(getTodaysMedications())
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    return `${hours}:${minutes}`
  }

  const getWeekDays = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Monday start
    startOfWeek.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const weekDays = getWeekDays(currentWeek)
  const dayLabels = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(newWeek.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString()
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white px-4 py-3 text-center border-b">
        <span className="text-sm font-medium text-gray-600">MediTrack</span>
      </div>

      {/* Header */}
      <div className="bg-white px-4 py-4">
        <div className="flex items-center gap-4 mb-6">
          <ChevronLeft className="h-6 w-6 text-gray-600" />
          <h1 className="text-xl font-semibold text-gray-900">Monitoring</h1>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <Button variant="default" className="rounded-lg py-2 bg-gray-900 text-white">
            Calendar
          </Button>
          <Link href="/medications" className="w-full">
            <Button variant="ghost" className="rounded-lg py-2 text-gray-600 w-full">
              Medications
            </Button>
          </Link>
          <Link href="/calendar" className="w-full">
            <Button variant="ghost" className="rounded-lg py-2 text-gray-600 w-full">
              Tracking
            </Button>
          </Link>
          <Button variant="ghost" className="rounded-lg py-2 text-gray-600">
            Profile
          </Button>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Select day</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigateWeek("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigateWeek("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Week Days - Vertical Layout */}
        <div className="flex flex-col gap-2 mb-6">
          {weekDays.map((day, index) => (
            <button
              key={index}
              onClick={() => setSelectedDate(day)}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isSelected(day)
                  ? "bg-green-500 text-white"
                  : isToday(day)
                    ? "bg-blue-100 text-blue-600"
                    : "bg-white text-gray-900 hover:bg-gray-100"
              }`}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium mr-3">
                {day.getDate()}
              </div>
              <div className="text-left">
                <div className="font-medium">{day.toLocaleDateString("en-US", { weekday: "long" })}</div>
                <div className="text-sm opacity-80">
                  {day.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Day Content */}
      <div className="px-4 pb-20">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
          </h3>
          <p className="text-gray-600">{selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}</p>
        </div>

        {/* Medications Schedule */}
        <div className="space-y-6">
          {todaysMeds.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">No medications scheduled for today</p>
              <Link href="/medications/add">
                <Button className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6">Add Medication</Button>
              </Link>
            </div>
          ) : (
            todaysMeds
              .reduce((groups: any[], med) => {
                const time = med.scheduledTime
                const existingGroup = groups.find((g) => g.time === time)
                if (existingGroup) {
                  existingGroup.medications.push(med)
                } else {
                  groups.push({ time, medications: [med] })
                }
                return groups
              }, [])
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((group) => (
                <div key={group.time}>
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">{formatTime(group.time)}</h4>
                  <div className="space-y-3">
                    {group.medications.map(({ medication, log }: any) => (
                      <Card key={log.logID} className="bg-white border-0 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleMarkAsTaken(log.logID)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  log.status === "Taken"
                                    ? "bg-green-500 border-green-500"
                                    : "border-gray-300 hover:border-green-500"
                                }`}
                              >
                                {log.status === "Taken" && (
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </button>
                              <div>
                                <h5 className="font-semibold text-gray-900">{medication.medicationName}</h5>
                                <p className="text-sm text-gray-600">{medication.dosage}</p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <Link href="/medications/add">
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-green-500 hover:bg-green-600 text-white"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  )
}
