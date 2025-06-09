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
      {/* Header */}
      <div className="bg-white px-4 py-4">
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-xl font-semibold text-gray-900">MediTrack</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6">
          <Button variant="default" className="rounded-full px-6 py-2 bg-gray-900 text-white">
            Home
          </Button>
          <Link href="/medications">
            <Button variant="ghost" className="rounded-full px-6 py-2 text-gray-600">
              Medications
            </Button>
          </Link>
          <Link href="/calendar">
            <Button variant="ghost" className="rounded-full px-6 py-2 text-gray-600">
              Calendar
            </Button>
          </Link>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Current week</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigateWeek("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigateWeek("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 gap-3 mb-8">
          {weekDays.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-500 mb-3">{dayLabels[index]}</div>
              <button
                onClick={() => setSelectedDate(day)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium transition-colors ${
                  isSelected(day)
                    ? "bg-green-500 text-white"
                    : isToday(day)
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-900 hover:bg-gray-100"
                }`}
              >
                {day.getDate()}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Day Content */}
      <div className="px-4 pb-24">
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
          </h3>
          <p className="text-lg text-gray-600">
            {selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Medications Schedule */}
        <div className="space-y-8">
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
                  <h4 className="text-3xl font-bold text-gray-900 mb-6">{formatTime(group.time)}</h4>
                  <div className="space-y-4">
                    {group.medications.map(({ medication, log }: any) => (
                      <Card key={log.logID} className="bg-white border-0 shadow-sm">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <button
                                onClick={() => handleMarkAsTaken(log.logID)}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  log.status === "Taken"
                                    ? "bg-green-500 border-green-500"
                                    : "border-gray-300 hover:border-green-500"
                                }`}
                              >
                                {log.status === "Taken" && (
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </button>
                              <div>
                                <h5 className="font-semibold text-gray-900 text-lg">{medication.medicationName}</h5>
                                <p className="text-gray-600">{medication.dosage}</p>
                              </div>
                            </div>
                            <ChevronRight className="h-6 w-6 text-gray-400" />
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
