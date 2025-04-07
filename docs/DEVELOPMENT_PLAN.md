# Development Plan för Gantt-schema

## Övergripande Mål

1. **Avancerad Visualisering**: Skapa ett interaktivt Gantt-schema som visualiserar projektplaner, beroenden, resurser och framsteg.

2. **Planering och Spårning**: Tillhandahålla verktyg för att skapa, redigera och övervaka projektplaner, deluppgifter och milstolpar.

3. **Interaktivitet**: Möjliggöra drag-och-släpp, zoom, filtrering och gruppering för att underlätta interaktion med schemat.

4. **Dataintegritet**: Säkerställa att alla ändringar valideras och upprätthåller projektets logiska integritet (t.ex. beroendeförhållanden).

## Utvecklingsfaser

### Fas A: Kärfunktionalitet (Gantt-schema och Grundfunktioner)

- [x] A1: Implementera grundläggande Gantt-schemalayout med tidslinje och uppgiftslista
- [x] A2: Lägg till funktionalitet för att skapa och redigera enkla uppgifter
- [x] A3: Implementera drag-och-släpp-funktionalitet för att ändra uppgiftens start- och slutdatum
- [x] A4: Lägg till zooma-in/ut-funktionalitet för tidslinjen
- [x] A5: Implementera grundläggande validering av uppgiftsändringar

### Fas B: Avancerade Planeringsverktyg

- [x] B1: Lägg till stöd för att hantera beroenden mellan uppgifter
- [x] B2: Implementera PERT/CPM för kritisk väg och slacktidsberäkningar
- [x] B3: Lägg till baslinjehantering för spårning av avvikelser
- [x] B4: Skapa funktionalitet för faser/gruppering med vikning av uppgifter
- [x] B5: Lägg till mallar för vanliga projekttyper

### Fas C: Resurs- och Kostnadshantering

- [x] C1: Implementera resurstilldelning till uppgifter
- [ ] C2: Lägg till resursprofiler med kapacitet och kostnader
- [ ] C3: Skapa resurshistogram för visualisering av resursanvändning
- [ ] C4: Implementera kostnadsberäkningar baserat på arbete och material
- [ ] C5: Lägg till prognosverktyg för kostnadsestimering

### Fas D: Integration med Databas och API

- [x] D1: Design av backend-datamodell för projekt och uppgifter
- [ ] D2: Implementera API-endpoints för CRUD-operationer
- [ ] D3: Skapa synkroniseringsfunktionalitet mellan frontend och backend
- [ ] D4: Lägg till realtidsuppdateringar med WebSockets
- [ ] D5: Implementera versionshantering av projektplaner

## Kompletterande Förbättringar (April 4, 2025)

### Förbättringar av bibliotekskompatibilitet
- [x] Uppdaterat date-fns till version 2.30.0 för kompatibilitet med Next.js
- [x] Korrigerat importvägar för Mantine v7-komponenter
- [x] Konsoliderat duplicerad CSS i globala stilar
- [x] Fixat inkompatibiliteter mellan React-draggable och React 18

### Förbättringar av vyhantering
- [x] Förbättrat cachening av vyer för minskad serverbelastning
- [x] Implementerat Context API för delning av vizualisationsstaten
- [x] Lagt till minnesfunktion för användarens senaste vyinställningar
- [x] Optimerad rendering för större dataset genom virtualisering

### Förbättringar av datahantering
- [x] Förfinat validering av uppgiftsberoenden för att förhindra cirkulära referenser
- [x] Förbättrat datumhantering för bättre prestanda med större datamängder
- [x] Lagt till bulk-operationer för massuppdateringar
- [x] Implementerat unikhet för IDs med bättre algoritm

### Bugfixar
- [x] Löst problem med fel i datumberäkningar vid månadsskiften
- [x] Fixat prestanda-regression vid många uppgiftsberoenden
- [x] Åtgärdat renderingsbugg i Chrome som orsakade visuella artefakter

## Nästa Iteration

**Obs**: Utvecklingen är för närvarande blockerad på grund av ihållande byggfel. Följande åtgärder bör prioriteras:

- **Rensa Miljön:** Ta bort node_modules och .next-mapparna för att säkerställa en ren installation.
- **Uppdatera Beroenden:** Kontrollera package.json för inkompatibla versioner, särskilt date-fns.
- [x] **Verifiera Miljön:** Försöka starta utvecklingsservern och eventuellt köra en produktionsbyggnad (`npm run build`) för att se om felen är lösta.
- **Prioritet:** Högsta prioritet är att lösa dessa blockerande miljöproblem innan någon refaktorering eller nyutveckling kan återupptas.

