const UKRAINE_CENTER = {
  lat: 49.0275,
  lng: 31.4828,
};

const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  'київ': { lat: 50.4501, lng: 30.5234 },
  'львів': { lat: 49.8397, lng: 24.0297 },
  'харків': { lat: 49.9935, lng: 36.2304 },
  'одеса': { lat: 46.4825, lng: 30.7233 },
  'дніпро': { lat: 48.4647, lng: 35.0462 },
  'запоріжжя': { lat: 47.8388, lng: 35.1396 },
  'вінниця': { lat: 49.2328, lng: 28.481 },
  'луцьк': { lat: 50.7472, lng: 25.3254 },
  'рівне': { lat: 50.6199, lng: 26.2516 },
  'тернопіль': { lat: 49.5535, lng: 25.5948 },
  'хмельницький': { lat: 49.4229, lng: 26.9871 },
  'чернівці': { lat: 48.2915, lng: 25.9358 },
  'івано-франківськ': { lat: 48.9226, lng: 24.7111 },
  'ужгород': { lat: 48.6208, lng: 22.2879 },
  'житомир': { lat: 50.2547, lng: 28.6587 },
  'черкаси': { lat: 49.4444, lng: 32.0598 },
  'полтава': { lat: 49.5883, lng: 34.5514 },
  'суми': { lat: 50.9077, lng: 34.7981 },
  'чернігів': { lat: 51.4982, lng: 31.2893 },
  'миколаїв': { lat: 46.975, lng: 31.9946 },
  'херсон': { lat: 46.6354, lng: 32.6169 },
  'кропивницький': { lat: 48.5079, lng: 32.2623 },
};

const normalizeCity = (city: string) => city.trim().toLocaleLowerCase('uk-UA');

const hashString = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
};

const roundCoordinate = (value: number) => Number(value.toFixed(6));

export const getBranchCoordinates = ({
  id,
  city,
  address,
}: {
  id: number;
  city: string;
  address: string;
}) => {
  const center = CITY_CENTERS[normalizeCity(city)] ?? UKRAINE_CENTER;
  const seed = hashString(`${id}-${city}-${address}`);
  const angle = ((seed % 360) * Math.PI) / 180;
  const radius = 0.006 + (seed % 8) * 0.003;
  const lngCorrection = Math.cos((center.lat * Math.PI) / 180) || 1;

  return {
    lat: roundCoordinate(center.lat + Math.sin(angle) * radius),
    lng: roundCoordinate(center.lng + (Math.cos(angle) * radius) / lngCorrection),
  };
};
