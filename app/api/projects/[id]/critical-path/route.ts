import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { calculateCriticalPath } from '@/lib/utils/critical-path'

// Typdefinitioner för Task och TaskDependency för att matcha critical-path utility
interface Task {
  id: string;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  status?: string;
  progress?: number;
  [key: string]: any;
}

interface TaskDependency {
  id: string;
  predecessorId: string;
  successorId: string;
  type: string;
  lag?: number;
}

// GET /api/projects/[id]/critical-path - Beräkna och returnera kritisk väg för ett projekt
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Hämta projektet
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    })
    
    if (!project) {
      return NextResponse.json(
        { error: 'Projektet hittades inte' },
        { status: 404 }
      )
    }
    
    // Hämta alla uppgifter för projektet
    const tasks = await prisma.task.findMany({
      where: { projectId: params.id },
    }) as unknown as Task[]
    
    // Hämta alla beroenden för uppgifterna
    const dependencies = await prisma.taskDependency.findMany({
      where: {
        OR: [
          { predecessor: { projectId: params.id } },
          { successor: { projectId: params.id } },
        ],
      },
    }) as unknown as TaskDependency[]
    
    // Beräkna kritisk väg med vår utility-funktion
    const criticalPath = calculateCriticalPath(tasks, dependencies)
    
    // Samla användbar information om den kritiska vägen
    const criticalPathInfo = {
      projectId: params.id,
      projectName: project.name,
      criticalPathTasks: criticalPath,
      taskCount: tasks.length,
      criticalPathTaskCount: criticalPath.length,
      criticalPathTaskIds: criticalPath.map(task => task.id),
      
      // Beräkna viktiga datum för den kritiska vägen
      criticalPathStartDate: criticalPath.length > 0 
        ? new Date(Math.min(...criticalPath.map(task => new Date(task.startDate).getTime())))
        : null,
      criticalPathEndDate: criticalPath.length > 0 
        ? new Date(Math.max(...criticalPath.map(task => new Date(task.endDate).getTime())))
        : null,
      
      // Beräkna total varaktighet av den kritiska vägen i dagar
      criticalPathDuration: criticalPath.length > 0 
        ? Math.floor(
            (Math.max(...criticalPath.map(task => new Date(task.endDate).getTime())) - 
            Math.min(...criticalPath.map(task => new Date(task.startDate).getTime()))) / 
            (1000 * 60 * 60 * 24)
          )
        : 0,
    }
    
    return NextResponse.json(criticalPathInfo)
  } catch (error) {
    console.error('Fel vid beräkning av kritisk väg:', error)
    return NextResponse.json(
      { error: 'Kunde inte beräkna kritisk väg', details: error },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id]/critical-path/update - Uppdatera projekt med en viss buffert på kritiska uppgifter
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const bufferPercentage = body.bufferPercentage || 10 // Standardvärde 10%
    
    // Hämta alla uppgifter för projektet
    const tasks = await prisma.task.findMany({
      where: { projectId: params.id },
    }) as unknown as Task[]
    
    // Hämta alla beroenden
    const dependencies = await prisma.taskDependency.findMany({
      where: {
        OR: [
          { predecessor: { projectId: params.id } },
          { successor: { projectId: params.id } },
        ],
      },
    }) as unknown as TaskDependency[]
    
    // Beräkna kritisk väg
    const criticalPath = calculateCriticalPath(tasks, dependencies)
    const criticalPathIds = criticalPath.map(task => task.id)
    
    // För varje uppgift på den kritiska vägen, lägg till en buffert i varaktigheten
    const updatedTasks = []
    
    for (const taskId of criticalPathIds) {
      const task = tasks.find(t => t.id === taskId)
      if (!task) continue
      
      // Beräkna nuvarande varaktighet i millisekunder
      const startDate = new Date(task.startDate)
      const endDate = new Date(task.endDate)
      const durationMs = endDate.getTime() - startDate.getTime()
      
      // Beräkna buffert baserat på angiven procentsats
      const bufferMs = durationMs * (bufferPercentage / 100)
      
      // Beräkna ny slutdatum med buffert
      const newEndDate = new Date(endDate.getTime() + bufferMs)
      
      // Uppdatera uppgiften i databasen
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          endDate: newEndDate,
          notes: task.notes ? 
            `${task.notes}\nBuffert (${bufferPercentage}%) tillagd som del av kritisk väg` : 
            `Buffert (${bufferPercentage}%) tillagd som del av kritisk väg`,
        },
      })
      
      updatedTasks.push(updatedTask)
    }
    
    // Beräkna kritisk väg igen efter uppdatering
    const updatedTasksWithBuffer = await prisma.task.findMany({
      where: { projectId: params.id },
    }) as unknown as Task[]
    
    const newCriticalPath = calculateCriticalPath(updatedTasksWithBuffer, dependencies)
    
    return NextResponse.json({
      originalCriticalPath: criticalPath,
      updatedTasks,
      newCriticalPath,
      bufferPercentage,
      message: `Buffert på ${bufferPercentage}% tillagd till ${updatedTasks.length} uppgifter på den kritiska vägen`
    })
  } catch (error) {
    console.error('Fel vid uppdatering av kritisk väg:', error)
    return NextResponse.json(
      { error: 'Kunde inte uppdatera kritisk väg', details: error },
      { status: 500 }
    )
  }
} 