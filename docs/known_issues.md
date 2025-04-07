# Kända problem

Detta dokument listar kända problem i Gantt-schemaapplikationen, deras status och planerade lösningar.

## Kritiska problem

## Nyligen Lösta Kritiska Problem

### 1. Uppgiftsstaplar visas på fel position i Gantt-schemat
**Status:** Löst
**Uppdaterad:** 2025-04-20 (Uppdaterad till Löst: [Dagens Datum])

**Påverkade komponenter:**
- components/gantt-chart.tsx
- lib/context/UIContext.tsx
- lib/utils/date-utils.ts

**Beskrivning:**
Uppgiftsstaplar (TaskBar) visades på felaktiga positioner i Gantt-schemat, speciellt vid zoom och panorering av tidslinjen. Även om uppgiftens start- och slutdatum var korrekta, förskjöts den visuella positionen relativt till tidslinjerubrikerna.

**Implementerad lösning:**
(Beskrivning av lösningen bör läggas till här om den är känd)
- Införde `normalizeDate`-funktion för att konsekvent hantera datum utan tidsinformation.
- Ersatte tidigare beräkningar i `getTaskPosition` med index-baserad positionering via `findDateIndexes` och den genererade `dates`-arrayen. Syftet är att säkerställa att samma datum alltid motsvarar samma index/pixelposition relativt till tidslinjens start.
- Åtgärdade `ReferenceError` för `viewStartDate` som tidigare hindrade rendering.
- Förbättrad layout med användaranpassningsbar gränssnitt genom draggbar skiljelinje mellan vänster- och högerpanel.
- (Ytterligare åtgärder som ledde till lösningen...)

### 2. Endast ett projekt visas
**Status:** Löst
**Uppdaterad:** 2025-04-20 (Uppdaterad till Löst: [Dagens Datum])

**Påverkade komponenter:**
- components/gantt-chart.tsx
- lib/context/ProjectContext.tsx
- Troligen sidkomponent/routing (t.ex. `app/gantt/[projectId]/page.tsx`)

**Beskrivning:**
Oavsett vilket projekt användaren valde eller försökte navigera till, visades alltid samma projekt (det första i listan som hämtades från API). Det gick inte att byta aktivt projekt.

**Implementerad lösning:**
(Beskrivning av lösningen bör läggas till här om den är känd)
- Korrigering av hur `projectId`-prop skickades till `GanttChart`.
- Säkerställd korrekt anrop av `setActiveProjectId` i `ProjectContext` från `GanttChart`.
- (Ytterligare åtgärder som ledde till lösningen...)

## UI och UX problem

### 1. Datumväljaren stängs inte automatiskt
**Status:** Delvis löst
**Uppdaterad:** 2025-04-20

**Påverkade komponenter:**  
- components/gantt/dialogs/ActivityDialog.tsx

**Beskrivning:**  
Datumväljaren stängs inte automatiskt efter att ett datum har valts, vilket kräver ett extra klick av användaren.

**Planerad lösning:**  
- Utforska alternativa stängningsmetoder för Popover-komponenten
- Eventuellt byta till annan datumväljarkomponent

### 2. Scrollfunktionalitet i Gantt-schemavy
**Status:** Löst
**Uppdaterad:** 2025-04-20

**Påverkade komponenter:**
- components/gantt-chart.tsx
- components/gantt/GanttTaskTree.tsx

**Beskrivning:**
Scrollfunktionaliteten i Gantt-schemavyn var problematisk. Scrollning kunde leda till att vissa delar av gränssnittet inte syntes korrekt.

**Implementerad lösning:**
- Scrollning har temporärt inaktiverats genom att ändra `overflow-y-auto` och `overflow-x-auto` till `overflow-hidden` i relevanta komponenter.
- En mer robust scrollningslösning kommer att implementeras i framtiden.

### 3. Procentvisning i uppgiftslistan
**Status:** Löst
**Uppdaterad:** 2025-04-20

**Påverkade komponenter:**
- components/gantt/GanttTaskTree.tsx

