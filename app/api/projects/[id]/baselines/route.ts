import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import prisma from '@/lib/prisma'

// Typdefinitioner för att undvika implicita any-typer
interface TaskBaseline {
  id: string;
  taskId: string;
  endDate: Date | string;
  startDate: Date | string;
  progress: number;
  status: string;
  task: {
    id: string;
    name: string;
    [key: string]: any;
  };
}

interface Task {
  id: string;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  progress?: number;
  status?: string;
  [key: string]: any;
}

interface Baseline {
  id: string;
  taskBaselines: TaskBaseline[];
  [key: string]: any;
}

interface TaskAnalysis {
  taskId: string;
  taskName: string;
  daysDelayed?: number;
  daysAhead?: number;
  baselineEndDate: Date;
  currentEndDate: Date;
  baselineProgress: number;
  currentProgress: number;
}

// GET /api/projects/[id]/baselines - Hämta alla baselines för ett projekt
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const baselines = await prisma.projectBaseline.findMany({
      where: { projectId: params.id },
      include: {
        taskBaselines: {
          include: {
            task: {
              select: {
                id: true,
                name: true,
                status: true,
                progress: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json(baselines)
  } catch (error) {
    console.error('Fel vid hämtning av projektbaslinjer:', error)
    return NextResponse.json(
      { error: 'Kunde inte hämta projektbaslinjer', details: error },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id]/baselines - Skapa en ny baseline för projektet
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validera projekt
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
    }) as Task[]
    
    // Skapa baseline med transaktion för att säkerställa atomär operation
    const baseline = await prisma.$transaction(async (tx: PrismaClient) => {
      // Skapa projekt-baseline
      const projectBaseline = await tx.projectBaseline.create({
        data: {
          name: body.name || `Baseline ${new Date().toISOString().slice(0, 10)}`,
          description: body.description || '',
          project: { connect: { id: params.id } },
          startDate: project.startDate,
          endDate: project.endDate,
          createdBy: body.createdBy || 'System',
        },
      })
      
      // Skapa task-baselines för alla projektuppgifter
      const taskBaselinePromises = tasks.map((task: Task) => 
        tx.taskBaseline.create({
          data: {
            task: { connect: { id: task.id } },
            projectBaseline: { connect: { id: projectBaseline.id } },
            startDate: task.startDate,
            endDate: task.endDate,
            progress: task.progress || 0,
            status: task.status || 'Ej påbörjad',
          },
        })
      )
      
      // Vänta på att alla task-baselines skapas
      await Promise.all(taskBaselinePromises)
      
      return projectBaseline
    })
    
    // Hämta den kompletta basline inklusive alla task-baselines
    const completeBaseline = await prisma.projectBaseline.findUnique({
      where: { id: baseline.id },
      include: {
        taskBaselines: {
          include: {
            task: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })
    
    return NextResponse.json(completeBaseline)
  } catch (error) {
    console.error('Fel vid skapande av baseline:', error)
    return NextResponse.json(
      { error: 'Kunde inte skapa baseline', details: error },
      { status: 500 }
    )
  }
}

// Hjälpfunktion: GET /api/projects/[id]/baselines/compare/:baselineId
// Jämför aktuellt projekt med en specifik baseline
export async function getCompare(
  request: Request,
  { params, extraParams }: { params: { id: string }, extraParams: { baselineId: string } }
) {
  try {
    const { baselineId } = extraParams
    
    // Hämta baseline
    const baseline = await prisma.projectBaseline.findUnique({
      where: { id: baselineId },
      include: {
        taskBaselines: {
          include: {
            task: true,
          },
        },
      },
    }) as Baseline | null
    
    if (!baseline) {
      return NextResponse.json(
        { error: 'Baseline hittades inte' },
        { status: 404 }
      )
    }
    
    // Hämta aktuella projektuppgifter
    const currentTasks = await prisma.task.findMany({
      where: { projectId: params.id },
    }) as Task[]
    
    // Skapa jämförelse
    const comparison = {
      baseline: baseline,
      current: {
        projectId: params.id,
        tasks: currentTasks,
      },
      analysis: {
        tasksDelayed: 0,
        tasksAhead: 0,
        tasksOnSchedule: 0,
        delayedTasks: [] as TaskAnalysis[],
        aheadTasks: [] as TaskAnalysis[],
      }
    }
    
    // Analysera varje uppgift
    for (const baselineTask of baseline.taskBaselines) {
      const currentTask = currentTasks.find((t: Task) => t.id === baselineTask.taskId)
      
      if (currentTask) {
        const baselineEndDate = new Date(baselineTask.endDate)
        const currentEndDate = new Date(currentTask.endDate)
        
        // Jämför slutdatum
        const diffDays = Math.floor((currentEndDate.getTime() - baselineEndDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays > 0) {
          // Uppgiften är försenad
          comparison.analysis.tasksDelayed++
          comparison.analysis.delayedTasks.push({
            taskId: currentTask.id,
            taskName: currentTask.name,
            daysDelayed: diffDays,
            baselineEndDate: baselineEndDate,
            currentEndDate: currentEndDate,
            baselineProgress: baselineTask.progress,
            currentProgress: currentTask.progress || 0,
          })
        } else if (diffDays < 0) {
          // Uppgiften ligger före schemat
          comparison.analysis.tasksAhead++
          comparison.analysis.aheadTasks.push({
            taskId: currentTask.id,
            taskName: currentTask.name,
            daysAhead: -diffDays,
            baselineEndDate: baselineEndDate,
            currentEndDate: currentEndDate,
            baselineProgress: baselineTask.progress,
            currentProgress: currentTask.progress || 0,
          })
        } else {
          // Uppgiften är i tid
          comparison.analysis.tasksOnSchedule++
        }
      }
    }
    
    return NextResponse.json(comparison)
  } catch (error) {
    console.error('Fel vid jämförelse av baseline:', error)
    return NextResponse.json(
      { error: 'Kunde inte jämföra baseline', details: error },
      { status: 500 }
    )
  }
} 