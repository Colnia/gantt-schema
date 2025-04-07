# Projekthanteringssystem för Kyltekniska Installationer

Ett komplett projekthanteringssystem som kombinerar tidsplaneringsverktyg (Gantt Schema) med ekonomi- och budgethantering (Projektordning) för kyltekniska installationer i byggnadsprojekt.

## Översikt

Detta projekt kombinerar två tidigare separata system:
- **Gantt Schema**: Fokuserat på avancerad tidsplanering, resurshantering och visualisering av projekt
- **Projektordning**: Fokuserat på budgethantering, kostnadsuppföljning och ekonomisk rapportering

Tillsammans bildar de ett kraftfullt och specialiserat projektledningsverktyg för kyltekniska installationer.

## Funktioner

### Kärnfunktionalitet
- **Hierarkisk projektstruktur** med:
  - Faser (Design, Material, Installation, Kontroll)
  - Delmål (Rördragning, Koppling, Isolering)
  - Leveranser (Kompressorer, Kylbänkar, Kontrollsystem)
- **Detaljerad resurshantering**:
  - Teknikerprofil med certifieringar och specialiseringar
  - Automatisk resursallokering och konflikthantering
  - Kapacitetsplanering och belastningsdiagram
- **Material- och leveranshantering**:
  - Beställningssystem för material
  - Leveransplanering och spårning
  - Integration med leverantörssystem
- **Kostnadshantering**:
  - Detaljerad kostnadsuppdelning per fas/uppgift/resurs
  - Budgetöversikt och avvikelseanalyser
  - Kostnadsprognoser och ekonomisk rapportering
- **Flexibla projektvyer**:
  - Gantt-vy (tidslinje)
  - Kanban-vy (faser)
  - Listvy (detaljerad)
  - Kalendervy
  - Ekonomisk översikt

## Teknisk Arkitektur

```
+-------------------+
|   Next.js App     |
+-------------------+
|    |        |     |
v    v        v     v
+-----+ +-----+ +------+
| API | | UI  | | Auth |
+-----+ +-----+ +------+
    |      |       |
    v      v       v
+-------------------+
|   Zustand Store   |
+-------------------+
        |
        v
+-------------------+
|   Prisma Client   |
+-------------------+
        |
        v
+-------------------+
|   PostgreSQL DB   |
+-------------------+
```

### Stack
- **Frontend**: Next.js 14.2.3 med App Router, React 18, TypeScript, Tailwind CSS
- **State Management**: Zustand för global state
- **Datahantering**: Prisma ORM
- **Databas**: PostgreSQL / SQLite (beroende på env)
- **UI-komponenter**: Radix UI, Shadcn/UI
- **Grafikverktyg**: Chart.js (Dashboard), React DnD (Gantt)
- **Virtualisering**: React Window för stora listor

## Integrationsplan

### 1. Gemensam Datamodell (Vecka 1-2)

Slå samman datamodellerna från båda projekten med fokus på:
- Unified Project, Task, Phase, Resource modeller
- Ekonomirelaterade fält i relevanta entiteter
- Relationer för kostnadsberäkning och tidsspårning

### 2. Arkitektur (Vecka 3-4)

- Enhetlig navigationsstruktur
- Konsoliderad state management med Zustand
- Kontextbaserad separation av ansvarsområden

### 3. UI-komponenter (Vecka 5-12)

- Fas 3.1: Gemensamt komponentbibliotek (Vecka 5-7)
- Fas 3.2: Ny Dashboard (Vecka 11-12)
- Implementera specialkomponenter:
  - ProjectHeader med kombinerad information
  - GanttWithCost för tidslinje med kostnadsdata
  - ResourceAllocation med kostnadsberäkning
  - BudgetDashboard från Projektordning

### 4. Funktionsintegration (Vecka 8-14)

- Fas 4.1: Kostnadsberäkning i Gantt-schema (Vecka 8-10)
- Fas 4.2: Tidslinjevisualiseringar i ekonomivyer (Vecka 13-14)

### 5. Rapportering (Vecka 15-17)

- Konsoliderade rapporter med data från båda systemen
- Exportfunktionalitet (PDF, Excel)
- Specialiserade rapporter för olika intressenter

### 6. Backend och Deployment (Vecka 18-21)

- Konsoliderad API-struktur
- Autentisering och auktorisering
- Färdigställande för production

## Datamodell

