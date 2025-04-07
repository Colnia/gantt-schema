# Resurshantering

Detta dokument beskriver resurshanteringsfunktionerna i Gantt-schemaapplikationen, deras implementation och användning.

## Översikt

Resurshanteringen i systemet omfattar följande funktioner:
- Resurstilldelning till uppgifter
- Hantering av resursprofiler med kapacitet och kostnader
- Visualisering av resursanvändning med histogram
- Kontexter för att tillhandahålla resursdata genom applikationen

## Komponenter

### ResourceSelector

`ResourceSelector` är en komponent som används för att visa och välja resurser i en dropdown-lista. Den används huvudsakligen i `ResourceAssignmentDialog` och `TaskDetailsDialog`.

#### Egenskaper:
- Filtrering av tillgängliga resurser
- Visuell indikering av resurstyp (tekniker, utrustning, material)
- Stöd för multiselect eller single-select

#### Användning:
```jsx
<ResourceSelector 
  projectId={projectId}
  selectedResources={selectedResources}
  onChange={handleResourceChange}
  multiSelect={true} 
/>
```

### ResourceAssignmentDialog

Denna dialog hanterar tilldelning av resurser till specifika uppgifter. Den visar tillgängliga resurser, tillåter val av resursenheter (% eller timmar) och visar befintliga tilldelningar.

#### Funktionalitet:
- Lista projektresurser
- Ange tilldelningsenheter per resurs
- Visualisera befintliga tilldelningar
- Validera resurstillgänglighet

#### Integration med `TaskDetailsDialog`:
```jsx
<TaskDetailsDialog>
  {/* ... */}
  <ResourceAssignmentDialog 
    taskId={taskId}
    projectId={projectId}
    taskName={task.name}
    taskStartDate={task.startDate}
    taskEndDate={task.endDate}
  />
  {/* ... */}
</TaskDetailsDialog>
```

### ResourceHistogram

`ResourceHistogram` är en visualiseringskomponent som visar resursanvändning över tid med ett stapeldiagram. Den hjälper projektledare att identifiera överallokerade resurser.

#### Funktioner:
- Visar daglig resursutnyttjande
- Färgkodning för olika nivåer av utnyttjande (normal, hög, överallokerad)
- Interaktiv tidsramsväljare (vecka, månad, kvartal)
- Dynamisk skala baserad på valda resurser

#### Användning:
```jsx
<ResourceHistogram 
  resourceId={selectedResourceId} 
  startDate={startDate}
  endDate={endDate}
/>
```

### ResourceDashboard

`ResourceDashboard` är huvudsidan för resurshantering. Den visar en översikt över alla resurser, deras aktuella allokering och tillgänglighet.

#### Funktioner:
- Lista över alla resurser med typ och status
- Resurshistogram för valda resurser
- Möjlighet att filtrera efter resurstyp och projekt
- Länkar till detaljerade resurssidor

## API Endpoints

### `GET /api/resources`
Hämtar alla tillgängliga resurser i systemet.

### `GET /api/resources/[id]`
Hämtar detaljerad information om en specifik resurs.

### `GET /api/resources/utilization`
Beräknar och returnerar resursutnyttjande över ett specifikt tidsintervall.

**Parametrar:**
- `startDate`: Periodens startdatum (krävs)
- `endDate`: Periodens slutdatum (krävs)
- `resourceId`: Specifik resurs att filtrera (valfri)
- `projectId`: Specifikt projekt att filtrera (valfri)

## Datamodeller

### Resource-modell:
```prisma
model Resource {
  id          String    @id @default(cuid())
  name        String
  type        String    // "technician", "equipment", "material"
  availability Float     // Tillgänglighet i %
  rate        Float?    // Kostnad per timme/enhet
  skills      String[]  // Array av kompetenser
  assignments Assignment[] // Relation till uppgiftstilldelningar
}
```

### Assignment-modell:
```prisma
model Assignment {
  id          String   @id @default(cuid())
  taskId      String
  task        Task     @relation(fields: [taskId], references: [id])
  resourceId  String
  resource    Resource @relation(fields: [resourceId], references: [id])
  units       Float    // Tilldelad % av resurs
  startDate   DateTime?
  endDate     DateTime?
}
```

## Kända problem och begränsningar

1. **API-modellinkonsekvens**: Prisma-modellen använder `assignments` medan flera API-endpoints refererar till `resourceAssignments`.
2. **Kalenderfunktioner**: Beräkning av helger och lediga dagar stöds ännu inte.
3. **Hierarkiska resurser**: Stöd för resursgrupper och team saknas.

## Kommande funktioner

- **Kostnadsberäkning**: Automatisk beräkning av kostnader baserat på resurstilldelning.
- **Resurskapacitetsplanering**: Avancerad prognostisering av resursbehov.
- **Periodvisningshistogram**: Visa resursutnyttjande på veckovis, månadsvis eller kvartalsvis nivå.

## Senaste uppdatering: [Dagens Datum] 