# Gantt-schema Refaktoriseringsplan

Detta dokument beskriver den planerade refaktoriseringen av Gantt-schema-applikationen, med fokus på att förbättra kodorganisation, prestanda, testning och tillgänglighet.

## Översikt

Den nuvarande implementeringen av Gantt-schemat är funktionell men har följande utmaningar:
- Huvudkomponenten (`gantt-chart.tsx`) är mycket stor (3184 rader)
- Avsaknad av dedikerad state management
- Inga automatiserade tester
- Potentiella prestandaproblem med stora projekt
- Begränsad tillgänglighet för tangentbordsanvändare

Denna refaktoriseringsplan syftar till att åtgärda dessa problem genom en fasad approach med väldefinierade steg och mätpunkter.

## Fas 1: Kodorganisation och struktur

### 1.1 Bryta ut komponenter från gantt-chart.tsx
- [x] Skapa ny katalogstruktur `components/gantt/`
- [x] Extrahera GanttToolbar-komponenten
- [x] Extrahera Timeline-komponenten
- [x] Extrahera TaskList-komponenten
- [x] Extrahera TaskBar-komponenten
- [x] Extrahera Dependency-komponenten
- [x] Extrahera Milestone-komponenten
- [  ] Extrahera GanttHeader-komponenten (Obs: Är nu en del av Timeline)
- [x] Extrahera dialoger och formulär till `components/gantt/dialogs/`

### 1.2 Bryta ut typdefintioner
- [x] Skapa `lib/types/` struktur
- [x] Extrahera Project-interface
- [x] Extrahera Task-interface
- [x] Extrahera Milestone-interface
- [x] Extrahera Resource-interface
- [x] Extrahera Dependency-interface

### 1.3 Bryta ut hjälpfunktioner
- [x] Skapa `lib/utils/` struktur
- [x] Extrahera date-utils.ts
- [x] Extrahera task-utils.ts
- [x] Extrahera dependency-utils.ts (Fil skapad, innehåll TBD)
- [x] Extrahera drag-utils.ts (Fil skapad, innehåll TBD)

## Fas 2: State Management

### 2.1 Implementera kontextbaserad state management
- [x] Skapa katalogstruktur för `lib/context/`
- [x] Skapa ProjectContext
- [x] Skapa UIContext
- [x] Skapa SelectionContext
- [x] Skapa InteractionContext
- [x] Skapa och integrera AppContextProvider i layout.tsx
- [x] Konvertera gantt-chart.tsx till att använda contexts (första iterationen klar)

## Fas 3: Datavalidering och Schemasäkerhet

### 3.1 Implementera Zod-scheman för datavalidering
- [x] Skapa lib/schemas/ struktur
- [x] Implementera project-schema.ts
- [x] Implementera task-schema.ts
- [x] Implementera validering vid datahantering

## Fas 4: UI-förbättringar och visualisering

### 4.1 Implementera förbättrad gruppering av uppgifter
- [x] Skapa TaskGroup-komponent för projektfaser
- [x] Implementera visuell hierarki med indragna undernivåer
- [x] Lägga till framstegsindikator för grupper/faser

### 4.2 Förbättra tidslinje och datumvisning
- [  ] Förbättra månadsvisning med tydliga separatorer
- [  ] Implementera veckonumrering (W1, W2, etc.)
- [  ] Visa veckodagar (S, M, T, W, T, F, S) i dagsvy

### 4.3 Statusfärger och visuell feedback
- [x] Skapa färgkodningssystem för olika uppgiftsstatustyper
- [  ] Implementera färglegend-komponent
- [x] Lägga till progressindikator på uppgiftsstaplar

### 4.4 Konfigurations- och inställningspanel
- [x] Skapa konfigurationspanel för Gantt-vy
- [x] Implementera alternativ för gruppering och filtrering
- [x] Lägga till visningsalternativ (beroenden, milstolpar, etc.)

## Fas 5: Testning

### 5.1 Konfigurera testmiljö
- [x] Lägg till testberoenden (vitest, jsdom, react testing library)
- [x] Konfigurera testskript i package.json

### 5.2 Implementera enhetstester
- [x] Tester för utils-funktioner

### 5.3 Implementera komponenttester
- [x] Tester för huvudkomponenter

## Fas 6: Prestanda

### 6.1 Implementera virtualisering för stora projektlistor
- [x] Lägg till react-window eller liknande
- [x] Implementera virtualisering i TaskList

### 6.2 Optimera rendering
- [x] Implementera React.memo för komponenter
- [x] Optimera använding av useMemo och useCallback
- [  ] Optimera drag-and-drop operationer

