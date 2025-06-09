"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getMedicationById, updateMedication, deleteMedication } from "@/lib/data"
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

export default function EditMedicationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [medicationName, setMedicationName] = useState("")
  const [dosage, setDosage] = useState("")
  const [reminderTimes, setReminderTimes] = useState<string[]>(["09:00"])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const medication = getMedicationById(params.id)
    if (medication) {
      setMedicationName(medication.medicationName)
      setDosage(medication.dosage)
      setReminderTimes(medication.reminderTimes)
    }
    setLoading(false)
  }, [params.id])

  const addReminderTime = () => {
    setReminderTimes([...reminderTimes, "12:00"])
  }

  const removeReminderTime = (index: number) => {
    if (reminderTimes.length > 1) {
      setReminderTimes(reminderTimes.filter((_, i) => i !== index))
    }
  }

  const updateReminderTime = (index: number, time: string) => {
    const updated = [...reminderTimes]
    updated[index] = time
    setReminderTimes(updated)
  }

  const handleSave = () => {
    if (!medicationName.trim() || !dosage.trim()) {
      alert("Please fill in all required fields")
      return
    }

    updateMedication(params.id, {
      medicationName: medicationName.trim(),
      dosage: dosage.trim(),
      reminderTimes: reminderTimes.filter((time) => time.trim() !== ""),
    })

    router.push("/medications")
  }

  const handleDelete = () => {
    deleteMedication(params.id)
    router.push("/medications")
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/medications">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Edit Medication</h1>
            </div>
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
                    Are you sure you want to delete this medication? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Medication Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="medication-name">Medicine Name *</Label>
              <Input
                id="medication-name"
                placeholder="e.g., Metformin"
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                placeholder="e.g., 500mg tablet, 10ml"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <Label>Reminder Times</Label>
              {reminderTimes.map((time, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => updateReminderTime(index, e.target.value)}
                    className="flex-1"
                  />
                  {reminderTimes.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeReminderTime(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addReminderTime} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Time
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 space-y-3">
          <Button onClick={handleSave} className="w-full" size="lg">
            Save Changes
          </Button>
          <Link href="/medications">
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
