"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Edit, Trash2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { type Medication, getAllMedications, deleteMedication } from "@/lib/data"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setMedications(getAllMedications())
    setIsLoading(false)
  }, [])

  const handleDelete = (medicationID: string) => {
    deleteMedication(medicationID)
    setMedications(getAllMedications())
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    return `${hours}:${minutes}`
  }

  const getScheduleSummary = (reminderTimes: string[]) => {
    if (reminderTimes.length === 1) {
      return `Daily at ${formatTime(reminderTimes[0])}`
    } else {
      return `${reminderTimes.length} times daily`
    }
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
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">My Medications</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6">
          <Link href="/">
            <Button variant="ghost" className="rounded-full px-6 py-2 text-gray-600">
              Calendar
            </Button>
          </Link>
          <Button variant="default" className="rounded-full px-6 py-2 bg-gray-900 text-white">
            Medications
          </Button>
          <Link href="/calendar">
            <Button variant="ghost" className="rounded-full px-6 py-2 text-gray-600">
              Tracking
            </Button>
          </Link>
          <Button variant="ghost" className="rounded-full px-6 py-2 text-gray-600">
            Profile
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-20">
        {medications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">No medications added yet</p>
            <Link href="/medications/add">
              <Button className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6">Add Medication</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {medications.map((medication) => (
              <Card key={medication.medicationID} className="bg-white border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{medication.medicationName}</h3>
                      <p className="text-gray-600 mb-2">{medication.dosage}</p>
                      <Badge variant="outline" className="text-xs">
                        {getScheduleSummary(medication.reminderTimes)}
                      </Badge>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {medication.reminderTimes.map((time, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {formatTime(time)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/medications/edit/${medication.medicationID}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Medication</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{medication.medicationName}"? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(medication.medicationID)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
