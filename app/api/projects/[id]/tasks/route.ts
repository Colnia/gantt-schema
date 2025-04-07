import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/projects/[id]/tasks - Hämta alla uppgifter för ett projekt
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: params.id },
      include: {
        dependencies: {
          include: {
            predecessor: {
              select: {
                id: true,
                name: true,
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
      },
    })
    
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Fel vid hämtning av uppgifter:', error)
    return NextResponse.json({ error: 'Kunde inte hämta uppgifter' }, { status: 500 })
  }
}

// POST /api/projects/[id]/tasks - Skapa ny uppgift i ett projekt
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Konvertera JSON-data till Prisma-format
    const task = await prisma.task.create({
      data: {
        name: body.name,
        description: body.description || '',
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        status: body.status || 'Ej påbörjad',
        priority: body.priority || 'Medium',
        progress: body.progress || 0,
        isMilestone: body.isMilestone || false,
        activityType: body.activityType || 'task',
        estimatedCost: body.estimatedCost || 0,
        actualCost: body.actualCost || 0,
        color: body.color,
        
        // Relationer
        project: {
          connect: { id: params.id },
        },
        
        // Om det finns en phase, koppla till den
        ...(body.phaseId && {
          phase: {
            connect: { id: body.phaseId },
          },
        }),
        
        // Om det finns en föräldrauppgift, koppla till den
        ...(body.parentTaskId && {
          parentTask: {
            connect: { id: body.parentTaskId },
          },
        }),
      },
    })
    
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Fel vid skapande av uppgift:', error)
    return NextResponse.json({ error: 'Kunde inte skapa uppgift', details: error }, { status: 500 })
  }
} 