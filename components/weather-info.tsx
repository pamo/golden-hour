'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

export interface WeatherData {
  list: Array<{
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
  }>;
}

interface WeatherInfoProps {
  weatherData: WeatherData;
  sunriseTime: Date;
  sunsetTime: Date;
}

export function WeatherInfo({ weatherData, sunriseTime, sunsetTime }: WeatherInfoProps) {
  const [useMetric, setUseMetric] = useState(false);

  // Determine if weather conditions are good for golden hour
  const isGoodForGoldenHour = (forecast: WeatherData['list'][0]) => {
    const badConditions = ['Rain', 'Thunderstorm', 'Drizzle', 'Snow', 'Mist', 'Fog', 'Haze'];
    const cloudCoverage = forecast.clouds.all;

    // Check if current weather condition is in the bad conditions list
    const hasBadWeather = forecast.weather.some((w) =>
      badConditions.some((condition) => w.main.includes(condition))
    );

    // Consider it good if there's no bad weather and cloud coverage is less than 70%
    return !hasBadWeather && cloudCoverage < 70;
  };

  const getWeatherIcon = (main: string) => {
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

  const getQualityMessage = (isGood: boolean) => {
    if (isGood) {
      return 'Great conditions for golden hour photography!';
    } else {
      return 'Weather conditions may affect golden hour quality.';
    }
  };

  const formatTemperature = (kelvin: number) => {
    if (useMetric) {
      return `${Math.round(kelvin - 273.15)}°C`;
    }
    return `${Math.round(((kelvin - 273.15) * 9) / 5 + 32)}°F`;
  };

  const formatWindSpeed = (mps: number) => {
    if (useMetric) {
      return `${Math.round(mps * 3.6)} km/h`;
    }
    return `${Math.round(mps * 2.237)} mph`;
  };

  const WeatherCard = ({ forecast }: { forecast: WeatherData['list'][0] }) => {
    const isGood = isGoodForGoldenHour(forecast);
    const main = forecast.weather[0].main;

    return (
      <Card className={`border-l-4 ${isGood ? 'border-l-green-500' : 'border-l-amber-500'}`}>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getWeatherIcon(main)}
              <div>
                <h3 className="font-medium">{main}</h3>
                <p className="text-sm text-muted-foreground">{forecast.weather[0].description}</p>
              </div>
            </div>
            <Badge
              variant={isGood ? 'secondary' : 'outline'}
              className={isGood ? 'bg-green-500 text-white' : ''}
            >
              {isGood ? 'Ideal' : 'Suboptimal'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Temperature</p>
              <p className="font-medium">{formatTemperature(forecast.main.temp)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Cloud Coverage</p>
              <p className="font-medium">{forecast.clouds.all}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Humidity</p>
              <p className="font-medium">{forecast.main.humidity}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Wind</p>
              <p className="font-medium">{formatWindSpeed(forecast.wind.speed)}</p>
            </div>
          </div>

          <p className="mt-4 text-center text-sm font-medium">{getQualityMessage(isGood)}</p>
        </CardContent>
      </Card>
    );
  };

  const sunriseForecast = weatherData.list.find(
    (f) => new Date(f.dt * 1000).getTime() >= sunriseTime.getTime()
  );
  const sunsetForecast = weatherData.list.find(
    (f) => new Date(f.dt * 1000).getTime() >= sunsetTime.getTime()
  );

  if (!sunriseForecast || !sunsetForecast) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end space-x-2">
        <Label htmlFor="unit-toggle" className="text-sm">
          Metric Units
        </Label>
        <Switch id="unit-toggle" checked={useMetric} onCheckedChange={setUseMetric} />
      </div>
      <Tabs defaultValue="sunrise" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sunrise">Sunrise Forecast</TabsTrigger>
          <TabsTrigger value="sunset">Sunset Forecast</TabsTrigger>
        </TabsList>
        <TabsContent value="sunrise">
          <WeatherCard forecast={sunriseForecast} />
        </TabsContent>
        <TabsContent value="sunset">
          <WeatherCard forecast={sunsetForecast} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
