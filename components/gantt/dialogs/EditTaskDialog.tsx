"use client"

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/lib/context/ProjectContext";
import { Task } from "@/lib/types";
import { formatDate } from "@/lib/utils/date-utils";

interface EditTaskDialogProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  startDate: string;
  endDate: string;
}

export function EditTaskDialog({ taskId, isOpen, onClose }: EditTaskDialogProps) {
  const { activeProject, updateTask } = useProjects();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    startDate: "",
    endDate: "",
  });
  const [originalTask, setOriginalTask] = useState<Task | null>(null);

  useEffect(() => {
    if (isOpen && taskId && activeProject) {
      const taskToEdit = activeProject.tasks.find((t) => t.id === taskId);
      if (taskToEdit) {
        setOriginalTask(taskToEdit);
        setFormData({
          name: taskToEdit.name,
          startDate: formatDate(taskToEdit.startDate, "yyyy-MM-dd"),
          endDate: formatDate(taskToEdit.endDate, "yyyy-MM-dd"),
        });
      } else {
        console.error(`Task with id ${taskId} not found in active project.`);
        onClose();
      }
    } else if (!isOpen) {
       setOriginalTask(null);
       setFormData({ name: "", startDate: "", endDate: "" });
    }
  }, [isOpen, taskId, activeProject, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!taskId || !activeProject?.id) return;

    const updates: Partial<Task> = {};
    if (originalTask && formData.startDate !== formatDate(originalTask.startDate, "yyyy-MM-dd")) {
        updates.startDate = new Date(formData.startDate).toISOString();
    }
    if (originalTask && formData.endDate !== formatDate(originalTask.endDate, "yyyy-MM-dd")) {
        updates.endDate = new Date(formData.endDate).toISOString();
    }
    if (originalTask && formData.name !== originalTask.name) {
        updates.name = formData.name;
    }

    if (Object.keys(updates).length > 0) {
        updateTask(activeProject.id, taskId, updates);
    }
    onClose();
  };

  if (!isOpen || !taskId) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redigera uppgift</DialogTitle>
          <DialogDescription>
             Uppdatera detaljerna för uppgiften "{originalTask?.name || ''}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Namn
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
              value={formData.startDate}
              onChange={handleChange}
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
              value={formData.endDate}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Avbryt
          </Button>
          <Button onClick={handleSave}>Spara ändringar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 