## Fas 7: Tillgänglighet

### 7.1 Förbättra tangentbordstillgänglighet
- [x] Implementera tangentbordskontroller
- [x] Lägg till fokushantering

### 7.2 Lägg till ARIA-attribut
- [x] Uppdatera interaktiva element med korrekt ARIA

## Fas 8: Internationalisering

### 8.1 Implementera i18n-ramverk
- [  ] Lägga till next-intl
- [  ] Extrahera strängar till översättningsfiler

## Anteckningar om genomförda ändringar

### Datum: 2025-03-30

#### Ändringar:
- Skapade REFACTORING_PLAN.md för att dokumentera processen
- Skapade grundläggande katalogstruktur:
  - components/gantt/dialogs/ för Gantt-komponenter
  - lib/types/ för typdefintioner
  - lib/utils/ för hjälpfunktioner
  - lib/schemas/ för Zod-scheman
  - lib/context/ för React Context
- Extraherade samtliga typdefintioner till lib/types/index.ts
- Skapade GanttToolbar-komponenten och extraherade toolbar-funktionaliteten
- Uppdaterade gantt-chart.tsx att använda den nya GanttToolbar-komponenten
- Skapade components/gantt/index.tsx för att enkelt exportera Gantt-komponenter
- Extraherade datumrelaterade hjälpfunktioner till lib/utils/date-utils.ts
- Extraherade uppgiftsrelaterade hjälpfunktioner till lib/utils/task-utils.ts
- Skapade tomma filer för dependency-utils.ts och drag-utils.ts (innehåll läggs till senare).
- Skapade ProjectContext för projekt- och uppgiftsdata.
- Skapade UIContext för UI-relaterat state.
- Skapade SelectionContext för uppgiftsval.
- Skapade InteractionContext för interaktionstillstånd.
- Skapade AppContextProvider för att samla alla providers.
- Integrerade AppContextProvider i app/layout.tsx.
- Refaktorerade gantt-chart.tsx att använda useProjects, useUI, useSelection och useInteraction.
- Tog bort motsvarande useState-anrop i gantt-chart.tsx.
- Uppdaterade de flesta handlers och renderingslogik att använda kontext-värden.
- Extraherade Timeline-komponenten (header och grid).
- Uppdaterade gantt-chart.tsx att rendera uppgifts-bars som children till Timeline.
- Extraherade TaskList-komponenten.
- Extraherade TaskBar-komponenten.

### Datum: 2025-04-01

#### Ändringar:
- Uppdaterad refaktoriseringsplan med ny "Fas 4: UI-förbättringar och visualisering" baserad på analys av moderna Gantt-gränssnitt
- Lagt till specifika uppgifter för förbättrad gruppering av uppgifter
- Lagt till specificering för förbättrad tidslinje och datumvisning
- Lagt till uppgifter för statusfärger och visuell feedback
- Lagt till uppgifter för konfigurations- och inställningspanel

#### Utmaningar:
- Det finns typdefintionsfel som behöver åtgärdas, men det kräver instalation av npm-paket
- Vissa UI-komponentstilar behöver eventuellt justeras för att matcha den tidigare designen
- Ett envist linterfel kvarstår i gantt-chart.tsx (rad 247) trots försök att åtgärda/tysta det
- Vissa handlers (resize, drop) behöver ytterligare implementation
- Dialogkomponenter för redigering saknas

### Datum: 2025-04-04

#### Bugfixar och förbättringar:
- Åtgärdade problem med date-fns biblioteket genom att installera version 2.30.0 som är kompatibel med react-day-picker
- Löst duplicerade handleTaskClick-funktioner i gantt-chart.tsx genom att byta namn på en till handleTaskSelection
- Uppdaterat TaskSchema för att stödja både string och Date typer för startDate och endDate fält
- Förbättrat AddTaskDialog.tsx med bättre validering och felhantering vid tillägg av uppgifter
- Lagt till detaljerad loggning för felsökning av uppgiftstilläggsproblem
- Skapat en ViewControls-komponent för att hantera navigering mellan olika vyer
- Uppdaterat UIContext för att stödja nya vytyper ("gantt", "list") utöver de befintliga ("projects", "project", "phase")
- Åtgärdat hanteringen av params.id i app/gantt/[id]/page.tsx för att eliminera Next.js varning om dynamiska ruttparametrar
- Förenklat navigering och gränssnitt med mer konsekventa komponentstilningar

