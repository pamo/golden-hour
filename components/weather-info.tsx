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
      pressure: number;
    };
    clouds: {
      all: number;
      high?: number;
      low?: number;
      mid?: number;
    };
    wind: {
      speed: number;
      deg: number;
    };
    visibility: number;
    pop: number; // Probability of precipitation
  }>;
}

interface WeatherInfoProps {
  weatherData: WeatherData;
  sunriseTime: Date;
  sunsetTime: Date;
}

interface AfterglowPrediction {
  quality: 'Excellent' | 'Good' | 'Moderate' | 'Poor';
  description: string;
  factors: string[];
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

  const predictAfterglow = (forecast: WeatherData['list'][0]): AfterglowPrediction => {
    const factors: string[] = [];
    let quality: AfterglowPrediction['quality'] = 'Moderate';

    // Cloud analysis
    const highClouds = forecast.clouds.high || 0;
    const lowClouds = forecast.clouds.low || 0;

    if (highClouds > 30 && highClouds < 70) {
      factors.push('High-level clouds present - good for light scattering');
    } else if (highClouds >= 70) {
      factors.push('Too many high clouds - may block afterglow');
      quality = 'Poor';
    }

    if (lowClouds > 30) {
      factors.push('Low clouds present - may block afterglow');
      quality = 'Poor';
    }

    // Humidity analysis
    if (forecast.main.humidity > 70) {
      factors.push('High humidity - good for light scattering');
      if (quality !== 'Poor') quality = 'Good';
    } else if (forecast.main.humidity < 30) {
      factors.push('Low humidity - may reduce afterglow intensity');
      if (quality === 'Moderate') quality = 'Poor';
    }

    // Visibility analysis
    if (forecast.visibility < 5000) {
      factors.push('Poor visibility - may enhance afterglow colors');
      if (quality !== 'Poor') quality = 'Good';
    } else if (forecast.visibility > 20000) {
      factors.push('Very clear air - may reduce afterglow intensity');
      if (quality === 'Moderate') quality = 'Poor';
    }

    // Wind analysis
    if (forecast.wind.speed > 20) {
      factors.push('Strong winds - may disperse atmospheric particles');
      if (quality === 'Good') quality = 'Moderate';
    }

    // Precipitation probability
    if (forecast.pop > 0.3) {
      factors.push('Possible precipitation - may affect afterglow');
      if (quality === 'Good') quality = 'Moderate';
    }

    // Temperature gradient (using pressure as a proxy)
    if (forecast.main.pressure < 1000) {
      factors.push('Low pressure - may enhance atmospheric effects');
      if (quality === 'Good') quality = 'Excellent';
    }

    let description = '';
    switch (quality) {
      case 'Excellent':
        description = 'Perfect conditions for vibrant afterglow';
        break;
      case 'Good':
        description = 'Good conditions for afterglow';
        break;
      case 'Moderate':
        description = 'Moderate conditions for afterglow';
        break;
      case 'Poor':
        description = 'Poor conditions for afterglow';
        break;
    }

    return { quality, description, factors };
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
    const afterglow = predictAfterglow(forecast);

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

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Afterglow Prediction</h4>
              <Badge
                variant="outline"
                className={
                  afterglow.quality === 'Excellent'
                    ? 'bg-purple-500 text-white'
                    : afterglow.quality === 'Good'
                      ? 'bg-blue-500 text-white'
                      : afterglow.quality === 'Moderate'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-red-500 text-white'
                }
              >
                {afterglow.quality}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{afterglow.description}</p>
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Key Factors:</h5>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {afterglow.factors.map((factor, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-xs">•</span>
                    {factor}
                  </li>
                ))}
              </ul>
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
