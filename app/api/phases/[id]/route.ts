import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/phases/[id] - Hämta en specifik fas
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!params.id) {
    return NextResponse.json({ error: 'Fas-ID krävs' }, { status: 400 });
  }

  try {
    const phase = await prisma.phase.findUnique({
      where: { id: params.id },
      include: {
        tasks: {
          include: {
            resourceAssignments: {
              include: {
                resource: true,
              },
            },
            dependencies: true,
            dependents: true,
          },
        },
        project: true,
        resourceAssignments: true,
      },
    })
    
    if (!phase) {
      return NextResponse.json({ error: 'Fasen hittades inte' }, { status: 404 })
    }
    
    return NextResponse.json(phase)
  } catch (error) {
    console.error('Fel vid hämtning av fas:', error)
    return NextResponse.json({ error: 'Kunde inte hämta fas' }, { status: 500 })
  }
}

// PUT /api/phases/[id] - Uppdatera en fas
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validera att fasen existerar
    const existingPhase = await prisma.phase.findUnique({
      where: { id: params.id },
    })
    
    if (!existingPhase) {
      return NextResponse.json({ error: 'Fasen hittades inte' }, { status: 404 })
    }
    
    // Uppdatera fas
    const phase = await prisma.phase.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        color: body.color,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        order: body.order !== undefined ? body.order : undefined,
      },
    })
    
    return NextResponse.json(phase)
  } catch (error) {
    console.error('Fel vid uppdatering av fas:', error)
    return NextResponse.json({ error: 'Kunde inte uppdatera fas', details: error }, { status: 500 })
  }
}

// DELETE /api/phases/[id] - Ta bort en fas
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Kontrollera om det finns uppgifter kopplade till fasen
    const tasksCount = await prisma.task.count({
      where: { phaseId: params.id },
    })
    
    if (tasksCount > 0) {
      return NextResponse.json(
        { 
          error: 'Kan inte ta bort fasen eftersom den innehåller uppgifter',
          tasksCount
        }, 
        { status: 400 }
      )
    }
    
    await prisma.phase.delete({
      where: { id: params.id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fel vid borttagning av fas:', error)
    return NextResponse.json({ error: 'Kunde inte ta bort fas' }, { status: 500 })
  }
} 