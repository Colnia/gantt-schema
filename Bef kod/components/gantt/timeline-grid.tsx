"use client"

import { useRef, useEffect } from "react"
import { format, addDays } from "date-fns"

interface TimelineGridProps {
  startDate: Date
  dayWidth: number
  days: number
  onScroll?: (scrollLeft: number) => void
  scrollLeft?: number
}

export default function TimelineGrid({ startDate, dayWidth, days = 30, onScroll, scrollLeft = 0 }: TimelineGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Synkronisera scrollposition med förälderelement
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (container.scrollLeft !== scrollLeft) {
      container.scrollLeft = scrollLeft
    }
  }, [scrollLeft])

  // Hantera scrollning och rapportera till förälderelement
  useEffect(() => {
    const container = containerRef.current
    if (!container || !onScroll) return

    const handleScroll = () => {
      onScroll(container.scrollLeft)
    }

    container.addEventListener("scroll", handleScroll)
    return () => {
      container.removeEventListener("scroll", handleScroll)
    }
  }, [onScroll])

  return (
    <div ref={containerRef} className="overflow-x-auto" style={{ width: "100%" }}>
      <div
        style={{
          width: `${days * dayWidth}px`,
          minWidth: "100%",
          position: "relative",
        }}
      >
        {/* Datumhuvuden */}
        <div className="flex border-b">
          {Array.from({ length: days }).map((_, i) => (
            <div
              key={i}
              className="border-r text-center text-xs py-2"
              style={{ width: `${dayWidth}px`, minWidth: `${dayWidth}px` }}
            >
              {format(addDays(startDate, i), "yyyy-MM-dd")}
            </div>
          ))}
        </div>

        {/* Rutnät */}
        <div className="relative">
          {Array.from({ length: days }).map((_, i) => (
            <div
              key={i}
              className="absolute border-r border-gray-200 h-full"
              style={{ left: `${i * dayWidth}px`, width: `${dayWidth}px` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}

