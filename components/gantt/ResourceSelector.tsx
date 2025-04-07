"use client"

import { useState, useEffect } from 'react'
import { useProjects } from '@/lib/context/ProjectContext'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CheckIcon, ChevronsUpDown, PlusCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'

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
}

interface ResourceSelectorProps {
  taskId?: string | null
  projectId?: string | null
  onResourcesChange?: (resources: ResourceAssignment[]) => void
  className?: string
}

export function ResourceSelector({
  taskId,
  projectId,
  onResourcesChange,
  className,
}: ResourceSelectorProps) {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selectedResources, setSelectedResources] = useState<ResourceAssignment[]>([])

  // Hämta resurser när komponenten laddas
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true)
        // Hämta resurser, med eller utan projektID-filter
        const url = projectId ? `/api/resources?projectId=${projectId}` : '/api/resources'
        const response = await fetch(url)
        if (!response.ok) throw new Error('Kunde inte hämta resurser')
        const data = await response.json()
        setResources(data)

        // Hämta tilldelade resurser för uppgiften om taskId är specificerat
        if (taskId) {
          const assignmentsResponse = await fetch(`/api/tasks/resources?taskId=${taskId}`)
          if (assignmentsResponse.ok) {
            const assignmentsData = await assignmentsResponse.json()
            setSelectedResources(assignmentsData)
            if (onResourcesChange) {
              onResourcesChange(assignmentsData)
            }
          }
        }
      } catch (error) {
        console.error('Fel vid hämtning av resurser:', error)
        toast.error('Kunde inte hämta resurser')
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [taskId, projectId, onResourcesChange])

  const toggleResource = async (resource: Resource) => {
    if (!taskId) {
      toast.error('Ingen uppgift vald')
      return
    }
    
    // Kontrollera om resursen redan är tilldelad
    const isAssigned = selectedResources.some(r => r.resourceId === resource.id)

    try {
      if (isAssigned) {
        // Ta bort resurstilldelning
        const response = await fetch(`/api/tasks/resources?taskId=${taskId}&resourceId=${resource.id}`, {
          method: 'DELETE',
        })
        
        if (!response.ok) throw new Error('Kunde inte ta bort resurstilldelning')
        
        const newSelectedResources = selectedResources.filter(r => r.resourceId !== resource.id)
        setSelectedResources(newSelectedResources)
        if (onResourcesChange) {
          onResourcesChange(newSelectedResources)
        }
        toast.success(`${resource.name} har tagits bort från uppgiften`)
      } else {
        // Lägg till resurstilldelning
        const response = await fetch('/api/tasks/resources', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskId,
            resourceId: resource.id,
            units: 100, // Standard: 100% tilldelning
          }),
        })
        
        if (!response.ok) throw new Error('Kunde inte tilldela resurs')
        
        const assignment = await response.json()
        const newSelectedResources = [...selectedResources, assignment]
        setSelectedResources(newSelectedResources)
        if (onResourcesChange) {
          onResourcesChange(newSelectedResources)
        }
        toast.success(`${resource.name} har tilldelats uppgiften`)
      }
    } catch (error) {
      console.error('Fel vid hantering av resurstilldelning:', error)
      toast.error('Ett fel uppstod')
    }
  }

  const getResourceInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return name.substring(0, 2).toUpperCase();
  }

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={loading}
          >
            {selectedResources.length > 0 
              ? `${selectedResources.length} resurs${selectedResources.length !== 1 ? 'er' : ''} tilldelade`
              : "Välj resurser"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Sök resurs..." />
            <CommandList>
              <CommandEmpty>Inga resurser hittades.</CommandEmpty>
              <CommandGroup heading="Tillgängliga resurser">
                {resources.map((resource) => {
                  const isAssigned = selectedResources.some(r => r.resourceId === resource.id)
                  return (
                    <CommandItem
                      key={resource.id}
                      value={resource.id + resource.name}
                      onSelect={() => toggleResource(resource)}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {getResourceInitials(resource.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{resource.name}</span>
                      </div>
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          isAssigned ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem 
                  onSelect={() => {
                    setOpen(false)
                    window.location.href = `/resources/new?projectId=${projectId}`
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Skapa ny resurs</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedResources.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedResources.map((assignment) => (
            <div 
              key={assignment.id}
              className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-2.5 py-0.5 rounded-full text-xs font-semibold"
            >
              <Avatar className="h-4 w-4">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                  {getResourceInitials(assignment.resource.name)}
                </AvatarFallback>
              </Avatar>
              <span>{assignment.resource.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 