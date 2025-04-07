import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/projects/[id] - Hämta enskilt projekt
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        phases: {
          include: {
            tasks: true,
          },
        },
        tasks: {
          where: {
            phaseId: null,
          },
        },
        materialDeliveries: true,
        resources: {
          include: {
            resource: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Projektet hittades inte' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Fel vid hämtning av projekt:', error)
    return NextResponse.json({ error: 'Kunde inte hämta projekt' }, { status: 500 })
  }
}

// PUT /api/projects/[id] - Uppdatera projekt
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        customer: body.customer,
        manager: body.manager,
        startDate: new Date(body.startDate),
        plannedEndDate: new Date(body.plannedEndDate),
        actualEndDate: body.actualEndDate ? new Date(body.actualEndDate) : null,
        status: body.status,
        budget: parseFloat(body.budget),
        costToDate: parseFloat(body.costToDate),
        estimatedTotalCost: parseFloat(body.estimatedTotalCost),
        isArchived: body.isArchived || false,
      },
    })
    
    return NextResponse.json(project)
  } catch (error) {
    console.error('Fel vid uppdatering av projekt:', error)
    return NextResponse.json({ error: 'Kunde inte uppdatera projekt' }, { status: 500 })
  }
}

// DELETE /api/projects/[id] - Ta bort projekt
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.project.delete({
      where: { id: params.id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fel vid borttagning av projekt:', error)
    return NextResponse.json({ error: 'Kunde inte ta bort projekt' }, { status: 500 })
  }
} 