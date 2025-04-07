import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Download, Edit, Trash } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function ProjectPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="container mx-auto space-y-6">
        {/* Header med navigation */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tillbaka till översikt
            </Button>
          </Link>

          <div className="flex space-x-2">
            <Link href={`/gantt/${params.id}`}>
              <Button variant="secondary" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Gantt-vy
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Redigera
            </Button>
            <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50">
              <Trash className="h-4 w-4 mr-2" />
              Ta bort
            </Button>
          </div>
        </div>

        {/* Projekttitel */}
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold mb-2">Köpcentrum Nordstan</h1>
          <div className="flex items-center space-x-4">
            <Badge>Pågående</Badge>
            <span className="text-sm text-muted-foreground">Projektledare: Maria Eriksson</span>
            <span className="text-sm text-muted-foreground">Kund: Vasakronan AB</span>
          </div>
        </div>

        {/* Projekttabs och innehåll */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Översikt</TabsTrigger>
            <TabsTrigger value="tasks">Uppgifter</TabsTrigger>
            <TabsTrigger value="resources">Resurser</TabsTrigger>
            <TabsTrigger value="materials">Material</TabsTrigger>
            <TabsTrigger value="documents">Dokument</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 pt-6">
            {/* Snabbfakta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Projektöversikt</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Status:</dt>
                      <dd className="text-sm font-medium">Pågående</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Startdatum:</dt>
                      <dd className="text-sm font-medium">2024-04-15</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Planerat slutdatum:</dt>
                      <dd className="text-sm font-medium">2024-07-30</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Dagar kvar:</dt>
                      <dd className="text-sm font-medium">105</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Total budget:</dt>
                      <dd className="text-sm font-medium">1 200 000 kr</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Förbrukat:</dt>
                      <dd className="text-sm font-medium">450 000 kr</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Återstående:</dt>
                      <dd className="text-sm font-medium">750 000 kr</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Prognos:</dt>
                      <dd className="text-sm font-medium">1 250 000 kr</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Framsteg</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Totalt framsteg</span>
                        <span>36%</span>
                      </div>
                      <Progress value={36} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Planering</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Material</span>
                        <span>60%</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Installation</span>
                        <span>0%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Projektbeskrivning */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Beskrivning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Installation av kylanläggning i Nordstan köpcentrum. Projektet omfattar installation av 5 kompressorer, 
                  rördragning, koppling och installation av kontrollsystem. Arbetet sker i samarbete med Vasakronan AB.
                </p>
              </CardContent>
            </Card>

            {/* Faser */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Faser</span>
                  <Button size="sm" variant="outline">Lägg till fas</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <h3 className="font-medium">Planering</h3>
                      </div>
                      <Badge variant="outline" className="bg-green-50">Avslutad</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">2024-04-15 - 2024-04-30</div>
                    <Progress value={100} className="h-2" />
                  </div>
                  
                  <div className="border rounded-md p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                        <h3 className="font-medium">Material</h3>
                      </div>
                      <Badge variant="outline" className="bg-blue-50">Pågående</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">2024-04-25 - 2024-05-20</div>
                    <Progress value={60} className="h-2" />
                  </div>
                  
                  <div className="border rounded-md p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                        <h3 className="font-medium">Installation</h3>
                      </div>
                      <Badge variant="outline" className="bg-slate-50">Ej påbörjad</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">2024-05-15 - 2024-07-15</div>
                    <Progress value={0} className="h-2" />
                  </div>
                  
                  <div className="border rounded-md p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                        <h3 className="font-medium">Kontroll</h3>
                      </div>
                      <Badge variant="outline" className="bg-slate-50">Ej påbörjad</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">2024-07-15 - 2024-07-30</div>
                    <Progress value={0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="pt-6">
              <p>Innehåll för uppgifter kommer här</p>
            </div>
          </TabsContent>

          <TabsContent value="resources">
            <div className="pt-6">
              <p>Innehåll för resurser kommer här</p>
            </div>
          </TabsContent>

          <TabsContent value="materials">
            <div className="pt-6">
              <p>Innehåll för material kommer här</p>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div className="pt-6">
              <p>Innehåll för dokument kommer här</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
} 