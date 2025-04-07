import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/resources - Hämta alla resurser
export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      include: {
        assignments: {
          include: {
            task: {
              select: {
                id: true,
                name: true,
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
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    return NextResponse.json(resources)
  } catch (error) {
    console.error('Fel vid hämtning av resurser:', error)
    return NextResponse.json(
      { error: 'Kunde inte hämta resurser' },
      { status: 500 }
    )
  }
}

// POST /api/resources - Skapa en ny resurs
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validera indata
    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: 'Namn och typ måste anges' },
        { status: 400 }
      )
    }
    
    // Skapa resurs
    const resource = await prisma.resource.create({
      data: {
        name: body.name,
        type: body.type,
        description: body.description || '',
        email: body.email || '',
        phone: body.phone || '',
        costPerHour: body.costPerHour || 0,
        baseHoursPerDay: body.baseHoursPerDay || 8,
        skills: body.skills || []
      }
    })
    
    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    console.error('Fel vid skapande av resurs:', error)
    return NextResponse.json(
      { error: 'Kunde inte skapa resurs' },
      { status: 500 }
    )
  }
} 