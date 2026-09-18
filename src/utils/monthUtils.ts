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
  const combined = (String(dateStr || '') + ' ' + String(monthStr || '')).toUpperCase().trim();

  // 1. Text word matching FIRST across dateStr and monthStr
  if (combined.includes('SEPT') || combined.includes('SEP')) return 'SEPTEMBER';
  if (combined.includes('AGUS') || combined.includes('AGU') || combined.includes('AUG')) return 'AGUSTUS';
  if (combined.includes('JULI') || combined.includes('JUL')) return 'JULI';
  if (combined.includes('JUNI') || combined.includes('JUN')) return 'JUNI';
  if (combined.includes('MEI') || combined.includes('MAY')) return 'MEI';
  if (combined.includes('APR')) return 'APRIL';
  if (combined.includes('MAR')) return 'MARET';
  if (combined.includes('FEB')) return 'FEBRUARI';
  if (combined.includes('JAN')) return 'JANUARI';
  if (combined.includes('OKT') || combined.includes('OCT')) return 'OKTOBER';
  if (combined.includes('NOV')) return 'NOVEMBER';
  if (combined.includes('DES') || combined.includes('DEC')) return 'DESEMBER';

  // 2. Strict numeric slash/dash/dot date matching SECOND
  if (combined.includes('/09/') || combined.includes('-09-') || combined.includes('.09.') || combined.endsWith('/09')) return 'SEPTEMBER';
  if (combined.includes('/08/') || combined.includes('-08-') || combined.includes('.08.') || combined.endsWith('/08')) return 'AGUSTUS';
  if (combined.includes('/07/') || combined.includes('-07-') || combined.includes('.07.') || combined.endsWith('/07')) return 'JULI';
  if (combined.includes('/06/') || combined.includes('-06-') || combined.includes('.06.') || combined.endsWith('/06')) return 'JUNI';
  if (combined.includes('/05/') || combined.includes('-05-') || combined.includes('.05.') || combined.endsWith('/05')) return 'MEI';
  if (combined.includes('/04/') || combined.includes('-04-') || combined.includes('.04.') || combined.endsWith('/04')) return 'APRIL';
  if (combined.includes('/03/') || combined.includes('-03-') || combined.includes('.03.') || combined.endsWith('/03')) return 'MARET';
  if (combined.includes('/02/') || combined.includes('-02-') || combined.includes('.02.') || combined.endsWith('/02')) return 'FEBRUARI';
  if (combined.includes('/01/') || combined.includes('-01-') || combined.includes('.01.') || combined.endsWith('/01')) return 'JANUARI';
  if (combined.includes('/10/') || combined.includes('-10-') || combined.includes('.10.') || combined.endsWith('/10')) return 'OKTOBER';
  if (combined.includes('/11/') || combined.includes('-11-') || combined.includes('.11.') || combined.endsWith('/11')) return 'NOVEMBER';
  if (combined.includes('/12/') || combined.includes('-12-') || combined.includes('.12.') || combined.endsWith('/12')) return 'DESEMBER';

  return '';
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
