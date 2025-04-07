# Gantt Diagram - Komponenter

Den här katalogen innehåller kärnkomponenterna för Gantt-diagrammet som hanterar rendering, interaktion och datahantering.

## Huvudkomponenter

### TaskBar

`TaskBar.tsx` ansvarar för rendering av uppgiftsstaplar i Gantt-diagrammet med olika visuella representationer baserat på uppgiftstyp.

- Hanterar olika aktivitetstyper (uppgift, fas, milstolpe, leverans, beslutspunkt)
- Implementerar interaktivitet för drag-and-drop och kontextmeny
- Hanterar visuell feedback för val och redigering

#### Kända problem och lösningar

**Problem med stapelrendering**: Uppgiftsstaplar visas ibland inte korrekt i Gantt-schemat. Detta är relaterat till problem med datumhantering och positionsberäkning.

**Försökt lösning**: Modifiering av `getTaskPosition` funktionen för att garantera korrekta Date-objekt:

```typescript
// Ursprunglig implementation
const left = getTaskLeft(task, dayWidth, viewStartDate);
const width = getTaskWidth(task, dayWidth, viewStartDate);

// Förbättrad implementation med säker datumkonvertering
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

**Status**: Problemet kvarstår. Nästa steg innefattar djupare analys av `getTaskLeft`, `getTaskWidth` och datumhantering genom hela kedjan från server till klient.

### Timeline

`Timeline.tsx` hanterar tidslinjen i Gantt-diagrammet.

- Renderar tidslinjerubrik med korrekt intervallvisning (dagar, veckor, månader)
- Hanterar zooma-funktionalitet
- Ger en ram för uppgiftsstaplar

### GanttToolbar

`GanttToolbar.tsx` tillhandahåller kontroller för att interagera med Gantt-diagrammet.

- Knappar för att zooma in/ut
- Alternativ för att visa/dölja beroenden, resurser och milstolpar
- Funktioner för att ändra tidsintervall och vy

### GanttTaskTree

`GanttTaskTree.tsx` visar den hierarkiska strukturen av uppgifter och faser i en trädvy.

- Hanterar expandering/kollapsning av faser
- Synkroniserar val med Gantt-vyn
- Erbjuder alternativa navigeringsmöjligheter

## Nyckeltekniker

### Positionsberäkning

Stapelpositioner (TaskBar) beräknas med följande logik:

1. `getTaskLeft` - Beräknar vänsterposition baserat på startdatum relativt till visningsstart
2. `getTaskWidth` - Beräknar bredd baserat på varaktighet (differens mellan start- och slutdatum)

### Datumkontroll och formatering

För att säkerställa korrekt datumhantering används:

1. `ensureDate` - Hjälpfunktion för att garantera giltiga Date-objekt
2. `formatDate` - Konverterar datum till string-representationer
3. `differenceInDays` - Beräknar datumintervall (från date-fns)

## Senaste uppdateringar (2025-04-18)

### Ändringar och förbättringar
- Förbättrad datumhantering i `getTaskPosition` för att åtgärda stapelrenderingsproblem
- Lagt till debugloggning för att identifiera problem med renderingsprocessen
- Förbättrat lösning för hantering av event i interaktionshanterare

### Kända problem
- **Stapelrendering**: Uppgiftsstaplar visas inte korrekt i Gantt-schemat
- **Typ-deklarationer**: Flera implicit `any`-typer i komponenterna
- **Prestanda**: Långsam rendering vid stora projektplaner

### Planerade förbättringar
- Djupanalys och omskrivning av positionsberäkningslogiken
- Förbättring av typdeklarationer för bättre typsäkerhet
- Prestandaoptimering genom memo och virtualisering
- Förbättrad felsökning med mer detaljerad loggning 