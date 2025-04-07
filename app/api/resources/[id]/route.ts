import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/resources/[id] - Hämta en specifik resurs
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: params.id },
      include: {
        assignments: {
          include: {
            task: {
              select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
                projectId: true,
                project: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        skills: true
      }
    })
    
    if (!resource) {
      return NextResponse.json(
        { error: 'Resursen hittades inte' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(resource)
  } catch (error) {
    console.error('Fel vid hämtning av resurs:', error)
    return NextResponse.json(
      { error: 'Kunde inte hämta resurs' },
      { status: 500 }
    )
  }
}

// PUT /api/resources/[id] - Uppdatera en resurs
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validera indata
    if (!body.name) {
      return NextResponse.json(
        { error: 'Resursnamn krävs' },
        { status: 400 }
      )
    }
    
    // Uppdatera resurs
    const resource = await prisma.resource.update({
      where: { id: params.id },
      data: {
        name: body.name,
        type: body.type,
        description: body.description,
        email: body.email,
        phone: body.phone,
        costPerHour: body.costPerHour,
        baseHoursPerDay: body.baseHoursPerDay
      }
    })
    
    return NextResponse.json(resource)
  } catch (error) {
    console.error('Fel vid uppdatering av resurs:', error)
    return NextResponse.json(
      { error: 'Kunde inte uppdatera resurs' },
      { status: 500 }
    )
  }
}

// DELETE /api/resources/[id] - Ta bort en resurs
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.resource.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fel vid borttagning av resurs:', error)
    return NextResponse.json(
      { error: 'Kunde inte ta bort resurs' },
      { status: 500 }
    )
  }
} 