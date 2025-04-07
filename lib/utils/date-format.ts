import { format, parseISO, isValid } from 'date-fns';
import { sv } from 'date-fns/locale';

/**
 * Standardiserad funktion för att formatera datum i användarvisningar
 * @param dateValue Ett datum, antingen som Date-objekt, ISO-sträng eller timestamp
 * @param formatString Formatteringssträng för date-fns
 * @returns Formatterad datumsträng
 */
export function formatDate(
  dateValue: Date | string | number | null | undefined,
  formatString: string = 'yyyy-MM-dd'
): string {
  if (!dateValue) return '';
  
  try {
    // Om dateValue är en sträng, försök parsa det
    const date = typeof dateValue === 'string' 
      ? parseISO(dateValue) 
      : typeof dateValue === 'number' 
        ? new Date(dateValue) 
        : dateValue;
    
    // Validera att datumet är giltigt
    if (!isValid(date)) {
      console.warn('Ogiltigt datumvärde:', dateValue);
      return '';
    }
    
    // Formatera enligt angiven format
    return format(date, formatString, { locale: sv });
  } catch (error) {
    console.error('Fel vid formatering av datum:', error);
    return '';
  }
}

/**
 * Säkerställer att ett datum är i Date-format
 * Används för att standardisera datum innan de skickas till API
 * @param dateValue Datumvärde i olika möjliga format
 * @returns Ett Date-objekt eller null om ingångsvärdet är ogiltigt
 */
export function ensureDate(dateValue: Date | string | number | null | undefined): Date | null {
  if (!dateValue) return null;
  
  try {
    const date = typeof dateValue === 'string' 
      ? parseISO(dateValue) 
      : typeof dateValue === 'number' 
        ? new Date(dateValue) 
        : dateValue;
    
    return isValid(date) ? date : null;
  } catch (error) {
    console.error('Fel vid konvertering av datumvärde:', error);
    return null;
  }
}

/**
 * Formaterar datum för visning i Gantt-schemat
 * @param date Ett datum
 * @returns Formatterad datumsträng anpassad för Gantt-vyn
 */
export function formatGanttDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  return formatDate(date, 'd MMM');
}

/**
 * Formaterar datum och tid för detaljvisning
 * @param date Ett datum
 * @returns Formatterad datum- och tidsträng
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  return formatDate(date, 'yyyy-MM-dd HH:mm');
}

/**
 * Förbereder datumvärden för API
 * @param dateValue Datumvärde från formulär
 * @returns ISO-sträng för API eller null om datumvärdet är ogiltigt
 */
export function prepareApiDate(dateValue: Date | string | number | null | undefined): string | null {
  const date = ensureDate(dateValue);
  return date ? date.toISOString() : null;
}

/**
 * Formaterar den visuella visningen av ett datumintervall
 * @param startDate Startdatum
 * @param endDate Slutdatum
 * @returns Formatterad datumsträng för intervall
 */
export function formatDateRange(
  startDate: Date | string | null | undefined, 
  endDate: Date | string | null | undefined
): string {
  if (!startDate && !endDate) return '';
  if (startDate && !endDate) return `Från ${formatDate(startDate)}`;
  if (!startDate && endDate) return `Till ${formatDate(endDate)}`;
  
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
} 