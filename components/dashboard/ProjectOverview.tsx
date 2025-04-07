"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { format, differenceInDays } from "date-fns"
import { sv } from "date-fns/locale"

import { useProjects } from "@/lib/context/ProjectContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Download, FileText, Home, LineChart, PieChart, Plus } from "lucide-react"

export function ProjectOverview() {
  const { projects } = useProjects()
  const [activeTab, setActiveTab] = useState("overview")
  
  // Beräkna statistik
  const totalProjectValue = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
  const totalOfferValue = 2500000 // Exempel (skulle komma från offers-data)
  const acceptedOffers = 0 // Exempel
  const totalOffers = 1 // Exempel
  const acceptedRate = totalOffers > 0 ? (acceptedOffers / totalOffers) * 100 : 0
  
  // Formateringsfunktioner
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('sv-SE') + ' kr'
  }
  
  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, 'd MMM yyyy', { locale: sv })
  }
  
  const getDaysLeft = (endDate: string | Date) => {
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate
    const today = new Date()
    return differenceInDays(end, today)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header med navigation */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center">
            <div className="flex items-center space-x-2 font-medium text-slate-800">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="h-6 w-6 text-blue-600">
                <rect width="15" height="15" x="2.5" y="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" rx="1" />
                <path fill="currentColor" d="M6 6h2v8H6zM10 10h4v4h-4z" />
              </svg>
              <span className="text-lg">Projektordning</span>
            </div>
            
            <nav className="ml-8">
              <ul className="flex space-x-4">
                <li><Button variant="ghost" className="font-medium">Översikt</Button></li>
                <li><Link href="/project"><Button variant="ghost" className="text-muted-foreground">Projekt</Button></Link></li>
                <li><Button variant="ghost" className="text-muted-foreground">Offerter</Button></li>
                <li><Button variant="ghost" className="text-muted-foreground">Arkiv</Button></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Huvudinnehåll */}
      <main className="container mx-auto px-4 py-6">
        {/* Brödsmulor */}
        <div className="flex items-center space-x-2 mb-4 text-sm">
          <Home className="h-4 w-4" />
          <span>›</span>
          <span>Projektöversikt</span>
        </div>

        {/* Sidhuvud */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Projektöversikt</h1>
          <div className="flex space-x-4">
            <Button variant="outline" className="bg-white">
              <FileText className="h-4 w-4 mr-2" />
              Generera rapport
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nytt projekt
            </Button>
          </div>
        </div>

        {/* Projektstatistik - övre kort */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Projekt och offerter */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Projekt och offerter</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="overview" className="flex-1">Översikt</TabsTrigger>
                  <TabsTrigger value="project" className="flex-1">Projekt ({projects.length})</TabsTrigger>
                  <TabsTrigger value="offers" className="flex-1">Offerter (1)</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4">
                  <div className="grid grid-cols-4 gap-6">
                    <div className="col-span-1 p-4 bg-blue-50 rounded-lg relative flex flex-col">
                      <div className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100">
                        <LineChart className="h-3 w-3 text-blue-700" />
                      </div>
                      <span className="text-sm text-blue-700 mb-2">Aktiva Projekt</span>
                      <span className="text-2xl font-bold">{projects.length}</span>
                    </div>
                    
                    <div className="col-span-1 p-4 bg-indigo-50 rounded-lg relative flex flex-col">
                      <div className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-indigo-100">
                        <PieChart className="h-3 w-3 text-indigo-700" />
                      </div>
                      <span className="text-sm text-indigo-700 mb-2">Aktiva Offerter</span>
                      <span className="text-2xl font-bold">1</span>
                      <span className="text-xs text-muted-foreground">Värde: 2,5 MSEK</span>
                    </div>
                    
                    <div className="col-span-1 p-4 bg-emerald-50 rounded-lg relative flex flex-col">
                      <div className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-emerald-100">
                        <svg className="h-3 w-3 text-emerald-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-sm text-emerald-700 mb-2">Projekt Marginal</span>
                      <span className="text-2xl font-bold">100.0%</span>
                      <span className="text-xs text-muted-foreground">Budget/utfall: 5,7 MSEK</span>
                    </div>
                    
                    <div className="col-span-1 p-4 bg-amber-50 rounded-lg relative flex flex-col">
                      <div className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-amber-100">
                        <svg className="h-3 w-3 text-amber-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 4V14M12 18V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <span className="text-sm text-amber-700 mb-2">Offert Konvertering</span>
                      <span className="text-2xl font-bold">0.0%</span>
                      <span className="text-xs text-muted-foreground">0/1 accepterade</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="project">
                  <p>Projektdetaljer visas här</p>
                </TabsContent>

                <TabsContent value="offers">
                  <p>Offertdetaljer visas här</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Projektdetaljer */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Projektdetaljer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Senast uppdaterad<br />
                  {format(new Date(), 'yyyy-MM-dd')}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Aktiva projekt</span>
                    <span className="text-sm">{projects.length}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Aktiva offerter</span>
                    <span className="text-sm">1</span>
                  </div>
                </div>
                
                <div className="pt-2 space-y-2">
                  <h3 className="text-lg font-semibold">Statistik</h3>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Totalt projektvärde</span>
                    <span className="text-sm">{formatCurrency(totalProjectValue)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Totalt offertvärde</span>
                    <span className="text-sm">{formatCurrency(totalOfferValue)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Vanligaste kunden</span>
                    <span className="text-sm">Bostadsbolaget</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Exportera projektlista
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projekttidslinjer */}
        <Card className="shadow-sm mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="16" height="16" x="2" y="2" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 5h2v3H5z M5 10h2v5H5z M9 5h2v5H9z M9 13h2v2H9z M13 5h2v10h-2z" fill="currentColor" />
              </svg>
              Projekttidslinjer
            </CardTitle>
            <p className="text-sm text-muted-foreground">Visualisering av projektets tidslinje och status</p>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Inga projekt att visa</p>
              </div>
            ) : (
              <div className="space-y-6">
                {projects.map(project => {
                  const daysLeft = getDaysLeft(project.endDate || project.plannedEndDate || new Date())
                  
                  return (
                    <div key={project.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium flex items-center">
                            <Link href={`/project/${project.id}`} className="hover:underline">
                              {project.name}
                            </Link>
                            <Badge className="ml-2" variant="outline">
                              {daysLeft > 0 ? `${daysLeft} dagar kvar` : 'Förfallen'}
                            </Badge>
                          </h3>
                          <p className="text-sm text-muted-foreground">{project.customer || 'Företag AB'}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge>{project.status || 'Pågående'}</Badge>
                          <Link href={`/gantt/${project.id}`}>
                            <Button size="sm" variant="outline">Gantt-vy</Button>
                          </Link>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Projektledare: </span>
                          {project.manager || 'Anna Andersson'}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Period: </span>
                          {formatDate(project.startDate)} - {formatDate(project.endDate || project.plannedEndDate || new Date())}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Budget: {formatCurrency(project.budget || 0)}</span>
                          <span className="text-muted-foreground">Förbrukat: {formatCurrency(project.costToDate || 0)}</span>
                        </div>
                        <Progress value={project.costToDate && project.budget ? (project.costToDate / project.budget) * 100 : 0} className="h-2" />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget- och kostnadsanalys */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Budget- och kostnadsanalys</CardTitle>
            <p className="text-sm text-muted-foreground">Jämförelse av budget, faktisk kostnad och estimerad totalkostnad för projekt</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="space-x-2">
                  <Badge variant="outline" className="bg-sky-100 text-sky-800 hover:bg-sky-100">Största projekt</Badge>
                  <Badge variant="outline" className="bg-slate-100 text-slate-800 hover:bg-slate-100">Största avvikelser</Badge>
                </div>
              </div>
              
              <div className="h-60 flex items-center justify-center border-t mt-2 pt-6">
                <div className="text-center text-muted-foreground">
                  <p>Diagram visas här</p>
                  <p className="text-sm">Implementera ett stapeldiagram med React Charts</p>
                </div>
              </div>

              <div className="flex justify-center space-x-8 mt-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-400 mr-2"></div>
                  <span>Budget</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-pink-400 mr-2"></div>
                  <span>Kostnad hittills</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-300 mr-2"></div>
                  <span>Estimerad total</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 