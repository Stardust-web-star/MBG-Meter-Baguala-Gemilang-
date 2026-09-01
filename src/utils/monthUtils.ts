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