```prisma
model Project {
  id                String   @id @default(cuid())
  name              String
  customer          String
  manager           String
  startDate         DateTime
  plannedEndDate    DateTime
  actualEndDate     DateTime?
  status            String
  budget            Float
  costToDate        Float
  estimatedTotalCost Float
  
  // Relationer
  phases            Phase[]
  resources         Resource[]
  materialDeliveries MaterialDelivery[]
  tasks             Task[]
  // ... övriga relationer
}

model Task {
  id             String       @id @default(cuid())
  name           String
  description    String?
  startDate      DateTime
  endDate        DateTime
  status         String
  priority       String?
  progress       Float?
  isMilestone    Boolean      @default(false)
  
  // Ekonomifält
  estimatedCost  Float        @default(0)
  actualCost     Float        @default(0)
  budgetVariance Float?       // Beräknat fält
  
  // Relationer
  project        Project      @relation(fields: [projectId], references: [id])
  projectId      String
  phase          Phase?       @relation(fields: [phaseId], references: [id])
  phaseId        String?
  resources      Resource[]
}

// Andra viktiga modeller: Phase, Resource, MaterialDelivery, Dependency, etc.
```

## Mockups för nyckelsidor

### Dashboard
```
+-------------------------------------------+
|            PROJEKT: ABC Köpcentrum        |
+--------+------------+--------------------+
| Status | Pågående   | Budget: 1.2 MSEK   |
+--------+------------+--------------------+
|                                           |
|  [Ekonomisk Översikt]    [Tidslinje]      |
|   +----------------+   +----------------+ |
|   |                |   |                | |
|   |  Budget/Kostnad|   |  Gantt Schema  | |
|   |                |   |                | |
|   +----------------+   +----------------+ |
|                                           |
|  [Resursbeläggning]     [Kritiska Punkter]|
|   +----------------+   +----------------+ |
|   |                |   |                | |
|   |  Resursgraf    |   |  Milstolpar    | |
|   |                |   |                | |
|   +----------------+   +----------------+ |
|                                           |
+-------------------------------------------+
```

### Gantt-vy med Kostnad
```
+-------------------------------------------+
|            GANTT: ABC Köpcentrum          |
+-------------------------------------------+
| [Faser][Uppgifter][Resurser][Kostnader]   |
+-------------------------------------------+
|                                           |
|  UPPGIFT         | COST |     TIMELINE   |
|  Installation    | 120k |====>           |
|  > Rördragning   |  45k |===>            |
|  > Koppling      |  35k |   ===>         |
|  > Test          |  40k |       ==>      |
|                                           |
|  RESURSBELÄGGNING                         |
|  Anders J        |      |====>==         |
|  Leif S          |      |   ====>        |
|                                           |
+-------------------------------------------+
```

## Implementationsordning

1. **Fas 1**: Datamodell (vecka 1-2)
2. **Fas 2**: Arkitektur (vecka 3-4)
3. **Fas 3.1**: Komponentbibliotek (vecka 5-7)
4. **Fas 4.1**: Kostnadsberäkning i Gantt (vecka 8-10)
5. **Fas 3.2**: Ny Dashboard (vecka 11-12)
6. **Fas 4.2**: Tidslinjevisualisering i Ekonomi (vecka 13-14)
7. **Fas 5**: Rapportering (vecka 15-17)
8. **Fas 6**: Backend och Deployment (vecka 18-21)

## Utveckling

### Installation

```bash
npm install
# eller
pnpm install
```

### Starta utvecklingsserver

**OBS:** Utvecklingsservern (`npm run dev` / `pnpm dev`) har visat sig instabil. Det rekommenderas att köra i produktionsläge lokalt:
```bash
npm run build && npm start
# eller
pnpm build && pnpm start
```

Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare för att se resultatet.

## Bidra

Detta projekt är under aktiv utveckling. Se [docs/REFACTORING_PLAN.md](./docs/REFACTORING_PLAN.md), [docs/DEVELOPMENT_PLAN.md](./docs/DEVELOPMENT_PLAN.md) och [docs/PROJECT_PLAN.md](./docs/PROJECT_PLAN.md) för mer detaljerad information om pågående utveckling.

## Pågående utveckling och kända problem

### Nuvarande utvecklingsfokus

Efter att ha löst kritiska problem med Gantt-rendering och projektnavigering, samt åtgärdat blockerare för Server Actions och Prisma Client, ligger fokus nu på:

1.  **Slutföra "Material i Gantt"-funktionen:**
    *   ✅ Prisma Client uppdaterad (`showOnGantt` fältet finns).
    *   ✅ Server Action (`updateMaterialVisibility`) flyttad till korrekt plats (`lib/actions/`).
    *   🔄 Aktivera checkbox-funktionaliteten i `ClientProjectMaterialList` (borde fungera nu).
    *   🔄 Implementera visualisering av material i `GanttChart`/`TaskArea` baserat på `showOnGantt`-flaggan.
