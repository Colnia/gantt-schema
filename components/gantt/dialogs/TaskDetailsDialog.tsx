"use client"

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Task, Resource, Project, Dependency, Phase, TaskStatus, TaskPriority } from "@/lib/types"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { useProjects } from "@/lib/context/ProjectContext"
import { useSelection } from "@/lib/context/SelectionContext"
import { getStatusColor, getPriorityColor, calculateTaskProgress } from "@/lib/utils/task-utils"
import { AlertCircle, Calendar, Check, Clock, FileText, Link, Pencil, Plus, Save, Settings, User } from "lucide-react"
import { ResourceAssignmentDialog } from "./ResourceAssignmentDialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"

interface TaskDetailsDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  taskId: string | null
  onEditTask: (taskId: string) => void
}

export function TaskDetailsDialog({ isOpen, onOpenChange, taskId, onEditTask }: TaskDetailsDialogProps) {
  const { activeProject, updateTask } = useProjects()
  const [task, setTask] = useState<Task | null>(null)
  const [phase, setPhase] = useState<Phase | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [dependencies, setDependencies] = useState<{from: Task[], to: Task[]}>({ from: [], to: [] })
  const [tabValue, setTabValue] = useState("general")
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState<Partial<Task>>({})
  const [isSaving, setIsSaving] = useState(false)

  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
    return format(date, 'yyyy-MM-dd')
  }

  useEffect(() => {
    if (taskId && activeProject && isOpen) {
      // Find task
      const currentTask = activeProject.tasks?.find(t => t.id === taskId) || null
      setTask(currentTask)
      setEditedTask({})

      // Find phase if applicable
      if (currentTask?.phaseId && activeProject.phases) {
        const taskPhase = activeProject.phases.find(p => p.id === currentTask.phaseId) || null
        setPhase(taskPhase)
      } else {
        setPhase(null)
      }

      // Find resources
      if (activeProject.resources && currentTask) {
        // Note: In this example, Task.resources might be string[] of IDs or ResourceAssignment[]
        // We'll try to handle both cases for flexibility
        const taskResources: Resource[] = []
        
        if (typeof currentTask.resources[0] === 'string') {
          // Handle case where resources are IDs
          const resourceIds = currentTask.resources as string[]
          resourceIds.forEach(resId => {
            const foundResource = activeProject.resources?.find(r => 
              typeof r === 'object' && 'resourceId' in r && r.resourceId === resId && r.resource
            )
            if (foundResource && 'resource' in foundResource && foundResource.resource) {
              taskResources.push(foundResource.resource)
            }
          })
        } else {
          // Handle case where resources are ResourceAssignment objects
          const assignments = currentTask.resources
          assignments.forEach(assignment => {
            if (typeof assignment === 'object' && 'resource' in assignment && assignment.resource) {
              taskResources.push(assignment.resource)
            }
          })
        }

        setResources(taskResources)
      } else {
        setResources([])
      }

      // Find dependencies
      if (activeProject.tasks && currentTask) {
        // Dependencies FROM this task (where this task is the predecessor)
        const depsFrom = activeProject.tasks.filter(t => 
          t.dependencies?.some(d => 
            (d.fromTaskId === taskId) || (d.predecessorId === taskId)
          )
        )

        // Dependencies TO this task (where this task is the successor)
        const depsTo = activeProject.tasks.filter(t => 
          currentTask.dependencies?.some(d => 
            (d.fromTaskId === t.id) || (d.predecessorId === t.id)
          )
        )

        setDependencies({
          from: depsFrom,
          to: depsTo
        })
      } else {
        setDependencies({ from: [], to: [] })
      }
    }
  }, [taskId, activeProject, isOpen])

  // Uppdatera resurserna när resursdialogrutan stängs
  useEffect(() => {
    const fetchResources = async () => {
      if (!taskId || !activeProject) return
      
      try {
        const response = await fetch(`/api/tasks/resources?taskId=${taskId}`)
        if (!response.ok) throw new Error('Kunde inte hämta resurstilldelningar')
        
        const assignmentsData = await response.json()
        const fetchedResources: Resource[] = assignmentsData.map((assignment: any) => assignment.resource)
        setResources(fetchedResources)
      } catch (error) {
        console.error('Fel vid hämtning av resurser:', error)
      }
    }

    if (!isResourceDialogOpen && isOpen && taskId) {
      fetchResources()
    }
  }, [isResourceDialogOpen, isOpen, taskId, activeProject])

  if (!task) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in-progress': return 'bg-blue-500'
      case 'delayed': return 'bg-red-500'
      case 'cancelled': return 'bg-gray-500'
      default: return 'bg-yellow-500' // not-started
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      default: return 'bg-blue-500' // low
    }
  }

  const handleEditClick = () => {
    if (taskId) {
      setIsEditing(true)
      setEditedTask({
        ...task,
      })
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedTask({})
  }

  const handleSave = async () => {
    if (!task) return;
    
    setIsSaving(true);
    try {
      // Create updated task object
      const updatedTask = {
        ...task,
        ...editedTask,
        // Update this line to include progress
        progress: editedTask.progress ?? task.progress ?? 0,
      };
      
      // Save task updates to backend
      await updateTask(updatedTask);
      
      // Update local state
      setTask(updatedTask);
      setIsEditing(false);
      toast({
        title: "Uppgift uppdaterad",
        description: "Uppgiften har uppdaterats.",
      });
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Uppdatering misslyckades",
        description: "Det uppstod ett problem vid uppdatering av uppgiften.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenResourceDialog = () => {
    setIsResourceDialogOpen(true)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {task.name}
              <Button 
                variant="outline" 
                size="icon" 
                onClick={isEditing ? handleSave : handleEditClick}
                disabled={isSaving}
              >
                {isEditing ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              </Button>
            </DialogTitle>
            {task.description && (
              <DialogDescription>
                {task.description}
              </DialogDescription>
            )}
          </DialogHeader>

          <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Allmänt</TabsTrigger>
              <TabsTrigger value="resources">Resurser</TabsTrigger>
              <TabsTrigger value="dependencies">Beroenden</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  {isEditing ? (
                    <Select 
                      value={editedTask.status || task.status}
                      onValueChange={(value) => setEditedTask({...editedTask, status: value as TaskStatus})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Välj status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-started">Ej påbörjad</SelectItem>
                        <SelectItem value="in-progress">Pågående</SelectItem>
                        <SelectItem value="completed">Avslutad</SelectItem>
                        <SelectItem value="delayed">Försenad</SelectItem>
                        <SelectItem value="cancelled">Avbruten</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div>
                      <Badge className={`${getStatusColor(task.status)}`}>
                        {task.status === 'completed' ? 'Avslutad' : 
                        task.status === 'in-progress' ? 'Pågående' :
                        task.status === 'delayed' ? 'Försenad' : 
                        task.status === 'cancelled' ? 'Avbruten' : 'Ej påbörjad'}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Prioritet</Label>
                  {isEditing ? (
                    <Select 
                      value={editedTask.priority || task.priority}
                      onValueChange={(value) => setEditedTask({...editedTask, priority: value as TaskPriority})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Välj prioritet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Låg</SelectItem>
                        <SelectItem value="medium">Medel</SelectItem>
                        <SelectItem value="high">Hög</SelectItem>
                        <SelectItem value="critical">Kritisk</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div>
                      <Badge className={`${getPriorityColor(task.priority)}`}>
                        {task.priority === 'critical' ? 'Kritisk' : 
                        task.priority === 'high' ? 'Hög' : 
                        task.priority === 'medium' ? 'Medel' : 'Låg'}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Startdatum</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {isEditing ? (
                      <Input 
                        type="date" 
                        value={format(new Date(editedTask.startDate || task.startDate), 'yyyy-MM-dd')}
                        onChange={(e) => setEditedTask({...editedTask, startDate: e.target.value})}
                      />
                    ) : (
                      formatDate(task.startDate)
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Slutdatum</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {isEditing ? (
                      <Input 
                        type="date" 
                        value={format(new Date(editedTask.endDate || task.endDate), 'yyyy-MM-dd')}
                        onChange={(e) => setEditedTask({...editedTask, endDate: e.target.value})}
                      />
                    ) : (
                      formatDate(task.endDate)
                    )}
                  </div>
                </div>
                
                <div className="col-span-2 space-y-2 mt-4">
                  <Label className="flex justify-between">
                    <span>Progress</span>
                    <span className="font-normal text-muted-foreground">{editedTask.progress ?? task.progress ?? 0}%</span>
                  </Label>
                  <div className="space-y-2">
                    {isEditing ? (
                      <Slider
                        defaultValue={[editedTask.progress ?? task.progress ?? 0]}
                        max={100}
                        step={5}
                        onValueChange={(value) => setEditedTask({...editedTask, progress: value[0]})}
                      />
                    ) : (
                      <Progress value={task.progress || 0} className="h-2" />
                    )}
                  </div>
                </div>
                
                {phase && (
                  <div className="space-y-2">
                    <Label>Fas</Label>
                    <div>
                      <Badge 
                        style={{ backgroundColor: phase.color }} 
                        className="text-white">
                        {phase.name}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={handleCancelEdit}>Avbryt</Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Sparar..." : "Spara ändringar"}
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="resources" className="space-y-4 pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium">Tilldelade resurser</h3>
                <Button size="sm" variant="outline" onClick={handleOpenResourceDialog}>
                  <Plus className="h-4 w-4 mr-2" /> Hantera resurser
                </Button>
              </div>
              
              {resources.length === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Inga resurser tilldelade. Klicka på "Hantera resurser" för att lägga till.
                </div>
              ) : (
                <div className="space-y-2">
                  {resources.map((resource, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{resource.name}</p>
                          <p className="text-xs text-muted-foreground">{resource.type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="dependencies" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Föregående uppgifter</h3>
                  {dependencies.to.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Inga beroenden</p>
                  ) : (
                    <div className="space-y-2">
                      {dependencies.to.map((depTask) => (
                        <div key={depTask.id} className="flex items-center p-2 border rounded-md">
                          <div className="mr-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{depTask.name}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(depTask.endDate)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Efterföljande uppgifter</h3>
                  {dependencies.from.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Inga beroenden</p>
                  ) : (
                    <div className="space-y-2">
                      {dependencies.from.map((depTask) => (
                        <div key={depTask.id} className="flex items-center p-2 border rounded-md">
                          <div className="mr-2">
                            <Clock className="h-4 w-4 text-green-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{depTask.name}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(depTask.startDate)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Stäng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ResourceAssignmentDialog
        isOpen={isResourceDialogOpen}
        onOpenChange={setIsResourceDialogOpen}
        taskId={taskId}
        taskName={task.name}
        taskStartDate={task.startDate ? new Date(task.startDate) : undefined}
        taskEndDate={task.endDate ? new Date(task.endDate) : undefined}
      />
    </>
  )
} 