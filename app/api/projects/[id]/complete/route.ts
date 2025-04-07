import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/projects/[id]/complete - Hämta fullständig projektdata för konsekvent Gantt-visualisering
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Hämta projektet med alla relaterade data
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        // Inkludera alla faser med deras uppgifter
        phases: {
          orderBy: { createdAt: 'asc' },
          include: {
            tasks: {
              include: {
                // Inkludera beroenden
                dependencies: {
                  include: {
                    predecessor: {
                      select: {
                        id: true,
                        name: true,
                        startDate: true,
                        endDate: true,
                        status: true,
                      },
                    },
                  },
                },
                dependents: {
                  include: {
                    successor: {
                      select: {
                        id: true,
                        name: true,
                        startDate: true,
                        endDate: true,
                        status: true,
                      },
                    },
                  },
                },
                // Inkludera resurstilldelningar
                assignments: {
                  include: {
                    resource: true,
                  },
                },
                // Inkludera underuppgifter och föräldrauppgift
                subTasks: true,
                parentTask: {
                  select: {
                    id: true,
                    name: true,
                    startDate: true,
                    endDate: true,
                  },
                },
              },
              orderBy: { startDate: 'asc' },
            },
          },
        },
        // Inkludera uppgifter som inte är kopplade till någon fas
        tasks: {
          where: { phaseId: null },
          include: {
            dependencies: {
              include: {
                predecessor: {
                  select: {
                    id: true,
                    name: true,
                    startDate: true, 
                    endDate: true,
                    status: true,
                  },
                },
              },
            },
            dependents: {
              include: {
                successor: {
                  select: {
                    id: true,
                    name: true,
                    startDate: true,
                    endDate: true,
                    status: true,
                  },
                },
              },
            },
            assignments: {
              include: {
                resource: true,
              },
            },
            subTasks: true,
            parentTask: {
              select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
              },
            },
          },
          orderBy: { startDate: 'asc' },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Projektet hittades inte' }, { status: 404 })
    }

    // Hämta även resurser som är tilldelade till detta projekt
    const resources = await prisma.resource.findMany({
      where: {
        assignments: {
          some: {
            task: {
              projectId: params.id,
            },
          },
        },
      },
      include: {
        assignments: {
          where: {
            task: {
              projectId: params.id,
            },
          },
          include: {
            task: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    // Beräkna projektstatistik
    const taskCount = await prisma.task.count({
      where: { projectId: params.id },
    })
    
    const completedTaskCount = await prisma.task.count({
      where: { 
        projectId: params.id,
        status: 'Klar',
      },
    })
    
    const overdueTaskCount = await prisma.task.count({
      where: {
        projectId: params.id,
        endDate: { lt: new Date() },
        status: { not: 'Klar' },
      },
    })

    // Bygga ihop ett samlat svar med all data
    const result = {
      project,
      resources,
      statistics: {
        taskCount,
        completedTaskCount,
        overdueTaskCount,
        completionPercentage: taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0,
      },
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Fel vid hämtning av komplett projektdata:', error)
    return NextResponse.json(
      { error: 'Kunde inte hämta komplett projektdata', details: error },
      { status: 500 }
    )
  }
}

// PUT /api/projects/[id]/complete - Markera ett projekt som färdigt
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Uppdatera projektet
    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: {
        status: 'Färdigt',
        actualEndDate: new Date()
      }
    })
    
    // Uppdatera alla faser i projektet
    await prisma.phase.updateMany({
      where: { projectId: params.id },
      data: {
        status: 'Avslutad',
        completionRate: 100
      }
    })
    
    // Uppdatera alla uppgifter i projektet
    await prisma.task.updateMany({
      where: { projectId: params.id },
      data: {
        status: 'completed',
        progress: 100
      }
    })
    
    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Fel vid färdigställande av projekt:', error)
    return NextResponse.json(
      { error: 'Kunde inte markera projektet som färdigt' },
      { status: 500 }
    )
  }
} 