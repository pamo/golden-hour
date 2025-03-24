'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin, Search, Sun } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WeatherData, WeatherInfo } from '@/components/weather-info';
import { getGoldenHourTimes, getWeatherData } from '@/lib/api';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { GoldenHourData } from '@/lib/types';
import { GoldenHourTimes } from '@/components/golden-hour-times';
import { Input } from '@/components/ui/input';
import { SunDirection } from '@/components/sun-direction';
import { useToast } from '@/components/ui/use-toast';

export function GoldenHourChecker() {
  const [location, setLocation] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [, setCoordinates] = useState<{
    lat: number | null;
    lon: number | null;
  }>({
    lat: null,
    lon: null,
  });
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [goldenHourData, setGoldenHourData] = useState<GoldenHourData | null>(null);
  const [deviceOrientation, setDeviceOrientation] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  const { toast } = useToast();

  // Get current location
  const getCurrentLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lon: longitude });

          try {
            const response = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
            );
            const data = await response.json();
            if (data && data.length > 0) {
              setLocation(`${data[0].name}, ${data[0].country}`);
            }

            fetchWeatherAndSunData(latitude, longitude);
          } catch (error) {
            console.error('Error fetching location name:', error);
            toast({
              title: 'Error',
              description: 'Failed to get location name. Please try again.',
              variant: 'destructive',
            });
            setIsLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: 'Location Access Denied',
            description: 'Please enable location services or use the search option.',
            variant: 'destructive',
          });
          setIsLoading(false);
        }
      );
    } else {
      toast({
        title: 'Geolocation Not Supported',
        description: "Your browser doesn't support geolocation. Please use the search option.",
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchLocation.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${searchLocation}&limit=1&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, name, country } = data[0];
        setCoordinates({ lat, lon });
        setLocation(`${name}, ${country}`);
        fetchWeatherAndSunData(lat, lon);
      } else {
        toast({
          title: 'Location Not Found',
          description: 'Please try a different location name.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error searching location:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to search location. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const fetchWeatherAndSunData = async (lat: number, lon: number) => {
    try {
      const weather = await getWeatherData(lat, lon);
      setWeatherData(weather);

      const goldenHour = getGoldenHourTimes(lat, lon);
      setGoldenHourData(goldenHour);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Data Fetch Error',
        description: 'Failed to get weather or sun data. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      // For iOS devices
      if ('webkitCompassHeading' in event) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setDeviceOrientation((event as any).webkitCompassHeading);
      }
      // For Android devices
      else if (event.alpha) {
        setDeviceOrientation(360 - event.alpha);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  return (
    <Card className="mx-auto w-full max-w-3xl bg-white/90 backdrop-blur-sm dark:bg-slate-800/90">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          <Sun className="h-6 w-6 text-amber-500" />
          Golden Hour Quality
        </CardTitle>
        <CardDescription className="text-center">
          Check weather conditions and sun position for the perfect shot
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="current"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Current Location</TabsTrigger>
            <TabsTrigger value="search">Search Location</TabsTrigger>
          </TabsList>
          <TabsContent value="current" className="mt-4">
            <Button
              onClick={getCurrentLocation}
              className="w-full bg-amber-600 text-white hover:bg-amber-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="mr-2 h-4 w-4" />
              )}
              Use My Location
            </Button>
          </TabsContent>
          <TabsContent value="search" className="mt-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter city name..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                className="bg-amber-600 text-white hover:bg-amber-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {location && weatherData && goldenHourData ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-2 text-lg font-medium">
              <MapPin className="h-5 w-5 text-amber-600" />
              <span>{location}</span>
            </div>

            <WeatherInfo
              weatherData={weatherData}
              sunriseTime={goldenHourData.morningStart}
              sunsetTime={goldenHourData.eveningStart}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <GoldenHourTimes goldenHourData={goldenHourData} />
              <SunDirection goldenHourData={goldenHourData} deviceOrientation={deviceOrientation} />
            </div>
          </div>
        ) : (
          !isLoading && (
            <div className="py-8 text-center text-muted-foreground">
              <Sun className="mx-auto mb-4 h-12 w-12 text-amber-400 opacity-50" />
              <p>Select your location to check golden hour quality</p>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
