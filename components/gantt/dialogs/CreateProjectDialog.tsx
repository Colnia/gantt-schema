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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from "@/lib/context/ProjectContext";
import { useInteraction } from "@/lib/context/InteractionContext";
import { Project, ProjectStatus } from "@/lib/types";
import { getTodayFormatted, getFutureDateFormatted } from "@/lib/utils/date-utils";

interface CreateProjectDialogProps {
  // We might need props later, e.g., if the trigger is outside
}

export function CreateProjectDialog({}: CreateProjectDialogProps) {
  const { addProject } = useProjects();
  const { isAddingProject, setIsAddingProject } = useInteraction();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Debug-loggar för att identifiera om komponenten renderas och om isAddingProject ändras
  console.log("CreateProjectDialog renderad, isAddingProject:", isAddingProject);
  
  React.useEffect(() => {
    console.log("isAddingProject ändrades till:", isAddingProject);
  }, [isAddingProject]);

  const [newProjectData, setNewProjectData] = useState<Partial<Project>>({
    name: "Nytt projekt",
    startDate: getTodayFormatted(),
    endDate: getFutureDateFormatted(90),
    tasks: [],
    milestones: [],
    resources: [],
    color: "#0891b2",
    description: "",
    customer: "",
    manager: "",
    budget: 0,
    costToDate: 0,
    estimatedTotalCost: 0,
    status: "Planering",
  });

  const handleAddProject = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Använd API:n för att skapa projekt
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProjectData.name,
          description: newProjectData.description || "",
          customer: newProjectData.customer || "Okänd kund",
          manager: newProjectData.manager || "Okänd projektledare",
          startDate: newProjectData.startDate,
          plannedEndDate: newProjectData.endDate,
          status: newProjectData.status || "Planering",
          budget: newProjectData.budget || 0,
          costToDate: newProjectData.costToDate || 0,
          estimatedTotalCost: newProjectData.estimatedTotalCost || 0,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte skapa projekt');
      }
      
      const data = await response.json();
      console.log('Projekt skapat:', data);
      
      // Använd addProject från context för att uppdatera lokal state
      // om du fortfarande vill använda den för realtidsuppdatering
      addProject({
        ...newProjectData,
        id: data.project.id,
        tasks: [],
        milestones: [],
        resources: [],
      });
      
      setIsAddingProject(false);
      
      // Reset form after adding
      setNewProjectData({
        name: "Nytt projekt",
        startDate: getTodayFormatted(),
        endDate: getFutureDateFormatted(90),
        color: "#0891b2",
        description: "",
        customer: "",
        manager: "",
        budget: 0,
        costToDate: 0,
        estimatedTotalCost: 0,
        status: "Planering",
      });
    } catch (err) {
      console.error('Fel vid skapande av projekt:', err);
      setError(err instanceof Error ? err.message : 'Kunde inte skapa projekt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProjectData((prevData) => ({
      ...prevData,
      [name]: name === 'budget' || name === 'costToDate' || name === 'estimatedTotalCost' 
        ? parseFloat(value) 
        : value,
    }));
  };

  const handleSelectChange = (name: string, value: string): void => {
    setNewProjectData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Skapa nytt projekt</DialogTitle>
          <DialogDescription>Fyll i projektuppgifterna nedan för att skapa ett nytt projekt.</DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Projektnamn*
            </Label>
            <Input
              id="name"
              name="name"
              value={newProjectData.name || ""}
              onChange={handleInputChange}
              className="col-span-3"
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Beskrivning
            </Label>
            <Textarea
              id="description"
              name="description"
              value={newProjectData.description || ""}
              onChange={handleInputChange}
              className="col-span-3 min-h-[100px]"
              placeholder="Beskriv projektets syfte och mål"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customer" className="text-right">
              Kund*
            </Label>
            <Input
              id="customer"
              name="customer"
              value={newProjectData.customer || ""}
              onChange={handleInputChange}
              className="col-span-3"
              required
              placeholder="Kundens namn"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="manager" className="text-right">
              Projektledare*
            </Label>
            <Input
              id="manager"
              name="manager"
              value={newProjectData.manager || ""}
              onChange={handleInputChange}
              className="col-span-3"
              required
              placeholder="Namn på projektledare"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Startdatum*
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={typeof newProjectData.startDate === 'string' ? newProjectData.startDate : ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                Slutdatum*
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={typeof newProjectData.endDate === 'string' ? newProjectData.endDate : ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select 
                value={newProjectData.status || "Planering"} 
                onValueChange={(value: string) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Välj status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planering">Planering</SelectItem>
                  <SelectItem value="Pågående">Pågående</SelectItem>
                  <SelectItem value="Färdigt">Färdigt</SelectItem>
                  <SelectItem value="Försenat">Försenat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 mt-2">
            <h3 className="font-medium text-sm">Ekonomi</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="grid grid-cols-2 items-center gap-2">
              <Label htmlFor="budget" className="text-right text-sm">
                Budget (kr)
              </Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                min="0"
                step="1000"
                value={newProjectData.budget || 0}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid grid-cols-2 items-center gap-2">
              <Label htmlFor="costToDate" className="text-right text-sm">
                Kostnad hittills
              </Label>
              <Input
                id="costToDate"
                name="costToDate"
                type="number"
                min="0"
                step="1000"
                value={newProjectData.costToDate || 0}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid grid-cols-2 items-center gap-2">
              <Label htmlFor="estimatedTotalCost" className="text-right text-sm">
                Est. totalkostnad
              </Label>
              <Input
                id="estimatedTotalCost"
                name="estimatedTotalCost"
                type="number"
                min="0"
                step="1000"
                value={newProjectData.estimatedTotalCost || 0}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4 mt-2">
            <Label htmlFor="color" className="text-right">
              Projektfärg
            </Label>
            <Input
              id="color"
              name="color"
              type="color"
              value={newProjectData.color || "#0891b2"}
              onChange={handleInputChange}
              className="p-1 h-10 w-full col-span-1"
            />
          </div>
          
          <div className="grid grid-cols-1 mt-6">
            <p className="text-xs text-muted-foreground">Fält markerade med * är obligatoriska</p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setIsAddingProject(false)} className="bg-background text-foreground border border-input hover:bg-accent hover:text-accent-foreground" disabled={isSubmitting}>
            Avbryt
          </Button>
          <Button onClick={handleAddProject} disabled={isSubmitting}>
            {isSubmitting ? "Skapar..." : "Skapa projekt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 