# Gantt Diagram - Kontrollkomponenter

Den här katalogen innehåller kontrollkomponenter för Gantt-diagrammet som används för att styra visning, layout och interaktion.

## Komponenter

### ViewControls

`ViewControls.tsx` hanterar visningsalternativ och navigation i Gantt-diagrammet.

- Knappar för att växla mellan olika vyer (Gantt, Fas, Lista)
- Tillbakaknapp för enkel navigation
- Integrerad med UIContext för att hantera visningsstatus

#### Användning

```jsx
<ViewControls projectId={projectId} />
```

#### Funktioner

- Växla mellan Gantt-vy, Fasvy och Listvy
- Hantera visuell feedback för aktiv vy med rätt stiländring
- Navigera tillbaka till projektoversikten

### Framtida Kontrollkomponenter

Planerade kontrollkomponenter:
- FilterControls - För att filtrera uppgifter baserat på status, prioritet osv.
- ZoomControls - För att zooma in/ut på tidsaxeln
- ExportControls - För att exportera Gantt-diagrammet till olika format

## Design Principer

Alla kontrollkomponenter följer dessa principer:
1. Enhetlig design med shadcn/ui komponenter
2. Tydlig visuell feedback för aktuellt val
3. Konsekvent ikonografi (Lucide icons)
4. Responsiv layout som anpassar sig till skärmstorlek 