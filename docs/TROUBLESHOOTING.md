# Felsökningsguide för Gantt-schemaapplikationen

Detta dokument innehåller lösningar på vanliga problem som kan uppstå vid utveckling eller användning av Gantt-schemaapplikationen.

## Ihållande byggfel (date-fns, cache, MODULE_NOT_FOUND, params.id) (Status: April 2025)

**Problem**: Trots att följa standardlösningarna (rensa `.next`, `node_modules`, installera specifik `date-fns`-version) kvarstår en blandning av följande fel:
- `Failed to read source code from ...\node_modules\date-fns\...` (t.ex. `addDays.js`, `addDays.mjs`, `esm/addDays/index.js`, `constants.js`) med `Det går inte att hitta filen/sökvägen`.
- `Error: Route "/gantt/[id]" used params.id. params should be awaited...` (även för `/project/[id]`), ibland pekande på kod som inte verkar finnas i den aktuella filversionen.
- Diverse `MODULE_NOT_FOUND`-fel för kärnfiler i Next.js (`.next/server/...`), vendor chunks (`next.js`, `@radix-ui.js`), eller projektfiler.
- JSON-parsefel och fel relaterade till `.next\server\pages\_document.js`.
- `[webpack.cache.PackFileCacheStrategy] Caching failed for pack...` (både `ENOENT` och `EPERM`).
- `unhandledRejection: [Error: ENOENT: no such file or directory, stat ...\.next\cache\webpack\client-development\*.pack.gz]`
- Timeout vid försök att läsa filer via externa verktyg.

**Förklaring**: Denna kombination av fel tyder på ett djupt liggande problem med utvecklingsmiljön, byggcachen eller låsta filer som standardrensningarna inte löser. Next.js byggprocess verkar använda gamla/korrupta filer.

**Lösning: Aggressiv Rensning och Miljöstabilisering**

1.  **Stäng allt:**
    *   Stoppa Next.js utvecklingsserver (`Ctrl+C`).
    *   Stäng IDE:n (Cursor) och alla andra program som kan tänkas använda projektfilerna (t.ex. andra kodredigerare, filutforskare).
    *   Starta om datorn (rekommenderas starkt för att frigöra alla fil-lås).

2.  **Döda processer (efter omstart, i en *ny* terminal):**
    ```bash
    # På Windows:
    taskkill /F /IM node.exe
    ```

3.  **Rensa allt (i samma terminal):**
    ```bash
    # Använd rimraf för mer robust borttagning
    rimraf node_modules
    rimraf .next
    # Ta bort lock-filen manuellt om rimraf missar den
    del package-lock.json 2> nul || echo "package-lock.json not found"
    # Rensa npm-cachen
    npm cache clean --force
    ```

4.  **Installera om paketen:**
    ```bash
    # Grundläggande installation
    npm install --legacy-peer-deps
    # Specifik date-fns version
    npm install date-fns@2.30.0
    ```

5.  **Verifiera installationen:**
    *   Kontrollera manuellt att `node_modules/date-fns` finns och innehåller filer som `addDays.js`.

6.  **(Valfritt men rekommenderat) Testa en produktionsbyggnad:**
    ```bash
    npm run build
    ```
    *Se om bygget slutförs utan fel. Detta kan fånga upp problem som `dev`-läget missar.*

7.  **Starta utvecklingsservern:**
    ```bash
    npm run dev
    ```
    *Håll utkik efter återkommande fel.*

**Om problemen kvarstår:**
- Kontrollera `next.config.mjs` för ovanliga inställningar.
- Överväg att temporärt inaktivera antivirusprogram.
- Granska Git-historiken för att se om felaktig kod har introducerats och återställts felaktigt.

## Paketberoenden

### date-fns problem (Se även "Ihållande byggfel" ovan)

**Problem**: Saknade date-fns moduler eller kompileringsfel relaterade till date-fns.
```
Error: Failed to read source code from C:\\Users\\...\\node_modules\\date-fns\\addDays.js
Caused by: Det går inte att hitta filen. (os error 2)
```

**Standardlösning (prova först Aggressiv Rensning ovan):** Installera om date-fns med specifik version som är kompatibel med react-day-picker:

```bash
# Rensa bort tidigare installationer (använd rimraf om rm/del misslyckas)
rimraf node_modules
del package-lock.json 2> nul || echo "package-lock.json not found"
rimraf .next

# Installera paket med legacy peer dependencies flaggan
npm install --legacy-peer-deps

# Installera exakt version av date-fns som är kompatibel med react-day-picker
npm install date-fns@2.30.0
```