**Beskrivning:**
Procentvisningen för uppgifter och faser var tidigare svårläst och ibland avklippt.

**Implementerad lösning:**
- Förbättrad styling av procentrutor med:
  - Fast minimibredd på 52px
  - Konsekvent högermarginaler (6px) för att förhindra avklippning
  - Färgkodning baserad på framsteg (grå för 0%, blå för pågående, grön för slutförda)
  - Förbättrad kontrast med tydligare text och bakgrundsfärger
  - Centrerad text och bättre padding

### 4. Anpassningsbar layout för Gantt-schema
**Status:** Implementerad
**Uppdaterad:** 2025-04-20

**Påverkade komponenter:**
- components/gantt-chart.tsx

**Beskrivning:**
Det fanns behov av att kunna anpassa layouten efter olika skärmstorlekar och användares behov.

**Implementerad lösning:**
- Draggbar skiljelinje mellan vänster- och högerpanel som användaren kan dra för att justera breddfördelningen
- Default-bredd på 200px för vänstra panelen med minimibredd på 100px
- Stilren grå skiljelinje som blir ljusare vid hover för att indikera att den är klickbar

### 4. Uppgiftsstaplar i Gantt-vyn (Äldre, Hög Prio)
    - **Beskrivning:** Uppgiftsstaplar renderas inte konsekvent eller på rätt position, särskilt vid zoom/panorering.
    - **Status:** Löst (Se "Nyligen Lösta Kritiska Problem")
    - **Möjliga orsaker:** Komplexitet i positionsberäkningar (`getTaskPosition`), datumhantering, interaktion med React DnD eller virtualisering.

## Typescript och kodkvalitet

### 1. Implicit `any`-typer i komponenter
**Status:** Delvis löst
**Uppdaterad:** 2025-04-20

**Beskrivning:**  
Flera komponenter har implicit any-typer för parametrar och variabler, vilket resulterar i linter-varningar.

**Delvis implementerade lösningar:**
- Lagt till typning för date och index i map-funktioner
- Uppdaterat funktionssignaturer med explicita parametertyper

**Planerad lösning:**
- Fortsätt granska och åtgärda återstående any-typer
- Implementera tydligare TypeScript-typning för hook-beroenden

### 2. Prestandaproblem vid stora projektplaner
**Status:** Ej analyserat
**Uppdaterad:** 2025-04-20

**Beskrivning:**  
Systemet uppvisar långsamhet vid hantering av större projektplaner.

## API och datahantering

### 1. Inkonsekvens i namngivning av resursallokationer
**Status:** Identifierat
**Uppdaterad:** 2025-04-20

**Påverkade komponenter:**  
- app/api/resources/utilization/route.ts
- app/api/resources/route.ts

**Beskrivning:**  
API-endpoints använder `resourceAssignments` men Prisma-modellen förväntar sig `assignments`.

## Senaste arbetet (April 2025)

### UI-förbättringar
- Implementerat draggbar skiljelinje mellan listvy och Gantt-schema för anpassningsbar layout.
- Förbättrat visningen av procentvärden i uppgiftslistan med bättre färgkodning och layout.
- Temporärt inaktiverat scrollfunktionalitet i väntan på en mer robust lösning.
- Procentrutor visas nu tydligare med fast bredd och konsekvent placering.

### Förbättringar av positionsberäkning & Buggfixar
- Löste kritiskt `ReferenceError` relaterat till `viewStartDate`.
- Refaktorerade positionsberäkning (`getTaskPosition`, `getMilestonePosition`) till att använda index-baserad metod via `findDateIndexes` och `dates`-arrayen.
- Genomförde omfattande kodstädning i `gantt-chart.tsx` för att rätta struktur och scope-problem.
- Korrigerade diverse fel relaterade till props, typkonvertering och funktionsanrop.

### Lösta problem
- Kritiskt `ReferenceError` i `gantt-chart.tsx`.
- Procentvisning i uppgiftslistan är nu tydligare och klipps inte av.
- Användare kan nu anpassa layout genom att dra gränsen mellan vänster- och högerpanel.