## Genomförda förbättringar (April 10, 2025)

### Kritiska bugfixar
- [x] Åtgärdat TypeError vid lägga till uppgifter genom att korrigera argumentordningen i `addTask`-anrop
- [x] Fixat felhanteringen i `addTask` med typvalidering och try/catch-block
- [x] Löst Next.js routing-fel genom att göra `GanttPage` till en async-funktion
- [x] Förbättrat `AddTaskDialog` med korrekt uppgiftsobjektstruktur
- [x] Säkerställt att validering av alla nödvändiga fält för uppgifter sker innan de läggs till

### Miljöförbättringar
- [x] Löst byggrelaterade problem genom aggressiv rensning av miljön
- [x] Uppdaterat date-fns till version 2.30.0 för att lösa importfel
- [x] Standardiserat projektstruktur för konsekvent kodorganisation
- [x] Förbättrat felrapportering med mer detaljerade felmeddelanden

### Funktionella förbättringar
- [x] Implementerat expandera/kollapsa för projektfaser med visuell indikering
- [x] Lagt till automatisk beräkning av framsteg baserat på underuppgifter
- [x] Förbättrat visuell feedback för drag-and-drop-operationer
- [x] Integrerat färgkodning för olika uppgiftsstatustyper

## Nuvarande iteration (April 10-17, 2025)

Nu när de kritiska felen är åtgärdade och utvecklingsmiljön är stabil, fokuserar vi på att förbättra användarupplevelsen och implementera avancerade funktioner:

### Primära mål
1. **Kritisk linje-visualisering**
   - Implementera algoritm för att identifiera kritiska uppgifter
   - Designa visuell indikator för kritiska uppgifter i schemat
   - Skapa verktygstipsinfo med slacktid och påverkan

2. **Baslinjehantering**
   - Implementera funktion för att spara aktuell plan som baslinje
   - Designa visuell representation av avvikelser från baslinjen
   - Skapa rapportfunktionalitet för att visa viktiga avvikelser

3. **Avancerade beroenden**
   - Lägga till stöd för lead/lag-tid mellan beroende uppgifter
   - Implementera olika beroendetyper (FS, SS, FF, SF)
   - Förbättra validering för att förhindra ogiltig beroendelogik

### Sekundära mål
- Färdigställa färglegend-komponenten för uppgiftsstatus
- Förbättra månadsvisning med tydligare separatorer
- Implementera veckonumrering och veckodagsvisning
- Optimera prestandan för drag-and-drop med större dataset

### Tidslinje
- **Dag 1-2**: Design och implementering av kritisk linje-algoritm
- **Dag 3-4**: Utveckling av baslinjehantering och visualisering
- **Dag 5-6**: Implementering av avancerade beroendefunktioner
- **Dag 7**: Konsolidering, testning och buggfixar

### Måttstock för framgång
- Alla kritiska funktioner implementerade och testade
- Inga nya buggar introducerade
- Fulla kravspecifikationer mötta för varje funktion
- Positiv användarfeedback på prototypen

## Senaste uppdateringar

### Datum: 2025-04-12

#### API-utveckling och Databasintegration
Dagens arbete fokuserade på att bygga API-endpoints för projektet och uppdatera UI-komponenter för att använda databasintegration istället för lokal lagring:

- **Implementerade API-endpoints**:
  - ✅ Skapade endpoint för hämtning av uppgifter (`GET /api/projects/[id]/tasks`) med inkludering av beroenden, resurser och underuppgifter
  - ✅ Byggde endpoint för skapande av nya uppgifter (`POST /api/projects/[id]/tasks`) med stöd för relationer och validering
  - ✅ Implementerade robust felhantering med lämpliga statuskoder och informativa felmeddelanden

- **Databasintegration**:
  - ✅ Konverterade `CreateProjectDialog` från lokal lagring till databasdriven arkitektur
  - ✅ Uppdaterade UX med laddningstillstånd och felhantering i formulär
  - ✅ Säkerställde att data valideras både på klient- och serversidan

- **Bugfixar**:
  - ✅ Löste problem med dynamiska rutter i Next.js 15 genom korrekt hantering av params
  - ✅ Åtgärdade UI-problem med dialogvisning för "Nytt projekt"
  - ✅ Förbättrade användarsäkerheten genom att hantera typfel i komponenterna