**Förklaring**: Applikationen använder både date-fns direkt och via react-day-picker. React-day-picker kan ha beroendekonflikter med nyare `date-fns`-versioner. Version 2.30.0 har visat sig fungera tidigare.

### Next.js cache problem (Se även "Ihållande byggfel" ovan)

**Problem**: webpack cache-fel som följande:
```
[webpack.cache.PackFileCacheStrategy] Caching failed for pack: Error: ENOENT: no such file or directory...
[webpack.cache.PackFileCacheStrategy] Caching failed for pack: Error: EPERM: operation not permitted...
```

**Standardlösning (prova först Aggressiv Rensning ovan)**: Rensa Next.js cache:

```bash
# Ta bort cache-mappen (använd rimraf för mer robust borttagning)
rimraf .next

# Starta om utvecklingsservern
npm run dev
```

**Förklaring**: Ibland kan webpack-cachen bli korrupt. Att rensa cachen löser oftast problemet, men om filerna är låsta kan `rimraf` behövas.

## Kompileringsfel

### Duplicerade funktionsdeklarationer

**Problem**: Duplicerade funktionsdeklarationer i komponenter, t.ex. duplicerad `handleTaskClick`:
```
Module parse failed: Identifier 'handleTaskClick' has already been declared
```

**Lösning**: Byt namn på en av funktionerna för att undvika namn-kollision. Kontrollera filen manuellt (t.ex. `components/gantt-chart.tsx` runt rad 431) för att säkerställa att det bara finns en definition.

```tsx
// Säkerställ att det bara finns EN av dessa eller att de har olika namn:
const handleTaskClick = useCallback((taskId, e) => { ... });

// Om en andra behövs, byt namn:
const handleTaskSelection = useCallback((taskId, e) => { ... });
```

### Next.js dynamiska ruttparametrar (Se även "Ihållande byggfel" ovan)

**Problem**: Varning eller fel om felaktig användning av dynamiska ruttparametrar:
```
Error: Route "/gantt/[id]" used `params.id`. `params` should be awaited before using its properties.
```
**Notera:** Felet kan dyka upp även om koden *ser* korrekt ut, vilket indikerar cache-problem (se Ihållande byggfel).

**Lösning**: Säkerställ att params används direkt i Next.js App Router-komponenter (inte Pages Router) utan `async`/`await` på själva sidkomponenten om det inte behövs för annat, och utan `Promise.resolve`:

```tsx
// Korrekt för App Router (utan async om inte inte annat kräver det):
export default function GanttPage({ params }: { params: { id: string } }) {
  const id = params.id; // Använd direkt
  // ...
}

// Fel (ofta från äldre kod eller missförstånd):
// export default async function GanttPage({ params }: { params: { id: string } }) {
//   const id = await Promise.resolve(params.id); // Fel användning
//   // ...
// }
```

## Typfel

### string | Date typkonflikter

**Problem**: Typfel med `string | Date` i Task-typen:
```
Type 'string | Date' is not assignable to type 'string'.
```

**Lösning**: Uppdatera schema för att hantera både string och Date typer:

1. Uppdatera TaskSchema i lib/schemas/task-schema.ts:
```tsx
const DateSchema = z.union([
  z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  z.instanceof(Date)
]);

// Använd DateSchema för startDate och endDate
```

2. Hantera båda typerna när du arbetar med datum:
```tsx
const formattedDate = typeof date === 'string' ? date : formatDate(date);
```

## UI-problem

### Knapp-varianter/stil-problem

**Problem**: Felaktiga knappvarianter eller egenskaper som inte finns på Button-komponenten:
```
Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'
```

**Lösning**: Använd className istället för variant när du använder shadcn/ui Button-komponenten:

```tsx
// Fel:
<Button variant="outline">Knapptext</Button>

// Korrekt:
<Button className="bg-background text-foreground border border-input hover:bg-accent hover:text-accent-foreground">
  Knapptext
</Button>
```

## Övrigt

### Många portar upptagna

**Problem**: När du kör `npm run dev` får du meddelanden om att portar är upptagna:
```
⚠ Port 3000 is in use, trying 3001 instead.
⚠ Port 3001 is in use, trying 3002 instead.
```

**Lösning**: Döda alla Node.js-processer innan du startar utvecklingsservern:

```bash
# På Windows:
taskkill /F /IM node.exe

# På macOS/Linux:
killall node

# Sedan starta servern:
npm run dev
```

**Förklaring**: Om tidigare utvecklingsserversessioner inte avslutades korrekt kan de fortfarande använda portarna.

