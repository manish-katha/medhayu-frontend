

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sun, Cloud, CloudRain, CloudSnow, Wind, MapPin, Loader2, AlertTriangle, Leaf, Droplets } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { useDeshaClassifier, DeshaData } from '@/hooks/useDeshaClassifier';

interface WeatherWidgetProps {
  className?: string;
}

interface LocationInfo {
    city: string;
    state: string;
}

interface CurrentWeather {
  currentTemp: number;
  conditionCode: number;
  high: number;
  low: number;
  humidity: number;
  wind: number;
}

interface WeatherData {
  location: LocationInfo;
  weather: CurrentWeather;
  deshaData?: DeshaData | null;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ className }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const deshaType = useDeshaClassifier(weatherData?.deshaData);

  const fetchWeatherData = useCallback(async (latitude: number, longitude: number) => {
    setLoading(true);
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const locationUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    const climateUrl = `https://climate-api.open-meteo.com/v1/climate?latitude=${latitude}&longitude=${longitude}&models=FGOALS-f3-L&start_date=2020-01-01&end_date=2020-12-31&daily=precipitation_sum`;
    
    try {
      // Fetch primary data first
      const [weatherResponse, locationResponse] = await Promise.all([
        fetch(weatherUrl),
        fetch(locationUrl)
      ]);

      if (!weatherResponse.ok || !locationResponse.ok) {
        throw new Error('Failed to fetch essential weather or location data.');
      }
      
      const weatherJson = await weatherResponse.json();
      const locationJson = await locationResponse.json();
      
      const city = locationJson.address.city || locationJson.address.town || locationJson.address.village || 'Unknown Location';
      const state = locationJson.address.state || '';

      const partialData: WeatherData = {
        location: { city, state },
        weather: {
          currentTemp: Math.round(weatherJson.current.temperature_2m),
          conditionCode: weatherJson.current.weather_code,
          high: Math.round(weatherJson.daily.temperature_2m_max[0]),
          low: Math.round(weatherJson.daily.temperature_2m_min[0]),
          humidity: Math.round(weatherJson.current.relative_humidity_2m),
          wind: Math.round(weatherJson.current.wind_speed_10m),
        },
        deshaData: null
      };

      setWeatherData(partialData);
      setLoading(false); // Display initial weather data

      // Then fetch secondary climate data for Desha classification
      try {
        const climateResponse = await fetch(climateUrl);
        if (climateResponse.ok) {
          const climateData = await climateResponse.json();
          const annualPrecipitation = climateData.daily.precipitation_sum.reduce((a: number, b: number) => a + b, 0);

          const deshaPayload: DeshaData = {
            rainfall: annualPrecipitation,
            humidity: partialData.weather.humidity,
            soilType: annualPrecipitation < 700 ? 'sandy' : 'clayey', // Simplified logic
            vegetationIndex: annualPrecipitation < 700 ? 0.15 : 0.65, // Simplified logic
          };
          setWeatherData(prevData => prevData ? { ...prevData, deshaData: deshaPayload } : null);
        }
      } catch (climateError) {
          console.warn("Could not fetch climate data for Desha classification:", climateError);
          // Don't set error, as primary weather is already displayed
      }

    } catch (err) {
      console.error(err);
      setError("Failed to fetch weather data.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setError(null);
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setError("Location access denied. Showing default weather.");
          toast({
            title: "Location Access Denied",
            description: "Showing weather for a default location. Please enable location permissions for accurate data.",
            variant: "destructive"
          });
          fetchWeatherData(12.97, 77.59); // Fallback to Bangalore
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  }, [fetchWeatherData, toast]);

  const getWeatherInterpretation = (code: number): {icon: React.ReactNode, condition: string, advice: string} => {
    const iconSizeClass = "h-6 w-6 sm:h-8 sm:w-8";
    switch (code) {
      case 0: return { icon: <Sun className={`${iconSizeClass} text-amber-500`} />, condition: "Clear sky", advice: "Pitta may increase. Stay hydrated and cool." };
      case 1:
      case 2:
      case 3:
        return { icon: <Cloud className={`${iconSizeClass} text-blue-500`} />, condition: "Partly cloudy", advice: "Balanced day. Good for all doshas." };
      case 45:
      case 48:
        return { icon: <Cloud className={`${iconSizeClass} text-gray-500`} />, condition: "Foggy", advice: "Kapha may be aggravated. Opt for warm, light foods." };
      case 51:
      case 53:
      case 55:
      case 61:
      case 63:
      case 65:
      case 80:
      case 81:
      case 82:
        return { icon: <CloudRain className={`${iconSizeClass} text-blue-700`} />, condition: "Rainy", advice: "Vata is high. Keep warm and eat nourishing meals." };
      case 71:
      case 73:
      case 75:
      case 85:
      case 86:
        return { icon: <CloudSnow className={`${iconSizeClass} text-blue-300`} />, condition: "Snowy", advice: "Vata and Kapha are high. Favor warm, spicy foods." };
      case 95:
      case 96:
      case 99:
        return { icon: <Wind className={`${iconSizeClass} text-slate-500`} />, condition: "Thunderstorm", advice: "Vata is highly aggravated. Stay indoors and calm." };
      default:
        return { icon: <Sun className={`${iconSizeClass} text-amber-500`} />, condition: "Clear", advice: "Enjoy the balanced weather." };
    }
  };
  
  const deshaAdvisory = {
    JANGALA: "This region is classified as JANGALA DESHA. Vata dosha predominates here. Residents are prone to neurological and joint disorders. Suggested therapies involve Snehana and Swedana.",
    ANUPA: "This region is classified as ANUPA DESHA. Kapha dosha predominates here. Residents are prone to respiratory congestion and heaviness. Suggested therapies involve Langhana, Swedana, and detox.",
    SADHARANA: "This region is classified as SADHARANA DESHA. All doshas are relatively balanced. General wellness guidelines apply.",
  };

  if (loading) {
    return (
        <Card className={className}>
            <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                </div>
                <Skeleton className="h-20 mt-4" />
            </CardContent>
        </Card>
    );
  }

  if (error && !weatherData) {
    return (
        <Card className={className}>
             <CardContent className="p-4 flex flex-col items-center justify-center h-full text-center">
                <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
                <h4 className="font-semibold">Weather Unavailable</h4>
                <p className="text-sm text-muted-foreground">{error}</p>
            </CardContent>
        </Card>
    );
  }

  if (!weatherData) return null;
  
  const { icon, condition, advice } = getWeatherInterpretation(weatherData.weather.conditionCode);

  return (
    <Card className={className}>
      <CardContent className="p-3 md:p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><MapPin size={12}/> {weatherData.location.city}, {weatherData.location.state}</p>
            <div className="flex items-center mt-1">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold">{weatherData.weather.currentTemp}°C</span>
              <span className="ml-2 text-xs text-muted-foreground">{condition}</span>
            </div>
            <p className="text-xs sm:text-sm mt-1">
              <span className="text-red-500">H: {weatherData.weather.high}°</span>{" "}
              <span className="text-blue-500">L: {weatherData.weather.low}°</span>
            </p>
          </div>
          <div className="flex flex-col items-center">
            {icon}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 md:gap-4 mt-3">
          <div className="text-xs sm:text-sm flex items-center gap-2">
            <Droplets size={16} className="text-muted-foreground"/>
            <div>
                <span className="block text-muted-foreground text-xs">Humidity</span>
                <span className="font-medium text-xs sm:text-sm">{weatherData.weather.humidity}%</span>
            </div>
          </div>
          <div className="text-xs sm:text-sm flex items-center gap-2">
             <Wind size={16} className="text-muted-foreground"/>
            <div>
              <span className="block text-muted-foreground text-xs">Wind</span>
              <span className="font-medium text-xs sm:text-sm">{weatherData.weather.wind} km/h</span>
            </div>
          </div>
        </div>

        {deshaType ? (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs sm:text-sm text-ayurveda-green font-medium flex items-center gap-1">
                <Leaf size={14}/>
                Ayurvedic Regional Assessment (Desha)
              </p>
              <p className="text-xs mt-1">
                <span className="font-semibold">{deshaType} DESHA.</span> {deshaAdvisory[deshaType]}
              </p>
            </div>
        ) : (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs sm:text-sm text-ayurveda-green font-medium flex items-center gap-1">
                <Leaf size={14}/>
                Ayurvedic Weather Insight
              </p>
              <p className="text-xs mt-1">
                {advice}
              </p>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;

