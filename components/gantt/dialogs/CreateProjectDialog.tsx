"use client"

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProjects } from "@/lib/context/ProjectContext";
import { useInteraction } from "@/lib/context/InteractionContext";
import { Project } from "@/lib/types";
import { getTodayFormatted, getFutureDateFormatted } from "@/lib/utils/date-utils";

interface CreateProjectDialogProps {
  // We might need props later, e.g., if the trigger is outside
}

export function CreateProjectDialog({}: CreateProjectDialogProps) {
  const { addProject } = useProjects();
  const { isAddingProject, setIsAddingProject } = useInteraction();

  const [newProjectData, setNewProjectData] = useState<Partial<Project>>({
    name: "Nytt projekt",
    startDate: getTodayFormatted(),
    endDate: getFutureDateFormatted(90),
    tasks: [],
    milestones: [],
    resources: [],
    color: "#0891b2",
  });

  const handleAddProject = () => {
    // TODO: Add validation if needed
    addProject(newProjectData);
    setIsAddingProject(false);
    // Reset form after adding
    setNewProjectData({
      name: "Nytt projekt",
      startDate: getTodayFormatted(),
      endDate: getFutureDateFormatted(90),
      color: "#0891b2",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProjectData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleColorChange = (color: string) => {
     setNewProjectData((prevData) => ({
       ...prevData,
       color: color,
     }));
  }

  return (
    <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
      {/* DialogTrigger might be rendered elsewhere, e.g., in the toolbar */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Skapa nytt projekt</DialogTitle>
          {/* Optional: <DialogDescription>Beskrivning här</DialogDescription> */}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Namn
            </Label>
            <Input
              id="name"
              name="name"
              value={newProjectData.name || ""}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Startdatum
            </Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={newProjectData.startDate || ""}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              Slutdatum
            </Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={newProjectData.endDate || ""}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          {/* TODO: Add color picker */}
           <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="color" className="text-right">
               Färg
             </Label>
             {/* Basic color input for now */}
             <Input
               id="color"
               name="color"
               type="color"
               value={newProjectData.color || "#0891b2"}
               onChange={handleInputChange}
               className="col-span-3 p-1 h-10 w-full"
             />
           </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAddingProject(false)}>
            Avbryt
          </Button>
          <Button onClick={handleAddProject}>Skapa projekt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 