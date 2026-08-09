// Native <input type="date"> renders its typed format (mm/dd/yyyy vs
// dd/mm/yyyy) based on the browser/OS locale, not anything the page
// controls — so on an en-US machine it shows mm/dd/yyyy even in a Brazilian
// app. These helpers back a masked text input that always reads dd/mm/yyyy,
// while the value passed around the app stays ISO "yyyy-mm-dd" so existing
// comparisons/schemas (which expect ISO) don't need to change.

export const isoToDisplay = (iso: string): string => {
  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) {
    return '';
  }
  return `${day}/${month}/${year}`;
};

export const maskDateInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 2));
  if (digits.length > 2) parts.push(digits.slice(2, 4));
  if (digits.length > 4) parts.push(digits.slice(4, 8));
  return parts.join('/');
};

export const displayToIso = (display: string): string => {
  const digits = display.replace(/\D/g, '');
  if (digits.length !== 8) {
    return '';
  }
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  if (Number(day) < 1 || Number(day) > 31 || Number(month) < 1 || Number(month) > 12) {
    return '';
  }
  return `${year}-${month}-${day}`;
};
