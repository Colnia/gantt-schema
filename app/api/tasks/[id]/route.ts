import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tasks/[id] - Hämta specifik uppgift
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
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
        resourceAssignments: {
          include: {
            resource: true,
          },
        },
        subTasks: true,
        parentTask: true,
        phase: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    
    if (!task) {
      return NextResponse.json({ error: 'Uppgiften hittades inte' }, { status: 404 })
    }
    
    return NextResponse.json(task)
  } catch (error) {
    console.error('Fel vid hämtning av uppgift:', error)
    return NextResponse.json({ error: 'Kunde inte hämta uppgift' }, { status: 500 })
  }
}

// PUT /api/tasks/[id] - Uppdatera uppgift
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validera att uppgiften existerar
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
    })
    
    if (!existingTask) {
      return NextResponse.json({ error: 'Uppgiften hittades inte' }, { status: 404 })
    }
    
    // Bygga uppdateringsobjekt
    const updateData: any = {
      name: body.name,
      description: body.description,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      status: body.status,
      priority: body.priority,
      progress: body.progress,
      isMilestone: body.isMilestone,
      activityType: body.activityType,
      color: body.color,
    }
    
    // Hantera optionella relationer
    if (body.phaseId) {
      updateData.phase = { connect: { id: body.phaseId } }
    } else if (body.phaseId === null) {
      updateData.phase = { disconnect: true }
    }
    
    if (body.parentTaskId) {
      updateData.parentTask = { connect: { id: body.parentTaskId } }
    } else if (body.parentTaskId === null) {
      updateData.parentTask = { disconnect: true }
    }
    
    const task = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
    })
    
    return NextResponse.json(task)
  } catch (error) {
    console.error('Fel vid uppdatering av uppgift:', error)
    return NextResponse.json({ error: 'Kunde inte uppdatera uppgift', details: error }, { status: 500 })
  }
}

// DELETE /api/tasks/[id] - Ta bort uppgift
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.task.delete({
      where: { id: params.id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fel vid borttagning av uppgift:', error)
    return NextResponse.json({ error: 'Kunde inte ta bort uppgift' }, { status: 500 })
  }
} 