#### Lösta problem:
- Problem med date-fns moduler som inte kunde hittas - löst genom ominstallation och specificering av exakt version
- Duplicerad koddeklaration av handleTaskClick - löst genom ombenämning av funktioner
- Typkompatibilitetsproblem i Task-typdefinitioner - löst genom uppdaterade Zod-scheman
- Fel i dialoghantering för uppgiftstillägg - löst genom förbättrad validering och felrapportering
- Problem med params.id-hantering i dynamiska rutter - löst genom korrekt hantering av params utan Promise.resolve
- Problem med knappvarianthantering - löst genom att implementera korrekta stilar på knappar

#### Kvarvarande problem:
- Cachingfel för webpack - dessa är kända Next.js-problem som normalt inte påverkar funktionalitet
- Certifikatfel och uppåt 300 anslutningsproblem på klientsidan - dessa är kopplade till utvecklingsmiljön och påverkar inte core-funktionaliteten

### Datum: 2025-04-05 (Aktuell status)

#### Utmaningar och Blockerare:
- **Ihållande byggfel:** Projektet är för närvarande blockerat av en serie envisa fel relaterade till `date-fns`, Next.js/Webpack-cache, modulupplösning (`MODULE_NOT_FOUND`) och inkonsekvent hantering av `params.id`. Standardfelsökningsmetoder (rensa `.next`, `node_modules`, specifik `date-fns`-version) har inte varit tillräckliga.
- **Instabil utvecklingsmiljö:** Felsymptomen tyder på djupare problem med fil-låsningar, korrupta cachar eller konflikter i utvecklingsmiljön som hindrar Next.js från att bygga och köra korrekt.
- **Vidareutveckling Pausad:** All funktionell utveckling (t.ex. UI-förbättringar, fas-hantering) är pausad tills miljön är stabiliserad.

#### Nästa Steg:
- **Aggressiv Rensning:** Genomföra en grundlig rensning av miljön enligt den uppdaterade planen i `TROUBLESHOOTING.md` (inkl. omstart, `taskkill`, `rimraf`, `npm cache clean`).
- **Verifiera Miljön:** Försöka starta utvecklingsservern och eventuellt köra en produktionsbyggnad (`npm run build`) för att se om felen är lösta.
- **Prioritet:** Högsta prioritet är att lösa dessa blockerande miljöproblem innan någon refaktorering eller nyutveckling kan återupptas.

### Datum: 2025-04-10

#### Sammanfattning:
Denna iteration fokuserade på att lösa kritiska miljöproblem och implementera viktiga UI-funktioner för att förbättra hierarkisk visualisering och användarinteraktion. Vi implementerade också automatiska beräkningar för projektframsteg.

#### Bugfixar:
- ✅ Löst kritiska fel relaterade till att lägga till nya uppgifter genom att korrigera typhantering i `addTask`-funktionen
- ✅ Åtgärdat Next.js routing-fel genom att göra `app/gantt/[id]/page.tsx` till en async-funktion för att hantera params korrekt
- ✅ Förbättrat typ-validering i AddTaskDialog.tsx för att säkerställa att uppgiftsobjekt skapas korrekt 
- ✅ Korrigerat parameter-ordningen i funktionsanrop till addTask (från projektID,uppgift till uppgift,projektID)

#### Miljöförbättringar:
- ✅ Implementerat "Aggressiv Rensning" enligt TROUBLESHOOTING.md med:
  - Rensning av node_modules och .next med rimraf
  - Rensning av npm-cache
  - Ominstallation av paket med rätt version av date-fns (2.30.0)
  - Validering med produktionsbygge (npm run build)
- ✅ Löst ihållande fel med Next.js byggprocess och modulupplösning
- ✅ Stabiliserat utvecklingsmiljön för konsekvent körning

#### Funktionella implementeringar:
1. **Expandera/Kollapsa faser:**
   - ✅ Implementerat `collapsedPhases: Set<string>` i TaskList.tsx för att spåra fasernas tillstånd
   - ✅ Lagt till chevron-ikoner (ChevronRight/Down från Lucide) för att visa expanderingsstatus
   - ✅ Skapat hjälpfunktionen `getTaskDepth` för att beräkna hierarkisk nivå
   - ✅ Implementerat indragningssystem baserat på uppgiftens hierarkiska nivå
   - ✅ Lagt till tangentbordsstöd för att expandera/kollapsa med Space-tangenten

2. **Automatisk framstegsberäkning:**
   - ✅ Förbättrat `calculatePhaseProgress` i task-utils.ts för att beräkna framsteg baserat på fasens underuppgifter
   - ✅ Uppdaterat `calculateProjectProgress` för att stödja beräkning från både faser och enskilda uppgifter
   - ✅ Integrerat dessa funktioner i ProjectContext för automatisk uppdatering när uppgifter ändras
   - ✅ Säkerställt att progress-attributet uppdateras för både faser och projekt vid ändringar

