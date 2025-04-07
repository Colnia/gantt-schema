# Gantt Schema - Detaljerad Projektplan

## 1. Översikt

Detta dokument beskriver den detaljerade utvecklingsplanen för Gantt Schema, ett avancerat projektledningsverktyg specialiserat för kyltekniska installationer i byggprojekt.

### 1.1 Vision
Att skapa ett intuitivt och kraftfullt projektledningsverktyg som effektiviserar planering, resurshantering och uppföljning av kyltekniska installationsprojekt.

### 1.2 Målgrupp
- Projektledare inom kyltekniska installationer
- Teammedlemmar (tekniker)
- Intressenter (byggherrar, beställare)
- Administratörer

## 1.3 Plananalys och Rekommendationer

*(Baserat på analys av [Datum för analys])*

### Styrkor
- **Tydlig målgruppsfokus:** Anpassad för projektledare inom kyltekniska installationer, med hänsyn till sekundära användare.
- **Komplett funktionalitetsomfattning:** Täcker hierarkisk struktur, resurshantering, material, kvalitet och säkerhet.
- **Tekniskt genomtänkt:** Modern stack (Next.js, React, TS), välavvägd datamodell (Prisma/PostgreSQL), och effektiv state management (Zustand).
- **Realistisk tidsplan:** 16 veckor uppdelat i logiska faser med tydliga veckovisa mål.

### Potentiella Utmaningar
- **Teknisk komplexitet:** Avancerade tekniker (resursallokering, belastningsdiagram) kräver specialistkunskap och komplexa algoritmer.
- **Datamodellsbegränsningar:** Task-modellen och dess relationer behöver specificeras ytterligare.
- **Integrationsutmaningar:** Externa integrationer (leverantörssystem) är nämnda men behöver specificeras och kan vara komplexa.

### Rekommendationer (Integrerade i planen nedan)
- **Datamodellsförfining:** Definiera Task-modellen och subtasks mer detaljerat.
- **Prototypfokus:** Bygg en enkel prototyp tidigt för att validera koncept (särskilt Gantt-vy och resurshantering).
- **Användarfeedbackloop:** Samla in feedback efter varje fas, prioritera tidig feedback på resursallokering.
- **Riskreducering:** Identifiera och hantera tekniskt komplexa delar tidigt (beroendehantering, resursbelastning).

## 2. Funktionella Krav

### 2.1 Projektstruktur och Hantering

#### 2.1.1 Hierarkisk Projektstruktur
- Huvudprojekt
  - Faser (Design, Material, Installation, Kontroll)
  - Delmål (Rördragning, Koppling, Isolering)
  - Leveranser (Kompressorer, Kylbänkar)
- Projektmallar för vanliga projekttyper
- Automatisk beräkning av projektlängd och kritiska linjer

#### 2.1.2 Flexibel Projektvy
- Gantt-vy (tidslinje)
- Kanban-vy (faser)
- Listvy (detaljerad)
- Kalendervy
- Anpassningsbara kolumner

### 2.2 Resurshantering

#### 2.2.1 Teknikerprofil
- Certifieringar och behörigheter
- Specialiseringar
- Tillgänglighet och schema
- Erfarenhetsnivå
- Belastningsdiagram

#### 2.2.2 Resursallokering
- Automatisk allokering baserat på:
  - Behörigheter
  - Tillgänglighet
  - Erfarenhet
- Konflikthantering
- Kapacitetsplanering

### 2.3 Material och Leveranser
- Materialöversikt
- Beställningslista
- Leveransplanering
- Lagerstatus
- Materialkostnader
- Integration med leverantörssystem

### 2.4 Kvalitet och Säkerhet
- Kvalitetskontrollpunkter
- Säkerhetskontroller
- Dokumenthantering
- Certifieringsöversikt
- Automatiska påminnelser

### 2.5 Kostnadshantering
- Detaljerad kostnadsuppdelning
- Budgetöversikt
- Kostnadsprognoser
- Avvikelseanalys

### 2.6 Rapportering och Analys
- Anpassningsbara dashboards
- Statusrapporter
- Resursutnyttjande
- Kostnadsanalyser
- Riskindikatorer

## 3. Teknisk Implementation

### 3.1 Arkitektur

#### 3.1.1 Frontend
- Next.js 14.2.3 med App Router
- React 18 med Server Components
- TypeScript för typsäkerhet
- Tailwind CSS för styling
- Radix UI för komponenter
- Zustand för state management
- Prisma ORM direkt i Server Components för datahämtning
- React DnD för drag-and-drop
- React Window för virtualisering

#### 3.1.2 Backend
- Next.js API Routes
- Prisma som ORM
- PostgreSQL som databas
- Redis för caching
- JWT för autentisering
- Zod för validering

