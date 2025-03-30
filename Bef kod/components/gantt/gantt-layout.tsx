"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Calendar, List } from "lucide-react"

interface GanttLayoutProps {
  children: React.ReactNode
  title: string
  onZoomIn?: () => void
  onZoomOut?: () => void
  onViewChange?: (view: string) => void
}

export default function GanttLayout({ children, title, onZoomIn, onZoomOut, onViewChange }: GanttLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)

  // Kontrollera skärmstorlek
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)

    return () => {
      window.removeEventListener("resize", checkScreenSize)
    }
  }, [])

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">{title}</h1>

        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-md overflow-hidden border">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-none border-r"
              onClick={() => onViewChange?.("timeline")}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Tidslinje
            </Button>
            <Button variant="ghost" size="sm" className="rounded-none" onClick={() => onViewChange?.("list")}>
              <List className="h-4 w-4 mr-1" />
              Lista
            </Button>
          </div>

          <div className="flex rounded-md overflow-hidden border">
            <Button variant="ghost" size="sm" className="rounded-none border-r px-2" onClick={onZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-none px-2" onClick={onZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card className="w-full">
        <CardContent className={isMobile ? "p-2" : "p-4"}>{children}</CardContent>
      </Card>
    </div>
  )
}

