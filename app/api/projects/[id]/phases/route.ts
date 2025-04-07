import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/projects/[id]/phases - Hämta alla faser i ett projekt
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const phases = await prisma.phase.findMany({
      where: { 
        projectId: params.id 
      },
      include: {
        tasks: {
          include: {
            dependencies: {
              include: {
                predecessor: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { 
        createdAt: 'asc' 
      },
    })
    
    return NextResponse.json(phases)
  } catch (error) {
    console.error('Fel vid hämtning av faser:', error)
    return NextResponse.json(
      { error: 'Kunde inte hämta faser', details: error },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id]/phases - Skapa en ny fas i ett projekt
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validera indata
    if (!body.name) {
      return NextResponse.json(
        { error: 'Fasnamn krävs' },
        { status: 400 }
      )
    }
    
    // Validera att projektet existerar
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    })
    
    if (!project) {
      return NextResponse.json(
        { error: 'Projektet hittades inte' },
        { status: 404 }
      )
    }
    
    // Skapa ny fas
    const phase = await prisma.phase.create({
      data: {
        name: body.name,
        description: body.description || '',
        color: body.color || '#808080', // Standard grå om ingen färg anges
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        status: body.status || 'Ej påbörjad',
        project: {
          connect: { id: params.id },
        },
      },
    })
    
    return NextResponse.json(phase)
  } catch (error) {
    console.error('Fel vid skapande av fas:', error)
    return NextResponse.json(
      { error: 'Kunde inte skapa fas', details: error },
      { status: 500 }
    )
  }
} 