## Byggfel med date-fns paketet

### Problem
Bygget misslyckas med felmeddelandet:
```
Module not found: Can't resolve 'date-fns/esm/addMilliseconds'
```

### Förklaring 
Detta beror på en inkompatibilitet mellan date-fns versioner. Vår kod använder import-syntax som är kompatibel med date-fns v2.x, men projektet kan ha en annan version installerad.

### Lösning
Installera specifikt version 2.30.0:
```
npm uninstall date-fns
npm install date-fns@2.30.0
```

## Cache-relaterade problem i Next.js

### Problem
Bygget eller utvecklingsservern visar konstiga fel som inte verkar relaterade till aktuella kodbändringar.

### Förklaring
Next.js cachear byggartifakter för att förbättra prestandan. Ibland kan denna cache bli korrupt eller förvirrande i en komplex kodbas.

### Lösning
Rensa Next.js cache:
```
rm -rf .next
# eller på Windows:
rmdir /s /q .next
```

Starta om utvecklingsservern efter rensning.

## Compilation failed: duplicate function declarations

### Problem
Bygget misslyckas med felmeddelandet:
```
Compilation failed: duplicate function declarations for function 'getTaskById'
```

### Förklaring
Detta kan hända om du råkar definiera samma funktion i flera filer eller om importer/exporter inte är korrekt konfigurerade.

### Lösning
1. Kontrollera vilka filer som innehåller funktionen:
   ```
   grep -r "function getTaskById" .
   # eller på Windows:
   findstr /s "function getTaskById" *.ts *.tsx
   ```
2. Konsolidera funktionen till en plats (vanligtvis utils-mappen)
3. Uppdatera importer i alla andra filer
4. Om det handlar om en utility-funktion, exportera den från en central plats som `lib/utils/index.ts`

## Problem med typkonflikt (string | Date)

### Problem
Typescript-fel som indikerar att en typ inte är kompatibel med `string | Date`.

### Förklaring
I vår datamodell använder vi `string | Date` för datumfält för flexibilitet, men detta kan leda till förvirrande fel när vi arbetar med datum.

### Lösning
1. Var tydlig med typkonverteringar:
   ```typescript
   // Konvertera till Date-objekt för beräkningar
   const startDateObj = typeof task.startDate === 'string' 
     ? new Date(task.startDate) 
     : task.startDate;
   
   // Konvertera till string för lagring eller visning
   const startDateStr = typeof task.startDate === 'object'
     ? task.startDate.toISOString()
     : task.startDate;
   ```

2. Överväg att använda hjälpfunktioner för konsekvens:
   ```typescript
   // I utils/date.ts
   export function ensureDateObject(date: string | Date): Date {
     return typeof date === 'string' ? new Date(date) : date;
   }
   
   export function ensureDateString(date: string | Date): string {
     return typeof date === 'object' ? date.toISOString() : date;
   }
   ```

## Aggressiv rensning (när inget annat hjälper)

### Problem
Du har provat allt men fortsätter att få konstiga byggrelaterade fel.

### Förklaring
Ibland kan byggsystem och beroenden hamna i ett konstigt tillstånd som kräver en fullständig omstart.

### Lösning
1. Rensa alla byggartifakter:
   ```
   rm -rf .next node_modules
   # eller på Windows:
   rmdir /s /q .next node_modules
   ```

2. Rensa npm-cache:
   ```
   npm cache clean --force
   ```

3. Återinstallera alla paket:
   ```
   npm install
   ```

4. Försök köra bygget igen:
   ```
   npm run build
   ```

## Fel med Next.js dynamic routing och params --> ✅ LÖST (Genom refaktorering till Server Component)

### Problem
Felmeddelande när man försöker öppna en Gantt-sida:
```
'params.id' is used before it was defined
```

### Förklaring
I Next.js App Router måste komponenter som använder dynamiska ruttsegment (`[id]`) deklareras som asynkrona funktioner om de direkt använder params-objektet.

### Lösning
Ändra `GanttPage`-komponenten i `app/gantt/[id]/page.tsx` för att vara en async-funktion:

```typescript
// Innan:
export default function GanttPage({ params }: { params: { id: string } }) {
  // Kod som använder params.id
}

// Efter:
export default async function GanttPage({ params }: { params: { id: string } }) {
  // Kod som använder params.id
}
```

Detta låter Next.js hantera ruttsegment-parametrarna korrekt och förhindrar "used before defined"-felet.

## Återkommande problem med Next.js Development Server (Status: April 2025) --> Workaround finns

