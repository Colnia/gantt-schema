import { useEffect, useState, useRef } from 'react'; // Keep for client-side logic, add useRef
import Link from 'next/link';
import { notFound } from 'next/navigation'; // Import notFound for server-side 404
import { format, compareAsc } from "date-fns";
import { sv } from "date-fns/locale";
import { ArrowLeft, Loader2 } from "lucide-react"; // Keep for UI

// Store imports remain for client-side state management
import { 
    useCurrentProjectStore, 
    useCurrentProject, 
    useCurrentProjectTasks, 
    useCurrentProjectMaterials,
    useCurrentProjectLoadingState, 
    CurrentProjectState
} from "@/lib/stores/currentProjectStore";

// Import Prisma client for SERVER-SIDE fetching
import prisma from "@/lib/prisma";

// Server Action import remains
import { updateMaterialVisibility } from "@/lib/actions/materialActions";

// Components remain
import GanttChart from '@/components/gantt-chart';
import ViewControls from '@/components/gantt/controls/view-controls';

// UI components remain
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// Types remain
import { Project, Task, MaterialDelivery } from "@/lib/types";

// --- Helper functions remain ---
const formatCurrency = (amount?: number | null) => {
  if (amount == null) return '-';
  return amount.toLocaleString('sv-SE') + ' kr';
};
const formatDate = (date?: string | Date | null): string => {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    // Ensure it's a valid date before formatting
    if (isNaN(dateObj.getTime())) return 'Ogiltigt datum'; 
    return format(dateObj, 'yyyy-MM-dd', { locale: sv });
  } catch (error) {
    console.error("Error formatting date:", date, error);
    return 'Datumfel';
  }
};
const getStatusVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status?.toLowerCase()) {
    case 'pågående': return 'default';
    case 'planering': case 'ej påbörjad': case 'planerad': case 'beställd': return 'secondary';
    case 'försenat': return 'destructive';
    case 'avslutat': case 'completed': case 'färdigt': case 'levererad': return 'outline';
    case 'pausad': case 'avbruten': return 'outline';
    default: return 'secondary';
  }
};
const getPriorityVariant = (priority?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority?.toLowerCase()) {
        case 'hög': case 'critical': return 'destructive';
        case 'medium': return 'default';
        case 'låg': return 'secondary';
        default: return 'outline';
    }
};

// --- Extracted Client Components --- 

