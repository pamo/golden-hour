import SunCalc from 'suncalc';

interface OpenWeatherMapForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  clouds: {
    all: number;
    high?: number;
    low?: number;
    mid?: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  sys: {
    pod: string;
  };
  dt_txt: string;
}

interface OpenWeatherMapResponse {
  cod: string;
  message: number;
  cnt: number;
  list: OpenWeatherMapForecastItem[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export async function getWeatherData(lat: number, lon: number): Promise<OpenWeatherMapResponse> {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = (await response.json()) as OpenWeatherMapResponse;

    // Process the forecast data to include cloud layers
    const processedList = data.list.map((item) => ({
      ...item,
      clouds: {
        all: item.clouds.all,
        high: item.clouds.high || 0,
        low: item.clouds.low || 0,
        mid: item.clouds.mid || 0,
      },
    }));

    return {
      ...data,
      list: processedList,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

export function findClosestForecast(
  forecasts: OpenWeatherMapForecastItem[],
  targetTime: Date
): OpenWeatherMapForecastItem {
  return forecasts.reduce((closest, current) => {
    const currentTime = new Date(current.dt * 1000);
    const closestTime = new Date(closest.dt * 1000);
    const currentDiff = Math.abs(currentTime.getTime() - targetTime.getTime());
    const closestDiff = Math.abs(closestTime.getTime() - targetTime.getTime());
    return currentDiff < closestDiff ? current : closest;
  });
}

export function getGoldenHourTimes(lat: number, lon: number) {
  const now = new Date();

  const sunTimes = SunCalc.getTimes(now, lat, lon);

  const morningGoldenHourStart = sunTimes.sunrise;
  const morningGoldenHourEnd = new Date(morningGoldenHourStart.getTime() + 60 * 60 * 1000);

  const eveningGoldenHourStart = new Date(sunTimes.sunset.getTime() - 60 * 60 * 1000);
  const eveningGoldenHourEnd = sunTimes.sunset;

  const morningSunPosition = SunCalc.getPosition(
    new Date(morningGoldenHourStart.getTime() + 30 * 60 * 1000),
    lat,
    lon
  );

  const eveningSunPosition = SunCalc.getPosition(
    new Date(eveningGoldenHourStart.getTime() + 30 * 60 * 1000),
    lat,
    lon
  );

  const currentSunPosition = SunCalc.getPosition(now, lat, lon);

  const morningSunAzimuth = ((morningSunPosition.azimuth * 180) / Math.PI + 180) % 360;
  const eveningSunAzimuth = ((eveningSunPosition.azimuth * 180) / Math.PI + 180) % 360;
  const currentSunAzimuth = ((currentSunPosition.azimuth * 180) / Math.PI + 180) % 360;

  return {
    morningStart: morningGoldenHourStart,
    morningEnd: morningGoldenHourEnd,
    eveningStart: eveningGoldenHourStart,
    eveningEnd: eveningGoldenHourEnd,
    morningSunAzimuth,
    eveningSunAzimuth,
    currentSunAzimuth,
    sunAltitude: (currentSunPosition.altitude * 180) / Math.PI,
  };
}
