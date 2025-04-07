"use client"

import { useState, useEffect } from 'react'
import { ResourceHistogram } from '@/components/gantt/ResourceHistogram'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { User, UserX, Briefcase, Clock, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResourceAssignmentDialog } from '@/components/gantt/dialogs/ResourceAssignmentDialog'
import { ResourceDetailsDialog } from '@/components/gantt/dialogs/ResourceDetailsDialog'

interface Resource {
  id: string
  name: string
  type: string
  email?: string
  phone?: string
  costRate: number
  capacity: number
  assignments?: ResourceAssignment[]
}

interface ResourceAssignment {
  id: string
  projectId: string
  taskId: string
  units: number
  hoursPerDay: number
  task: {
    id: string
    name: string
    startDate: string
    endDate: string
    status: string
    project: {
      id: string
      name: string
    }
  }
}

export default function ResourceDashboardPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedResource, setSelectedResource] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  
  // Ladda resurser
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/resources')
        
        if (!response.ok) {
          throw new Error('Kunde inte hämta resurser')
        }
        
        const data = await response.json()
        setResources(data)
      } catch (error) {
        console.error('Fel vid hämtning av resurser:', error)
        setError('Kunde inte ladda resurser')
      } finally {
        setLoading(false)
      }
    }
    
    fetchResources()
  }, [])
  
  // Hantera visning av resursdetaljer
  const handleShowResourceDetails = (resourceId: string) => {
    setSelectedResource(resourceId)
    setShowDetails(true)
  }
  
  // Gruppera resurser efter typ
  const technicians = resources.filter(r => r.type === 'Tekniker' || r.type === 'PERSON')
  const equipment = resources.filter(r => r.type === 'Utrustning' || r.type === 'EQUIPMENT')
  const other = resources.filter(r => 
    r.type !== 'Tekniker' && 
    r.type !== 'PERSON' && 
    r.type !== 'Utrustning' && 
    r.type !== 'EQUIPMENT'
  )
  
  // Beräkna resursutnyttjande
  const calculateUtilization = (resource: Resource) => {
    if (!resource.assignments || resource.assignments.length === 0) return 0
    
    // Förenkla genom att räkna antal uppdrag för tillfället
    const activeAssignments = resource.assignments.filter(a => 
      a.task.status !== 'completed' && a.task.status !== 'cancelled'
    )
    
    // Beräkna beläggning baserat på enheter och timmar
    const totalUnits = activeAssignments.reduce((total, a) => {
      return total + (a.units / 100) * (a.hoursPerDay / 8) 
    }, 0)
    
    return Math.min(100, Math.round(totalUnits * 100))
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center">
            <User className="mr-3 h-8 w-8" /> 
            Resurser
          </h1>
          <Button asChild>
            <Link href="/resources/new">
              Lägg till resurs
            </Link>
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fel</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <User className="mr-2 h-5 w-5" /> Tekniker
              </CardTitle>
              <CardDescription>
                Personer som utför uppgifter
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-14 my-2" />
                  <Skeleton className="h-14 my-2" />
                  <Skeleton className="h-14 my-2" />
                </>
              ) : technicians.length > 0 ? (
                <div className="space-y-3">
                  {technicians.map(resource => (
                    <div 
                      key={resource.id}
                      className="flex items-center p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleShowResourceDetails(resource.id)}
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{resource.name}</h4>
                        <p className="text-sm text-gray-500">{resource.email || 'Ingen e-post'}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant={calculateUtilization(resource) > 90 ? 'destructive' : 'outline'}>
                          {calculateUtilization(resource)}%
                        </Badge>
                        <span className="text-xs text-gray-500 mt-1">{resource.capacity}h/vecka</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <UserX className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>Inga tekniker tillagda</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <Briefcase className="mr-2 h-5 w-5" /> Utrustning
              </CardTitle>
              <CardDescription>
                Verktyg och maskiner
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-14 my-2" />
                  <Skeleton className="h-14 my-2" />
                </>
              ) : equipment.length > 0 ? (
                <div className="space-y-3">
                  {equipment.map(resource => (
                    <div 
                      key={resource.id}
                      className="flex items-center p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleShowResourceDetails(resource.id)}
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                        <Briefcase className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{resource.name}</h4>
                        <p className="text-sm text-gray-500">{resource.costRate} kr/h</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant={calculateUtilization(resource) > 90 ? 'destructive' : 'outline'}>
                          {calculateUtilization(resource)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>Ingen utrustning tillagd</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <Clock className="mr-2 h-5 w-5" /> Andra resurser
              </CardTitle>
              <CardDescription>
                Övriga resurser
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-14 my-2" />
                </>
              ) : other.length > 0 ? (
                <div className="space-y-3">
                  {other.map(resource => (
                    <div 
                      key={resource.id}
                      className="flex items-center p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleShowResourceDetails(resource.id)}
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <Clock className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{resource.name}</h4>
                        <p className="text-sm text-gray-500">{resource.type}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant={calculateUtilization(resource) > 90 ? 'destructive' : 'outline'}>
                          {calculateUtilization(resource)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <Clock className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>Inga andra resurser</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="chart" className="w-full">
          <TabsList>
            <TabsTrigger value="chart">Belastning</TabsTrigger>
            <TabsTrigger value="list">Tilldelningar</TabsTrigger>
          </TabsList>
          <TabsContent value="chart">
            <div className="mt-6">
              <ResourceHistogram className="w-full" 
                resourceId={selectedResource || undefined} 
              />
            </div>
          </TabsContent>
          <TabsContent value="list">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Resurstilldelningar</CardTitle>
                <CardDescription>
                  Lista över aktiva uppgifter tilldelade till resurser
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <div className="border rounded-md overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted">
                          <th className="text-left p-2">Resurs</th>
                          <th className="text-left p-2">Uppgift</th>
                          <th className="text-left p-2">Projekt</th>
                          <th className="text-center p-2">Tilldelning</th>
                          <th className="text-center p-2">Timmar</th>
                          <th className="text-left p-2">Period</th>
                          <th className="text-left p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resources.flatMap(resource => 
                          (resource.assignments || []).map(assignment => (
                            <tr key={assignment.id} className="border-t">
                              <td className="p-2">{resource.name}</td>
                              <td className="p-2">{assignment.task.name}</td>
                              <td className="p-2">{assignment.task.project.name}</td>
                              <td className="text-center p-2">{assignment.units}%</td>
                              <td className="text-center p-2">{assignment.hoursPerDay}h</td>
                              <td className="p-2">
                                {new Date(assignment.task.startDate).toLocaleDateString()} - {new Date(assignment.task.endDate).toLocaleDateString()}
                              </td>
                              <td className="p-2">
                                <Badge variant={
                                  assignment.task.status === 'completed' ? 'default' :
                                  assignment.task.status === 'delayed' ? 'destructive' :
                                  assignment.task.status === 'in-progress' ? 'secondary' : 'outline'
                                }>
                                  {assignment.task.status === 'completed' ? 'Avslutad' : 
                                   assignment.task.status === 'in-progress' ? 'Pågående' :
                                   assignment.task.status === 'delayed' ? 'Försenad' : 
                                   assignment.task.status === 'cancelled' ? 'Avbruten' : 'Ej påbörjad'}
                                </Badge>
                              </td>
                            </tr>
                          ))
                        )}
                        {resources.every(r => !r.assignments || r.assignments.length === 0) && (
                          <tr>
                            <td colSpan={7} className="p-6 text-center text-muted-foreground">
                              Inga resurstilldelningar hittades
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedResource && (
        <ResourceDetailsDialog
          isOpen={showDetails}
          onOpenChange={setShowDetails}
          resourceId={selectedResource}
        />
      )}
    </div>
  )
} 