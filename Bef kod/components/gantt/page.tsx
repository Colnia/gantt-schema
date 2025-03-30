"use client"

import GanttChart from "./gantt-chart"
import { useGanttData } from "@/hooks/use-gantt-data"
import GanttLayout from "./gantt-layout"
import { useState } from "react"

export default function Page() {
  const { projectDetails, loading, changeActiveProject } = useGanttData()
  const [viewMode, setViewMode] = useState("timeline")

  const handleZoomIn = () => {
    // Implement zoom in logic here
    console.log("Zoom In")
  }

  const handleZoomOut = () => {
    // Implement zoom out logic here
    console.log("Zoom Out")
  }

  const handleViewChange = (view: string) => {
    setViewMode(view)
    console.log(`View changed to: ${view}`)
  }

  return (
    <GanttLayout
      title="Projektplanering"
      onZoomIn={handleZoomIn}
      onZoomOut={handleZoomOut}
      onViewChange={handleViewChange}
    >
      {loading ? (
        <div>Laddar...</div>
      ) : projectDetails ? (
        <GanttChart initialProjects={[projectDetails]} />
      ) : (
        <div>Inget projekt valt.</div>
      )}
    </GanttLayout>
  )
}

