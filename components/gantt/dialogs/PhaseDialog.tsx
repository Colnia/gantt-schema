"use client"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { sv } from "date-fns/locale"
import { CalendarIcon, Check, XIcon } from "lucide-react"

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
import { cn } from "@/lib/utils"

interface PhaseDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  projectId: string | null
  phaseId?: string | null
  onSuccess?: () => void
}

export function PhaseDialog({
  isOpen,
  onOpenChange,
  projectId,
  phaseId = null,
  onSuccess
}: PhaseDialogProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [status, setStatus] = useState<string>("Ej påbörjad")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [color, setColor] = useState<string>("#4169E1") // Default blå

  // State for controlling Popover open/closed
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isEndDateOpen, setIsEndDateOpen] = useState(false)

  useEffect(() => {
    if (isOpen && projectId) {
      if (phaseId) {
        // Redigera befintlig fas
        loadPhase()
      } else {
        // Ny fas
        resetForm()
      }
    }
  }, [isOpen, projectId, phaseId])

  const resetForm = () => {
    setName("")
    setDescription("")
    setStatus("Ej påbörjad")
    setStartDate(undefined)
    setEndDate(undefined)
    setColor("#4169E1")
    setError(null)
    // Reset popover states
    setIsStartDateOpen(false)
    setIsEndDateOpen(false)
  }

  const loadPhase = async () => {
    if (!phaseId) return
    try {
      setLoading(true)
      const response = await fetch(`/api/phases/${phaseId}`)
      if (!response.ok) throw new Error("Kunde inte ladda fasen")
      
      const phase = await response.json()
      setName(phase.name)
      setDescription(phase.description || "")
      setStatus(phase.status)
      setStartDate(phase.startDate ? parseISO(phase.startDate) : undefined)
      setEndDate(phase.endDate ? parseISO(phase.endDate) : undefined)
      setColor(phase.color || "#4169E1")
    } catch (err) {
      setError("Ett fel uppstod när fasen skulle laddas")
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

    try {
      setLoading(true)
      setError(null)

      const phaseData = {
        name,
        description,
        status,
        startDate,
        endDate,
        color,
        projectId
      }

      const url = phaseId 
        ? `/api/phases/${phaseId}` 
        : `/api/projects/${projectId}/phases`
      
      const method = phaseId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(phaseData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Kunde inte spara fasen")
      }

      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.message || "Ett fel uppstod när fasen skulle sparas")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{phaseId ? "Redigera fas" : "Skapa ny fas"}</DialogTitle>
          <DialogDescription>
            {phaseId 
              ? "Uppdatera information om fasen" 
              : "Lägg till en ny fas i projektet"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Namn
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Projektfas"
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
              placeholder="Beskriv fasens innehåll och mål"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Välj status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ej påbörjad">Ej påbörjad</SelectItem>
                <SelectItem value="Pågående">Pågående</SelectItem>
                <SelectItem value="Avslutad">Avslutad</SelectItem>
                <SelectItem value="Pausad">Pausad</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Startdatum
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
                  {startDate ? format(startDate, "PPP", { locale: sv }) : <span>Välj datum</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date: Date | undefined) => {
                    setStartDate(date)
                    // Close popover after selecting
                    setIsStartDateOpen(false)
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
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
                  {endDate ? format(endDate, "PPP", { locale: sv }) : <span>Välj datum</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date: Date | undefined) => {
                    setEndDate(date)
                    // Close popover after selecting
                    setIsEndDateOpen(false)
                  }}
                  initialFocus
                  fromDate={startDate}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="color" className="text-right">
              Färg
            </Label>
            <div className="col-span-3 flex flex-wrap gap-2">
              {[
                "#4169E1", // Royal Blue
                "#2E8B57", // Sea Green
                "#9370DB", // Medium Purple
                "#E9967A", // Dark Salmon
                "#20B2AA", // Light Sea Green
                "#6A5ACD", // Slate Blue
                "#FF6347", // Tomato
                "#3CB371", // Medium Sea Green
                "#FF8C00", // Dark Orange
                "#4682B4"  // Steel Blue
              ].map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  className={`h-8 w-8 rounded-full border-2 ${color === colorOption ? 'ring-2 ring-primary ring-offset-2' : 'border-gray-200'}`}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => setColor(colorOption)}
                  aria-label={`Välj färg ${colorOption}`}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Avbryt
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Sparar..." : phaseId ? "Uppdatera" : "Skapa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 