import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/tasks/resources/[id] - Hämta en specifik resurstilldelning
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const assignment = await prisma.resourceAssignment.findUnique({
      where: { id: params.id },
      include: {
        resource: true,
        task: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    })
    
    if (!assignment) {
      return NextResponse.json({ error: 'Resurstilldelningen hittades inte' }, { status: 404 })
    }
    
    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Fel vid hämtning av resurstilldelning:', error)
    return NextResponse.json({ error: 'Kunde inte hämta resurstilldelning' }, { status: 500 })
  }
}

// PUT /api/tasks/resources/[id] - Uppdatera en resurstilldelning
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validera indata
    if (!body) {
      return NextResponse.json(
        { error: 'Inget uppdateringsdata tillhandahålls' },
        { status: 400 }
      )
    }
    
    // Kontrollera att resurstilldelningen existerar
    const existingAssignment = await prisma.resourceAssignment.findUnique({
      where: { id: params.id },
    })
    
    if (!existingAssignment) {
      return NextResponse.json(
        { error: 'Resurstilldelningen hittades inte' },
        { status: 404 }
      )
    }
    
    // Förbereda uppdateringsdata
    const updateData: any = {}
    
    if (body.units !== undefined) {
      updateData.units = Number(body.units)
    }
    
    if (body.hoursPerDay !== undefined) {
      updateData.hoursPerDay = Number(body.hoursPerDay)
    }
    
    if (body.startDate) {
      updateData.startDate = new Date(body.startDate)
    }
    
    if (body.endDate) {
      updateData.endDate = new Date(body.endDate)
    }
    
    if (body.notes !== undefined) {
      updateData.notes = body.notes
    }
    
    if (body.estimatedCost !== undefined) {
      updateData.estimatedCost = Number(body.estimatedCost)
    }
    
    if (body.actualCost !== undefined) {
      updateData.actualCost = Number(body.actualCost)
    }
    
    // Uppdatera resurstilldelningen
    const updatedAssignment = await prisma.resourceAssignment.update({
      where: { id: params.id },
      data: updateData,
      include: {
        resource: true,
        task: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    
    return NextResponse.json(updatedAssignment)
  } catch (error) {
    console.error('Fel vid uppdatering av resurstilldelning:', error)
    return NextResponse.json(
      { error: 'Kunde inte uppdatera resurstilldelning', details: error },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/resources/[id] - Ta bort en resurstilldelning
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Kontrollera att resurstilldelningen existerar
    const existingAssignment = await prisma.resourceAssignment.findUnique({
      where: { id: params.id },
    })
    
    if (!existingAssignment) {
      return NextResponse.json(
        { error: 'Resurstilldelningen hittades inte' },
        { status: 404 }
      )
    }
    
    // Ta bort resurstilldelningen
    await prisma.resourceAssignment.delete({
      where: { id: params.id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fel vid borttagning av resurstilldelning:', error)
    return NextResponse.json(
      { error: 'Kunde inte ta bort resurstilldelning' },
      { status: 500 }
    )
  }
} 