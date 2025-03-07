'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sun, CloudRain, Cloud, CloudFog, CloudLightning, CloudSnow } from 'lucide-react';

export function WeatherInfo({ weatherData }) {
  // Determine if weather conditions are good for golden hour
  const isGoodForGoldenHour = () => {
    const badConditions = ['Rain', 'Thunderstorm', 'Drizzle', 'Snow', 'Mist', 'Fog', 'Haze'];
    const cloudCoverage = weatherData.clouds?.all || 0;

    // Check if current weather condition is in the bad conditions list
    const hasBadWeather = weatherData.weather.some((w) =>
      badConditions.some((condition) => w.main.includes(condition))
    );

    // Consider it good if there's no bad weather and cloud coverage is less than 70%
    return !hasBadWeather && cloudCoverage < 70;
  };

  const getWeatherIcon = () => {
    const main = weatherData.weather[0].main;

    switch (main) {
      case 'Clear':
        return <Sun className="h-8 w-8 text-amber-500" />;
      case 'Rain':
      case 'Drizzle':
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      case 'Thunderstorm':
        return <CloudLightning className="h-8 w-8 text-purple-500" />;
      case 'Snow':
        return <CloudSnow className="h-8 w-8 text-blue-200" />;
      case 'Mist':
      case 'Fog':
      case 'Haze':
        return <CloudFog className="h-8 w-8 text-gray-400" />;
      case 'Clouds':
        return <Cloud className="h-8 w-8 text-gray-500" />;
      default:
        return <Cloud className="h-8 w-8 text-gray-500" />;
    }
  };

  const getQualityMessage = () => {
    if (isGoodForGoldenHour()) {
      return 'Great conditions for golden hour photography!';
    } else {
      return 'Weather conditions may affect golden hour quality.';
    }
  };

  return (
    <Card
      className={`border-l-4 ${isGoodForGoldenHour() ? 'border-l-green-500' : 'border-l-amber-500'}`}
    >
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getWeatherIcon()}
            <div>
              <h3 className="font-medium">{weatherData.weather[0].main}</h3>
              <p className="text-sm text-muted-foreground">{weatherData.weather[0].description}</p>
            </div>
          </div>
          <Badge
            variant={isGoodForGoldenHour() ? 'success' : 'outline'}
            className={isGoodForGoldenHour() ? 'bg-green-500' : ''}
          >
            {isGoodForGoldenHour() ? 'Ideal' : 'Suboptimal'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Temperature</p>
            <p className="font-medium">{Math.round(weatherData.main.temp - 273.15)}°C</p>
          </div>
          <div>
            <p className="text-muted-foreground">Cloud Coverage</p>
            <p className="font-medium">{weatherData.clouds?.all || 0}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Humidity</p>
            <p className="font-medium">{weatherData.main.humidity}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Wind</p>
            <p className="font-medium">{Math.round(weatherData.wind.speed * 3.6)} km/h</p>
          </div>
        </div>

        <p className="mt-4 text-center text-sm font-medium">{getQualityMessage()}</p>
      </CardContent>
    </Card>
  );
}
