import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addDays, format, isAfter, isBefore, isSameDay, parseISO } from 'date-fns'
import { calculateDailyUtilization, ResourceAssignment } from '@/lib/utils/resource-utils'

// Konfiguration för dynamiska rutter
export const dynamic = 'force-dynamic'

// Typdefinitioner
interface Resource {
  id: string;
  name: string;
  type: string;
  costPerHour?: number;
  baseHoursPerDay?: number;
  assignments: any[];
}

// GET /api/resources/utilization - Hämta resursanvändningsdata
export async function GET(request: NextRequest) {
  try {
    // Hämta datum från query params
    const searchParams = request.nextUrl.searchParams
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    const projectId = searchParams.get('projectId')
    const resourceId = searchParams.get('resourceId')
    
    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: 'Startdatum och slutdatum måste anges' },
        { status: 400 }
      )
    }
    
    // Konvertera till Date-objekt
    const startDate = new Date(startDateParam)
    const endDate = new Date(endDateParam)
    
    // Bygg query
    const query: Record<string, any> = {}
    
    if (projectId) {
      query.projectId = projectId
    }
    
    if (resourceId) {
      query.id = resourceId
    }
    
    // Hämta resurser och deras tilldelningar under angiven period
    const resources = await prisma.resource.findMany({
      where: query,
      include: {
        resourceAssignments: {
          where: {
            OR: [
              // Om uppgiften överlappar den begärda perioden och tilldelningen saknar egna datum
              {
                startDate: null,
                endDate: null,
                task: {
                  startDate: { lte: endDate },
                  endDate: { gte: startDate }
                }
              },
              // Om resurstilldelningen har specifika datum som överlappar perioden
              {
                startDate: { lte: endDate },
                endDate: { gte: startDate }
              }
            ]
          },
          include: {
            task: {
              select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
                status: true,
                progress: true,
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
      }
    })
    
    // Beräkna daglig användning för varje resurs
    const resourceUtilization = resources.map((resource: Resource) => {
      const dailyData = calculateDailyUtilization(
        resource.resourceAssignments as unknown as ResourceAssignment[],
        startDate,
        endDate,
        resource.baseHoursPerDay || 8
      )
      
      return {
        resource: {
          id: resource.id,
          name: resource.name,
          type: resource.type,
          costPerHour: resource.costPerHour,
          baseHoursPerDay: resource.baseHoursPerDay
        },
        dailyUtilization: dailyData
      }
    })
    
    return NextResponse.json(resourceUtilization)
  } catch (error) {
    console.error('Fel vid hämtning av resursanvändning:', error)
    return NextResponse.json(
      { error: 'Kunde inte hämta resursanvändningsdata' },
      { status: 500 }
    )
  }
} 