2.  **Fortsatt API & Databasintegration:** Systematiskt implementera återstående API-endpoints och integrera UI-komponenter för att göra applikationen fullt databasdriven.
3.  **Resurshantering:** Påbörja implementation av resursprofiler, tilldelning och visualisering enligt plan.

- ✅ **Dashboard UI:** Förbättrad med dynamisk tabell och diagram.
- ✅ **Projektsida Struktur:** Ny struktur med flikar (`app/gantt/[id]/page.tsx`).
- ✅ **Projektsida Datahämtning:** Refaktorerad till Server Component som hämtar data med Prisma server-side och initialiserar Zustand-storen på klienten.
- ✅ **State Management:** Zustand (`currentProjectStore`) används för state på projektdetaljsidan.

### Kända problem

Se [docs/known_issues.md](./docs/known_issues.md) för en uppdaterad lista. De tidigare kritiska problemen med Gantt-rendering och projektnavigering är nu **lösta**. Kvarvarande problem inkluderar:

1.  **Datumväljare (Äldre):** Stängs inte automatiskt.
2.  **Scrollning (Äldre):** Temporärt inaktiverad i Gantt, behöver robust lösning.
3.  **Linter-varningar:** Implicit `any`-typer behöver åtgärdas.
4.  **(Byggfel vid senaste försök):** Importer av `useEffect`/`useState`/`useRef` i Server Component (`app/gantt/[id]/page.tsx`) behöver tas bort.

### Nyligen lösta problem

- ✅ **Kritiska Gantt-rendering och Navigeringsproblem:** Åtgärdade.
- ✅ **Blockerare för Material-i-Gantt:** Prisma Client uppdaterad, Server Action flyttad.
- ✅ **Instabil Utvecklingsmiljö:** Workaround implementerad (kör `build` + `start`).
- ✅ **Linter-fel i Projekt/Dashboard:** Korrigerade.
- ✅ **Hantering av `progress`:** Anpassat.
- ✅ **Sortering på Dashboard:** Implementerat.

### Kommande funktioner

1.  **Visualisera Material i Gantt:** Slutföra implementationen.
2.  **Komplett API/DB-integration:** Slutföra CRUD för alla entiteter.
3.  **Resurshantering:** Implementera enligt plan.
4.  **Projektredigering:** Funktion för att redigera grundläggande projektuppgifter.
5.  **Prognoser:** Implementera kostnads- och tidsprognoser.
6.  **Robust scrollningslösning:** Implementera.
7.  **Fylla övriga flikar:** Ekonomi, Resurser, Dokument, Rapporter.

### Senaste uppdatering: [Dagens Datum]

## Licens

[MIT](https://choosealicense.com/licenses/mit/)

## Gantt Schema

Ett modernt projekthanteringsverktyg med avancerad Gantt-schemaläggning.

### Funktioner

- Projektöversiktshantering
- Fashantering för logisk organisering
- Stöd för olika aktivitetstyper (uppgifter, milstolpar, leveranser, beslutspunkter)
- Hierarkisk vyvisualisering
- Resurshantering och beroendehantering
- Kostnadsuppföljning

### Teknisk implementering

**Backend:**
- REST API-slutpunkter för datahämtning och manipulation
- Prisma ORM för databashantering
- Stöd för SQLite (utveckling) och PostgreSQL (produktion)

**Frontend:**
- React.js med Next.js framework
- Tailwind CSS för stilar och responsiv design
- ShadCN komponentbibliotek för enhetligt UI

## Installation

För att köra projektet lokalt:

```bash
# Klona projektet
git clone https://github.com/yourusername/gantt-schema.git

# Installera dependencies
cd gantt-schema
npm install

# Starta utvecklingsserver
npm run dev
```

## Dokumentation

All projektdokumentation finns tillgänglig i `docs`-mappen:

- [Utvecklingsplan](./docs/DEVELOPMENT_PLAN.md)
- [Refaktoreringsplan](./docs/REFACTORING_PLAN.md)
- [Projektplan](./docs/PROJECT_PLAN.md)
- [UI-förbättringsplan](./docs/UI_IMPROVEMENT_PLAN.md)
- [Kända problem](./docs/known_issues.md)
- [Resurshantering](./docs/resource_management.md)
- [Ändringslogg](./docs/CHANGELOG.md)
- [Felsökning](./docs/TROUBLESHOOTING.md)

## Bidra

Detta projekt är under aktiv utveckling. Se [docs/REFACTORING_PLAN.md](./docs/REFACTORING_PLAN.md), [docs/DEVELOPMENT_PLAN.md](./docs/DEVELOPMENT_PLAN.md) och [docs/PROJECT_PLAN.md](./docs/PROJECT_PLAN.md) för mer detaljerad information om pågående utveckling. 