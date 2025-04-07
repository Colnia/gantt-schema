"use client"

import { useState, useEffect, useRef } from "react"
import { format, parseISO } from "date-fns"
import { sv } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { TaskIcon, MilestoneIcon, DeliveryIcon, DecisionIcon } from "@/components/ui/activity-icons"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { 
  TaskStatus, 
  TaskPriority 
} from "@/lib/types"
import { STATUS_INFO } from "@/lib/utils/task-utils"

interface ActivityDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  projectId: string | null
  phaseId?: string | null
  parentTaskId?: string | null
  taskId?: string | null
  onSuccess?: () => void
  defaultType?: string
}

export function ActivityDialog({
  isOpen,
  onOpenChange,
  projectId,
  phaseId = null,
  parentTaskId = null,
  taskId = null,
  onSuccess,
  defaultType = "task"
}: ActivityDialogProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Aktivitetsdetaljer
  const [name, setName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [activityType, setActivityType] = useState<string>(defaultType)
  const [status, setStatus] = useState<TaskStatus>("Ej påbörjad")
  const [priority, setPriority] = useState<TaskPriority>("Medium")
  const [progress, setProgress] = useState<number>(0)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [color, setColor] = useState<string>("#0891b2") // Default blå

  // State for controlling Popover open/closed
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (taskId) {
        // Redigera befintlig aktivitet
        loadTask()
      } else {
        // Ny aktivitet
        resetForm()
        setActivityType(defaultType)
      }
    }
  }, [isOpen, taskId, defaultType])

  const resetForm = () => {
    setName("")
    setDescription("")
    setActivityType(defaultType)
    setStatus("Ej påbörjad")
    setPriority("Medium")
    setProgress(0)
    setStartDate(undefined)
    setEndDate(undefined)
    setColor("#0891b2")
    setError(null)
    // Reset popover states
    setIsStartDateOpen(false);
    setIsEndDateOpen(false);
  }

  const loadTask = async () => {
    if (!taskId) return
    try {
      setLoading(true)
      const response = await fetch(`/api/tasks/${taskId}`)
      if (!response.ok) throw new Error("Kunde inte ladda aktiviteten")
      
      const task = await response.json()
      setName(task.name)
      setDescription(task.description || "")
      setActivityType(task.activityType || (task.isMilestone ? "milestone" : "task"))
      setStatus(task.status)
      setPriority(task.priority)
      setProgress(task.progress || 0)
      setStartDate(task.startDate ? parseISO(task.startDate) : undefined)
      setEndDate(task.endDate ? parseISO(task.endDate) : undefined)
      setColor(task.color || "#0891b2")
    } catch (err) {
      setError("Ett fel uppstod när aktiviteten skulle laddas")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!projectId) {
      setError("Inget projekt valt")
      return
    }

    if (!name) {
      setError("Namn måste anges")
      return
    }

    if (!startDate) {
      setError("Startdatum måste anges")
      return
    }

    if (!endDate && activityType !== "milestone") {
      setError("Slutdatum måste anges")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // isMilestone är för bakåtkompatibilitet
      const isMilestone = activityType === "milestone"
      
      // För milstolpar, använd samma datum för både start och slut
      const resolvedEndDate = isMilestone 
        ? startDate
        : endDate

      const taskData = {
        name,
        description,
        activityType,
        status,
        priority,
        progress,
        startDate,
        endDate: resolvedEndDate,
        color,
        projectId,
        phaseId: phaseId || undefined,
        parentTaskId: parentTaskId || undefined,
        isMilestone
      }

      const url = taskId 
        ? `/api/tasks/${taskId}` 
        : `/api/projects/${projectId}/tasks`
      
      const method = taskId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Kunde inte spara aktiviteten")
      }

      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.message || "Ett fel uppstod när aktiviteten skulle sparas")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Hjälpfunktion för att hämta titel baserat på aktivitetstyp
  const getTypeTitle = () => {
    switch (activityType) {
      case "milestone": return "milstolpe"
      case "delivery": return "leverans"
      case "decision": return "beslutspunkt"
      default: return "uppgift"
    }
  }

  // Hjälpfunktion för att visa rätt aktivitetsikon
  const getTypeIcon = () => {
    switch (activityType) {
      case "milestone": return <MilestoneIcon />
      case "delivery": return <DeliveryIcon />
      case "decision": return <DecisionIcon />
      default: return <TaskIcon />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center">
              <span className="mr-2">{getTypeIcon()}</span>
              {taskId ? `Redigera ${getTypeTitle()}` : `Skapa ny ${getTypeTitle()}`}
            </div>
          </DialogTitle>
          <DialogDescription>
            {taskId 
              ? `Uppdatera information om ${getTypeTitle()}en` 
              : `Lägg till en ny ${getTypeTitle()} i projektet`}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Typ
            </Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Välj typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="task">
                  <div className="flex items-center">
                    <TaskIcon className="mr-2" />
                    <span>Uppgift</span>
                  </div>
                </SelectItem>
                <SelectItem value="milestone">
                  <div className="flex items-center">
                    <MilestoneIcon className="mr-2" />
                    <span>Milstolpe</span>
                  </div>
                </SelectItem>
                <SelectItem value="delivery">
                  <div className="flex items-center">
                    <DeliveryIcon className="mr-2" />
                    <span>Leverans</span>
                  </div>
                </SelectItem>
                <SelectItem value="decision">
                  <div className="flex items-center">
                    <DecisionIcon className="mr-2" />
                    <span>Beslutspunkt</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Namn
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              className="col-span-3"
              placeholder={`Namnge ${getTypeTitle()}en`}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Beskrivning
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder={`Beskriv ${getTypeTitle()}ens innehåll och mål`}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={status} onValueChange={(value: string) => setStatus(value as TaskStatus)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Välj status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_INFO).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${info.color} mr-2`} />
                      <span>{info.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {activityType !== "milestone" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Prioritet
              </Label>
              <Select value={priority} onValueChange={(value: string) => setPriority(value as TaskPriority)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Välj prioritet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Låg">Låg</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hög">Hög</SelectItem>
                  <SelectItem value="critical">Kritisk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              {activityType === "milestone" ? "Datum" : "Startdatum"}
            </Label>
            <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP", { locale: sv }) : "Välj datum"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date: Date | undefined) => {
                    setStartDate(date);
                    setIsStartDateOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          {activityType !== "milestone" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                Slutdatum
              </Label>
              <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: sv }) : "Välj datum"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date: Date | undefined) => {
                      setEndDate(date);
                      setIsEndDateOpen(false);
                    }}
                    initialFocus
                    fromDate={startDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
          {activityType !== "milestone" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="progress" className="text-right">
                Färdighetsgrad
              </Label>
              <div className="col-span-3 flex items-center">
                <Slider
                  value={[progress]}
                  onValueChange={(value: number[]) => setProgress(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1 mr-4"
                />
                <span className="min-w-12 text-right">{progress}%</span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="color" className="text-right">
              Färg
            </Label>
            <div className="col-span-3">
              <div className="flex flex-wrap gap-2">
                {[
                  "#4169E1", // Royal Blue
                  "#2E8B57", // Sea Green
                  "#FF6347", // Tomato
                  "#FFD700", // Gold
                  "#8A2BE2", // Blue Violet
                  "#20B2AA", // Light Sea Green
                  "#FF4500", // Orange Red
                  "#9370DB", // Medium Purple
                  "#3CB371", // Medium Sea Green
                  "#CD5C5C", // Indian Red
                ].map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    onClick={() => setColor(presetColor)}
                    className={`w-8 h-8 rounded-full cursor-pointer border ${
                      color === presetColor ? 'ring-2 ring-offset-2 ring-primary' : 'border-border'
                    }`}
                    style={{ backgroundColor: presetColor }}
                    aria-label={`Färg ${presetColor}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Avbryt
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Sparar..." : taskId ? "Uppdatera" : "Skapa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 