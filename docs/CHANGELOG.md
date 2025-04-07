# Ändringslogg

Alla betydande ändringar i projektet kommer att dokumenteras i denna fil.

## [Unreleased] - Pågående utveckling

### Tillagt
- Förbättrad datumhantering med `normalizeDate`-funktion för konsekvent UTC-baserad datumberäkning
- Dynamiska navigeringsberäkningar för bättre användarupplevelse
- Detaljerad loggning för positionsberäkningar för felsökning
- Mer robust typning för datum- och indexpararmetrar
- Uppdaterad positionsberäkning i `getTaskPosition`-funktionen för mer exakta uppgiftspositioner
- Ny Server Action (`lib/actions/materialActions.ts`) för `updateMaterialVisibility`.
- `InitializeProjectStore` Client Component för att hydrera Zustand från server-data.
- `ClientProjectTaskList`, `ClientProjectOverviewTab`, `ClientProjectMaterialList` som extraherade Client Components.
- `loadProjectStart` action i Zustand store för förbättrad laddningshantering.

### Ändrat
- Förbättrad zoom-funktionalitet som nu centrerar runt midpoint för bättre orientering
- Uppdaterad navigationskontroller (vänster/höger/zoom in/ut) för mer intuitiv användning
- Omarbetad `getTaskPosition` med direktimplementation istället för hjälpfunktioner
- **`app/gantt/[id]/page.tsx`:** Refaktorerad till Server Component.
  - Datahämtning med Prisma sker nu server-side.
  - Använder `InitializeProjectStore` för att sätta klient-state.
  - Interna komponenter extraherade till Client Components.
- **`lib/stores/currentProjectStore.ts`:** Lade till `loadProjectStart` action.
- **`useEffect` i `app/gantt/[id]/page.tsx`:** Logik för dataladdning borttagen och ersatt med anrop till `loadProjectStart`.

### Åtgärdat
- Fixat vissa typfel för map-funktioner som hanterar datum
- Hanterar nu date-fns relaterade felmeddelanden mer robust
- Åtgärdat problem med variabelinitialisering i Gantt-vy (viewStartDate/viewEndDate)
- Runtime-fel "Maximum update depth exceeded" relaterat till `useEffect`/Zustand.
- Runtime-fel "PrismaClient is unable to run in this browser environment" genom att flytta datahämtning till servern.
- Kritiskt fel med felaktig positionering av uppgiftsstaplar i Gantt-vyn.
- Kritiskt fel där endast ett projekt kunde visas (projektnavigering).

### Kända Problem / Nästa Steg
- **Byggfel:** `app/gantt/[id]/page.tsx` (Server Component) importerar `useEffect`/`useState`/`useRef`. **Åtgärd:** Ta bort importen.
- Slutföra "Material i Gantt" (implementera visualisering).
- Fortsätta API/DB Integration.
- Påbörja Resurshantering.

## [0.8.1] - 2025-04-20

### Tillagt
- Anpassningsbar layout med draggbar skiljelinje mellan vänster- och högerpanel
- Förbättrad procentvisning i uppgiftslistan med färgkodning baserad på framsteg
- Mer konsekvent styling av procentbadges med minimibredd och bättre marginaler
- Färgkodning av progress-indikatorer (grå för 0%, blå för pågående, grön för slutförda)

### Ändrat
- Justerat layouten för att förhindra avklippning av procentvärden
- Temporärt inaktiverat scrollfunktionalitet i väntan på en mer robust implementation
- Förbättrad visuell feedback för interaktiva element som den draggbara skiljelinjen
- Ökat avståndet mellan procentindikator och höger kant för bättre synlighet

### Åtgärdat
- Problem med avklippta procentindikatorer i uppgiftslistan
- Instabil scrollning i Gantt-vyn genom att temporärt inaktivera overflow-funktionaliteten
- Förbättrat kontrastproblem i procentindikatorerna för bättre läsbarhet

## [0.8.0] - 2025-04-12

### Tillagt
- Progress slider i TaskDetailsDialog för att uppdatera uppgifters framsteg
- Visualisering av framsteg direkt i uppgiftsstaplarna
- "Idag"-linje i Gantt-schemavyn för bättre kontext
- Förbättrat vertikalt grid med konsekvent rendering
- Stöd för att exportera basdata från projekt

### Ändrat
- Förbättrad TimelineHeader med stöd för olika vyer (dag, vecka, månad)
- Bättre hantering av hierarkiska uppgifter i Gantt-vyn
- Optimerad renderingsprestanda för stora projektplaner

### Åtgärdat
- Fixat z-index problem där vissa uppgiftsstaplar doldes bakom andra
- Förbättrad vertikal justering av uppgiftsstaplar i förhållande till uppgiftsnamn
- Åtgärdat scrollningsproblem mellan uppgiftslista och tidslinje

## [0.7.0] - 2025-03-25

### Tillagt
- Dialoger för skapande av projekt, fas och aktivitet
- Stöd för uppgiftsberoenden och visualisering av dessa
- Filter och sortering av uppgifter
- Context menu för uppgiftsredigering
- Milstolpar i tidslinjen

