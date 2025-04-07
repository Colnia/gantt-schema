import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { addDays, max } from 'date-fns'

// POST /api/tasks/[id]/reschedule - Räkna om schema för uppgift och dess beroende uppgifter
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Hämta uppgiften
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        dependents: {
          include: {
            successor: true,
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Uppgiften hittades inte' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const propagateChanges = body.propagateChanges !== false // Default: true
    const updatedTasks = []

    // Om vi ska propregera ändringarna, hämta alla beroende uppgifter rekursivt
    if (propagateChanges) {
      // Samla alla beroende uppgifter som behöver hanteras
      const dependentTaskIds = new Set<string>()
      const processedTaskIds = new Set<string>()
      
      // Hjälpfunktion för att samla alla beroende uppgifter rekursivt
      async function collectDependentTasks(taskId: string): Promise<void> {
        if (processedTaskIds.has(taskId)) return
        processedTaskIds.add(taskId)
        
        const task = await prisma.task.findUnique({
          where: { id: taskId },
          include: {
            dependents: {
              include: {
                successor: true,
              },
            },
          },
        })
        
        if (!task) return
        
        for (const dependency of task.dependents) {
          const successorId = dependency.successor.id
          if (!dependentTaskIds.has(successorId)) {
            dependentTaskIds.add(successorId)
            // Rekursiv insamling för successors
            await collectDependentTasks(successorId)
          }
        }
      }
      
      // Starta insamling av beroende uppgifter från startuppgiften
      await collectDependentTasks(params.id)
      
      // Uppdatera varje beroende uppgift baserat på dess beroenden
      for (const dependentTaskId of dependentTaskIds) {
        // Hämta alla beroenden för uppgiften
        const dependencies = await prisma.taskDependency.findMany({
          where: { successorId: dependentTaskId },
          include: {
            predecessor: true,
          },
        })
        
        // Hämta uppgiften som ska uppdateras
        const taskToUpdate = await prisma.task.findUnique({
          where: { id: dependentTaskId },
        })
        
        if (!taskToUpdate) continue
        
        // Beräkna nytt startdatum baserat på beroenden
        let newStartDate = new Date(taskToUpdate.startDate)
        let shouldUpdate = false
        
        for (const dependency of dependencies) {
          if (dependency.type === 'FS') {
            // Finish-to-Start: successorn kan inte starta förrän predecessorn är klar
            const predecessorEndDate = new Date(dependency.predecessor.endDate)
            const lagDays = dependency.lag || 0
            const minStartDate = addDays(predecessorEndDate, lagDays)
            
            if (minStartDate > newStartDate) {
              newStartDate = minStartDate
              shouldUpdate = true
            }
          } else if (dependency.type === 'SS') {
            // Start-to-Start: successorn kan inte starta förrän predecessorn har startat
            const predecessorStartDate = new Date(dependency.predecessor.startDate)
            const lagDays = dependency.lag || 0
            const minStartDate = addDays(predecessorStartDate, lagDays)
            
            if (minStartDate > newStartDate) {
              newStartDate = minStartDate
              shouldUpdate = true
            }
          }
          // Andra beroendetyper (FF, SF) kan implementeras vid behov
        }
        
        if (shouldUpdate) {
          // Beräkna ny slutdatum baserat på varaktighet
          const duration = Math.max(
            1, 
            Math.floor((new Date(taskToUpdate.endDate).getTime() - new Date(taskToUpdate.startDate).getTime()) / (1000 * 60 * 60 * 24))
          )
          const newEndDate = addDays(newStartDate, duration)
          
          // Uppdatera uppgiften
          const updatedTask = await prisma.task.update({
            where: { id: dependentTaskId },
            data: {
              startDate: newStartDate,
              endDate: newEndDate,
            },
          })
          
          updatedTasks.push(updatedTask)
        }
      }
    }

    return NextResponse.json({
      originalTask: task,
      updatedTasks: updatedTasks,
      message: `Schemaläggning uppdaterad för ${updatedTasks.length} beroende uppgifter`
    })
  } catch (error) {
    console.error('Fel vid omschemaläggning:', error)
    return NextResponse.json(
      { error: 'Kunde inte omplanera uppgifter', details: error },
      { status: 500 }
    )
  }
}

// GET /api/tasks/[id]/reschedule - Beräknar förslag på omschemaläggning utan att spara ändringar
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Hämta uppgiften
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        dependents: {
          include: {
            successor: true,
            predecessor: true,
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Uppgiften hittades inte' },
        { status: 404 }
      )
    }

    // Beräkna förslag utan att spara
    const proposals = []

    // Hitta alla direkta beroende uppgifter
    for (const dependency of task.dependents) {
      const successor = dependency.successor
      
      // Beräkna föreslaget nytt datum baserat på beroendetyp
      let proposedStartDate = new Date(successor.startDate)
      let needsRescheduling = false
      
      if (dependency.type === 'FS') {
        // Finish-to-Start
        const predecessorEndDate = new Date(task.endDate)
        const lagDays = dependency.lag || 0
        const minStartDate = addDays(predecessorEndDate, lagDays)
        
        if (minStartDate > proposedStartDate) {
          proposedStartDate = minStartDate
          needsRescheduling = true
        }
      } else if (dependency.type === 'SS') {
        // Start-to-Start
        const predecessorStartDate = new Date(task.startDate)
        const lagDays = dependency.lag || 0
        const minStartDate = addDays(predecessorStartDate, lagDays)
        
        if (minStartDate > proposedStartDate) {
          proposedStartDate = minStartDate
          needsRescheduling = true
        }
      }
      
      if (needsRescheduling) {
        const duration = Math.max(
          1, 
          Math.floor((new Date(successor.endDate).getTime() - new Date(successor.startDate).getTime()) / (1000 * 60 * 60 * 24))
        )
        const proposedEndDate = addDays(proposedStartDate, duration)
        
        proposals.push({
          taskId: successor.id,
          taskName: successor.name,
          currentStartDate: successor.startDate,
          currentEndDate: successor.endDate,
          proposedStartDate,
          proposedEndDate,
          dependencyType: dependency.type,
          lag: dependency.lag || 0,
        })
      }
    }

    return NextResponse.json({
      task,
      proposals,
      count: proposals.length,
    })
  } catch (error) {
    console.error('Fel vid beräkning av omschemaläggning:', error)
    return NextResponse.json(
      { error: 'Kunde inte beräkna omplanering', details: error },
      { status: 500 }
    )
  }
} 