### 3.2 Datamodell

#### 3.2.1 Huvudentiteter
```prisma
model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  startDate   DateTime
  endDate     DateTime
  status      String
  phases      Phase[]
  resources   Resource[]
  materials   Material[]
  costs       Cost[]
  risks       Risk[]
  documents   Document[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Phase {
  id          String   @id @default(cuid())
  name        String
  description String?
  startDate   DateTime
  endDate     DateTime
  status      String
  project     Project  @relation(fields: [projectId], references: [id])
  tasks       Task[]
  resources   Resource[]
  materials   Material[]
  costs       Cost[]
  risks       Risk[]
  documents   Document[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Resource {
  id          String   @id @default(cuid())
  name        String
  type        String   // "technician", "equipment", etc.
  skills      String[]
  availability DateTime[] // Överväg en mer detaljerad modell för tillgänglighet/schema
  project     Project? @relation(fields: [projectId], references: [id])
  phase       Phase?   @relation(fields: [phaseId], references: [id])
  tasks       Task[]   // Relation till Task-modellen
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Material {
  id          String   @id @default(cuid())
  name        String
  type        String
  quantity    Float
  unit        String
  cost        Float
  project     Project? @relation(fields: [projectId], references: [id])
  phase       Phase?   @relation(fields: [phaseId], references: [id])
  supplier    String?
  orderStatus String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Cost {
  id          String   @id @default(cuid())
  type        String   // "labor", "material", "equipment", etc.
  amount      Float
  currency    String
  project     Project? @relation(fields: [projectId], references: [id])
  phase       Phase?   @relation(fields: [phaseId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Risk {
  id          String   @id @default(cuid())
  name        String
  description String?
  impact      String
  probability String
  mitigation  String?
  project     Project? @relation(fields: [projectId], references: [id])
  phase       Phase?   @relation(fields: [phaseId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Document {
  id          String   @id @default(cuid())
  name        String
  type        String
  url         String
  project     Project? @relation(fields: [projectId], references: [id])
  phase       Phase?   @relation(fields: [phaseId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// NY: Grundläggande Task-modell (Behöver detaljeras ytterligare)
model Task {
  id             String       @id @default(cuid())
  name           String
  description    String?
  startDate      DateTime
  endDate        DateTime
  status         String       // t.ex. "not-started", "in-progress", "completed"
  priority       String?      // t.ex. "low", "medium", "high"
  progress       Float?       // Procent färdigställt (0-1)
  isMilestone    Boolean      @default(false)
  phaseId        String
  phase          Phase        @relation(fields: [phaseId], references: [id])
  assignedResources Resource[]   // Resurser tilldelade denna uppgift
  dependencies   Dependency[] @relation("TaskDependencies") // Uppgifter som denna beror på
  dependents     Dependency[] @relation("TaskDependents")   // Uppgifter som beror på denna
  subTasks       Task[]       @relation("SubTasks")      // Underuppgifter (Hierarki)
  parentTaskId   String?
  parentTask     Task?        @relation("SubTasks", fields: [parentTaskId], references: [id])
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  // Ytterligare fält att överväga:
  // estimatedHours Float?
  // actualHours    Float?
  // cost           Float?
}

// NY: Beroendemodell (Dependency)
model Dependency {
  id             String @id @default(cuid())
  type           String // t.ex. "FS" (Finish-to-Start), "SS", "FF", "SF"
  lagDays        Int    @default(0) // Fördröjning i dagar
  predecessorId  String
  successorId    String
  predecessor    Task   @relation("TaskDependencies", fields: [predecessorId], references: [id])
  successor      Task   @relation("TaskDependents", fields: [successorId], references: [id])

  @@unique([predecessorId, successorId]) // Säkerställ unika beroenden
}
```

### 3.3 Komponentstruktur

```
components/
├── gantt/
│   ├── views/
│   │   ├── GanttView.tsx
│   │   ├── KanbanView.tsx
│   │   ├── ListView.tsx
│   │   └── CalendarView.tsx
│   ├── timeline/
│   │   ├── Timeline.tsx
│   │   ├── TimelineHeader.tsx
│   │   └── TimelineGrid.tsx
│   ├── tasks/
│   │   ├── TaskList.tsx
│   │   ├── TaskBar.tsx
│   │   └── TaskDetails.tsx
│   ├── resources/
│   │   ├── ResourceList.tsx
│   │   ├── ResourceCard.tsx
│   │   └── ResourceAllocation.tsx
│   ├── materials/
│   │   ├── MaterialList.tsx
│   │   ├── MaterialCard.tsx
│   │   └── OrderForm.tsx
│   └── dialogs/
│       ├── ProjectDialog.tsx
│       ├── PhaseDialog.tsx
│       ├── ResourceDialog.tsx
│       └── MaterialDialog.tsx
├── dashboard/
│   ├── Dashboard.tsx
│   ├── ProjectOverview.tsx
│   ├── ResourceOverview.tsx
│   └── CostOverview.tsx
└── shared/
    ├── Header.tsx
    ├── Sidebar.tsx
    └── Navigation.tsx
```

