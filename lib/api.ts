import SunCalc from 'suncalc';

// Function to get weather data from OpenWeatherMap API
export async function getWeatherData(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
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

// Function to calculate golden hour times and sun position
export function getGoldenHourTimes(lat, lon) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Get sun times for today
  const sunTimes = SunCalc.getTimes(now, lat, lon);

  // Golden hour is typically about 1 hour before sunset and after sunrise
  const morningGoldenHourStart = sunTimes.sunrise;
  const morningGoldenHourEnd = new Date(morningGoldenHourStart.getTime() + 60 * 60 * 1000);

  const eveningGoldenHourStart = new Date(sunTimes.sunset.getTime() - 60 * 60 * 1000);
  const eveningGoldenHourEnd = sunTimes.sunset;

  // Get sun position (azimuth) for morning and evening golden hour
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

  // Get current sun position
  const currentSunPosition = SunCalc.getPosition(now, lat, lon);

  // Convert azimuth from radians to degrees
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
