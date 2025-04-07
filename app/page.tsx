"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { format, compareAsc, compareDesc } from "date-fns"
import { sv } from "date-fns/locale"
import {
  PieChart as PieChartIcon,
  LineChart,
  Download,
  FileText,
  HomeIcon,
  Plus,
  BarChartHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CreateProjectDialog } from "@/components/gantt/dialogs/CreateProjectDialog"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { useProjects } from "@/lib/context/ProjectContext"
import { useInteraction } from "@/lib/context/InteractionContext"
import { Project } from "@/lib/types"
import { Navbar } from "../Projektordning/projektordning-git/app/components/navbar"

// Define colors for charts - use Tailwind colors for consistency if possible
const COLORS = {
  'Pågående': '#3b82f6', // blue-500
  'Planering': '#10b981', // emerald-500
  'Försenat': '#ef4444', // red-500
  'Avslutat': '#6b7280', // gray-500
  'Färdigt': '#6b7280', // gray-500 (Same as Avslutat)
  'Okänd': '#a1a1aa',    // zinc-400
  'Budget': '#84cc16', // lime-500
  'Cost': '#f97316'     // orange-500
};

// Exempeldata för offerter - behålls för Översikt-fliken tills vidare
const offersData = [
  {
    id: "off-1",
    name: "Köpcentrum Öst",
    company: "Fastighets AB",
    value: 2500000,
    status: "pending",
    date: "2023-05-15"
  }
]

// Helper function to get status badge variant
const getStatusVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status?.toLowerCase()) {
    case 'pågående':
      return 'default' // Blue
    case 'planering':
      return 'secondary' // Greenish
    case 'försenat':
      return 'destructive' // Red
    case 'avslutat':
    case 'färdigt':
      return 'outline' // Greyish
    default:
      return 'secondary'
  }
}

// Helper formatting functions (assuming these exist or are defined as before)
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('sv-SE') + ' kr'
}

const formatDate = (date?: string | Date | null): string => {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    // Check if date is valid before formatting
    if (isNaN(dateObj.getTime())) {
        return 'Ogiltigt datum';
    }
    return format(dateObj, 'yyyy-MM-dd', { locale: sv });
  } catch (error) {
    console.error("Error formatting date:", date, error);
    return 'Datumfel';
  }
};

const getCompanyName = (project: Project) => {
  return project.company || project.customer || "Inget företag"
}

// Helper to parse date for sorting, returning null for invalid dates
const parseDateForSort = (date?: string | Date | null): Date | null => {
  if (!date) return null;
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return isNaN(dateObj.getTime()) ? null : dateObj;
  } catch {
    return null;
  }
}

