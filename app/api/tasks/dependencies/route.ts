import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/tasks/dependencies - Skapa beroendeförhållande mellan uppgifter
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validera indata
    if (!body.predecessorId || !body.successorId || !body.type) {
      return NextResponse.json(
        { error: 'Felaktig indata, predecessorId, successorId och type krävs' },
        { status: 400 }
      )
    }
    
    // Validera att uppgifterna existerar
    const predecessor = await prisma.task.findUnique({
      where: { id: body.predecessorId },
    })
    
    const successor = await prisma.task.findUnique({
      where: { id: body.successorId },
    })
    
    if (!predecessor || !successor) {
      return NextResponse.json(
        { error: 'En eller båda uppgifterna hittades inte' },
        { status: 404 }
      )
    }
    
    // Kontrollera att beroendet inte redan existerar
    const existingDependency = await prisma.taskDependency.findFirst({
      where: {
        predecessorId: body.predecessorId,
        successorId: body.successorId,
      },
    })
    
    if (existingDependency) {
      return NextResponse.json(
        { error: 'Beroendet existerar redan' },
        { status: 409 }
      )
    }
    
    // Skapa nytt beroende
    const dependency = await prisma.taskDependency.create({
      data: {
        type: body.type,
        lag: body.lag || 0,
        predecessor: {
          connect: { id: body.predecessorId },
        },
        successor: {
          connect: { id: body.successorId },
        },
      },
    })
    
    return NextResponse.json(dependency)
  } catch (error) {
    console.error('Fel vid skapande av beroende:', error)
    return NextResponse.json(
      { error: 'Kunde inte skapa beroende', details: error },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/dependencies
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const predecessorId = searchParams.get('predecessorId')
    const successorId = searchParams.get('successorId')
    
    if (!predecessorId || !successorId) {
      return NextResponse.json(
        { error: 'Både predecessorId och successorId krävs som sökparametrar' },
        { status: 400 }
      )
    }
    
    // Hitta beroendet
    const dependency = await prisma.taskDependency.findFirst({
      where: {
        predecessorId,
        successorId,
      },
    })
    
    if (!dependency) {
      return NextResponse.json(
        { error: 'Beroendet hittades inte' },
        { status: 404 }
      )
    }
    
    // Ta bort beroendet
    await prisma.taskDependency.delete({
      where: {
        id: dependency.id,
      },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fel vid borttagning av beroende:', error)
    return NextResponse.json(
      { error: 'Kunde inte ta bort beroende' },
      { status: 500 }
    )
  }
} 