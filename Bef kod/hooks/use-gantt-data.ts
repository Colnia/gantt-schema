"use client"

import { useState, useEffect } from "react"
import { getProjects, getProjectWithDetails } from "@/app/actions/project-actions"
import { useToast } from "@/components/ui/use-toast"

export function useGanttData(initialProjectId?: string) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [activeProject, setActiveProject] = useState<string | null>(initialProjectId || null)
  const [projectDetails, setProjectDetails] = useState<any | null>(null)

  // Hämta alla projekt
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      try {
        const result = await getProjects()
        if (result.success) {
          setProjects(result.data)

          // Om inget aktivt projekt är satt, använd det första
          if (!activeProject && result.data.length > 0) {
            setActiveProject(result.data[0].id)
          }
        } else {
          toast({
            title: "Fel",
            description: result.error,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Fel vid hämtning av projekt:", error)
        toast({
          title: "Fel",
          description: "Kunde inte hämta projekt",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [toast, activeProject])

  // Hämta aktivt projekt med detaljer
  useEffect(() => {
    if (!activeProject) return

    const fetchProjectDetails = async () => {
      setLoading(true)
      try {
        const result = await getProjectWithDetails(activeProject)
        if (result.success) {
          setProjectDetails(result.data)
        } else {
          toast({
            title: "Fel",
            description: result.error,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Fel vid hämtning av projektdetaljer:", error)
        toast({
          title: "Fel",
          description: "Kunde inte hämta projektdetaljer",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProjectDetails()
  }, [activeProject, toast])

  // Funktion för att byta aktivt projekt
  const changeActiveProject = (projectId: string) => {
    setActiveProject(projectId)
  }

  // Funktion för att uppdatera projektdata
  const refreshData = async () => {
    if (activeProject) {
      const result = await getProjectWithDetails(activeProject)
      if (result.success) {
        setProjectDetails(result.data)
      }
    }

    const projectsResult = await getProjects()
    if (projectsResult.success) {
      setProjects(projectsResult.data)
    }
  }

  return {
    loading,
    projects,
    activeProject,
    projectDetails,
    changeActiveProject,
    refreshData,
  }
}

