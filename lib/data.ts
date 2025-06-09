export interface Medication {
  medicationID: string
  medicationName: string
  dosage: string
  reminderTimes: string[]
}

export interface DoseLog {
  logID: string
  medicationID_ref: string
  scheduledDate: string
  scheduledTime: string
  status: "Scheduled" | "Taken" | "Missed"
  takenTimestamp?: string
}

// Add this helper function at the top of the file after the imports
const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Local storage keys
const MEDICATIONS_KEY = "meditrack_medications"
const DOSE_LOGS_KEY = "meditrack_dose_logs"

// Helper functions for local storage
const getMedicationsFromStorage = (): Medication[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(MEDICATIONS_KEY)
  return stored ? JSON.parse(stored) : []
}

const saveMedicationsToStorage = (medications: Medication[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications))
}

const getDoseLogsFromStorage = (): DoseLog[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(DOSE_LOGS_KEY)
  return stored ? JSON.parse(stored) : []
}

const saveDoseLogsToStorage = (logs: DoseLog[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem(DOSE_LOGS_KEY, JSON.stringify(logs))
}

// Generate unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Medication CRUD operations
export const getAllMedications = (): Medication[] => {
  return getMedicationsFromStorage()
}

export const getMedicationById = (id: string): Medication | null => {
  const medications = getMedicationsFromStorage()
  return medications.find((med) => med.medicationID === id) || null
}

export const addMedication = (medicationData: Omit<Medication, "medicationID">) => {
  const medications = getMedicationsFromStorage()
  const newMedication: Medication = {
    ...medicationData,
    medicationID: generateId(),
  }

  medications.push(newMedication)
  saveMedicationsToStorage(medications)

  // Generate dose logs for the next 30 days
  generateDoseLogsForMedication(newMedication)

  return newMedication
}

export const updateMedication = (id: string, updates: Omit<Medication, "medicationID">) => {
  const medications = getMedicationsFromStorage()
  const index = medications.findIndex((med) => med.medicationID === id)

  if (index !== -1) {
    medications[index] = { ...medications[index], ...updates }
    saveMedicationsToStorage(medications)

    // Regenerate future dose logs
    regenerateFutureDoseLogsForMedication(medications[index])
  }
}

export const deleteMedication = (id: string) => {
  const medications = getMedicationsFromStorage()
  const filteredMedications = medications.filter((med) => med.medicationID !== id)
  saveMedicationsToStorage(filteredMedications)

  // Remove associated dose logs
  const logs = getDoseLogsFromStorage()
  const filteredLogs = logs.filter((log) => log.medicationID_ref !== id)
  saveDoseLogsToStorage(filteredLogs)
}

// Replace the generateDoseLogsForMedication function
const generateDoseLogsForMedication = (medication: Medication) => {
  const logs = getDoseLogsFromStorage()
  const today = new Date()

  // Generate logs for next 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const dateString = getLocalDateString(date)

    medication.reminderTimes.forEach((time) => {
      // Check if log already exists
      const existingLog = logs.find(
        (log) =>
          log.medicationID_ref === medication.medicationID &&
          log.scheduledDate === dateString &&
          log.scheduledTime === time,
      )

      if (!existingLog) {
        logs.push({
          logID: generateId(),
          medicationID_ref: medication.medicationID,
          scheduledDate: dateString,
          scheduledTime: time,
          status: "Scheduled",
        })
      }
    })
  }

  saveDoseLogsToStorage(logs)
}

// Replace the regenerateFutureDoseLogsForMedication function
const regenerateFutureDoseLogsForMedication = (medication: Medication) => {
  const logs = getDoseLogsFromStorage()
  const today = new Date()
  const todayString = getLocalDateString(today)

  // Remove future logs for this medication
  const filteredLogs = logs.filter(
    (log) => log.medicationID_ref !== medication.medicationID || log.scheduledDate <= todayString,
  )

  saveDoseLogsToStorage(filteredLogs)
  generateDoseLogsForMedication(medication)
}

// Replace the getTodaysMedications function
export const getTodaysMedications = () => {
  const medications = getMedicationsFromStorage()
  const logs = getDoseLogsFromStorage()
  const today = getLocalDateString(new Date())

  const todaysLogs = logs.filter((log) => log.scheduledDate === today)

  return todaysLogs
    .map((log) => {
      const medication = medications.find((med) => med.medicationID === log.medicationID_ref)
      return {
        medication: medication!,
        scheduledTime: log.scheduledTime,
        log,
      }
    })
    .filter((item) => item.medication)
    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
}

// Replace the updateMissedDoses function
export const updateMissedDoses = () => {
  const logs = getDoseLogsFromStorage()
  const now = new Date()
  const currentTime = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0")
  const today = getLocalDateString(now)

  let updated = false

  logs.forEach((log) => {
    if (log.status === "Scheduled") {
      const logDate = new Date(log.scheduledDate + "T00:00:00")
      const todayDate = new Date(today + "T00:00:00")

      // If the scheduled time has passed and it's not taken, mark as missed
      if (logDate < todayDate || (log.scheduledDate === today && log.scheduledTime < currentTime)) {
        log.status = "Missed"
        updated = true
      }
    }
  })

  if (updated) {
    saveDoseLogsToStorage(logs)
  }
}

// Replace the getAdherenceForMonth function
export const getAdherenceForMonth = (date: Date) => {
  updateMissedDoses()

  const medications = getMedicationsFromStorage()
  const logs = getDoseLogsFromStorage()

  const year = date.getFullYear()
  const month = date.getMonth()

  // Get all days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthData = []

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day)
    const dateString = getLocalDateString(currentDate)

    const dayLogs = logs.filter((log) => log.scheduledDate === dateString)
    const totalScheduled = dayLogs.length
    const totalTaken = dayLogs.filter((log) => log.status === "Taken").length

    const logsWithMedications = dayLogs
      .map((log) => ({
        medication: medications.find((med) => med.medicationID === log.medicationID_ref)!,
        log,
      }))
      .filter((item) => item.medication)

    monthData.push({
      date: currentDate,
      totalScheduled,
      totalTaken,
      adherenceRate: totalScheduled > 0 ? totalTaken / totalScheduled : 0,
      logs: logsWithMedications,
    })
  }

  return monthData
}

// Initialize with sample data if empty
export const initializeSampleData = () => {
  const medications = getMedicationsFromStorage()

  if (medications.length === 0) {
    // Add sample medications
    const sampleMeds = [
      {
        medicationName: "Metformin",
        dosage: "500mg tablet",
        reminderTimes: ["09:00", "21:00"],
      },
      {
        medicationName: "Lisinopril",
        dosage: "10mg tablet",
        reminderTimes: ["08:00"],
      },
    ]

    sampleMeds.forEach((med) => addMedication(med))
  }
}

export const markDoseAsTaken = (logId: string) => {
  const logs = getDoseLogsFromStorage()
  const logIndex = logs.findIndex((log) => log.logID === logId)

  if (logIndex !== -1) {
    logs[logIndex] = {
      ...logs[logIndex],
      status: "Taken",
      takenTimestamp: new Date().toISOString(),
    }
    saveDoseLogsToStorage(logs)
  }
}

// Add this function at the end of the file
export const initializeApp = () => {
  // Update missed doses when app loads
  updateMissedDoses()

  // Initialize sample data if needed
  initializeSampleData()
}