**Problem**: Trots diverse åtgärder (rensning, specifik `date-fns`-version, nedgradering av Next.js, avaktivering av experimentella flaggor) kvarstår problem med `npm run dev` i Windows-miljö. Symptom inkluderar:
- `Error: @prisma/client did not initialize yet.` vid API-anrop.
- Inkonsekvent tillämpning av ändringar i `next.config.mjs` (t.ex. experimentella flaggor förblir aktiva).
- `MODULE_NOT_FOUND` för vendor chunks (`next.js`, `date-fns.js`).
- Oväntade `params.id should be awaited` -varningar.

**Förklaring**: Grundorsaken verkar vara en fundamental instabilitet i Next.js development server (`next dev`) i den specifika miljön. Exakt orsak oklar (Next.js-bugg, Webpack-problem, filsystemsinterferens?).

**Lösning/Workaround**: Kör applikationen i produktionsläge:
1.  **Bygg:** `npm run build`
2.  **Starta:** `npm start`

Produktionsläget har visat sig vara stabilt och kringgår problemen med utvecklingsservern. Detta rekommenderas för vidare utveckling tills grundorsaken till dev-lägets instabilitet är löst.

**Tidigare Felsökningssteg (för referens):**
- Aggressiv rensning (taskkill, rimraf node_modules/.next, npm cache clean)
- Specifik `date-fns` version (2.30.0)
- Nedgradering av Next.js (15.1.0 -> 14.2.3)
- Inaktivering av experimentella flaggor i `next.config.mjs`
- Separat testning av Prisma Client (fungerade utanför Next.js) 

## Runtime-fel: Maximum update depth exceeded --> ✅ LÖST

**Problem:** Applikationen kraschar med felet "Maximum update depth exceeded".

**Förklaring:** Indikerar en oändlig loop av state-uppdateringar i React.

**Lösning:** Refaktorerade `useEffect`-hooken i `app/gantt/[id]/page.tsx` och Zustand store (`currentProjectStore`) för att förhindra oavsiktliga loopar vid dataladdning. Introducerade en `loadProjectStart`-action i storen.

## Runtime-fel: PrismaClient is unable to run in this browser environment --> ✅ LÖST

**Problem:** Applikationen kraschar med felet "PrismaClient is unable to run in this browser environment".

**Förklaring:** Försök att köra Prisma Client (som är server-side) inuti en Client Component (`'use client';`).

**Lösning:** Refaktorerade `app/gantt/[id]/page.tsx` till en Server Component som hämtar data med Prisma på servern. Klient-state (Zustand) hydreras med server-datan via en `InitializeProjectStore`-komponent. Komponentdelar som kräver client-hooks extraherades till egna Client Components.

## Byggfel: Hooks importerade i Server Component (Status: [Dagens Datum]) --> AKTUELLT PROBLEM

**Problem:** Bygget misslyckas med fel som:
`You're importing a component that needs useEffect. It only works in a Client Component but none of its parents are marked with "use client"...`
(och liknande för `useState`, `useRef`).

**Förklaring:** Efter refaktoreringen till Server Component i `app/gantt/[id]/page.tsx`, finns import-satser för `useEffect`, `useState`, `useRef` kvar i filen, vilket inte är tillåtet.

**Lösning:** Ta bort följande importrad från `app/gantt/[id]/page.tsx`:
```typescript
import { useEffect, useState, useRef } from 'react';
```

## Felsökning av GanttChart-rendering och Projektval ([Dagens Datum]) --> ✅ LÖST

### Problem: Uppgiftsstaplar renderas på fel position vid zoom/panorering --> ✅ LÖST

**Symptom:**
- Uppgiftsstaplarna (`TaskBar`) förskjöts visuellt relativt till tidslinjerubrikerna (`TimelineHeader`) vid zoom/panorering.

**Lösning (Sammanfattning):**
- Problemet löstes genom en kombination av att korrigera `ReferenceError` relaterat till `viewStartDate`, noggrann felsökning och refaktorering av positionsberäkningslogiken (`getTaskPosition`, `getMilestonePosition`), troligen genom att använda en index-baserad metod och säkerställa synkronisering mellan `UIContext` och renderingen.

### Problem: Endast ett projekt kan visas --> ✅ LÖST

**Symptom:**
- Gick inte att byta aktivt projekt i Gantt-vyn.

**Lösning (Sammanfattning):**
- Problemet löstes genom att korrigera hur `projectId`-prop hanterades och säkerställa att `setActiveProjectId` i `ProjectContext` (eller motsvarande i Zustand) anropades korrekt vid navigering.