### 3.4 State Management

#### 3.4.1 Zustand Stores
```typescript
interface ProjectStore {
  projects: Project[];
  activeProject: Project | null;
  setActiveProject: (project: Project) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
}

interface ResourceStore {
  resources: Resource[];
  selectedResources: Resource[];
  setSelectedResources: (resources: Resource[]) => void;
  allocateResources: (allocation: ResourceAllocation) => void;
}

interface MaterialStore {
  materials: Material[];
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
}
```

### 3.5 API Routes

```
app/api/
├── projects/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       ├── phases/
│       │   └── route.ts
│       ├── resources/
│       │   └── route.ts
│       └── materials/
│           └── route.ts
├── resources/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
└── materials/
    ├── route.ts
    └── [id]/
        └── route.ts
```

## 4. Utvecklingsfaser

### 4.1 Fas 1: Grundstruktur (4 veckor)

#### Vecka 1-2: Datamodell och API
- Implementera Prisma-schema
- Skapa API-routes
- Implementera grundläggande CRUD-operationer
- Sätta upp autentisering

#### Vecka 3-4: Frontend Grundstruktur
- Implementera projektstruktur
- Skapa grundläggande komponenter
- Implementera state management
- Sätta upp routing
- **NY:** Bygg en enkel prototyp av Gantt-vyn och resurshanteringen för tidig konceptvalidering.
- **NY:** Påbörja implementation av komplexa algoritmer (beroendehantering, resursbelastning) för att identifiera utmaningar tidigt.

- **NY:** Samla in initial användarfeedback på prototypen.

### 4.2 Fas 2: Kärnfunktionalitet (6 veckor)

#### Vecka 5-6: Projekthantering
- Implementera projektvyer
- Skapa projektmallar
- Implementera fas- och uppgiftshantering
- Lägga till beroendehantering
- Lägga till budgetöversikt

- **NY:** Genomför användartester och samla in feedback på kärnfunktionaliteten (projekt-, resurs-, material-, kostnadshantering). Prioritera feedback på resursallokering.

#### Vecka 7-8: Resurshantering
- Implementera teknikerprofiler
- Skapa resursallokering
- Implementera belastningsdiagram
- Lägga till konflikthantering

#### Vecka 9-10: Material och Kostnader
- Implementera materialhantering
- Skapa beställningssystem
- Implementera kostnadshantering
- Lägga till budgetöversikt

### 4.3 Fas 3: Avancerade Funktioner (4 veckor)

#### Vecka 11-12: Kvalitet och Säkerhet
- Implementera kvalitetskontroll
- Skapa säkerhetskontroller
- Implementera dokumenthantering
- Lägga till certifieringsöversikt

#### Vecka 13-14: Rapportering och Analys
- Skapa dashboards
- Implementera rapporter
- Lägga till analysverktyg
- Implementera export

- **NY:** Genomför användartester och samla in feedback på avancerade funktioner (kvalitet, säkerhet, rapportering).

### 4.4 Fas 4: Optimering och Integration (2 veckor)

#### Vecka 15: Prestanda
- Implementera virtualisering
- Optimera databasanrop
- Förbättra caching
- Lägga till offline-stöd

#### Vecka 16: Integration och Testning
- Integrera med externa system
- Utföra prestandatestning
- Genomföra säkerhetstestning
- Slutföra användartestning

- **NY:** Samla in slutanvändarfeedback och planera för första release/iterativa förbättringar.

## 5. Kvalitetssäkring

### 5.1 Testning
- Enhetstester med Vitest
- Komponenttester med React Testing Library
- Integrationstester med Cypress
- Prestandatestning med Lighthouse

### 5.2 Kodkvalitet
- ESLint för kodstil
- Prettier för formatering
- TypeScript för typsäkerhet
- Husky för pre-commit hooks

### 5.3 Dokumentation
- JSDoc för komponenter
- Storybook för komponentdokumentation
- API-dokumentation med Swagger
- Användarguide

## 6. Deployment och DevOps

### 6.1 CI/CD
- GitHub Actions för automatisering
- Automatisk testning
- Automatisk deployment
- Miljöhantering

### 6.2 Monitoring
- Error tracking med Sentry
- Prestandamonitoring med Vercel Analytics
- Loggning med LogRocket
- Uptime monitoring

