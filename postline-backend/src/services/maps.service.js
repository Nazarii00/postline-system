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

const geocodeAddress = async (address) => {
  const token = getMapboxToken();
  const inputAddress = String(address || "").trim();

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

module.exports = {
  geocodeAddress,
  optimizeMultiStopRoute,
};
