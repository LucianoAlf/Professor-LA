export const parseFlexibleNumber = (rawValue: string, fallback = 0) => {
  const value = rawValue.trim();

  if (!value) return fallback;

  const hasComma = value.includes(',');
  const hasDot = value.includes('.');

  let normalized = value;

  if (hasComma && hasDot) {
    const lastComma = value.lastIndexOf(',');
    const lastDot = value.lastIndexOf('.');
    const decimalSeparator = lastComma > lastDot ? ',' : '.';

    normalized =
      decimalSeparator === ','
        ? value.replace(/\./g, '').replace(',', '.')
        : value.replace(/,/g, '');
  } else if (hasComma) {
    normalized = value.replace(',', '.');
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
};
