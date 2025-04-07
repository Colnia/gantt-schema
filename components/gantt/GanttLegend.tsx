"use client"

import React from "react"
import { getStatusColor, getPriorityColor } from "@/lib/utils/task-utils"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskStatus, TaskPriority } from "@/lib/types"

interface GanttLegendProps {
  visible: boolean
  onToggle: (visible: boolean) => void
}

interface LegendItem {
  value: string
  label: string
  color: string
  description: string
}

// Status legend items
const statusItems: LegendItem[] = [
  { value: "not-started", label: "Ej påbörjad", color: getStatusColor("not-started"), description: "Uppgiften har inte påbörjats än" },
  { value: "in-progress", label: "Pågående", color: getStatusColor("in-progress"), description: "Uppgiften är under arbete" },
  { value: "completed", label: "Avslutad", color: getStatusColor("completed"), description: "Uppgiften är slutförd" },
  { value: "delayed", label: "Försenad", color: getStatusColor("delayed"), description: "Uppgiften är försenad mot planen" },
  { value: "cancelled", label: "Inställd", color: getStatusColor("cancelled"), description: "Uppgiften är avbruten" }
];

// Priority legend items
const priorityItems: LegendItem[] = [
  { value: "low", label: "Låg", color: getPriorityColor("low"), description: "Kan vänta om nödvändigt" },
  { value: "medium", label: "Medium", color: getPriorityColor("medium"), description: "Normal prioritet" },
  { value: "high", label: "Hög", color: getPriorityColor("high"), description: "Viktig uppgift som bör prioriteras" },
  { value: "critical", label: "Kritisk", color: getPriorityColor("critical"), description: "Måste åtgärdas omedelbart" }
];

// Dependency types
const dependencyItems: LegendItem[] = [
  { value: "finish-to-start", label: "Slut-till-Start", color: "bg-blue-500", description: "Föregående måste avslutas innan denna kan starta" },
  { value: "start-to-start", label: "Start-till-Start", color: "bg-green-500", description: "Båda uppgifterna måste starta samtidigt" },
  { value: "finish-to-finish", label: "Slut-till-Slut", color: "bg-amber-500", description: "Båda uppgifterna måste avslutas samtidigt" },
  { value: "start-to-finish", label: "Start-till-Slut", color: "bg-red-500", description: "Efterföljande kan inte avslutas innan föregående startat" },
];

export const GanttLegend: React.FC<GanttLegendProps> = ({ visible, onToggle }) => {
  if (!visible) return null
  
  return (
    <Card className="absolute bottom-4 right-4 w-auto shadow-md z-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Förklaringar</h3>
          <Switch 
            checked={visible}
            onCheckedChange={onToggle}
            aria-label="Visa/dölj förklaringar"
          />
        </div>
        
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-3">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="priority">Prioritet</TabsTrigger>
            <TabsTrigger value="dependency">Beroenden</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="mt-0">
            <div className="grid grid-cols-2 gap-2">
              <TooltipProvider>
                {statusItems.map((item) => (
                  <Tooltip key={item.value}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5">
                        <div 
                          className={`w-3 h-3 rounded-full ${item.color}`}
                          aria-label={item.label}
                        />
                        <span className="text-xs">{item.label}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{item.description}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </TabsContent>
          
          <TabsContent value="priority" className="mt-0">
            <div className="grid grid-cols-2 gap-2">
              <TooltipProvider>
                {priorityItems.map((item) => (
                  <Tooltip key={item.value}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5">
                        <div 
                          className={`w-3 h-3 rounded-full ${item.color}`}
                          aria-label={item.label}
                        />
                        <span className="text-xs">{item.label}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{item.description}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </TabsContent>
          
          <TabsContent value="dependency" className="mt-0">
            <div className="grid grid-cols-1 gap-2">
              <TooltipProvider>
                {dependencyItems.map((item) => (
                  <Tooltip key={item.value}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5">
                        <div 
                          className={`w-5 h-2 ${item.color}`}
                          aria-label={item.label}
                        />
                        <span className="text-xs">{item.label}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{item.description}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default GanttLegend 