- **Fas D: Integration med Databas och API (påbörjad)**:
  - ✅ D1: Design av backend-datamodell för projekt och uppgifter (avslutad)
  - ✅ D2: Implementera API-endpoints för CRUD-operationer (pågående, 40% färdigt)
  - ⏳ D3: Skapa synkroniseringsfunktionalitet mellan frontend och backend (planerad)
  - ⏳ D4: Lägg till realtidsuppdateringar med WebSockets (planerad)
  - ⏳ D5: Implementera versionshantering av projektplaner (planerad)

#### Nästa Steg (2025-04-13 och framåt)
1. Slutföra API-endpoints för faser, resurser och beroenden
2. Uppdatera befintliga UI-komponenter för att använda API-data
3. Implementera fullständig synkronisering mellan frontend och backend
4. Förbättra felhantering och återhämtning från nätverksproblem 

### Datum: 2025-04-18

#### Resurser och Datumhantering
Dagens arbete fokuserade på att förbättra datumhantering i formulär och lösa renderingsproblem i Gantt-vyn:

- **Problem med datumhantering**:
  - 🔍 Identifierat problem med datumväljardialogen som inte stängs automatiskt efter att ett datum har valts
  - 🔧 Försökt åtgärda genom att ersätta `document.body.click()` med en mer robust metod som använder `MouseEvent`
  - ⚠️ Problemet kvarstår delvis - datumväljaren stängs med ytterligare klick men inte direkt efter val

- **Renderingsproblem i Gantt-vyn**:
  - 🔍 Identifierat kritiskt problem där uppgiftsstaplar inte visas i Gantt-schemat
  - 🔧 Analyserat `getTaskPosition` funktionen och identifierat möjliga problem med datumkonvertering
  - 🔧 Implementerat en lösning med `ensureDate` för att säkerställa korrekt formatering av datum
  - ⚠️ Problemet kvarstår trots flera försök - staplar visas fortfarande inte korrekt

- **Linter-felhantering**:
  - 🔍 Identifierat flera linter-fel relaterade till implicit `any`-typer i flera komponenter
  - ⚠️ Befintliga typdeklarationer behöver uppdateras och typescript-konfigurationen behöver ses över

#### Tekniska detaljer

1. **Datumväljarlösning**:
   ```typescript
   // Försök att lösa stängning av datumväljare
   onSelect={(date) => {
     setStartDate(date);
     // Från:
     // document.body.click(); // Trigga klick utanför för att stänga popover
     // Till:
     const closeEvent = new MouseEvent('mousedown', {
       bubbles: true,
       cancelable: true,
       view: window
     });
     document.dispatchEvent(closeEvent);
   }}
   ```

2. **Stapelrenderingslösning**:
   ```typescript
   // Från:
   const left = getTaskLeft(task, dayWidth, viewStartDate);
   const width = getTaskWidth(task, dayWidth, viewStartDate);
   
   // Till:
   const taskStartDate = ensureDate(task.startDate);
   const taskEndDate = ensureDate(task.endDate);
   
   const taskWithDates = {
     ...task,
     startDate: taskStartDate,
     endDate: taskEndDate
   };
   
   const left = getTaskLeft(taskWithDates, dayWidth, viewStartDate);
   const width = getTaskWidth(taskWithDates, dayWidth, viewStartDate);
   ```

#### Fas C: Resurs- och Kostnadshantering (pågående)
- ✅ C1: Implementera resurstilldelning till uppgifter (slutförd)
- 🔄 C2: Lägg till resursprofiler med kapacitet och kostnader (pågående)
- 🔄 C3: Skapa resurshistogram för visualisering av resursanvändning (pågående)
- ⏳ C4: Implementera kostnadsberäkningar baserat på arbete och material (planerad)
- ⏳ C5: Lägg till prognosverktyg för kostnadsestimering (planerad)

#### Nästa steg (2025-04-19 och framåt)
1. **Högsta prioritet**: Lösa problemet med stapelrendering i Gantt-schemat --> ✅ **LÖST**
2. **Andra prioritet**: Åtgärda datumväljarens stängningsproblem
   - Utforska alternativa metoder för att stänga Popover-komponenten
   - Överväg att ersätta nuvarande kalenderlösning med en annan datumväljarkomponent

3. **Typescript och linter-fel**:
   - Systematiskt gå igenom och korrigera implicit `any`-typer i komponenter
   - Förbättra typdeklarationer för event-hanterare och kontextdata

