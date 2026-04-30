const { reserveMapboxRequest } = require("./mapboxQuota.service");

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const getMapboxToken = () => {
  const token = process.env.MAPBOX_TOKEN;

  if (!token) {
    throw createError(500, "MAPBOX_TOKEN не налаштований");
  }

  return token;
};

const requestMapboxJson = async (url) => {
  try {
    await reserveMapboxRequest();
    const response = await fetch(url);

    if (!response.ok) {
      throw createError(502, "Mapbox request failed");
    }

    return response.json();
  } catch (error) {
    if (error.status) throw error;
    throw createError(502, "Mapbox request failed");
  }
};

const normalizeSpaces = (value) =>
  String(value || "").replace(/\s+/g, " ").trim();

const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const stripAddressDetails = (address) => {
  const detailToken = "(кв\\.?|квартира|ап\\.?|апартамент|під['’]?їзд|пiд['’]?їзд|поверх|пов\\.?|домофон|код|офіс|оф\\.?|каб\\.?|коментар|примітка)";
  const detailStartPattern = new RegExp(`^${detailToken}(?:\\s|\\.|,|:|$)`, "i");
  const inlineDetailPattern = new RegExp(`\\s+${detailToken}(?:\\s|\\.|,|:|$).*$`, "i");

  const withoutSeparatedDetails = normalizeSpaces(address)
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && !detailStartPattern.test(part))
    .join(", ");

  return normalizeSpaces(withoutSeparatedDetails.replace(inlineDetailPattern, ""));
};

const appendCityIfMissing = (address, city) => {
  const cleanAddress = normalizeSpaces(address);
  const cleanCity = normalizeSpaces(city);
  if (!cleanAddress || !cleanCity) return cleanAddress;

  const cityPattern = new RegExp(`(^|[,\\s])(?:м\\.?\\s*)?${escapeRegExp(cleanCity)}([,\\s]|$)`, "iu");
  return cityPattern.test(cleanAddress) ? cleanAddress : `${cleanCity}, ${cleanAddress}`;
};

const prepareGeocodingAddress = (address, { city } = {}) =>
  appendCityIfMissing(stripAddressDetails(address), city);

const geocodeAddress = async (address, options = {}) => {
  const token = getMapboxToken();
  const inputAddress = prepareGeocodingAddress(address, options);

  if (!inputAddress) {
    throw createError(400, "Адреса для геокодування є обов'язковою");
  }

  const params = new URLSearchParams({
    access_token: token,
    limit: "1",
    language: "uk",
    country: "ua",
  });

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(inputAddress)}.json?${params}`;
  const data = await requestMapboxJson(url);
  const feature = data.features?.[0];

  if (!feature) {
    throw createError(404, `Адресу не знайдено: ${inputAddress}`);
  }

  const [lng, lat] = feature.center || [];
  if (typeof lat !== "number" || typeof lng !== "number") {
    throw createError(404, `Адресу не знайдено: ${inputAddress}`);
  }

  return {
    inputAddress,
    resolvedAddress: feature.place_name || inputAddress,
    lat,
    lng,
  };
};

const optimizeMultiStopRoute = async ({ startPoint, stops }) => {
  const token = getMapboxToken();
  const points = [startPoint, ...stops];
  const coordinates = points.map((point) => `${point.lng},${point.lat}`).join(";");

  const params = new URLSearchParams({
    access_token: token,
    geometries: "geojson",
    overview: "full",
    steps: "false",
    source: "first",
    roundtrip: "true",
  });

  const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordinates}?${params}`;
  const data = await requestMapboxJson(url);
  const trip = data.trips?.[0];

  if (!trip) {
    throw createError(404, "Оптимізований маршрут не знайдено");
  }

  return {
    distanceMeters: Math.round(trip.distance || 0),
    durationSeconds: Math.round(trip.duration || 0),
    geometry: trip.geometry,
    waypoints: data.waypoints || [],
  };
};

const calculateOrderedRouteMetrics = async ({ points }) => {
  const token = getMapboxToken();
  const coordinates = points.map((point) => `${point.lng},${point.lat}`).join(";");

  const params = new URLSearchParams({
    access_token: token,
    geometries: "geojson",
    overview: "false",
    steps: "false",
  });

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?${params}`;
  const data = await requestMapboxJson(url);
  const route = data.routes?.[0];

  if (!route) {
    throw createError(404, "Маршрут між відділеннями не знайдено");
  }

  return {
    distanceMeters: Math.round(route.distance || 0),
    durationSeconds: Math.round(route.duration || 0),
    segmentDistancesMeters: (route.legs || []).map((leg) => Math.round(leg.distance || 0)),
    segmentDurationsSeconds: (route.legs || []).map((leg) => Math.round(leg.duration || 0)),
  };
};

module.exports = {
  geocodeAddress,
  prepareGeocodingAddress,
  optimizeMultiStopRoute,
  calculateOrderedRouteMetrics,
};
