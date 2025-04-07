import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tasks/resources - Hämta resurstilldelningar för en uppgift
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json(
        { error: 'TaskId parameter är obligatorisk' },
        { status: 400 }
      )
    }

    // Hämta uppgiften först för att få default datum
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        projectId: true
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Uppgiften hittades inte' },
        { status: 404 }
      )
    }

    // Hämta resurstilldelningar
    const assignments = await prisma.resourceAssignment.findMany({
      where: { taskId },
      include: {
        resource: true
      }
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Fel vid hämtning av resurstilldelningar:', error)
    return NextResponse.json(
      { error: 'Kunde inte hämta resurstilldelningar' },
      { status: 500 }
    )
  }
}

// POST /api/tasks/resources - Skapa ny resurstilldelning till en uppgift
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validera indata
    if (!body.taskId || !body.resourceId) {
      return NextResponse.json(
        { error: 'TaskId och resourceId är obligatoriska' },
        { status: 400 }
      )
    }

    // Verifiera att uppgift och resurs existerar
    const task = await prisma.task.findUnique({
      where: { id: body.taskId },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        projectId: true
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Uppgiften hittades inte' },
        { status: 404 }
      )
    }

    const resource = await prisma.resource.findUnique({
      where: { id: body.resourceId }
    })

    if (!resource) {
      return NextResponse.json(
        { error: 'Resursen hittades inte' },
        { status: 404 }
      )
    }

    // Kontrollera om det redan finns en tilldelning för samma resurs och uppgift
    const existingAssignment = await prisma.resourceAssignment.findFirst({
      where: {
        taskId: body.taskId,
        resourceId: body.resourceId
      }
    })

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Resursen är redan tilldelad till denna uppgift' },
        { status: 409 }
      )
    }

    // Skapa ny resurstilldelning
    const assignment = await prisma.resourceAssignment.create({
      data: {
        resourceId: body.resourceId,
        taskId: body.taskId,
        projectId: task.projectId,
        startDate: body.startDate || task.startDate,
        endDate: body.endDate || task.endDate,
        units: body.units || 100,
        hoursPerDay: body.hoursPerDay || 8,
        notes: body.notes || ''
      },
      include: {
        resource: true
      }
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Fel vid skapande av resurstilldelning:', error)
    return NextResponse.json(
      { error: 'Kunde inte skapa resurstilldelning' },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/resources - Ta bort resurstilldelning
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    const resourceId = searchParams.get('resourceId')
    
    if (!taskId || !resourceId) {
      return NextResponse.json(
        { error: 'Både taskId och resourceId krävs som sökparametrar' },
        { status: 400 }
      )
    }
    
    // Hitta resurstilldelningen
    const assignment = await prisma.resourceAssignment.findFirst({
      where: {
        taskId,
        resourceId,
      },
    })
    
    if (!assignment) {
      return NextResponse.json(
        { error: 'Resurstilldelningen hittades inte' },
        { status: 404 }
      )
    }
    
    // Ta bort resurstilldelningen
    await prisma.resourceAssignment.delete({
      where: {
        id: assignment.id,
      },
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