// --- Project Status Pie Chart Component ---
const ProjectStatusPieChart = ({ data }: { data: { name: string; value: number }[] }) => {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground">Ingen statusdata att visa.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Okänd} />
          ))}
        </Pie>
        <RechartsTooltip formatter={(value, name) => [`${value} projekt`, name]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// --- Budget Comparison Bar Chart Component ---
const BudgetComparisonBarChart = ({ data }: { data: Project[] }) => {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground">Ingen budgetdata att visa.</div>;
  }

  const chartData = data.map(p => ({
    name: p.name.length > 15 ? `${p.name.substring(0, 15)}...` : p.name, // Shorten long names
    Budget: p.budget || 0,
    Kostnad: p.costToDate || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => formatCurrency(value)} />
        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend />
        <Bar dataKey="Budget" fill={COLORS.Budget} />
        <Bar dataKey="Kostnad" fill={COLORS.Cost} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// --- Updated Project List Table Component with Sorting ---
type SortKey = keyof Pick<Project, 'name' | 'customer' | 'status' | 'progress' | 'budget' | 'costToDate' | 'startDate' | 'plannedEndDate'>;
type SortDirection = 'asc' | 'desc';
interface SortConfig {
  key: SortKey | null;
  direction: SortDirection;
}

// Define which columns are sortable
const sortableColumns: SortKey[] = ['name', 'customer', 'status', 'progress', 'budget', 'costToDate', 'startDate', 'plannedEndDate'];

const ProjectListTable = ({
  projects,
  sortConfig,
  onSort
}: {
  projects: Project[];
  sortConfig: SortConfig;
  onSort: (key: SortKey) => void;
}) => {
  if (projects.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 text-center text-muted-foreground mt-4">
        Inga projekt att visa. Klicka på "Nytt projekt" för att komma igång.
      </div>
    );
  }

  const renderSortArrow = (columnKey: SortKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  // Define the order and properties of columns explicitly
  const columns: { key: SortKey; label: string; isNumeric?: boolean }[] = [
    { key: 'name', label: 'Projektnamn' },
    { key: 'customer', label: 'Kund' },
    { key: 'startDate', label: 'Startdatum' },
    { key: 'plannedEndDate', label: 'Planerat Slut' },
    { key: 'status', label: 'Status' },
    { key: 'progress', label: 'Framsteg', isNumeric: true },
    { key: 'budget', label: 'Budget', isNumeric: true },
    { key: 'costToDate', label: 'Kostnad Hittills', isNumeric: true },
  ];

  return (
    <div className="mt-4 border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(col => {
              const isSortable = sortableColumns.includes(col.key);
              return (
                <TableHead
                  key={col.key}
                  className={`${isSortable ? 'cursor-pointer hover:bg-muted/50' : ''} ${col.isNumeric ? 'text-right' : ''}`}
                  onClick={() => isSortable && onSort(col.key)}
                >
                  <div className={`flex items-center ${col.isNumeric ? 'justify-end' : 'justify-start'}`}>
                    {col.label}
                    {isSortable && renderSortArrow(col.key)}
                  </div>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              {columns.map(col => (
                <TableCell
                  key={col.key}
                  className={`${col.key === 'name' ? 'font-medium' : ''} ${col.isNumeric ? 'text-right' : ''}`}
                >
                  {(() => {
                    switch (col.key) {
                      case 'name':
                        return (
                          <Link href={`/gantt/${project.id}`} className="hover:underline text-blue-600">
                            {project.name}
                          </Link>
                        );
                      case 'customer':
                        return getCompanyName(project);
                      case 'status':
                        return <Badge variant={getStatusVariant(project.status)}>{project.status || 'Okänd'}</Badge>;
                      case 'progress':
                        return (
                          <div className="flex items-center justify-end space-x-2">
                            <span>{project.progress ?? 0}%</span>
                            <Progress value={project.progress ?? 0} className="h-2 w-16" />
                          </div>
                        );
                      case 'budget':
                        return formatCurrency(project.budget || 0);
                      case 'costToDate':
                        return formatCurrency(project.costToDate || 0);
                      case 'startDate':
                        return formatDate(project.startDate);
                      case 'plannedEndDate':
                        return formatDate(project.plannedEndDate);
                      default:
                        return null;
                    }
                  })()}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default function Home() {
  const [activeTab, setActiveTab] = useState("project") // Default to project tab
  const { setIsAddingProject, isAddingProject } = useInteraction();
  const { projects: originalProjects } = useProjects();
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  
  console.log("Home renderad, isAddingProject:", isAddingProject);
  
  // Testfunktion för direkt manipulation av isAddingProject
  const handleOpenDialog = () => {
    console.log("handleOpenDialog anropas, sätter isAddingProject till true");
    setIsAddingProject(true);
  };
  
  // Calculate data needed for charts and overview
  const { overviewData, projectsByStatusData } = useMemo(() => {
    const projectsByStatus: Record<string, number> = {};
    let totalValue = 0;
    let progressSum = 0;

    originalProjects.forEach(p => {
      const status = p.status || "Okänd";
      projectsByStatus[status] = (projectsByStatus[status] || 0) + 1;
      totalValue += p.budget || 0;
      progressSum += p.progress ?? 0;
    });

    const statusData = Object.entries(projectsByStatus).map(([name, value]) => ({ name, value }));

    const offerValue = offersData.reduce((sum, o) => sum + (o.value || 0), 0);
    const accepted = 0; // Still hardcoded
    const totalOff = offersData.length;
    const rate = totalOff > 0 ? (accepted / totalOff) * 100 : 0;
    const avgProg = originalProjects.length > 0 ? progressSum / originalProjects.length : 0;

    return {
      overviewData: {
        totalProjectValue: totalValue,
        totalOfferValue: offerValue,
        acceptedOffers: accepted,
        totalOffers: totalOff,
        acceptedRate: rate,
        avgProgress: avgProg,
      },
      projectsByStatusData: statusData
    };
  }, [originalProjects]);

  // Function to handle sorting logic
  const handleSort = (key: SortKey) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Memoized sorted projects for the table
  const sortedProjects = useMemo(() => {
    let sortableItems = [...originalProjects];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = sortConfig.key === 'progress' ? (a.progress ?? 0) : a[sortConfig.key!];
        const bValue = sortConfig.key === 'progress' ? (b.progress ?? 0) : b[sortConfig.key!];
        const direction = sortConfig.direction === 'asc' ? 1 : -1;

        // Updated date handling to include startDate
        if (sortConfig.key === 'plannedEndDate' || sortConfig.key === 'startDate') {
            const dateA = parseDateForSort(aValue as string | Date);
            const dateB = parseDateForSort(bValue as string | Date);
            if (dateA === null && dateB === null) return 0;
            if (dateA === null) return direction;
            if (dateB === null) return -direction;
            return compareAsc(dateA, dateB) * direction;
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return (aValue - bValue) * direction;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue, 'sv', { sensitivity: 'base' }) * direction;
        } else {
          if (aValue == null && bValue == null) return 0;
          if (aValue == null) return -direction;
          if (bValue == null) return direction;
          return (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) * direction;
        }
      });
    }
    return sortableItems;
  }, [originalProjects, sortConfig]);

  return (
    <div className="flex min-h-screen">
      <Navbar />
      <div className="flex-1 p-8">
        {/* Brödsmulor */}
        <div className="flex items-center space-x-2 mb-4 text-sm">
          <HomeIcon className="h-4 w-4" />
          <span>›</span>
          <span>Projektöversikt</span>
        </div>

        {/* Sidhuvud */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Projektöversikt</h1>
          <div className="flex space-x-4">
            <Button className="bg-white" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Generera rapport
            </Button>
            <Button onClick={handleOpenDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nytt projekt
            </Button>
          </div>
        </div>

        {/* Main Content Area with Tabs */}
        <Card className="shadow-sm mb-6"> {/* Keep one main card */} 
          <CardHeader className="pb-2">
            {/* Title removed, handled by TabsList now */}
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3"> {/* Adjust grid-cols based on tabs */}
                <TabsTrigger value="overview">Översikt</TabsTrigger>
                <TabsTrigger value="project">Projekt ({originalProjects.length})</TabsTrigger>
                <TabsTrigger value="offers">Offerter ({offersData.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                {/* Keep the Overview summary boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg relative flex flex-col">
                    <div className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100">
                      <LineChart className="h-3 w-3 text-blue-700" />
                    </div>
                    <span className="text-sm text-blue-700 mb-2">Aktiva Projekt</span>
                    <span className="text-2xl font-bold">{originalProjects.length}</span>
                  </div>

                  <div className="p-4 bg-indigo-50 rounded-lg relative flex flex-col">
                    <div className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-indigo-100">
                      <PieChartIcon className="h-3 w-3 text-indigo-700" />
                    </div>
                    <span className="text-sm text-indigo-700 mb-2">Aktiva Offerter</span>
                    <span className="text-2xl font-bold">{offersData.length}</span>
                    <span className="text-xs text-muted-foreground">Värde: {(overviewData.totalOfferValue / 1000000).toFixed(1)} MSEK</span>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-lg relative flex flex-col">
                    <div className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-emerald-100">
                      <svg className="h-3 w-3 text-emerald-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-sm text-emerald-700 mb-2">Projekt Framgång</span>
                    <span className="text-2xl font-bold">{overviewData.avgProgress.toFixed(1)}%</span>
                    <span className="text-xs text-muted-foreground">Genomsnittlig framgång</span>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg relative flex flex-col">
                    <div className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-amber-100">
                      <svg className="h-3 w-3 text-amber-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4V14M12 18V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <span className="text-sm text-amber-700 mb-2">Offert Konvertering</span>
                    <span className="text-2xl font-bold">{overviewData.acceptedRate.toFixed(1)}%</span>
                    <span className="text-xs text-muted-foreground">{overviewData.acceptedOffers}/{overviewData.totalOffers} accepterade</span>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <PieChartIcon className="h-5 w-5 mr-2 text-indigo-600" />
                          Projektstatus Fördelning
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ProjectStatusPieChart data={projectsByStatusData} />
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                       <CardHeader>
                         <CardTitle className="text-lg flex items-center">
                           <BarChartHorizontal className="h-5 w-5 mr-2 text-lime-600" />
                           Budget vs Kostnad per Projekt
                         </CardTitle>
                       </CardHeader>
                       <CardContent>
                         <BudgetComparisonBarChart data={originalProjects} />
                       </CardContent>
                    </Card>
                </div>
              </TabsContent>

              <TabsContent value="project">
                {/* Pass sorted data and sort controls to the table */}
                <ProjectListTable
                   projects={sortedProjects}
                   sortConfig={sortConfig}
                   onSort={handleSort}
                 />
              </TabsContent>

              <TabsContent value="offers">
                {/* Keep the offers list for now */}
                <div className="space-y-4 mt-4">
                  {offersData.map(offer => (
                    <div key={offer.id} className="p-4 border rounded-lg bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{offer.name}</h3>
                          <p className="text-sm text-muted-foreground">{offer.company}</p>
                        </div>
                        <Badge variant={offer.status === 'pending' ? 'secondary' : 'default'}>
                          {offer.status === "pending" ? "Avvaktar" : "Accepterad"}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Värde: {formatCurrency(offer.value)}</span>
                        <span>Datum: {formatDate(offer.date)}</span>
                      </div>
                    </div>
                  ))}
                  {offersData.length === 0 && (
                      <div className="p-4 border rounded-lg bg-gray-50 text-center text-muted-foreground mt-4">
                          Inga offerter att visa.
                      </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Removed ProjektDetaljer Card */}
        {/* Removed Budget och kostnadsanalys Card */}
        {/* Removed Projektutveckling and Projektstatus Cards */}

      </div>

      {/* Dialogen för att lägga till nytt projekt */}
      <CreateProjectDialog />
    </div>
  )
}

