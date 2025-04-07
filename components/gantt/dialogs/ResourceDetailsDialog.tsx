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
import { Resource, Task, ResourceAssignment } from "@/lib/types"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { useProjects } from "@/lib/context/ProjectContext"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AtSign, Calendar, Phone, Star, Wrench, User } from "lucide-react"

interface ResourceDetailsDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  resourceId: string | null
}

export function ResourceDetailsDialog({ isOpen, onOpenChange, resourceId }: ResourceDetailsDialogProps) {
  const { activeProject } = useProjects()
  const [resource, setResource] = useState<Resource | null>(null)
  const [assignments, setAssignments] = useState<ResourceAssignment[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [tabValue, setTabValue] = useState("general")

  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
    return format(date, 'yyyy-MM-dd')
  }

  useEffect(() => {
    if (resourceId && activeProject && isOpen) {
      let foundResource: Resource | null = null;
      let foundAssignments: ResourceAssignment[] = [];
      
      // Find resource - need to handle both direct resource objects and resourceAssignments
      if (activeProject.resources) {
        activeProject.resources.forEach(res => {
          if (typeof res === 'object') {
            // Handle ResourceAssignment
            if ('resourceId' in res && res.resourceId === resourceId && res.resource) {
              foundResource = res.resource;
              foundAssignments.push(res as ResourceAssignment);
            }
            // Handle direct Resource
            else if ('id' in res && res.id === resourceId) {
              // Use type assertion with unknown as intermediate step
              foundResource = res as unknown as Resource;
            }
          }
        });
      }
      
      setResource(foundResource);
      setAssignments(foundAssignments);
      
      // Find tasks assigned to this resource
      if (activeProject.tasks && foundAssignments.length > 0) {
        const resourceTasks = activeProject.tasks.filter(task => 
          foundAssignments.some(assignment => assignment.taskId === task.id)
        );
        setTasks(resourceTasks);
      } else {
        setTasks([]);
      }
    }
  }, [resourceId, activeProject, isOpen]);

  if (!resource) {
    return null;
  }

  const getResourceInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{resource.name}</DialogTitle>
          {resource.role && (
            <DialogDescription>
              {resource.role}
            </DialogDescription>
          )}
        </DialogHeader>

        <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Allmänt</TabsTrigger>
            <TabsTrigger value="assignments">Uppdrag</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                  {getResourceInitials(resource.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resource.type && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Typ</Label>
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                        <span>{resource.type}</span>
                      </div>
                    </div>
                  )}
                  
                  {resource.email && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">E-post</Label>
                      <div className="flex items-center gap-2">
                        <AtSign className="h-4 w-4 text-muted-foreground" />
                        <span>{resource.email}</span>
                      </div>
                    </div>
                  )}
                  
                  {resource.phone && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Telefon</Label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{resource.phone}</span>
                      </div>
                    </div>
                  )}
                  
                  {resource.costRate && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Kostnad per timme</Label>
                      <div>
                        <span>{resource.costRate} kr/h</span>
                      </div>
                    </div>
                  )}
                  
                  {resource.capacity && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Kapacitet</Label>
                      <div>
                        <span>{resource.capacity} h/vecka</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {resource.skills && resource.skills.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Kompetenser</Label>
                    <div className="flex flex-wrap gap-2">
                      {resource.skills.map(skill => (
                        <Badge key={skill.id} variant="outline" className="flex gap-1 items-center">
                          <span>{skill.name}</span>
                          <span className="flex">
                            {Array.from({ length: skill.level }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-current" />
                            ))}
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="assignments" className="pt-4">
            {assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map(assignment => {
                  const task = tasks.find(t => t.id === assignment.taskId);
                  return (
                    <div key={assignment.id} className="border rounded-md p-4 space-y-3">
                      {task ? (
                        <div className="font-medium">
                          {task.name}
                        </div>
                      ) : (
                        <div className="font-medium text-muted-foreground">
                          Projektövergripande
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Period</Label>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>
                              {formatDate(assignment.startDate)} - {formatDate(assignment.endDate)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Timmar per dag</Label>
                          <div>{assignment.hoursPerDay} h</div>
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Budget</Label>
                          <div>{assignment.estimatedCost.toLocaleString()} kr</div>
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Förbrukat</Label>
                          <div>{assignment.actualCost.toLocaleString()} kr</div>
                        </div>
                      </div>
                      
                      {assignment.notes && (
                        <div className="text-sm mt-2">
                          <Label className="text-xs text-muted-foreground">Anteckningar</Label>
                          <p className="mt-1">{assignment.notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>Inga tilldelningar för denna resurs</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Stäng</Button>
          <Button>Redigera</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 