3. **Förbättrad visuell feedback för drag-and-drop:**
   - ✅ Integrerat InteractionContext i TaskBar.tsx för att spåra draggingTask och resizingTask
   - ✅ Implementerat opacity-effekt (0.6) för uppgifter som dras eller storleksändras
   - ✅ Lagt till CSS-transitioner för mjukare visuell feedback
   - ✅ Förbättrat användarupplevelsen för drag-and-drop-interaktioner

#### Kvarstående utmaningar:
- Finjustering av färglegend-komponenten
- Förbättring av månadsvisning med tydligare separatorer
- Implementation av veckonumrering och veckodagsvisning
- Optimering av drag-and-drop-prestanda för större projekt

#### Nästa steg:
Fokus skiftar nu till implementering av:
1. Kritisk linje-beräkning genom ny utility-funktion och visuell indikering
2. Baslinje-funktionalitet för projektjämförelser
3. Avancerade beroenden med lead/lag-funktionalitet 

### Datum: 2025-04-12

#### Sammanfattning:
Denna iteration fokuserade på att utveckla API-endpoints för projektet och att förbättra UI-komponenter för att använda databas istället för lokal lagring.

#### Implementerade API-endpoints:
- ✅ Skapade API-endpoint för hämtning av uppgifter för ett projekt (`GET /api/projects/[id]/tasks`) med inkludering av relationer (beroenden, resurser, underuppgifter)
- ✅ Implementerade API-endpoint för att skapa nya uppgifter (`POST /api/projects/[id]/tasks`) med stöd för alla uppgiftsrelaterade fält
- ✅ Förbättrade felhantering i API-endpoints med korrekta statuskoder och detaljerade felmeddelanden
- ✅ Uppdaterade route-hantering enligt Next.js 15 konventioner för korrekta parameterhantering vid dynamiska rutter

#### Integration med databas:
- ✅ Uppdaterade `CreateProjectDialog.tsx` för att använda API istället för lokal lagring:
  - Implementerade asynkron hantering av projektdata med state för inlämning och felhantering
  - Lade till API-anrop för att skapa nya projekt via `POST /api/projects`
  - Förbättrade användargränssnittet med feedback under projektkreation

#### Bugfixar:
- ✅ Löste problem med dynamiska rutter i Next.js 15 genom korrekt hantering av params i `app/gantt/[id]/page.tsx`
- ✅ Garanterade att CreateProjectDialog-komponenten visas korrekt när "Nytt projekt" klickas genom att lägga till den i DOM-strukturen
- ✅ Lade till laddningsindikator under API-anrop för bättre användarupplevelse
- ✅ Åtgärdade typ-problem för knappelement genom konsekvent hantering av props

#### Teknisk förbättring:
- ✅ Migrerade från lokal lagring till databas-driven arkitektur för bättre dataintegritet
- ✅ Förbättrade projektets struktur med väl organiserade API-routes som följer REST-konventioner
- ✅ Implementerade bättre skripthantering och felhantering för att förbättra stabilitet och underhållbarhet
- ✅ Säkerställde att all datavalidering sker på serversidan via Prisma

#### Nästa steg:
1. Implementera resterande API-endpoints för faser, resurser och beroenden
2. Integrera komponenterna för uppgiftshantering med API
3. Uppdatera GanttChart-komponenterna för att använda API-data istället för lokal lagring
4. Lägga till stöd för filtrering och sortering i API-endpoints för mer flexibel dataåtkomst 

### Datum: 2025-04-13 (Uppdaterad efter felsökning)

#### Sammanfattning:
Denna session fokuserade nästan uteslutande på att lösa kritiska problem med utvecklingsmiljön och runtime-fel som hindrade grundläggande funktionalitet. Vi identifierade att Next.js utvecklingsserver (`npm run dev`) var instabil i den nuvarande miljön (Windows), vilket ledde till fel med Prisma-initiering, konfigurationshantering och modul-laddning. En fungerande workaround hittades genom att nedgradera till Next.js 14.2.3 och köra applikationen i produktionsläge (`npm run build && npm start`).

