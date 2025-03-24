import SunCalc from 'suncalc';

interface ForecastData {
  dt: number;
  weather: Array<{
    main: string;
    description: string;
  }>;
  main: {
    temp: number;
    humidity: number;
  };
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
  };
}

export async function getWeatherData(lat: number, lon: number) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

export function findClosestForecast(forecasts: ForecastData[], targetTime: Date): ForecastData {
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
