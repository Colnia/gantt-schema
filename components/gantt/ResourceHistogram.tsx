"use client"

import { useState, useEffect } from 'react'
import { useProjects } from '@/lib/context/ProjectContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, formatISO } from 'date-fns'
import { AlertCircle, Calendar, User } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ResourceUtilizationData {
  resourceId: string
  resourceName: string
  resourceType: string
  capacity: number
  utilization: DailyUtilization[]
}

interface DailyUtilization {
  date: string
  utilization: number
  assignments: {
    id: string
    taskId: string
    taskName: string
    units: number
    hoursPerDay: number
    projectId: string
    projectName: string
  }[]
}

interface ResourceHistogramProps {
  projectId?: string
  resourceId?: string
  className?: string
}

export function ResourceHistogram({ projectId, resourceId, className }: ResourceHistogramProps) {
  const { activeProject } = useProjects()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resources, setResources] = useState<ResourceUtilizationData[]>([])
  const [selectedResource, setSelectedResource] = useState<string | null>(resourceId || null)
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'custom'>('week')
  const [startDate, setStartDate] = useState<Date>(startOfWeek(new Date()))
  const [endDate, setEndDate] = useState<Date>(endOfWeek(new Date()))

  // Sätt startdatum baserat på vald tidsperiod
  useEffect(() => {
    const today = new Date()
    
    if (timeframe === 'week') {
      setStartDate(startOfWeek(today))
      setEndDate(endOfWeek(today))
    } else if (timeframe === 'month') {
      setStartDate(startOfMonth(today))
      setEndDate(endOfMonth(today))
    }
  }, [timeframe])

  // Ladda resursanvändningsdata
  useEffect(() => {
    const fetchResourceUtilization = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Konstruera URL med sökparametrar
        const params = new URLSearchParams()
        params.append('startDate', formatISO(startDate, { representation: 'date' }))
        params.append('endDate', formatISO(endDate, { representation: 'date' }))
        
        if (projectId) {
          params.append('projectId', projectId)
        }
        
        if (selectedResource) {
          params.append('resourceId', selectedResource)
        }
        
        const response = await fetch(`/api/resources/utilization?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Kunde inte hämta resursanvändningsdata')
        }
        
        const data = await response.json()
        setResources(data)
        
        // Om vi inte har valt någon resurs än och data innehåller resurser, välj den första
        if (!selectedResource && data.length > 0) {
          setSelectedResource(data[0].resourceId)
        }
      } catch (error) {
        console.error('Fel vid hämtning av resursanvändningsdata:', error)
        setError('Kunde inte ladda resursanvändningsdata')
      } finally {
        setLoading(false)
      }
    }
    
    if (startDate && endDate) {
      fetchResourceUtilization()
    }
  }, [projectId, selectedResource, startDate, endDate])

  // Hämtar data för vald resurs
  const selectedResourceData = resources.find(res => res.resourceId === selectedResource)
  
  // Förbereder data för diagrammet
  const chartData = selectedResourceData?.utilization.map(day => ({
    date: day.date,
    utilization: Math.round(day.utilization * 100),
    taskCount: day.assignments.length
  })) || []

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dailyData = selectedResourceData?.utilization.find(day => day.date === label)
      
      return (
        <div className="bg-white p-4 border rounded-md shadow-md">
          <p className="font-medium">{format(parseISO(label), 'yyyy-MM-dd')}</p>
          <p className="text-sm">Beläggning: {payload[0].value}%</p>
          <p className="text-sm text-gray-500 mt-2">Uppgifter:</p>
          <div className="max-h-40 overflow-auto">
            {dailyData?.assignments.map(a => (
              <div key={a.id} className="text-xs my-1 border-t pt-1">
                <div>{a.taskName}</div>
                <div className="text-gray-500">{a.projectName} ({a.hoursPerDay}h, {a.units}%)</div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <User className="mr-2 h-5 w-5" /> Resursbeläggning
        </CardTitle>
        <CardDescription>
          Visualisering av resursanvändning över tid
        </CardDescription>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="resource-select">Resurs</Label>
            <Select
              value={selectedResource || ''}
              onValueChange={setSelectedResource}
              disabled={loading || resources.length === 0}
            >
              <SelectTrigger id="resource-select">
                <SelectValue placeholder="Välj resurs" />
              </SelectTrigger>
              <SelectContent>
                {resources.map(resource => (
                  <SelectItem key={resource.resourceId} value={resource.resourceId}>
                    {resource.resourceName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="timeframe-select">Tidsram</Label>
            <Select value={timeframe} onValueChange={(val: 'week' | 'month' | 'custom') => setTimeframe(val)}>
              <SelectTrigger id="timeframe-select">
                <SelectValue placeholder="Välj tidsperiod" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Denna vecka</SelectItem>
                <SelectItem value="month">Denna månad</SelectItem>
                <SelectItem value="custom">Anpassad period</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {timeframe === 'custom' && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Startdatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex justify-start"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'yyyy-MM-dd') : "Välj datum"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label>Slutdatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex justify-start"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'yyyy-MM-dd') : "Välj datum"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fel</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="w-full h-[300px] flex items-center justify-center">
            <Skeleton className="h-[250px] w-full" />
          </div>
        ) : (
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    tickFormatter={(value) => format(parseISO(value), 'dd/MM')}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis 
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <ReferenceLine y={100} stroke="red" strokeDasharray="3 3" />
                  <Bar dataKey="utilization" name="Beläggning (%)">
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.utilization > 100 ? '#ef4444' : entry.utilization > 85 ? '#eab308' : '#3b82f6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <User className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>Ingen data tillgänglig</p>
                  {!selectedResource && (
                    <p className="text-sm text-gray-400 mt-2">Välj en resurs för att visa beläggning</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 