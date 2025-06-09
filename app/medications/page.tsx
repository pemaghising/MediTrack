"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react"
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
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-600 mb-4">MediTrack</h1>
          <p className="text-muted-foreground">Loading your medications...</p>
        </div>
      </div>
    )
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
            <h1 className="text-xl font-bold">My Medications</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <div className="space-y-3 mb-20">
          {medications.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-4 opacity-50"></div>
                <p className="text-muted-foreground mb-4">No medications added yet</p>
                <Link href="/medications/add">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            medications.map((medication) => (
              <Card key={medication.medicationID}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{medication.medicationName}</h3>
                      <p className="text-muted-foreground mb-2">{medication.dosage}</p>
                      <Badge variant="outline">{getScheduleSummary(medication.reminderTimes)}</Badge>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {medication.reminderTimes.map((time, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {formatTime(time)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
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
