"use client"

import React from "react";
import { useUI } from "@/lib/context/UIContext";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  PieChart, 
  AlignLeft,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface ViewControlsProps {
  projectId: string;
}

export default function ViewControls({ projectId }: ViewControlsProps) {
  const { currentView, setCurrentView } = useUI();

  return (
    <div className="flex items-center justify-between mb-4 px-4">
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <Button 
            className="gap-2 bg-background text-foreground border border-input hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Tillbaka
          </Button>
        </Link>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          className={`gap-2 ${currentView === 'gantt' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground border border-input hover:bg-accent hover:text-accent-foreground'}`}
          onClick={() => setCurrentView('gantt')}
        >
          <Calendar className="h-4 w-4" />
          Gantt
        </Button>
        
        <Button
          className={`gap-2 ${currentView === 'phase' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground border border-input hover:bg-accent hover:text-accent-foreground'}`}
          onClick={() => setCurrentView('phase')}
        >
          <PieChart className="h-4 w-4" />
          Faser
        </Button>
        
        <Button
          className={`gap-2 ${currentView === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground border border-input hover:bg-accent hover:text-accent-foreground'}`}
          onClick={() => setCurrentView('list')}
        >
          <AlignLeft className="h-4 w-4" />
          Lista
        </Button>
      </div>
    </div>
  );
} 