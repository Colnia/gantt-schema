"use client"

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProjects } from "@/lib/context/ProjectContext";
import { useInteraction } from "@/lib/context/InteractionContext";
import { useUI } from "@/lib/context/UIContext"; // Need currentView and currentPhase
import { Task, Dependency } from "@/lib/types";
import { getTodayFormatted, getFutureDateFormatted } from "@/lib/utils/date-utils";

interface AddTaskDialogProps {
  activeProjectId: string | null;
  // Trigger might be rendered elsewhere
}

export function AddTaskDialog({ activeProjectId }: AddTaskDialogProps) {
  const { addTask, projects } = useProjects(); // Need projects to find phase name
  const { isAddingTask, setIsAddingTask } = useInteraction();
  const { currentView, currentPhase } = useUI();

  const [newTaskData, setNewTaskData] = useState<Partial<Task>>({
    name: "",
    startDate: getTodayFormatted(),
    endDate: getFutureDateFormatted(7),
    progress: 0,
    status: "not-started" as const,
    priority: "medium" as const,
    resources: [],
    dependencies: [],
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddTask = async () => {
    console.log("===== DEBUGGING AddTaskDialog =====");
    console.log("1. handleAddTask anropat med:", { 
      activeProjectId, 
      currentView, 
      currentPhase,
      newTaskData 
    });
    
    if (!activeProjectId) {
      console.error("2. AVBRYTER: Kan inte lägga till uppgift: Inget aktivt projekt valt");
      setError("Inget aktivt projekt valt");
      return;
    }
    
    // Kontrollera att nödvändiga fält har värden
    if (!newTaskData.name || !newTaskData.name.trim()) {
      console.error("2. AVBRYTER: Uppgiftsnamn måste anges");
      setError("Uppgiftsnamn måste anges");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Säkerställ att datumfälten är strings
      const startDate = typeof newTaskData.startDate === 'string' 
        ? newTaskData.startDate 
        : getTodayFormatted();
        
      const endDate = typeof newTaskData.endDate === 'string' 
        ? newTaskData.endDate 
        : getFutureDateFormatted(7);
      
      console.log("3. Datum efter konvertering:", { startDate, endDate });
      
      // Skapa en unik id för uppgiften (OBS: ID kommer skapas av API:t)
      const taskToAdd: Task = {
        id: `temp-${Date.now()}`,
        name: newTaskData.name?.trim() || "Ny uppgift",
        description: newTaskData.description || "",
        startDate: startDate,
        endDate: endDate,
        progress: newTaskData.progress ?? 0,
        status: newTaskData.status || "not-started",
        priority: newTaskData.priority || "medium",
        // Säkerställ att dessa är arrays och att de är av rätt typ
        resources: Array.isArray(newTaskData.resources) ? newTaskData.resources : [] as string[],
        dependencies: Array.isArray(newTaskData.dependencies) ? newTaskData.dependencies : [] as Dependency[],
        // Lägg till parentId direkt i objektet om vi befinner oss i fasvy
        parentId: currentView === 'phase' && currentPhase ? currentPhase : undefined,
        // Sätt dessa till standardvärden
        color: newTaskData.color || "#4f46e5", // Default färg om ingen anges
        isPhase: newTaskData.isPhase || false,
        collapsed: newTaskData.collapsed || false
      };
      
      console.log("4. Komplett uppgiftsobjekt som ska läggas till:", taskToAdd);
      console.log("5. ProjectID som används:", activeProjectId);
      
      // Lägg till uppgiften i projektet med det asynkrona API-anropet
      const newTaskId = await addTask(taskToAdd, activeProjectId);
      console.log("7. Uppgift tillagd med ID:", newTaskId);
      
      if (!newTaskId) {
        console.error("8. VARNING: addTask returnerade inget ID");
        setError("Kunde inte lägga till uppgift. Försök igen.");
        return;
      }
      
      // Stäng dialogen
      setIsAddingTask(false);
      
      // Reset form
      setNewTaskData({
        name: "",
        startDate: getTodayFormatted(),
        endDate: getFutureDateFormatted(7),
        progress: 0,
        status: "not-started" as const,
        priority: "medium" as const,
        resources: [],
        dependencies: [],
      });
    } catch (error) {
      console.error("ERROR i handleAddTask:", error);
      setError("Ett fel uppstod när uppgiften skulle läggas till.");
    } finally {
      setIsSubmitting(false);
    }
    console.log("===== SLUT DEBUGGING =====");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTaskData((prevData) => ({
      ...prevData,
      [name]: name === 'progress' ? parseFloat(value) : value,
    }));
  };

  // Find phase name for description
  const phaseName = currentView === 'phase' && currentPhase
    ? projects.find(p => p.id === activeProjectId)?.tasks?.find(t => t.id === currentPhase)?.name
    : null;

  return (
    <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lägg till ny uppgift</DialogTitle>
          {phaseName && (
            <DialogDescription>
              Lägger till i fas: {phaseName}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-2">
              {error}
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taskName" className="text-right">
              Namn
            </Label>
            <Input
              id="taskName"
              name="name" // Ensure name matches state key
              value={newTaskData.name || ""}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="Ny uppgift"
            />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taskStartDate" className="text-right">
              Startdatum
            </Label>
            <Input
              id="taskStartDate"
              name="startDate"
              type="date"
              value={typeof newTaskData.startDate === 'string' ? newTaskData.startDate : ""}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taskEndDate" className="text-right">
              Slutdatum
            </Label>
            <Input
              id="taskEndDate"
              name="endDate"
              type="date"
              value={typeof newTaskData.endDate === 'string' ? newTaskData.endDate : ""}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          {/* TODO: Add fields for progress, status, priority, resources, dependencies */}
        </div>
        <DialogFooter>
          <Button 
            className="bg-background text-foreground border border-input hover:bg-accent hover:text-accent-foreground"
            onClick={() => setIsAddingTask(false)}
            disabled={isSubmitting}
          >
            Avbryt
          </Button>
          <Button onClick={handleAddTask} disabled={isSubmitting}>
            {isSubmitting ? "Lägger till..." : "Lägg till uppgift"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 