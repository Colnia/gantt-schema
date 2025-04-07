"use client"

import { useState, useEffect, ChangeEvent } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from "@/lib/context/ProjectContext";
import { Task } from "@/lib/types";
import { formatDate } from "@/lib/utils/date-utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Fördefinierade färger för enklare val
const PREDEFINED_COLORS = [
  "#4169E1", // Royal Blue
  "#2E8B57", // Sea Green
  "#FF6347", // Tomato
  "#FFD700", // Gold
  "#8A2BE2", // Blue Violet
  "#20B2AA", // Light Sea Green
  "#FF4500", // Orange Red
  "#9370DB", // Medium Purple
  "#3CB371", // Medium Sea Green
  "#CD5C5C", // Indian Red
];

interface EditTaskDialogProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTaskDialog({ taskId, isOpen, onClose }: EditTaskDialogProps) {
  const { activeProject, updateTask } = useProjects();
  const [task, setTask] = useState<Task | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activityType, setActivityType] = useState<string>("task");
  const [status, setStatus] = useState<string>("not-started");
  const [progress, setProgress] = useState(0);
  const [selectedColor, setSelectedColor] = useState("#4169E1");
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    console.log("EditTaskDialog useEffect triggered, taskId:", taskId, "isOpen:", isOpen);
    if (taskId && activeProject && isOpen) {
      const currentTask = activeProject.tasks?.find((t: Task) => t.id === taskId);
      if (currentTask) {
        console.log("Found task:", currentTask);
        setTask(currentTask);
        setName(currentTask.name || "");
        setDescription(currentTask.description || "");
        setStartDate(currentTask.startDate || "");
        setEndDate(currentTask.endDate || "");
        setActivityType(currentTask.activityType || "task");
        setStatus(currentTask.status || "not-started");
        setProgress(currentTask.progress || 0);
        setSelectedColor(currentTask.color || "#4169E1");
        setHasChanges(false);
        setError(null);
        setSuccess(false);
      } else {
        console.warn("Task not found with ID:", taskId);
        setError("Kunde inte hitta uppgiften");
      }
    }
  }, [taskId, activeProject, isOpen]);

  const handleChange = () => {
    setHasChanges(true);
    setError(null);
  };

  const handleSave = async () => {
    if (!taskId || !task) return;
    
    setLoading(true);
    try {
      await updateTask({
        id: taskId,
        name,
        description,
        startDate,
        endDate,
        progress,
        activityType,
        status,
        color: selectedColor
      });
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Failed to update task:", error);
      setError("Ett fel uppstod när uppgiften skulle uppdateras");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Redigera uppgift</DialogTitle>
          <DialogDescription>
            Ändra information för uppgiften
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="my-2 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">Uppgiften har uppdaterats</AlertDescription>
          </Alert>
        )}

        {task && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Namn</Label>
              <Input
                id="name"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setName(e.target.value);
                  handleChange();
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beskrivning</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                  setDescription(e.target.value);
                  handleChange();
                }}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activity-type">Typ</Label>
                <Select
                  value={activityType}
                  onValueChange={(value: string) => {
                    setActivityType(value);
                    handleChange();
                  }}
                >
                  <SelectTrigger id="activity-type">
                    <SelectValue placeholder="Välj typ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Uppgift</SelectItem>
                    <SelectItem value="milestone">Milstolpe</SelectItem>
                    <SelectItem value="delivery">Leverans</SelectItem>
                    <SelectItem value="decision">Beslutspunkt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(value: string) => {
                    setStatus(value);
                    handleChange();
                  }}
                >
                  <SelectTrigger id="status">
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
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Startdatum</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formatDate(startDate, "yyyy-MM-dd")}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setStartDate(e.target.value);
                    handleChange();
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">Slutdatum</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={formatDate(endDate, "yyyy-MM-dd")}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setEndDate(e.target.value);
                    handleChange();
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress">Färdig (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="progress"
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setProgress(parseInt(e.target.value) || 0);
                    handleChange();
                  }}
                  className="flex-1"
                />
                <span className="w-12 text-center">{progress}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Färg</Label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full cursor-pointer border ${
                      selectedColor === color ? 'ring-2 ring-offset-2 ring-primary' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setSelectedColor(color);
                      handleChange();
                    }}
                    aria-label={`Färg ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Avbryt
          </Button>
          <Button onClick={handleSave} disabled={loading || !hasChanges}>
            {loading ? "Sparar..." : "Spara ändringar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 