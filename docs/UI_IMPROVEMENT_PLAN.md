# Gantt-schema UI-förbättringsplan

Detta dokument beskriver de planerade UI-förbättringarna för Gantt-schema-applikationen, baserat på analys av moderna Gantt-gränssnitt och användbarhetsprinciper.

## Översikt

Baserat på analysen av referensbilder och moderna Gantt-verktyg, planerar vi att implementera följande förbättringar för att göra gränssnittet mer intuitivt, funktionellt och visuellt tilltalande:

1. **Förbättrad hierarkisk struktur** - Tydligare uppdelning av projektfaser och deluppgifter
2. **Bättre tidslinjevisualisering** - Mer detaljerade och flexibla tidslinjevyer
3. **Statusvisualisering** - Förbättrad färgkodning och visuella indikatorer för status
4. **Konfiguration och anpassning** - Mer flexibla inställningar för användaren

## 1. Hierarkisk struktur och gruppering

### 1.1 Projektfaser och gruppering
- Implementera färgkodade projektfaser med summering av framsteg (t.ex. "Planning 100%", "Creative 69%")
- Skapa visuell struktur med indragna undernivåer för uppgifter inom en fas
- Lägga till expandera/kollapsa-funktion för projektfaser

### 1.2 Visuell hierarki
- Använda tydliga separatorer mellan projektfaser i listan
- Förbättra typografi med fetare text för fastitlar och normal text för uppgifter
- Implementera numrering av rader för enklare referens

### 1.3 Sammanfattningar och aggregationer
- Visa aggregerad status för varje fas baserat på deluppgifter
- Beräkna och visa framstegsindikator för varje fas och hela projektet

## 2. Tidslinjeförbättringar

### 2.1 Månads- och veckovisning
- Implementera tydlig månadsvy högst upp i tidslinjen
- Lägga till veckonumrering (W1, W2, W3) med tillhörande datumintervall (3-7, 10-14, etc.)
- Förbättra dagvisning med veckodagsmarkörer (S, M, T, W, T, F, S)

### 2.2 Tidsskalor och zoomning
- Förbättra zoomningsfunktionen för att växla mellan olika detaljnivåer
- Implementera "Auto Fit"-funktion för optimal visning av hela projektet
- Lägga till knapp för att centrera på dagens datum

### 2.3 Datumseparatorer och markörer
- Tydliggöra skillnad mellan veckor och månader med olika separatorer
- Lägga till "Today"-indikator för att visa aktuellt datum
- Implementera alternativ för att visa/dölja helger

## 3. Status och visuell feedback

### 3.1 Färgkodningssystem
- Implementera konsekvent färgkodning för uppgiftsstatus:
  - Grön: "Done" eller "Approved"
  - Röd: "At risk"
  - Gul: "Not yet" eller "In progress"
  - Orange: "Stuck"
  - Mörkgrön: "Ready for review"
- Lägga till visuella markörer som indikerar prioritet och blockering

### 3.2 Färglegend
- Skapa en färglegend i nedre delen av gantt-vyn som förklarar färgernas betydelse
- Lägga till alternativ för att visa/dölja färglegenden
- Implementera hover-tillstånd för att markera alla uppgifter med samma status

### 3.3 Progressindikatorer
- Lägga till progressindikatorer direkt på uppgiftsstaplar (100%, 75%, 50%, etc.)
- Implementera visuell skillnad mellan planerade och faktiska framsteg
- Visa procentuell framgång i både uppgiftslistan och på tidslinjen

## 4. Beroenden och relationer

### 4.1 Förbättrad visualisering av beroenden
- Implementera tydligare pilar som visar beroenden mellan uppgifter
- Förbättra hovring-effekter för att markera relaterade uppgifter
- Lägga till olika typer av beroendepilar (Finish-to-Start, Start-to-Start, etc.)

### 4.2 Milstolpevisning
- Tydligare visualisering av milstolpar med diamantsymboler
- Färgkoda milstolpar baserat på status 
- Visa milstolpeinformation vid hovring

## 5. Konfigurationsmöjligheter

### 5.1 Anpassningsalternativ
- Lägga till "Group by"-funktion med flera alternativ (fas, ansvarig, status)
- Implementera "Label by"-funktion för att anpassa textetiketterna
- Skapa "Color by"-funktion för att välja färgkodningssystem (status, prioritet, fas)

### 5.2 Visningsalternativ
- Lägga till växling för att visa/dölja:
  - Beroenden
  - Gruppsummering
  - Dagens indikator
  - Helger
  - Färglegend
- Implementera "Split View"-alternativ för att visa olika delar av projektet samtidigt

### 5.3 Filteringsalternativ
- Lägga till globalt sökfält för att filtrera uppgifter baserat på text
- Implementera filteringsalternativ baserat på status, ansvarig, datum, etc.
- Skapa sparade vyer för vanliga filterkombinationer

## Implementationsordning

1. ✅ Fixa grundläggande strukturella problem och biblioteksfel (date-fns)
2. ✅ Implementera förbättrad navigation och vyväxling
3. Implementera förbättrad datumhantering och task CRUD (Create-Read-Update-Delete)
4. Implementera färgkodning och status
5. Skapa färglegend-komponent
6. Förbättra tidslinjen med veckonumrering och datumvisning
7. Implementera gruppering och hierarki för uppgifter
8. Lägga till konfigurationspanel med anpassningsalternativ

## Integration med befintliga komponenter

- [x] Skapat ViewControls-komponenten för att hantera vyväxling och navigation
- [x] Förbättrat AddTaskDialog för att hantera uppgiftstillägg med förbättrad validering
- [x] Uppdaterat Task-modellen för att hantera både string och Date typer för datum
- TaskBar-komponenten behöver uppdateras för att visa progressindikatorer
- Timeline-komponenten behöver förbättras för att visa veckonumrering och månader
- TaskList-komponenten behöver uppdateras för att hantera gruppering och hierarki
- GanttToolbar-komponenten behöver utökas med konfigurationsalternativ
- En ny Legend-komponent behöver implementeras för färgförklaringar

## Genomförda förbättringar ([Dagens Datum])

### Navigation och vyer
- ✅ Implementerat ViewControls-komponenten med stöd för olika vyer (Gantt, Fas, Lista)
- ✅ Löst problem med projektnavigering (byte mellan projekt fungerar).
- ✅ Förbättrat navigering med tillbakaknapp till projektöversikten.

### Datumhantering
- ✅ Åtgärdat problem med date-fns biblioteket och säkerställt kompatibilitet med react-day-picker
- ✅ Uppdaterat TaskSchema för att hantera både string och Date typer för startDate och endDate
- ✅ Förbättrat valideringslogik för datum i formulär och scheman

### Uppgiftshantering
- ✅ Förbättrat AddTaskDialog med omfattande valideringskontroller och felhantering
- ✅ Implementerat bättre stöd för att lägga till uppgifter i specifika faser
- ✅ Lagt till detaljerad loggning för felsökning av uppgiftstillägg

### Nästa steg ([Dagens Datum])

**OBS! Byggfel kvarstår (importer i Server Component), måste lösas först.**

1.  Implementera färgkodning och status för uppgifter enligt färgkodningssystemet i 3.1
2.  Skapa färglegendkomponent enligt specifikationen i 3.2
3.  Förbättra tidslinjen med veckonumrering och datumvisning enligt 2.1
4.  Implementera progressindikatorer direkt på uppgiftsstaplar enligt 3.3
5.  Lägga till filtreringsmöjligheter enligt 5.3 