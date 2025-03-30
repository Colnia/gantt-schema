# Gantt Schema - Utvecklingsplan

Detta dokument beskriver den planerade vidareutvecklingen av Gantt-schema-applikationen, baserat på den ursprungliga visionen och identifierade förbättringsområden.

## Övergripande Mål

Att skapa ett avancerat och funktionsrikt projekthanteringsverktyg med fokus på visualisering, planering, interaktivitet och dataintegritet.

## Utvecklingsfaser

### Fas A: Förbättra Kärnfunktionalitet & Hierarki

Mål: Implementera grundläggande hierarkisk visning och förbättra feedback.

1.  **Expandera/Kollapsa Faser (Huvudfunktion 2):**
    *   **`TaskList.tsx`:**
        *   Inför state `collapsedPhases: Set<string>`.
        *   Modifiera `RowComponent`: Visa chevron-ikon för faser (`task.isPhase`), anropa `togglePhaseCollapse(phaseId)` vid klick, använd `padding-left` för indragning.
        *   Implementera filtrering av `tasks` för `FixedSizeList` baserat på `collapsedPhases` (rekursiv hjälpfunktion behövs).
        *   Uppdatera `itemCount` och `itemData` för `FixedSizeList`.
    *   **(Valfritt) `ProjectContext.tsx`:** Spara `collapsedPhases`-tillstånd.

2.  **Automatisk Framstegsberäkning (Huvudfunktion 2, README):**
    *   **`ProjectContext.tsx`:** Använd `calculatePhaseProgress`/`calculateProjectProgress` från `task-utils` i `updateTask`/`addTask`/`deleteTask` för att uppdatera `progress`-fält på faser/projekt.
    *   **`TaskBar.tsx` / `TaskList.tsx`:** Visa progress visuellt (t.ex. ifylld stapel, procenttal).

3.  **Förbättrad Drag & Drop Visuell Feedback (Huvudfunktion 6):**
    *   **`TaskBar.tsx`:** Använd `draggingTask` från `InteractionContext` för att applicera stil (t.ex. `opacity-50`) på den dragna stapeln.
    *   **(Avancerat):** Implementera egen "drag preview" med `e.dataTransfer.setDragImage`.

### Fas B: Kärnfunktioner för Planering

Mål: Lägga till avancerade planeringsverktyg.

4.  **Kritisk Linje (Ny Funktion 1):**
    *   **`utils/critical-path-utils.ts`:** Implementera algoritm (PERT-liknande) för att identifiera kritisk linje baserat på uppgifter och beroenden (inkl. olika typer).
    *   **`ProjectContext.tsx` / `UIContext.tsx`:** Spara resultat (lista med kritiska uppgifts-ID:n).
    *   **`GanttChart.tsx`:** Hämta kritiska ID:n.
    *   **`TaskBar.tsx`:** Applicera visuell stil på kritiska uppgifter.
    *   **`DependencyLine.tsx`:** Applicera visuell stil på kritiska beroenden.

5.  **Baslinjer (Ny Funktion 3):**
    *   **Datamodell/Prisma:** Lägg till `Baseline` och `BaselineTask`-modeller.
    *   **Backend/API:** Endpoints för att skapa/hämta baslinjer.
    *   **`UIContext.tsx`:** State för `selectedBaselineId` och `showBaseline`.
    *   **`GanttChart.tsx` / `Timeline.tsx`:** Hämta och rendera baslinjedata som "spökstaplar"/indikatorer.
    *   **`GanttToolbar.tsx`:** UI för att välja/visa/dölja baslinjer.

6.  **Avancerade Beroenden (Lead/Lag) (Ny Funktion 6):**
    *   **Datamodell/Prisma/Types:** Lägg till `offsetDays: number` i `Dependency`.
    *   **Dialoger/UI:** Inputfält för offset.
    *   **`dependency-utils.ts` (`getDependencyCoordinates`):** Justera X-koordinater baserat på offset.
    *   **`critical-path-utils.ts`:** Uppdatera algoritm för att hantera offset.

### Fas C: Resurser och Kostnader

Mål: Lägga till funktionalitet för resurs- och kostnadshantering.

7.  **Resurshantering (Huvudfunktion 4, README):**
    *   **Dialoger/UI:** Skapa/redigera resurser, tilldela resurser till uppgifter (uppdatera `task.resources`).
    *   **`TaskBar.tsx`:** Visa tilldelade resurser (initialer/avatarer) när `showResources` är aktivt.
    *   **(Avancerat - Resursutjämning - Ny Funktion 2):** Separat vy/verktyg för att visualisera resursbelastning och identifiera konflikter.

8.  **Kostnadshantering (Ny Funktion 4):**
    *   **Datamodell/Prisma/Types:** Lägg till kostnadsfält (`hourlyRate`, `fixedCost`).
    *   **Dialoger/UI:** Inputfält för kostnader.
    *   **Utils/Context:** Funktioner för att beräkna kostnader.
    *   **UI:** Visa kostnadsinformation.

### Fas D: Integration och Slutförande

Mål: Integrera med databas och färdigställa applikationen.

9.  **Prisma/Databasintegration (README, PRISMA-INTEGRATION.md):**
    *   Implementera Prisma-schema (`schema.prisma`).
    *   Skapa API-routes/Server Actions för CRUD-operationer.
    *   Byt ut lokal state i kontexter mot datahämtning/mutering via API (använd SWR/React Query).

10. **Förbättrad Rapportering & Dashboard (Ny Funktion 8):**
    *   Skapa nya sidor/komponenter.
    *   Visualisera data med diagrambibliotek (t.ex. `recharts`).

11. **Portföljhantering (Ny Funktion 10):**
    *   Skapa vy (`/portfolio`) för översikt över flera projekt.

12. **Tillgänglighet & Finputsning (Fas 6):**
    *   Slutför tangentbordsnavigering (tidslinje).
    *   Genomgång och komplettering av ARIA-attribut.
    *   Generell UI-polish och buggfixar.

13. **Övrigt:**
    *   Implementera dynamisk höjd för `TaskList` (ta bort hårdkodad `height={600}`).
    *   Implementera robust Ångra/Gör om.
    *   Fortsätt skriva tester (enhet och komponent).
    *   Åtgärda eventuella säkerhetssårbarheter (`npm audit`). 