4. **Fortsätt implementering av resurshistogram**:
   - Åtgärda API-integrationsproblem med resursdata
   - Förbättra visualiseringen av resursanvändning 

# Utvecklingsplan för Gantt-Schemaapplikationen

## Mål

Skapa en integrerad lösning för projekthantering som kombinerar Gantt-schema för tidsplanering med ekonomiuppföljning från Projektordning.

## Pågående arbete - April 2025 (Uppdaterad [Dagens Datum])

### Fokus: Färdigställande av Material-i-Gantt & API/DB Integration

#### Uppgift: Förbättra Dashboard (Projektöversikt)
- **Status**: Till stor del genomförd (✅ Tabell, ✅ Diagram)
- **Prioritet**: Låg (just nu)
- **Ansvarig**: Utvecklingsteamet
- **Beskrivning**:
  - ✅ Ersatt statiska kort med dynamisk, sorterbar `ProjectListTable`.
  - ✅ Implementerat interaktiva diagram (Recharts) för Status & Budget.
  - ✅ Löst diverse linter-fel och problem med `progress`-fältet.
  - ⏳ Göra översiktskorten ("Aktiva projekt" etc.) klickbara för filtrering (senare).
  - ⏳ Implementera filtreringsfunktion för projektlistan (senare).

#### Uppgift: Skapa Struktur för Projektdetaljsida (`app/gantt/[id]/page.tsx`)
- **Status**: Genomförd (och Refaktorerad till Server Component)
- **Prioritet**: Hög
- **Ansvarig**: Utvecklingsteamet
- **Beskrivning**:
  - ✅ Refaktorerat sidan till Server Component som hämtar data med Prisma.
  - ✅ Introducerat `InitializeProjectStore`-komponent för att hydrera Zustand (`currentProjectStore`) på klienten.
  - ✅ Skapat standardiserad `ProjectHeader`-komponent.
  - ✅ Implementerat flik-navigation (`Tabs`) med platshållare.
  - ✅ Extrakterat Client Components (`ClientProjectOverviewTab`, `ClientProjectTaskList`, `ClientProjectMaterialList`) för delar som behöver client-side state/hooks.

#### Uppgift: Hantera Materialsynlighet i Gantt
- **Status**: Pågående
- **Prioritet**: Hög
- **Ansvarig**: Utvecklingsteamet
- **Beskrivning**:
  - ✅ Lagt till `showOnGantt` i `MaterialDelivery`-modellen (Prisma + Typ).
  - ✅ Uppdaterat Prisma Client (`pnpm prisma generate` körd).
  - ✅ Flyttat `updateMaterialVisibility` till Server Action (`lib/actions/`).
  - ✅ Lagt till (aktiv) checkbox i `ClientProjectMaterialList` som anropar Server Action.
  - 🔄 **Nästa Steg:** Implementera visualisering av material i `GanttChart`/`TaskArea` baserat på `showOnGantt`.

#### Uppgift: Lösa kritiska Gantt-problem (Äldre)
- **Status**: ✅ Löst
- **Prioritet**: Kritisk (tidigare)
- **Ansvarig**: Utvecklingsteamet
- **Beskrivning**:
  - ✅ Positionsberäkning för uppgiftsstaplar korrigerad.
  - ✅ Projektnavigering fungerar.

### Kända Blockerare/Problem ([Dagens Datum])
- **Byggfel:** `app/gantt/[id]/page.tsx` (Server Component) importerar `useEffect`/`useState`/`useRef`. **Åtgärd:** Ta bort importen.
- **Datumväljare:** Popover stängs inte automatiskt (äldre problem).
- **Scrollning:** Temporärt inaktiverad i Gantt (äldre problem).
- **Linter:** Implicit `any`-typer kvarstår.

## Planerat arbete - Nästa Steg

1.  **Åtgärda Byggfel:** Ta bort felaktiga importer i `app/gantt/[id]/page.tsx`.
2.  **Slutföra Material i Gantt:**
    - Implementera visualisering i `GanttChart`/`TaskArea`.
3.  **Fortsatt API/DB Integration:**
    - Implementera återstående API-endpoints (CRUD för faser, resurser, etc.).
    - Integrera UI-komponenter.
4.  **Påbörja Resurshantering (Fas C):**
    - Resursprofiler, tilldelning, kostnader, histogram.
5.  **Övrigt:** Projektredigering, Prognoser, Flikar, Robust Scrollning, Linter.

## Senast uppdaterad: [Dagens Datum] 