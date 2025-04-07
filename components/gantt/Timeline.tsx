"use client"

import React, { RefObject, ReactNode } from "react"
import { TimeScale } from "@/lib/types"
import { formatDate } from "@/lib/utils/date-utils"

interface TimelineProps {
  dates: Date[]
  timelineItems: { date: Date; type: "primary" | "secondary"; label: string; width: number }[]
  dayWidth: number
  timeScale: TimeScale
  timelineHeaderRef: RefObject<HTMLDivElement>
  timelineContentRef: RefObject<HTMLDivElement>
  children: ReactNode;
}

export const Timeline = ({ 
  dates, 
  timelineItems, 
  dayWidth, 
  timeScale, 
  timelineHeaderRef, 
  timelineContentRef, 
  children
}: TimelineProps) => {
  const totalWidth = dates.length * dayWidth;

  const primaryItems = timelineItems.filter(item => item.type === 'primary');
  const secondaryItems = timelineItems.filter(item => item.type === 'secondary');

  // CSS-klasser baserade på tidsskala
  const getPrimaryClassNames = () => {
    let baseClasses = "text-sm font-semibold text-center border-r overflow-hidden whitespace-nowrap p-1";
    
    // Specialstil för veckor W1, W2 etc. med datumintervaller
    if (timeScale === "day") {
      return `${baseClasses} bg-muted/30`;
    }
    
    return baseClasses;
  };
  
  const getSecondaryClassNames = () => {
    let baseClasses = "text-xs text-center border-r text-muted-foreground overflow-hidden whitespace-nowrap p-0.5";
    
    // Specialstil för veckodagar 
    if (timeScale === "day") {
      return `${baseClasses} bg-muted/10`;
    }
    
    return baseClasses;
  };

  return (
    <div ref={timelineContentRef} className="relative">
      {/* Content area containing task bars and grid lines */}
      <div className="relative">
        {/* We don't need the grid background here anymore, it's now part of the children */}
        {children}
      </div>
    </div>
  )
}

export default Timeline; 