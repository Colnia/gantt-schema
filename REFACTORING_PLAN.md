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
- [  ] Extrahera dialoger och formulär till `components/gantt/dialogs/`

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
- [  ] Implementera project-schema.ts
- [  ] Implementera task-schema.ts
- [  ] Implementera validering vid datahantering

## Fas 4: Testning

### 4.1 Konfigurera testmiljö
- [  ] Lägg till testberoenden (vitest, jsdom, react testing library)
- [  ] Konfigurera testskript i package.json

### 4.2 Implementera enhetstester
- [  ] Tester för utils-funktioner

### 4.3 Implementera komponenttester
- [  ] Tester för huvudkomponenter

## Fas 5: Prestanda

### 5.1 Implementera virtualisering för stora projektlistor
- [  ] Lägg till react-window eller liknande
- [  ] Implementera virtualisering i TaskList

### 5.2 Optimera rendering
- [  ] Implementera React.memo för komponenter
- [  ] Optimera använding av useMemo och useCallback
- [  ] Optimera drag-and-drop operationer

## Fas 6: Tillgänglighet

### 6.1 Förbättra tangentbordstillgänglighet
- [  ] Implementera tangentbordskontroller
- [  ] Lägg till fokushantering

### 6.2 Lägg till ARIA-attribut
- [  ] Uppdatera interaktiva element med korrekt ARIA

## Fas 7: Internationalisering

### 7.1 Implementera i18n-ramverk
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

#### Utmaningar:
- Det finns typdefintionsfel som behöver åtgärdas, men det kräver instalation av npm-paket
- Vissa UI-komponentstilar behöver eventuellt justeras för att matcha den tidigare designen
- Ett envist linterfel kvarstår i gantt-chart.tsx (rad 247) trots försök att åtgärda/tysta det.
- Vissa handlers (resize, drop) behöver ytterligare implementation.
- Dialogkomponenter för redigering saknas. 