### Identifierade problem
- Fortsatta problem med felaktig positionering av uppgiftsstaplar vid zoom/panorering.
- Problem med att endast det första projektet visas (navigering/aktivt projekt-hantering).

## Kommande förbättringar

1. **Lösa återstående uppgiftspositionsproblem** - Fortsatt analys av `UIContext`, `GanttChart` och datumhantering.
2. **Lösa problem med projektnavigering** - Analys av routing, props och `ProjectContext`.
3. **Implementera robust scrollningslösning** - Efter temporärt inaktiverad scrollning.
4. **Förbättrat mobilstöd** - Responsiv design för alla komponenter.
5. **Förbättrad exportfunktionalitet** - Export till PDF, Excel, etc.
6. **Optimerad datahantering** - Implementera batch-operationer och caching.

## Senaste uppdatering: 2025-04-20 

## Aktuella Blockerare / Hög Prioritet

1.  **Prisma Client behöver uppdateras (2025-04-06)**
    - **Beskrivning:** Efter att fältet `showOnGantt` lades till i `MaterialDelivery`-modellen behöver Prisma Client genereras om.
    - **Konsekvens:** Linter-fel uppstår när koden försöker komma åt `materialDelivery.showOnGantt` eftersom Prisma Client inte känner till fältet.
    - **Åtgärd:** Kör `pnpm prisma generate` (eller motsvarande) i terminalen och starta om utvecklingsservern.

2.  **Server Action för Material-synlighet felplacerad (2025-04-06)**
    - **Beskrivning:** Funktionen `updateMaterialVisibility` som ska uppdatera material i databasen är definierad direkt i klientkomponenten `app/gantt/[id]/page.tsx`.
    - **Konsekvens:** Funktionen kan inte köras korrekt som en Server Action från klientkomponentens event handler (`handleCheckboxChange`).
    - **Åtgärd:** Flytta funktionen till en dedikerad fil (t.ex. `lib/actions/materialActions.ts`) och lägg till `'use server';` högst upp i den filen. Importera och anropa sedan den actionen från `ProjectMaterialList`.

3.  **Zustand-modul ej funnen (2025-04-06)**
    - **Beskrivning:** TypeScript/Linter rapporterar "Cannot find module 'zustand'" trots försök till installation.
    - **Konsekvens:** Kan blockera kompilering eller ge runtime-fel.
    - **Åtgärd:** Verifiera att `zustand` är korrekt installerat (`pnpm install zustand`), kontrollera `node_modules`, och starta om TS-servern/utvecklingsservern.

4.  **Uppgiftsstaplar i Gantt-vyn (Äldre, Hög Prio)**
    - **Beskrivning:** Uppgiftsstaplar renderas inte konsekvent eller på rätt position, särskilt vid zoom/panorering.
    - **Status:** Löst (Se "Nyligen Lösta Kritiska Problem")
    - **Möjliga orsaker:** Komplexitet i positionsberäkningar (`getTaskPosition`), datumhantering, interaktion med React DnD eller virtualisering.

## Övriga Kända Problem (Lägre Prioritet / Äldre)

5.  **Projektnavigering (Äldre)**
    - **Beskrivning:** Svårigheter att byta mellan projekt i vissa vyer.
    - **Status:** Löst (Se "Nyligen Lösta Kritiska Problem")

6.  **Datumväljare (Äldre)**
    - **Beskrivning:** Datumväljare i formulär (t.ex. vid skapande av uppgift) stängs inte automatiskt efter val.
    - **Status:** Undersökning pågår.

7.  **Scrollning (Äldre)**
    - **Beskrivning:** Scrollningsfunktionalitet är medvetet inaktiverad i vissa vyer (t.ex. Gantt) i väntan på en mer robust lösning.
    - **Status:** Planerad förbättring.

// ... (Behåll eventuell äldre historik nedanför om det är värdefullt) ... 