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
import { Task } from "@/lib/types";
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
    status: "not-started",
    priority: "medium",
    resources: [],
    dependencies: [],
  });

  const handleAddTask = () => {
    if (activeProjectId) {
      const parentId = currentView === 'phase' && currentPhase ? currentPhase : undefined;
      addTask(activeProjectId, newTaskData, parentId);
      setIsAddingTask(false);
      // Reset form
      setNewTaskData({
        name: "",
        startDate: getTodayFormatted(),
        endDate: getFutureDateFormatted(7),
        progress: 0,
        status: "not-started",
        priority: "medium",
        resources: [],
        dependencies: [],
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTaskData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Find phase name for description
  const phaseName = currentView === 'phase' && currentPhase
    ? projects.find(p => p.id === activeProjectId)?.tasks.find(t => t.id === currentPhase)?.name
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
              value={newTaskData.startDate || ""}
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
              value={newTaskData.endDate || ""}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          {/* TODO: Add fields for progress, status, priority, resources, dependencies */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAddingTask(false)}>
            Avbryt
          </Button>
          <Button onClick={handleAddTask}>Lägg till uppgift</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 