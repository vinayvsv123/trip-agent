import { z } from "zod";

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export const weatherSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
});


async function getWeather(destination) {
  if (!API_KEY) {
    throw new Error("OpenWeather API key is missing.");
  }

  const url =
    `${BASE_URL}/weather?` +
    new URLSearchParams({
      q: destination,
      appid: API_KEY,
      units: "metric",
    });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Weather lookup failed (${response.status})`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

// Format Weather

function formatWeather(rawWeather) {
  return {
    location: rawWeather.name ?? null,
    country: rawWeather.sys?.country ?? null,

    temperature: rawWeather.main?.temp ?? null,
    feelsLike: rawWeather.main?.feels_like ?? null,
    minTemperature: rawWeather.main?.temp_min ?? null,
    maxTemperature: rawWeather.main?.temp_max ?? null,

    humidity: rawWeather.main?.humidity ?? null,
    pressure: rawWeather.main?.pressure ?? null,

    condition: rawWeather.weather?.[0]?.main ?? null,
    description: rawWeather.weather?.[0]?.description ?? null,

    windSpeed: rawWeather.wind?.speed ?? null,
    visibility: rawWeather.visibility ?? null,

    sunrise: rawWeather.sys?.sunrise ?? null,
    sunset: rawWeather.sys?.sunset ?? null,

    timezone: rawWeather.timezone ?? null,
  };
}

// Main Service
export async function searchWeather(input) {
  const result = weatherSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0].message,
    };
  }

  const { destination } = result.data;

  try {
    const rawWeather = await getWeather(destination);

    return {
      success: true,
      weather: formatWeather(rawWeather),
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}