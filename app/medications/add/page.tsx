"use client"

import { useState } from "react"
import { ArrowLeft, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { addMedication } from "@/lib/data"

export default function AddMedicationPage() {
  const router = useRouter()
  const [medicationName, setMedicationName] = useState("")
  const [dosage, setDosage] = useState("")
  const [reminderTimes, setReminderTimes] = useState<string[]>(["09:00"])

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

  const addCommonSchedule = () => {
    if (reminderTimes.length === 1) {
      setReminderTimes(["08:00", "20:00"])
    }
  }

  const handleSave = () => {
    if (!medicationName.trim() || !dosage.trim()) {
      alert("Please fill in all required fields")
      return
    }

    addMedication({
      medicationName: medicationName.trim(),
      dosage: dosage.trim(),
      reminderTimes: reminderTimes.filter((time) => time.trim() !== ""),
    })

    router.push("/medications")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/medications">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Add Medication</h1>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white px-4 py-2 flex justify-center items-center text-sm font-medium">
        <span>{new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}</span>
      </div>

      <div className="px-4 pb-8">
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Medication Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-6">
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
                <div className="flex items-center justify-between">
                  <Label>Reminder Times</Label>
                  <span className="text-sm text-muted-foreground">
                    {reminderTimes.length} time{reminderTimes.length !== 1 ? "s" : ""} per day
                  </span>
                </div>

                <div className="space-y-3">
                  {reminderTimes.map((time, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <Label htmlFor={`time-${index}`} className="text-sm font-medium">
                          {index === 0
                            ? "Morning"
                            : index === 1
                              ? "Afternoon"
                              : index === 2
                                ? "Evening"
                                : index === 3
                                  ? "Night"
                                  : `Time ${index + 1}`}
                        </Label>
                        <Input
                          id={`time-${index}`}
                          type="time"
                          value={time}
                          onChange={(e) => updateReminderTime(index, e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      {reminderTimes.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeReminderTime(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={addReminderTime}
                    className="w-full"
                    disabled={reminderTimes.length >= 6}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Time
                  </Button>

                  {reminderTimes.length < 4 && (
                    <Button variant="outline" onClick={addCommonSchedule} className="w-full text-sm">
                      Quick: 2x Daily
                    </Button>
                  )}
                </div>

                {reminderTimes.length >= 6 && (
                  <p className="text-sm text-muted-foreground text-center">Maximum 6 reminder times per day</p>
                )}

                {/* Common schedule suggestions */}
                {reminderTimes.length === 1 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Quick Setup:</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReminderTimes(["08:00", "20:00"])}
                        className="text-xs"
                      >
                        2x Daily (8AM, 8PM)
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReminderTimes(["08:00", "14:00", "20:00"])}
                        className="text-xs"
                      >
                        3x Daily (8AM, 2PM, 8PM)
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReminderTimes(["08:00", "12:00", "16:00", "20:00"])}
                        className="text-xs"
                      >
                        4x Daily
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReminderTimes(["07:00", "11:00", "15:00", "19:00", "23:00"])}
                        className="text-xs"
                      >
                        5x Daily
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 space-y-4">
          <Button onClick={handleSave} className="w-full bg-green-500 hover:bg-green-600 text-white" size="lg">
            Save Medication
          </Button>
          <Link href="/medications">
            <Button variant="outline" className="w-full" size="lg">
              Cancel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