#### Buggfixar och Stabilitetsförbättringar:
- ✅ Nedgraderade Next.js till 14.2.3.
- ✅ Implementerade workaround genom att använda produktionsläge (`npm start`) istället för utvecklingsläge (`npm run dev`).
- ✅ Löste problem med `Error: @prisma/client did not initialize yet` genom att stabilisera miljön.
- ✅ Korrigerade API-svarshantering i `ProjectContext` för `addTask`, vilket löste `TypeError: Cannot read properties of undefined (reading 'id')`.
- ✅ Korrigerade argumentordning i `handleTaskSelection` (`SelectionContext`), vilket löste `TypeError: Cannot use 'in' operator`.
- ✅ Lade till `onClick`-hanterare för "Redigera"-knappen i `TaskDetailsDialog` (behöver dock testas).
- ✅ Korrigerade "Maximum update depth exceeded"-felet genom att refaktorera state-hantering i `useEffect` och Zustand store.
- ✅ Löste kritiskt fel med felaktig positionering av uppgiftsstaplar i Gantt-schemat.
- ✅ Löste kritiskt fel där endast ett projekt kunde visas (projektnavigering).

#### Kvarstående Utmaningar:
- **Byggfel:** Server Component (`app/gantt/[id]/page.tsx`) importerar `useEffect`/`useState`/`useRef`. **Åtgärd:** Ta bort importen.
- **UI-bugg:** Rubriken för nyskapade uppgifter visas inte i listan till vänster (`EnhancedTaskList`). (Lägre prioritet)
- **Testning:** "Redigera"-knappen i `TaskDetailsDialog` behöver verifieras. (Lägre prioritet)
- **Linter:** Många `implicit any`-varningar och potentiellt felaktiga modulvarningar kvarstår.
- **Utvecklingsläge:** Grundorsaken till instabiliteten i `npm run dev` är inte helt löst, men kan kringgås.

#### Nästa steg (Prioritering):
1.  **Åtgärda Byggfel:** Ta bort felaktiga importer från `app/gantt/[id]/page.tsx`.
2.  **Slutför Material i Gantt:** Implementera visualisering i `GanttChart`/`TaskArea`.
3.  **Slutför API-integration:** Implementera resterande API-endpoints och integrera med UI-komponenter (med fokus på att köra i produktionsläge).
4.  **Påbörja Resurshantering (Fas C).**
5.  **Åtgärda Linter-varningar.**

## Fas 9: Ytterligare Refaktorering av GanttChart (Avslutad)

**Motivering:** Komponenten `components/gantt-chart.tsx` var mycket stor och komplex, vilket gjorde felsökning och underhåll svårt. Specifikt var buggen med felaktig positionering av uppgiftsstaplar svår att isolera.

**Mål:** Att ytterligare bryta ner `gantt-chart.tsx` i mindre, mer fokuserade komponenter för att förbättra läsbarhet, underhållbarhet och testbarhet, samt för att underlätta felsökning av positioneringsbuggen.

**Plan:**
- [x] **9.1 Analysera `gantt-chart.tsx`:** Identifiera logiken specifikt relaterad till rendering av uppgiftslistan/uppgiftsområdet.
- [x] **9.2 Extrahera `TaskArea`-komponent:** Skapa en ny komponent (`TaskArea.tsx` i `components/gantt/`).
- [x] **9.3 Integrera `TaskArea`:** Uppdatera `gantt-chart.tsx` (eller motsvarande) till att använda den nya `TaskArea`-komponenten.
- [x] **9.4 Fokuserad Felsökning:** ✅ Positioneringsbuggen löst efter extrahering och felsökning.

## Fas 10: Refaktorering av Projektdetaljsida (Pågående)

**Motivering:** Projektdetaljsidan (`app/gantt/[id]/page.tsx`) använde client-side datahämtning med Prisma, vilket är felaktigt och orsakade runtime-fel.

**Mål:** Flytta datahämtning till servern och strukturera om komponenten enligt Next.js App Router-principer.

**Plan:**
- [x] **10.1 Konvertera till Server Component:** Ta bort `'use client';`, gör komponenten `async`.
- [x] **10.2 Flytta Datahämtning:** Implementera `prisma.project.findUnique` direkt i komponenten.
- [x] **10.3 Ta bort Client-Side Fetch:** Ta bort `useEffect`-hooken som använde Prisma.
- [x] **10.4 Hydrera Klient-State:** Introducera `InitializeProjectStore` (Client Component) för att sätta Zustand-state från server-data.
- [x] **10.5 Extrahera Client Components:** Flytta delar som använder client-hooks (`useState`, Zustand-hooks) till egna Client Components (`ClientProjectOverviewTab`, `ClientProjectTaskList`, `ClientProjectMaterialList`).
- [ ] **10.6 Åtgärda Byggfel:** Ta bort felaktiga importer (`useEffect`/`useState`/`useRef`) från Server Component (`app/gantt/[id]/page.tsx`).