function ClientProjectTaskList() {
    'use client';
    const tasks = useCurrentProjectTasks(); // Get tasks from store

    if (!tasks || tasks.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">Inga uppgifter hittades för detta projekt.</p>
                </CardContent>
            </Card>
        );
    }

    const taskColumns: { key: keyof Task | 'actions'; label: string; isNumeric?: boolean }[] = [
        { key: 'name', label: 'Uppgift' },
        { key: 'status', label: 'Status' },
        { key: 'priority', label: 'Prioritet' },
        { key: 'startDate', label: 'Startdatum' },
        { key: 'endDate', label: 'Slutdatum' },
        { key: 'progress', label: 'Framsteg', isNumeric: true },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Projektuppgifter</CardTitle>
                <CardDescription>Lista över alla uppgifter kopplade till projektet.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {taskColumns.map(col => (
                                    <TableHead key={col.key} className={col.isNumeric ? 'text-right' : ''}>
                                        {col.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.map((task: Task) => (
                                <TableRow key={task.id}>
                                    {taskColumns.map(col => (
                                        <TableCell
                                            key={col.key}
                                            className={`${col.key === 'name' ? 'font-medium' : ''} ${col.isNumeric ? 'text-right' : ''}`}
                                        >
                                            {(() => {
                                                switch (col.key) {
                                                    case 'name': return task.name;
                                                    case 'status': return <Badge variant={getStatusVariant(task.status)}>{task.status || 'Okänd'}</Badge>;
                                                    case 'priority': return task.priority ? <Badge variant={getPriorityVariant(task.priority)}>{task.priority}</Badge> : '-';
                                                    case 'startDate': return formatDate(task.startDate);
                                                    case 'endDate': return formatDate(task.endDate);
                                                    case 'progress': return (
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <span>{task.progress ?? 0}%</span>
                                                            <Progress value={task.progress ?? 0} className="h-2 w-16" />
                                                        </div>
                                                    );
                                                    default: return null;
                                                }
                                            })()}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

function ClientProjectOverviewTab() {
    'use client';
    const project = useCurrentProject();
    const tasks = useCurrentProjectTasks();
    const isLoading = useCurrentProjectStore((state) => state.isLoading); 

    if (isLoading) {
         return (
             <Card>
                <CardHeader><CardTitle>Projekt Översikt</CardTitle></CardHeader>
                <CardContent className="h-64 flex items-center justify-center bg-muted rounded-md">
                   <p className="text-muted-foreground">Laddar projektdata...</p>
                </CardContent>
             </Card>
        );
    }
    
    if (!project) {
        return (
             <Card>
                <CardHeader><CardTitle>Projekt Översikt</CardTitle></CardHeader>
                <CardContent className="h-64 flex items-center justify-center bg-muted rounded-md">
                   <p className="text-muted-foreground">Kunde inte ladda projektdata.</p>
                </CardContent>
             </Card>
        );
    }

    const calculatedProgress = (() => {
        if (!tasks || tasks.length === 0) return 0;
        const totalProgress = tasks.reduce((sum: number, task: Task) => sum + (task.progress ?? 0), 0);
        return tasks.length > 0 ? Math.round(totalProgress / tasks.length) : 0;
    })();

    const upcomingMilestones = (() => {
        if (!tasks) return [];
        const now = new Date();
        const thirtyDaysFromNow = new Date(new Date().setDate(now.getDate() + 30));
        return tasks
            .filter((task: Task) => task.isMilestone && task.endDate)
            .map((task: Task) => ({ ...task, endDate: typeof task.endDate === 'string' ? new Date(task.endDate) : task.endDate })) // Ensure Date object
            .filter((task): task is Task & { endDate: Date } => task.endDate instanceof Date && !isNaN(task.endDate.getTime()) && task.endDate >= now && task.endDate <= thirtyDaysFromNow)
            .sort((a, b) => compareAsc(a.endDate, b.endDate));
    })();

    const budgetSpentPercentage = project.budget > 0 ? Math.round((project.costToDate / project.budget) * 100) : 0;
    const overdueTasksCount = tasks?.filter((task: Task) => 
       task.endDate && 
       task.status !== 'Avslutad' && 
       task.status !== 'completed' && 
       (typeof task.endDate === 'string' ? new Date(task.endDate) : task.endDate) < new Date()
    ).length ?? 0;

    return (
         <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <CardTitle className="text-sm font-medium">Budgetförbrukning</CardTitle>
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                   </CardHeader>
                   <CardContent>
                       <div className="text-2xl font-bold">{budgetSpentPercentage}%</div>
                       <p className="text-xs text-muted-foreground">
                           {formatCurrency(project.costToDate)} / {formatCurrency(project.budget)}
                       </p>
                        <Progress value={budgetSpentPercentage} className="h-2 mt-2" />
                   </CardContent>
                </Card>
               <Card>
                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <CardTitle className="text-sm font-medium">Projektframsteg</CardTitle>
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                   </CardHeader>
                   <CardContent>
                       <div className="text-2xl font-bold">{calculatedProgress}%</div>
                       <p className="text-xs text-muted-foreground">
                           Baserat på slutförda uppgifter (genomsnitt)
                       </p>
                   </CardContent>
                </Card>
               <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <CardTitle className="text-sm font-medium">Försenade Uppgifter</CardTitle>
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-red-500"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                   </CardHeader>
                   <CardContent>
                       <div className={`text-2xl font-bold ${overdueTasksCount > 0 ? 'text-red-600' : ''}`}>
                           {overdueTasksCount}
                        </div>
                       <p className="text-xs text-muted-foreground">Antal uppgifter efter slutdatum</p>
                   </CardContent>
                </Card>
               <Card className="col-span-1">
                   <CardHeader className="pb-2">
                       <CardTitle className="text-sm font-medium">Kommande Milstolpar (30 dagar)</CardTitle>
                   </CardHeader>
                   <CardContent>
                       {upcomingMilestones.length > 0 ? (
                           <ul className="space-y-1 text-sm max-h-32 overflow-y-auto">
                               {upcomingMilestones.map((task) => (
                                   <li key={task.id} className="flex justify-between pr-2">
                                       <span title={task.name} className="truncate mr-2">{task.name}</span>
                                       <span className="text-muted-foreground whitespace-nowrap">{formatDate(task.endDate)}</span>
                                   </li>
                               ))}
                           </ul>
                       ) : (
                           <p className="text-sm text-muted-foreground">Inga kommande milstolpar.</p>
                       )}
                   </CardContent>
                </Card>
             </div>
            <div> <Card> <CardHeader><CardTitle>Risker & Problem</CardTitle></CardHeader> <CardContent className="h-40 flex items-center justify-center bg-muted rounded-md"> <p className="text-muted-foreground">[Komponent för riskhantering här]</p> </CardContent> </Card> </div>
         </div>
    );
}

function ClientProjectMaterialList() {
    'use client';
    const materials = useCurrentProjectMaterials();
    const updateMaterialInStore = useCurrentProjectStore((state: CurrentProjectState) => state.updateMaterialShowOnGantt);
    const project = useCurrentProject();
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    if (!materials || materials.length === 0) { 
        return (
            <Card><CardContent className="pt-6"><p className="text-center text-muted-foreground">Inga materialleveranser hittades.</p></CardContent></Card>
        );
     }

    const materialColumns: { key: keyof MaterialDelivery | 'actions' | 'showOnGanttCol'; label: string; isNumeric?: boolean; headerClass?: string; cellClass?: string }[] = [
        { key: 'showOnGanttCol', label: 'Gantt', headerClass: 'w-[50px] text-center', cellClass: 'text-center' }, 
        { key: 'description', label: 'Beskrivning' },
        { key: 'supplier', label: 'Leverantör' },
        { key: 'quantity', label: 'Antal', isNumeric: true },
        { key: 'unit', label: 'Enhet' },
        { key: 'cost', label: 'Kostnad', isNumeric: true },
        { key: 'expectedDate', label: 'Förv. Datum' },
        { key: 'status', label: 'Status' },
    ];

    const handleCheckboxChange = async (itemId: string, checked: boolean) => {
        if (!project?.id) {
             toast.error("Projekt-ID saknas, kan inte uppdatera.");
             return;
         }
        setUpdatingId(itemId);
        
        updateMaterialInStore(itemId, checked); // Optimistic UI update

        try {
            const result = await updateMaterialVisibility(itemId, checked, project.id);
            if (!result.success) {
                updateMaterialInStore(itemId, !checked); // Revert on error
                toast.error(result.error || "Kunde inte uppdatera synlighet.");
            } else {
                 toast.success("Synlighet uppdaterad!");
            }
        } catch (error) {
             updateMaterialInStore(itemId, !checked); // Revert on unexpected error
             toast.error("Ett oväntat fel inträffade.");
             console.error("Error calling updateMaterialVisibility:", error);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Material & Leveranser</CardTitle>
                <CardDescription>Översikt över material och leveranser. Markera i "Gantt"-kolumnen för att visa i planeringen.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {materialColumns.map(col => (
                                    <TableHead key={col.key} className={`${col.isNumeric ? 'text-right' : ''} ${col.headerClass ?? ''}`}>
                                        {col.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {materials.map((item: MaterialDelivery) => (
                                <TableRow key={item.id}>
                                    {materialColumns.map(col => (
                                        <TableCell
                                            key={col.key}
                                            className={`${col.key === 'description' ? 'font-medium' : ''} ${col.isNumeric ? 'text-right' : ''} ${col.cellClass ?? ''}`}
                                        >
                                             {(() => {
                                                if (col.key === 'showOnGanttCol') {
                                                    const isUpdating = updatingId === item.id;
                                                    return (
                                                        <div className="flex items-center justify-center h-full">
                                                            {isUpdating ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Checkbox
                                                                    id={`showOnGantt-${item.id}`}
                                                                    checked={item.showOnGantt ?? false}
                                                                    onCheckedChange={(checkedState) => {
                                                                        handleCheckboxChange(item.id, checkedState === true);
                                                                    }}
                                                                    aria-label={`Visa ${item.description} i Gantt`}
                                                                    disabled={isUpdating} 
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                }
                                                switch (col.key) {
                                                    case 'description': return item.description;
                                                    case 'supplier': return item.supplier;
                                                    case 'quantity': return item.quantity;
                                                    case 'unit': return item.unit;
                                                    case 'cost': return formatCurrency(item.cost);
                                                    case 'expectedDate': return formatDate(item.expectedDate);
                                                    case 'status': return <Badge variant={getStatusVariant(item.status)}>{item.status || 'Okänd'}</Badge>;
                                                    default: return null;
                                                }
                                            })()}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

// Component to initialize the store on the client side
function InitializeProjectStore({ projectData, fetchError }: { projectData: Project | null, fetchError?: string | null }) {
    'use client';
    const setProjectData = useCurrentProjectStore((store) => store.setProjectData);
    const initialized = useRef(false);

    useEffect(() => {
        // Only initialize once
        if (initialized.current) return;

        if (projectData) {
            setProjectData(projectData);
            initialized.current = true;
        } else {
             // Set error state if data is null (fetch failed server-side or missing ID)
             setProjectData(null, fetchError || "Projektet kunde inte hämtas på servern.");
             initialized.current = true;
        }
    }, [projectData, fetchError, setProjectData]); // Dependencies

    return null; // This component doesn't render anything
}

// Main Page Component - Now async for server-side fetching
export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const projectId = params?.id;
  let projectData: Project | null = null;
  let fetchError: string | null = null;

  if (!projectId) {
      fetchError = "Projekt-ID saknas i URL.";
      // Consider calling notFound() here if appropriate for your app
      // notFound(); 
  } else {
      // --- Fetch data directly on the server --- 
      try {
          const fetchedProjectData = await prisma.project.findUnique({
              where: { id: projectId },
              include: { 
                  tasks: true, 
                  materialDeliveries: true
              }
          });

          if (!fetchedProjectData) {
              fetchError = `Project with ID ${projectId} not found.`;
              // Or call notFound() for a standard 404 page:
              // notFound();
          } else {
             // Transform data for the client/store
             // Make sure date fields are correctly converted or serializable
             projectData = {
                 ...fetchedProjectData,
                 // Convert dates to string for serialization, or handle in client
                 startDate: fetchedProjectData.startDate.toISOString(), 
                 plannedEndDate: fetchedProjectData.plannedEndDate.toISOString(),
                 actualEndDate: fetchedProjectData.actualEndDate?.toISOString(),
                 budget: fetchedProjectData.budget ?? 0,
                 costToDate: fetchedProjectData.costToDate ?? 0,
                 estimatedTotalCost: fetchedProjectData.estimatedTotalCost ?? null,
                 // Pass tasks and materials as they are, ensure dates are handled client-side
                 tasks: fetchedProjectData.tasks.map(task => ({
                     ...task,
                     startDate: task.startDate.toISOString(),
                     endDate: task.endDate.toISOString(),
                     progress: task.progress ?? 0,
                     estimatedCost: task.estimatedCost ?? 0,
                     actualCost: task.actualCost ?? 0,
                     budgetVariance: task.budgetVariance ?? null,
                 })),
                 materialDeliveries: fetchedProjectData.materialDeliveries.map(delivery => ({
                     ...delivery,
                     expectedDate: delivery.expectedDate.toISOString(),
                     actualDate: delivery.actualDate?.toISOString(),
                     showOnGantt: delivery.showOnGantt ?? false, 
                 }))
             } as Project;
          }
      } catch (err) {
          console.error("Failed to fetch project on server:", err);
          fetchError = err instanceof Error ? err.message : "Okänt fel vid hämtning av projekt på servern.";
      }
  }

  // --- Client-side Render Logic (managed via Zustand and InitializeProjectStore) --- 

  // Prepare header details using server-fetched data if available (dates are now strings)
  const projectHeaderDetails = projectData ? [
      { label: "Kund", value: projectData.customer || '-' },
      { label: "Projektledare", value: projectData.manager || '-' },
      { label: "Status", value: <Badge variant={getStatusVariant(projectData.status)}>{projectData.status || 'Okänd'}</Badge> },
      { label: "Startdatum", value: formatDate(projectData.startDate) }, // formatDate handles string date
      { label: "Planerat slut", value: formatDate(projectData.plannedEndDate) }, // formatDate handles string date
      { label: "Budget", value: formatCurrency(projectData.budget) },
      { label: "Kostnad Hittills", value: formatCurrency(projectData.costToDate) },
      { label: "Framsteg", value: `${projectData.progress ?? 'N/A'}%` }, 
  ] : [];

  return (
    <div className="flex-1 p-8">
         {/* Component to initialize the store on the client */}
         <InitializeProjectStore projectData={projectData} fetchError={fetchError} />

         {/* Static part of the header */}
         <div className="flex justify-between items-center mb-4">
             <Button variant="outline" size="sm" asChild>
                 <Link href="/">
                     <ArrowLeft className="mr-2 h-4 w-4" />
                     Tillbaka till översikt
                 </Link>
             </Button>
         </div>

         {/* Render header using server-fetched data or show error/loading state client-side */}
         <Card className="mb-6 shadow-sm">
             <CardHeader>
                 <CardTitle className="text-2xl">{projectData?.name ?? (fetchError ? 'Fel vid laddning' : 'Laddar projektnamn...')}</CardTitle>
             </CardHeader>
             <CardContent>
                 {projectData ? (
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                         {projectHeaderDetails.map(detail => (
                             <div key={detail.label}>
                                 <span className="font-medium text-muted-foreground">{detail.label}:</span>{' '}
                                 {/* Render Badge/components directly */}
                                 <span>{typeof detail.value === 'string' || typeof detail.value === 'number' ? detail.value : <>{detail.value}</>}</span>
                             </div>
                         ))}
                     </div>
                 ) : (
                     <p className="text-muted-foreground">
                         {fetchError ? `Fel: ${fetchError}` : 'Laddar projektdetaljer...'}
                     </p>
                 )}
             </CardContent>
         </Card>

         {/* Tabs structure */}
         <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 mb-4">
                 <TabsTrigger value="overview">Översikt</TabsTrigger>
                 <TabsTrigger value="gantt">Planering</TabsTrigger>
                 <TabsTrigger value="tasks">Uppgifter</TabsTrigger>
                 <TabsTrigger value="economy">Ekonomi</TabsTrigger>
                 <TabsTrigger value="resources">Resurser</TabsTrigger>
                 <TabsTrigger value="materials">Material</TabsTrigger>
                 <TabsTrigger value="documents">Dokument</TabsTrigger>
                 <TabsTrigger value="reports">Rapporter</TabsTrigger>
              </TabsList>

              {/* Content needs client components to access store */}
              <TabsContent value="overview">
                  <ClientProjectOverviewTab />
              </TabsContent>

              <TabsContent value="gantt">
                 <div className="flex flex-col w-full h-full space-y-4">
                    {/* Pass projectId to client components */}
                    <ViewControls projectId={projectId ?? ''} />
                    <GanttChart projectId={projectId ?? ''} /> 
                 </div>
              </TabsContent>

              <TabsContent value="tasks">
                  <ClientProjectTaskList />
              </TabsContent>

              <TabsContent value="materials">
                   <ClientProjectMaterialList />
              </TabsContent>

              {/* Other Placeholders */}
              <TabsContent value="economy"> <Card><CardHeader><CardTitle>Ekonomi</CardTitle></CardHeader><CardContent className="h-64 flex items-center justify-center bg-muted rounded-md"><p className="text-muted-foreground">[Budgetdetaljer, Kostnadsspårning, Fakturering här]</p></CardContent></Card> </TabsContent>
              <TabsContent value="resources"> <Card><CardHeader><CardTitle>Resurser</CardTitle></CardHeader><CardContent className="h-64 flex items-center justify-center bg-muted rounded-md"><p className="text-muted-foreground">[Lista över tilldelade resurser, Beläggning här]</p></CardContent></Card> </TabsContent>
              <TabsContent value="documents"> <Card><CardHeader><CardTitle>Dokument</CardTitle></CardHeader><CardContent className="h-64 flex items-center justify-center bg-muted rounded-md"><p className="text-muted-foreground">[Dokumentlista / Uppladdning här]</p></CardContent></Card> </TabsContent>
              <TabsContent value="reports"> <Card><CardHeader><CardTitle>Rapporter</CardTitle></CardHeader><CardContent className="h-64 flex items-center justify-center bg-muted rounded-md"><p className="text-muted-foreground">[Generera/Visa projektspecifika rapporter här]</p></CardContent></Card> </TabsContent>

         </Tabs>
    </div>
  );
} 