### Ändrat
- Förbättrad datamodell för uppgifter och projekt
- Uppgraderad till Next.js 14 app router struktur
- Optimerad rendering för bättre prestanda

### Åtgärdat
- Datumhanteringsproblem i flertalet komponenter
- Inkonsekvens i UI för mobila enheter

## [0.6.0] - 2025-02-20

### Tillagt
- Grundläggande Gantt-schema med tidslinjevy
- Hierarchisk datamodell för projekt och uppgifter
- Projekt- och uppgiftshanteringsgränssnitt
- Kontextuella inställningar för olika vyer

### Ändrat
- Migrerat från tidigare arkitektur
- Implementerat nytt designsystem

### Åtgärdat
- Diverse UI/UX problem från prototypen

## [2025-04-19] - Felsökning och Refaktorering GanttChart

### Åtgärdat
- **`components/gantt-chart.tsx`:** Löste kritiskt `ReferenceError: Cannot access 'viewStartDate' before initialization`-fel. Grundorsaken var att `useCallback` för positionsberäkning använde `viewStartDate` från kontext innan den initialiserats via `useEffect`. Fixades genom att flytta normalisering av datum in i `useCallback` och använda råa kontextvärden som beroenden.

### Ändrat
- **`components/gantt-chart.tsx`:** Refaktorerade `getTaskPosition` och `getMilestonePosition` för att använda index-baserad positionering baserat på den genererade `dates`-arrayen istället för direkta matematiska beräkningar med `differenceInDays`. Detta syftar till att förbättra stabiliteten vid zoom/panorering.
- **`components/gantt-chart.tsx`:** Genomförde omfattande kodstädning för att korrigera struktur, scope-problem och duplicerad kod som introducerades under tidigare automatiska redigeringsförsök. Flyttade funktioner (`findDateIndexes`, `getTaskPosition`, `getMilestonePosition`, handlers, navigeringsfunktioner) till korrekt scope och ordning inuti komponenten.
- **`components/gantt-chart.tsx`:** Korrigerade anrop i JSX för att rendera milstolpar med `getMilestonePosition` istället för `getTaskPosition`.
- **`components/gantt-chart.tsx`:** Korrigerade destructuring från `useUI` för att använda `viewStartDate`/`viewEndDate`.
- **`components/gantt-chart.tsx`:** Förbättrade typkonvertering från `Phase` till `Task` i `filteredTasks` och `displayedItems`.
- **`components/gantt-chart.tsx`:** Lade till saknade props för `GanttToolbar` och `GanttTaskTree`.
- **`components/gantt-chart.tsx`:** Återställde subkomponenten `TimelineHeader`.

### Kända Problem (Fortfarande)
- **`components/gantt-chart.tsx`:** Uppgiftsstaplar positioneras fortfarande felaktigt vid zoom/panorering, trots användning av index-baserad beräkning. Felsökning pågår.
- **Navigering:** Endast det första projektet i listan visas, oavsett vilket projekt användaren försöker navigera till. Undersökning av `ProjectContext` och routing/prop-hantering påbörjad.

## [Version X.Y.Z] - 2025-04-06

### Lade till
- **Dashboard Förbättringar:**
  - Ersatt statiska översiktskort med en dynamisk, sorterbar `ProjectListTable` (Shadcn Table).
  - Implementerat interaktiva diagram för Projektstatus (Pie) och Budget vs Kostnad (Bar) med Recharts.
- **Projektdetaljsida (Ny Struktur):**
  - Skapat ny struktur för `/gantt/[id]` med flikar (Översikt, Planering, Uppgifter, Material, m.fl.).
  - Implementerat `ProjectHeader` med dynamisk data.
  - Implementerat innehåll för "Översikt"-fliken (KPI-kort, Milstolpar).
  - Implementerat tabellvisning för "Uppgifter"-fliken (`ProjectTaskList`).
  - Implementerat tabellvisning för "Material"-fliken (`ProjectMaterialList`) med förberedelse för Gantt-synlighet (checkbox).
- **State Management:**
  - Refaktorerat Projektdetaljsidan till Client Component.
  - Introducerat Zustand store (`currentProjectStore`) för att hantera state (projektdata, tasks, materials) för den aktiva projektsidan.
- **Material i Gantt (Förberedelser):**
  - Lade till `showOnGantt` fält i `MaterialDelivery` (Prisma schema + TS typ).
  - Lade till (inaktiv) checkbox i materialtabellen.
  - Lade till action i Zustand store för att uppdatera synlighet.

### Ändrat
- Projektdetaljsidans standardflik är nu "Översikt".
- Justerat hantering av `project.progress` (optionellt fält) på Dashboard och Projektdetaljsida.

### Fixat
- Diverse linter-fel relaterade till typer och React hooks i `app/page.tsx` och `app/gantt/[id]/page.tsx`.
- Korrigerat sorteringslogik för datum och null-värden i projektlistan på dashboard.

### Kända Problem
- Se `docs/known_issues.md` för detaljer om problem med Prisma Client Sync, Server Actions och Zustand-modul. 