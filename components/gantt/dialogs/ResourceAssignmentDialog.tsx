"use client"

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ResourceSelector } from "../ResourceSelector"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"

interface Resource {
  id: string
  name: string
  type: string
  email?: string
  phone?: string
  costRate: number
  capacity: number
}

interface ResourceAssignment {
  id: string
  resourceId: string
  taskId: string
  units: number
  resource: Resource
  startDate?: Date
  endDate?: Date
  hoursPerDay?: number
  notes?: string
  estimatedCost?: number
  actualCost?: number
}

interface ResourceAssignmentDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  taskId: string | null
  projectId?: string
  taskName?: string
  taskStartDate?: Date
  taskEndDate?: Date
}

export function ResourceAssignmentDialog({
  isOpen,
  onOpenChange,
  taskId,
  projectId,
  taskName,
  taskStartDate,
  taskEndDate
}: ResourceAssignmentDialogProps) {
  const [assignments, setAssignments] = useState<ResourceAssignment[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<ResourceAssignment | null>(null)
  const [editing, setEditing] = useState(false)
  const [units, setUnits] = useState<number>(100)
  const [hoursPerDay, setHoursPerDay] = useState<number>(8)
  const [startDate, setStartDate] = useState<Date | undefined>(taskStartDate)
  const [endDate, setEndDate] = useState<Date | undefined>(taskEndDate)
  const [notes, setNotes] = useState<string>("")
  const [taskDetails, setTaskDetails] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Hämta uppgiftsdetaljer om projektId inte skickats med
  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!taskId || projectId) return; // Hämta inte om vi redan har projektId
      
      setLoading(true);
      try {
        const response = await fetch(`/api/tasks/${taskId}`);
        if (!response.ok) throw new Error('Kunde inte hämta uppgiftsdetaljer');
        
        const data = await response.json();
        setTaskDetails(data);
      } catch (error) {
        console.error('Fel vid hämtning av uppgiftsdetaljer:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [taskId, projectId]);

  // Hämta resurstilldelningar när dialogen öppnas
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!isOpen || !taskId) return

      try {
        const response = await fetch(`/api/tasks/resources?taskId=${taskId}`)
        if (!response.ok) throw new Error('Kunde inte hämta resurstilldelningar')
        
        const data = await response.json()
        setAssignments(data)
      } catch (error) {
        console.error('Fel vid hämtning av resurstilldelningar:', error)
        toast.error('Kunde inte hämta resurstilldelningar')
      }
    }

    fetchAssignments()
  }, [isOpen, taskId])

  // Återställ formuläret när dialogrutan stängs
  useEffect(() => {
    if (!isOpen) {
      setSelectedAssignment(null)
      setEditing(false)
      setUnits(100)
      setHoursPerDay(8)
      setStartDate(taskStartDate)
      setEndDate(taskEndDate)
      setNotes("")
    }
  }, [isOpen, taskStartDate, taskEndDate])

  // Uppdatera formulärfält när en tilldelning väljs
  useEffect(() => {
    if (selectedAssignment) {
      setUnits(selectedAssignment.units || 100)
      setHoursPerDay(selectedAssignment.hoursPerDay || 8)
      setStartDate(selectedAssignment.startDate || taskStartDate)
      setEndDate(selectedAssignment.endDate || taskEndDate)
      setNotes(selectedAssignment.notes || "")
    }
  }, [selectedAssignment, taskStartDate, taskEndDate])

  const handleResourcesChange = (newAssignments: ResourceAssignment[]) => {
    setAssignments(newAssignments)
  }

  const handleEditAssignment = (assignment: ResourceAssignment) => {
    setSelectedAssignment(assignment)
    setEditing(true)
  }

  const handleSaveAssignment = async () => {
    if (!selectedAssignment) return

    try {
      // Implementera API-anrop för att uppdatera resurstilldelning
      const response = await fetch(`/api/tasks/resources/${selectedAssignment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          units,
          hoursPerDay,
          startDate,
          endDate,
          notes,
        }),
      })

      if (!response.ok) throw new Error('Kunde inte uppdatera resurstilldelning')
      
      const updatedAssignment = await response.json()
      
      // Uppdatera listan med tilldelningar
      setAssignments(assignments.map(a => 
        a.id === updatedAssignment.id ? updatedAssignment : a
      ))
      
      // Återställ formuläret
      setSelectedAssignment(null)
      setEditing(false)
      
      toast.success('Resurstilldelning uppdaterad')
    } catch (error) {
      console.error('Fel vid uppdatering av resurstilldelning:', error)
      toast.error('Kunde inte uppdatera resurstilldelning')
    }
  }

  const calculateEstimatedCost = () => {
    if (!selectedAssignment || !selectedAssignment.resource) return 0
    
    const days = startDate && endDate 
      ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 1
    
    const totalHours = days * hoursPerDay * (units / 100)
    const cost = totalHours * selectedAssignment.resource.costRate
    
    return Math.round(cost)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Resurstilldelning</DialogTitle>
          {taskName && (
            <DialogDescription>
              Hantera resurser för uppgift: {taskName}
            </DialogDescription>
          )}
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">Laddar uppgiftsinformation...</div>
        ) : (
          <div className="grid gap-6 py-4">
            <ResourceSelector 
              taskId={taskId}
              projectId={projectId || (taskDetails?.project?.id)}
              onResourcesChange={handleResourcesChange}
            />

            {assignments.length > 0 && !editing && (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left p-2">Resurs</th>
                      <th className="text-center p-2">Tilldelning</th>
                      <th className="text-right p-2">Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((assignment) => (
                      <tr key={assignment.id} className="border-t">
                        <td className="p-2">{assignment.resource.name}</td>
                        <td className="text-center p-2">{assignment.units || 100}%</td>
                        <td className="text-right p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAssignment(assignment)}
                          >
                            Redigera
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {editing && selectedAssignment && (
              <div className="space-y-4 border rounded-md p-4">
                <h3 className="font-medium">Redigera tilldelning: {selectedAssignment.resource.name}</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="units">Tilldelning (%)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="units"
                        value={[units]}
                        onValueChange={(value: number[]) => setUnits(value[0])}
                        min={10}
                        max={100}
                        step={10}
                        className="flex-1"
                      />
                      <span className="w-12 text-right">{units}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hoursPerDay">Timmar per dag</Label>
                    <Select 
                      value={String(hoursPerDay)}
                      onValueChange={(value: string) => setHoursPerDay(Number(value))}
                    >
                      <SelectTrigger id="hoursPerDay">
                        <SelectValue placeholder="Välj timmar" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 4, 6, 8].map((hours) => (
                          <SelectItem key={hours} value={String(hours)}>
                            {hours} {hours === 1 ? 'timme' : 'timmar'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Startdatum</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="startDate"
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "yyyy-MM-dd") : "Välj datum"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Slutdatum</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="endDate"
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "yyyy-MM-dd") : "Välj datum"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Anteckningar</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                    placeholder="Lägg till anteckningar..."
                    className="resize-none"
                  />
                </div>
                
                <div className="bg-muted p-3 rounded-md">
                  <div className="flex justify-between">
                    <span>Beräknad kostnad:</span>
                    <span className="font-medium">{calculateEstimatedCost().toLocaleString()} kr</span>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedAssignment(null)
                      setEditing(false)
                    }}
                  >
                    Avbryt
                  </Button>
                  <Button onClick={handleSaveAssignment}>Spara</Button>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Stäng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 