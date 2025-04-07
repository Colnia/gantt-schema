"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Project, Phase } from "@/lib/types"
import { format } from "date-fns"
import { sv } from "date-fns/locale"
import { useProjects } from "@/lib/context/ProjectContext"
import { calculateProjectProgress } from "@/lib/utils/task-utils"
import Link from "next/link"

export function ProjectProgress() {
  const { projects, activeProjectId } = useProjects()
  const [sortedProjects, setSortedProjects] = useState<Project[]>([])

  useEffect(() => {
    // Sort projects by progress (highest first)
    const sorted = [...projects].sort((a, b) => {
      const progressA = calculateProjectProgress(a)
      const progressB = calculateProjectProgress(b)
      return progressB - progressA
    })
    setSortedProjects(sorted)
  }, [projects])

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-slate-500';
    
    switch (status.toLowerCase()) {
      case 'pågående': return 'bg-blue-500'
      case 'färdigt': return 'bg-green-500'
      case 'försenat': return 'bg-red-500'
      default: return 'bg-slate-500' // planering or other
    }
  }

  const calculateProjectProgress = (project: Project) => {
    if (project.progress !== undefined) return project.progress

    // Calculate from tasks if progress isn't directly available
    if (!project.tasks || project.tasks.length === 0) return 0

    const totalTasks = project.tasks.length
    const completedWeight = project.tasks.reduce((sum, task) => {
      return sum + (task.progress / 100)
    }, 0)

    return Math.round((completedWeight / totalTasks) * 100)
  }

  const getDaysLeft = (endDate: string | Date) => {
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate
    const today = new Date()
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, 'd MMM yyyy', { locale: sv })
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Projektframsteg</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedProjects.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              Inga projekt att visa
            </div>
          ) : (
            sortedProjects.map(project => {
              const progress = calculateProjectProgress(project)
              const daysLeft = getDaysLeft(project.endDate || project.plannedEndDate)
              
              return (
                <div key={project.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Link href={`/projects/${project.id}`} className="font-medium hover:underline">
                      {project.name}
                    </Link>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Framsteg: {progress}%</span>
                      <span>Deadline: {formatDate(project.endDate || project.plannedEndDate)}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-xs mt-2">
                    {project.phases && project.phases.map(phase => (
                      <Badge key={phase.id} variant="outline" style={{
                        borderColor: phase.color || '#64748b',
                        color: phase.color || '#64748b'
                      }}>
                        {phase.name}: {phase.completionRate}%
                      </Badge>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
} 