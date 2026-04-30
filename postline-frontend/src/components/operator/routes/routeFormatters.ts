export const formatRouteDistance = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'Немає даних';

  const distance = Number(value);
  if (!Number.isFinite(distance)) return 'Немає даних';

  return `${distance.toFixed(Number.isInteger(distance) ? 0 : 1)} км`;
};

export const formatRouteTime = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'Немає даних';

  const hours = Number(value);
  if (!Number.isFinite(hours)) return 'Немає даних';
  if (hours > 0 && hours < 1) return `${Math.max(1, Math.round(hours * 60))} хв`;

  return `${hours.toFixed(Number.isInteger(hours) ? 0 : 2)} год`;
};