## 7. Säkerhet

### 7.1 Autentisering och Auktorisering
- JWT för autentisering
- Role-based access control
- API-säkerhet
- Data-kryptering

### 7.2 Dataskydd
- GDPR-efterlevnad
- Databackup
- Återställningsplan
- Säkerhetsgranskning

## 8. Underhåll och Uppdateringar

### 8.1 Regelbundet Underhåll
- Säkerhetsuppdateringar
- Prestandaoptimering
- Bugfixar
- Dokumentationsuppdateringar

### 8.2 Nya Funktioner
- Användarfeedback
- Marknadsanalys
- Konkurrentanalys
- Funktionell roadmap 

## 9. Framsteg och Milstolpar

### 9.1 Uppnådda Milstolpar ([Dagens Datum])

#### 9.1.1 Teknisk Infrastruktur
- ✅ Grundläggande applikationsstruktur med Next.js 14.2.3 (App Router) implementerad
- ✅ Zustand för state management på klientsidan implementerat (`currentProjectStore`)
- ✅ Datamodell med Prisma definierad
- ✅ Shadcn/UI-komponenter integrerade för konsekvent design
- ✅ Utvecklingsmiljö stabiliserad (workaround med `build` + `start`)
- ✅ Refaktorering av kodstruktur (komponenter, typer, utils) till stor del genomförd

#### 9.1.2 Grundläggande Funktionalitet
- ✅ Projektöversikt (Dashboard) med dynamisk lista och diagram
- ✅ Projektdetaljsida (`/gantt/[id]`) med flikstruktur, hämtar data server-side
- ✅ Grundläggande Gantt-diagram med dragbara uppgiftsstaplar (positionering löst)
- ✅ Projektnavigering (byte mellan projekt) fungerar
- ✅ Dialoger för att lägga till uppgifter (initial version)
- ✅ Förberedelser för "Material i Gantt" (Prisma Client, Server Action)

#### 9.1.3 Lösta Tekniska Utmaningar
- ✅ Datumhantering med stöd för både string och Date typer (initialt löst)
- ✅ Bibliotekskonflikter (date-fns) lösta genom versionshantering
- ✅ Kritiska renderingsproblem i Gantt-vy lösta
- ✅ Kritiska problem med projektnavigering lösta
- ✅ Runtime-fel ("Maximum update depth", "Prisma client in browser") lösta genom refaktorering

### 9.2 Pågående Arbete ([Dagens Datum])

- **Fokus:** Slutföra "Material i Gantt", fortsatt API/DB-integration, påbörja Resurshantering.
- 🔄 **Material i Gantt:** Implementera visualisering i `GanttChart`/`TaskArea`.
- 🔄 **API/DB Integration (Fas D):** Implementera återstående API-endpoints (CRUD för faser, resurser, beroenden etc.) och integrera UI.
- 🔄 **Resurshantering (Fas C):** Påbörja implementation av resursprofiler, tilldelning, kostnader, histogram.

### 9.3 Kommande Milstolpar (Q2 2025 / Reviderad)

#### 9.3.1 Planerade Funktioner
- ⏳ **Material i Gantt:** Slutföra visualisering (Q2)
- ⏳ **Fullständig API/DB Integration:** (Q2)
- ⏳ **Resurshantering:** Grundläggande funktioner (Q2)
- ⏳ Kostnadsuppföljning och budgetvisualiseringar (Q2/Q3)
- ⏳ Rapportgenerering och dashboards (Q3)
- ⏳ Kvalitet och Säkerhet (Q3)

#### 9.3.2 Tekniska Förbättringar
- ⏳ Prestandaoptimering och virtualisering (fortsatt)
- ⏳ Fullständig test suite med enhetstester och E2E-tester (Q3)
- ⏳ Förbättrad accessibility och tangentbordsnavigation (Q3)
- ⏳ Robust scrollningslösning för Gantt (Q2/Q3)
- ⏳ Åtgärda byggfel (import i Server Component) (Omedelbart)
- ⏳ Åtgärda Linter-varningar (Q2/Q3)

### 9.4 Feedback och Justeringar

Baserat på initial användarfeedback (April 2025) har följande justeringar prioriterats och delvis genomförts:
1. Förbättrad uppgiftshantering med mer robust validering (Pågående)
2. Tydligare navigering mellan olika vyer (✅ Delvis löst med projektnavigering)
3. Bättre stöd för datumhantering och validering (✅ Delvis löst)
4. Mer konsekvent design av knappar och kontroller (✅ Pågående via Shadcn/UI)

Nästa användarfeedbackrunda är planerad till slutet av maj 2025, med fokus på resurs- och materialhantering. 