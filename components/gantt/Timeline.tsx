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

  return (
    <> 
      {/* --- Tidslinje Header --- */}
      <div ref={timelineHeaderRef} className="sticky top-0 bg-background z-10 border-b select-none">
         {/* Primär Rad (t.ex. Månader, Veckor) */} 
         <div className="flex border-b" style={{ width: `${totalWidth}px` }}>
            {primaryItems.map((item, index) => (
                <div key={`primary-${index}`} 
                     className={`text-sm font-semibold text-center border-r overflow-hidden whitespace-nowrap p-1`}
                     style={{ width: `${item.width}px` }}>
                   {item.label}
                </div>
            ))}
         </div>
         {/* Sekundär Rad (t.ex. Dagar), visas bara om det finns några */} 
         {secondaryItems.length > 0 && (
             <div className="flex" style={{ width: `${totalWidth}px` }}>
                {secondaryItems.map((item, index) => (
                    <div key={`secondary-${index}`} 
                         className={`text-xs text-center border-r text-muted-foreground overflow-hidden whitespace-nowrap p-0.5`}
                         style={{ width: `${item.width}px` }}>
                       {item.label}
                    </div>
                ))}
             </div>
         )}
      </div>

      {/* --- Grid Bakgrund (Inuti Content) --- */} 
      <div ref={timelineContentRef} className="relative flex-grow overflow-auto">
         {/* Grid-bakgrund (oförändrad) */}
         <div className="absolute inset-0 pointer-events-none">
             <div className="flex h-full" style={{ width: `${totalWidth}px` }}>
                 {dates.map((date, index) => (
                     <div key={`grid-${index}`} className="h-full border-r border-muted-foreground/10" style={{ width: `${dayWidth}px` }}></div>
                 ))}
             </div>
         </div>
         
         {/* Rendera children (uppgifts-bars etc.) här */} 
         {children}
      </div>
    </>
  )
}

export default Timeline; 