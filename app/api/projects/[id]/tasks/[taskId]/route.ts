import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Hämta en specifik task baserat på ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const { id, taskId } = params;

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId: id
      },
      include: {
        assignments: {
          include: {
            resource: true
          }
        },
        dependencies: true,
        dependents: true,
        subTasks: true
      }
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Error fetching task" },
      { status: 500 }
    );
  }
}

// PUT: Uppdatera en task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const { id, taskId } = params;
    const body = await request.json();

    // Kontrollera att uppgiften tillhör projektet
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId: id
      }
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found in this project" },
        { status: 404 }
      );
    }

    // Förbereda uppdateringsdata
    const updateData: any = {
      name: body.name,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      progress: body.progress,
      status: body.status,
      priority: body.priority,
      color: body.color,
      isPhase: body.isPhase,
    };

    // Hantera fältet för parent task om det tillhandahålls
    if (body.parentId || body.parentId === null) {
      if (body.parentId) {
        // Kontrollera att parent task existerar
        const parentTask = await prisma.task.findUnique({
          where: { id: body.parentId }
        });
        
        if (!parentTask) {
          return NextResponse.json(
            { error: "Parent task not found" },
            { status: 400 }
          );
        }
        
        updateData.parent = { connect: { id: body.parentId } };
      } else {
        // Ta bort parent relation om null skickas
        updateData.parent = { disconnect: true };
      }
    }

    // Uppdatera phase-association om det tillhandahålls
    if (body.phaseId || body.phaseId === null) {
      if (body.phaseId) {
        // Kontrollera att phase existerar
        const phase = await prisma.task.findUnique({
          where: { 
            id: body.phaseId,
            isPhase: true
          }
        });
        
        if (!phase) {
          return NextResponse.json(
            { error: "Phase not found" },
            { status: 400 }
          );
        }
        
        updateData.phase = { connect: { id: body.phaseId } };
      } else {
        // Ta bort phase-relation om null skickas
        updateData.phase = { disconnect: true };
      }
    }

    // TODO: Hantera uppdateringar för dependencies, resourceAssignments etc. om det behövs

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId
      },
      data: updateData,
      include: {
        dependencies: true,
        dependents: true,
        resourceAssignments: true,
        subtasks: true,
        phase: true,
        parent: true
      }
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Error updating task" },
      { status: 500 }
    );
  }
}

// DELETE: Ta bort en task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const { id, taskId } = params;

    // Kontrollera att uppgiften tillhör projektet
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId: id
      }
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found in this project" },
        { status: 404 }
      );
    }

    // Ta bort relaterade kopplingar först
    // Ta bort resource assignments
    await prisma.resourceAssignment.deleteMany({
      where: {
        taskId: taskId
      }
    });

    // *** Fix: Delete TaskDependency records directly instead of through Task update ***
    // First, delete all dependencies where this task is involved (either as predecessor or successor)
    await prisma.taskDependency.deleteMany({
      where: {
        OR: [
          { predecessorId: taskId },
          { successorId: taskId }
        ]
      }
    });

    // Update any sub-tasks to remove their parent reference
    await prisma.task.updateMany({
      where: {
        parentTaskId: taskId
      },
      data: {
        parentTaskId: null
      }
    });

    // Remove phase references if this task was a phase
    if (existingTask.isPhase) {
      await prisma.task.updateMany({
        where: {
          phaseId: taskId
        },
        data: {
          phaseId: null
        }
      });
    }

    // Ta bort själva uppgiften
    await prisma.task.delete({
      where: {
        id: taskId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Error deleting task" },
      { status: 500 }
    );
  }
} 