export interface MonthItem {
  id: string;
  label: string;
  year: string;
  status: string;
  statusColor: string;
  description: string;
}

export const INDONESIAN_MONTHS = [
  'JANUARI',
  'FEBRUARI',
  'MARET',
  'APRIL',
  'MEI',
  'JUNI',
  'JULI',
  'AGUSTUS',
  'SEPTEMBER',
  'OKTOBER',
  'NOVEMBER',
  'DESEMBER'
];

/**
 * Gets real-time current month name (e.g., 'SEPTEMBER') and year (e.g., '2026')
 */
/**
 * Normalizes any tab name, date string, or month identifier into a clean standard Indonesian month string (JULI, AGUSTUS, SEPTEMBER, etc.)
 */
export function normalizeMonthName(monthStr?: string, dateStr?: string): string {
  const m = String(monthStr || '').toUpperCase().trim();
  if (m) {
    if (m.includes('SEP') || m.includes('SEPT')) return 'SEPTEMBER';
    if (m.includes('AGU') || m.includes('AUG')) return 'AGUSTUS';
    if (m.includes('JUL')) return 'JULI';
    if (m.includes('JUN')) return 'JUNI';
    if (m.includes('MEI') || m.includes('MAY')) return 'MEI';
    if (m.includes('APR')) return 'APRIL';
    if (m.includes('MAR')) return 'MARET';
    if (m.includes('FEB')) return 'FEBRUARI';
    if (m.includes('JAN')) return 'JANUARI';
    if (m.includes('OKT') || m.includes('OCT')) return 'OKTOBER';
    if (m.includes('NOV')) return 'NOVEMBER';
    if (m.includes('DES') || m.includes('DEC')) return 'DESEMBER';
  }

  const d = String(dateStr || '').toUpperCase().trim();
  if (d) {
    if (d.includes('SEP') || d.includes('SEPT') || d.includes('/09/') || d.includes('-09-') || d.includes('.09.') || d.endsWith('/09') || d.includes(' 9 ') || d.includes('/9/')) return 'SEPTEMBER';
    if (d.includes('AGU') || d.includes('AUG') || d.includes('/08/') || d.includes('-08-') || d.includes('.08.') || d.endsWith('/08') || d.includes(' 8 ') || d.includes('/8/')) return 'AGUSTUS';
    if (d.includes('JUL') || d.includes('/07/') || d.includes('-07-') || d.includes('.07.') || d.endsWith('/07') || d.includes(' 7 ') || d.includes('/7/')) return 'JULI';
    if (d.includes('JUN') || d.includes('/06/') || d.includes('-06-') || d.includes('.06.')) return 'JUNI';
    if (d.includes('MEI') || d.includes('MAY') || d.includes('/05/') || d.includes('-05-')) return 'MEI';
    if (d.includes('APR') || d.includes('/04/') || d.includes('-04-')) return 'APRIL';
    if (d.includes('MAR') || d.includes('/03/') || d.includes('-03-')) return 'MARET';
    if (d.includes('FEB') || d.includes('/02/') || d.includes('-02-')) return 'FEBRUARI';
    if (d.includes('JAN') || d.includes('/01/') || d.includes('-01-')) return 'JANUARI';
    if (d.includes('OKT') || d.includes('OCT') || d.includes('/10/') || d.includes('-10-')) return 'OKTOBER';
    if (d.includes('NOV') || d.includes('/11/') || d.includes('-11-')) return 'NOVEMBER';
    if (d.includes('DES') || d.includes('DEC') || d.includes('/12/') || d.includes('-12-')) return 'DESEMBER';
  }

  return (m || 'SEPTEMBER').toUpperCase().trim();
}

export function getRealCurrentMonthInfo(): { id: string; name: string; year: string; monthIndex: number } {
  const now = new Date();
  const monthIndex = now.getMonth(); // 0-indexed (0 = JANUARI, 8 = SEPTEMBER)
  const year = String(now.getFullYear());
  const id = INDONESIAN_MONTHS[monthIndex] || 'SEPTEMBER';
  return { id, name: id, year, monthIndex };
}

/**
 * Calculates dynamic period status for any given month & year compared to real-time Date()
 */
export function getMonthStatusInfo(monthId: string, yearStr: string = '2026') {
  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const currentYear = now.getFullYear();

  // Clean month string (e.g., 'AGUSTUS 2026' -> 'AGUSTUS')
  const monthClean = monthId.toUpperCase().replace(/\s+\d{4}$/, '').trim();
  let targetIdx = INDONESIAN_MONTHS.indexOf(monthClean);
  if (targetIdx === -1) {
    targetIdx = 8; // fallback to September if unknown
  }
  const targetYear = parseInt(yearStr, 10) || currentYear;

  const currentScore = currentYear * 12 + currentMonthIdx;
  const targetScore = targetYear * 12 + targetIdx;

  if (targetScore === currentScore) {
    return {
      status: 'Aktif',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Periode Berjalan (Aktif)'
    };
  } else if (targetScore < currentScore) {
    return {
      status: 'Selesai',
      statusColor: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Arsip Periode Lalu'
    };
  } else {
    return {
      status: 'Rencana',
      statusColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'Periode Rencana'
    };
  }
}

/**
 * Returns list of month items dynamically calculated against real-time current month
 */
export function getAvailableMonthsList(): MonthItem[] {
  const currentInfo = getRealCurrentMonthInfo();
  // Standard list of active operational tabs
  const baseMonths = ['JULI', 'AGUSTUS', 'SEPTEMBER'];

  // Ensure real current month is present in the list
  if (!baseMonths.includes(currentInfo.id)) {
    baseMonths.push(currentInfo.id);
  }

  return baseMonths.map((mId) => {
    const info = getMonthStatusInfo(mId, currentInfo.year);
    return {
      id: mId,
      label: mId,
      year: currentInfo.year,
      status: info.status,
      statusColor: info.statusColor,
      description: info.description
    };
  });
}
