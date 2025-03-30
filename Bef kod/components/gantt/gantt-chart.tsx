"use client"

import { useEffect, useRef, useState } from "react"
import { addDays, differenceInDays, format, parseISO } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronRight } from "lucide-react"

// Types (samma som tidigare)
// ...

interface GanttChartProps {
  initialProjects: any[] // Replace 'any' with a more specific type if possible
}

export default function GanttChart({ initialProjects = [] }: GanttChartProps) {
  // State-variabler (samma som tidigare)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState("projects")
  const [project, setProject] = useState<any>(null) // Replace 'any' with a more specific type if possible
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [viewStartDate, setViewStartDate] = useState(new Date())
  const [dayWidth, setDayWidth] = useState(20)
  const [expandedGroups, setExpandedGroups] = useState(new Set<string>())
  const [currentPhase, setCurrentPhase] = useState<string | null>(null)
  const [showMilestones, setShowMilestones] = useState(true)

  // Refs för att hantera scrollning
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const ganttRef = useRef<HTMLDivElement>(null)

  // Synkronisera horisontell scrollning mellan header och content
  useEffect(() => {
    const container = containerRef.current
    const content = contentRef.current
    const header = headerRef.current

    if (!container || !content || !header) return

    const handleScroll = () => {
      if (header) {
        header.scrollLeft = container.scrollLeft
      }
    }

    container.addEventListener("scroll", handleScroll)
    return () => {
      container.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Övriga useEffects (samma som tidigare)
  // ...

  // Helper functions (declare these before using them)
  const togglePhaseExpansion = (taskId: string) => {
    setExpandedGroups((prev) => {
      const newGroups = new Set(prev)
      if (newGroups.has(taskId)) {
        newGroups.delete(taskId)
      } else {
        newGroups.add(taskId)
      }
      return newGroups
    })
  }

  const navigateToPhase = (phaseId: string) => {
    setCurrentView("phase")
    setCurrentPhase(phaseId)
  }

  const getTaskLeft = (task: any, dayWidth: number, viewStartDate: Date) => {
    const startDate = parseISO(task.startDate)
    return differenceInDays(startDate, viewStartDate) * dayWidth
  }

  const getTaskWidth = (task: any, dayWidth: number, viewStartDate: Date) => {
    const startDate = parseISO(task.startDate)
    const endDate = parseISO(task.endDate)
    const duration = differenceInDays(endDate, startDate)
    return duration * dayWidth
  }

  const openTaskEditor = (taskId: string) => {
    // Implement your task editor logic here
    console.log(`Opening task editor for task ID: ${taskId}`)
  }

  // Rendera laddningstillstånd (samma som tidigare)
  if (loading) {
    // ...
  }

  // Rendera projektvyn (samma som tidigare)
  if (currentView === "projects") {
    // ...
  }

  // Rendera projektdetaljer eller fasvyn med förbättrad scrollning
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {/* Brödsmulor (samma som tidigare) */}
        <div className="flex items-center space-x-2 mb-4">{/* ... */}</div>

        {/* Projektinformation (samma som tidigare) */}
        {project && <div className="mb-6">{/* ... */}</div>}

        {/* Gantt-schema med förbättrad scrollning */}
        <div className="flex flex-col" ref={ganttRef}>
          {/* Verktygsfält (samma som tidigare) */}
          <div className="flex justify-between items-center mb-4">{/* ... */}</div>

          {/* Gantt-huvudinnehåll med förbättrad scrollning */}
          <div className="flex flex-col border rounded-md overflow-hidden">
            {/* Fast header som inte scrollar vertikalt */}
            <div ref={headerRef} className="flex border-b">
              {/* Fast uppgiftsrubrik */}
              <div className="w-64 min-w-64 border-r bg-gray-100 p-2 font-semibold">Uppgift</div>

              {/* Tidslinjehuvud som scrollar horisontellt med innehållet */}
              <div className="overflow-hidden">
                <div style={{ width: `${30 * dayWidth}px`, minWidth: "100%" }} className="flex">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className="border-r text-center text-xs py-2"
                      style={{ width: `${dayWidth}px`, minWidth: `${dayWidth}px` }}
                    >
                      {format(addDays(viewStartDate, i), "yyyy-MM-dd")}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Scrollbart innehåll med en enda scrollbar */}
            <div
              ref={containerRef}
              className="overflow-auto"
              style={{
                height: "calc(100vh - 300px)",
                minHeight: "400px",
                maxHeight: "800px",
              }}
            >
              <div className="flex">
                {/* Uppgiftslista som är fast horisontellt */}
                <div ref={sidebarRef} className="w-64 min-w-64 bg-gray-50">
                  {project &&
                    project.tasks
                      .filter((task) => {
                        if (currentView === "phase" && currentPhase) {
                          return task.parentId === currentPhase
                        }
                        return currentView === "project" && !task.parentId
                      })
                      .map((task) => (
                        <div key={task.id} className="border-b">
                          <div
                            className={`p-2 flex items-center hover:bg-gray-100 ${
                              selectedTask === task.id ? "bg-blue-50" : ""
                            }`}
                            onClick={() => setSelectedTask(task.id)}
                          >
                            {task.isPhase && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  togglePhaseExpansion(task.id)
                                }}
                                className="mr-1 w-5 h-5 flex items-center justify-center"
                              >
                                {expandedGroups.has(task.id) ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: task.color || "#0891b2" }}
                            ></div>
                            <span
                              className={`text-sm truncate ${task.isPhase ? "font-semibold" : ""}`}
                              title={task.name}
                            >
                              {task.name}
                            </span>
                            {task.isPhase && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigateToPhase(task.id)
                                }}
                                className="ml-auto text-xs text-blue-600 hover:underline"
                              >
                                Visa
                              </button>
                            )}
                          </div>
                          {task.isPhase &&
                            expandedGroups.has(task.id) &&
                            project.tasks
                              .filter((t) => t.parentId === task.id)
                              .map((subtask) => (
                                <div
                                  key={subtask.id}
                                  className={`p-2 pl-8 flex items-center hover:bg-gray-100 border-t ${
                                    selectedTask === subtask.id ? "bg-blue-50" : ""
                                  }`}
                                  onClick={() => setSelectedTask(subtask.id)}
                                >
                                  <div
                                    className="w-2 h-2 rounded-full mr-2"
                                    style={{ backgroundColor: subtask.color || "#0891b2" }}
                                  ></div>
                                  <span className="text-sm truncate" title={subtask.name}>
                                    {subtask.name}
                                  </span>
                                </div>
                              ))}
                        </div>
                      ))}
                </div>

                {/* Tidslinjeinnehåll som scrollar både horisontellt och vertikalt */}
                <div
                  ref={contentRef}
                  style={{
                    width: `${30 * dayWidth}px`,
                    minWidth: "100%",
                    position: "relative",
                  }}
                >
                  {/* Rutnät */}
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute border-r border-gray-200 h-full"
                        style={{ left: `${i * dayWidth}px`, width: `${dayWidth}px` }}
                      ></div>
                    ))}
                  </div>

                  {/* Uppgiftsstaplar */}
                  {project &&
                    project.tasks
                      .filter((task) => {
                        if (currentView === "phase" && currentPhase) {
                          return task.parentId === currentPhase
                        }
                        return currentView === "project" && !task.parentId
                      })
                      .map((task, index) => (
                        <div key={task.id} className="relative" style={{ height: "40px" }}>
                          <div
                            className={`absolute rounded-sm ${
                              task.isPhase ? "h-6 mt-2" : "h-5 mt-2.5"
                            } ${selectedTask === task.id ? "ring-2 ring-blue-500" : ""}`}
                            style={{
                              left: `${getTaskLeft(task, dayWidth, viewStartDate)}px`,
                              width: `${getTaskWidth(task, dayWidth, viewStartDate)}px`,
                              backgroundColor: task.color || "#0891b2",
                            }}
                            onClick={() => setSelectedTask(task.id)}
                            onDoubleClick={() => openTaskEditor(task.id)}
                          >
                            <div className="absolute inset-0 flex items-center px-2">
                              <span className="text-xs text-white truncate">{task.name}</span>
                              {task.progress > 0 && (
                                <div
                                  className="absolute left-0 top-0 bottom-0 bg-white/20"
                                  style={{ width: `${task.progress}%` }}
                                ></div>
                              )}
                            </div>
                          </div>

                          {/* Underuppgifter om fasen är expanderad */}
                          {task.isPhase &&
                            expandedGroups.has(task.id) &&
                            project.tasks
                              .filter((t) => t.parentId === task.id)
                              .map((subtask, subIndex) => (
                                <div
                                  key={subtask.id}
                                  className="relative"
                                  style={{
                                    height: "40px",
                                    marginTop: "2px",
                                  }}
                                >
                                  <div
                                    className={`absolute rounded-sm h-5 mt-2.5 ${
                                      selectedTask === subtask.id ? "ring-2 ring-blue-500" : ""
                                    }`}
                                    style={{
                                      left: `${getTaskLeft(subtask, dayWidth, viewStartDate)}px`,
                                      width: `${getTaskWidth(subtask, dayWidth, viewStartDate)}px`,
                                      backgroundColor: subtask.color || "#64748b",
                                    }}
                                    onClick={() => setSelectedTask(subtask.id)}
                                    onDoubleClick={() => openTaskEditor(subtask.id)}
                                  >
                                    <div className="absolute inset-0 flex items-center px-2">
                                      <span className="text-xs text-white truncate">{subtask.name}</span>
                                      {subtask.progress > 0 && (
                                        <div
                                          className="absolute left-0 top-0 bottom-0 bg-white/20"
                                          style={{ width: `${subtask.progress}%` }}
                                        ></div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                        </div>
                      ))}

                  {/* Milstolpar */}
                  {showMilestones &&
                    project &&
                    project.milestones.map((milestone) => {
                      const milestoneDate = parseISO(milestone.date)
                      const left = differenceInDays(milestoneDate, viewStartDate) * dayWidth
                      return (
                        <div
                          key={milestone.id}
                          className="absolute"
                          style={{
                            left: `${left}px`,
                            top: "0px",
                          }}
                        >
                          <div
                            className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent"
                            style={{ borderBottomColor: milestone.color || "#f59e0b" }}
                          ></div>
                          <div className="text-xs mt-1 -ml-10 w-20 text-center">{milestone.name}</div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modaler (samma som tidigare) */}
        {/* ... */}
      </CardContent>
    </Card>
  )
}

