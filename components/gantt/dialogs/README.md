# Gantt Diagram - Dialoger

Den här katalogen innehåller dialogkomponenter relaterade till Gantt-diagrammet. Dessa används för att lägga till, redigera och visa detaljer om uppgifter, faser och resurser.

## Komponenter

### AddTaskDialog

`AddTaskDialog.tsx` hanterar tillägg av nya uppgifter till Gantt-diagrammet. 

- Använder kontext från `ProjectContext` och `InteractionContext`
- Validerar input-data innan uppgiften läggs till
- Hanterar både string och Date typer för datum
- Stöder tillägg av uppgifter till specifika faser baserat på aktuell vy

#### Användning

```jsx
<AddTaskDialog activeProjectId={projectId} />
```

### Edit-dialoger (att implementera)

Framtida dialoger kommer att inkludera:
- TaskDetailDialog - För att visa och redigera uppgiftsdetaljer 
- PhaseDialog - För att hantera projektfaser
- ResourceAssignmentDialog - För att hantera resurstilldelning

## Arkitektur

Alla dialoger följer dessa principer:
1. Använder shadcn/ui komponenter för konsistent design
2. Integrerar med applikationens kontextsystem
3. Implementerar validering via Zod-schema
4. Hanterar data genom kontext-API:er

## Felhantering

Dialogerna implementerar detaljerad felhantering och loggning för att underlätta felsökning i produktion. Problem med inmatning hanteras gracefully genom validering och användarvänliga felmeddelanden. 

## Implementerade dialoger

### ActivityDialog

`ActivityDialog.tsx` är en ny dialog som hanterar skapande och redigering av olika typer av aktiviteter (uppgifter, milstolpar, leveranser, beslutspunkter).

- Stöder olika aktivitetstyper med dynamiskt UI baserat på typ
- Hanterar integration med projektfaser
- Ger användaren möjlighet att sätta färg, prioritet och tidsramar

#### Kända problem och lösningar

**Problem med datumväljare**: Datumväljaren stängs inte automatiskt när ett datum väljs, vilket kräver att användaren manuellt klickar utanför dialogen.

**Försökt lösning**: Implementerat en mer robust lösning genom att ersätta `document.body.click()` med:

```typescript
const closeEvent = new MouseEvent('mousedown', {
  bubbles: true,
  cancelable: true,
  view: window
});
document.dispatchEvent(closeEvent);
```

**Status**: Problemet kvarstår delvis. Datumväljaren kräver fortfarande en extra klickning för att stängas. Planerad lösning inkluderar utvärdering av alternativa datumväljarbibliotek.

### PhaseDialog

`PhaseDialog.tsx` hanterar skapande och redigering av projektfaser.

- Tillåter inställning av start- och slutdatum för faser
- Hanterar koppling till projekt
- Inkluderar statushantering och färgval

### ResourceAssignmentDialog

`ResourceAssignmentDialog.tsx` implementerar resurstilldelning till uppgifter med följande funktionalitet:

- Listning av tillgängliga resurser från projektet
- Tilldelning av enheter (% eller timmar) per resurs
- Validering av resurstillgänglighet
- Visualisering av befintliga tilldelningar

### TaskDetailsDialog

`TaskDetailsDialog.tsx` visar detaljerad information om en uppgift och möjliggör redigering.

- Visar uppgiftsinformation inklusive tider, beskrivning, status
- Integrerar med ResourceAssignmentDialog för resurstilldelning
- Hanterar beroenden mellan uppgifter
- Erbjuder redigeringsmöjligheter för alla uppgiftsfält

## Senaste uppdateringar

### 2025-04-18

- Förbättrat stängningslösningen för datumväljaren i `ActivityDialog.tsx`
- Åtgärdat typfel för event-hantering i flera formulärfält
- Lagt till bättre felhantering för datumformatering

### Kommande förbättringar

- Implementera en mer robust lösning för datumväljardialog
- Förbättra typdeklarationer för event-hanterare
- Lägga till en gemensam bas-dialog för att dela logik mellan olika dialoger
- Integrera förbättrad validering med felmeddelanden nära respektive fält 