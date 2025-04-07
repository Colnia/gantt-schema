import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/projects - Hämta alla projekt
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        phases: true,
        tasks: true,
      },
    })
    
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Fel vid hämtning av projekt:', error)
    return NextResponse.json({ error: 'Kunde inte hämta projekt' }, { status: 500 })
  }
}

// POST /api/projects - Skapa nytt projekt
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        customer: body.customer,
        manager: body.manager,
        startDate: new Date(body.startDate),
        plannedEndDate: new Date(body.plannedEndDate),
        status: body.status,
        budget: parseFloat(body.budget),
        costToDate: parseFloat(body.costToDate || 0),
        estimatedTotalCost: parseFloat(body.estimatedTotalCost),
      },
    })
    
    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('Fel vid skapande av projekt:', error)
    return NextResponse.json({ error: 'Kunde inte skapa projekt' }, { status: 500 })
  }
} 