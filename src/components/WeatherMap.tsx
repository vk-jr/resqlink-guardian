import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Cloud, 
  Thermometer, 
  Droplets,
  RefreshCw,
  Settings
} from "lucide-react";

const WeatherMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiKey, setApiKey] = useState("d67c28bb330844a19e0135930252007");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [location, setLocation] = useState("New York");
  const { toast } = useToast();

  const fetchWeatherData = async (query: string = "New York") => {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${query}&aqi=yes`
      );
      
      if (!response.ok) {
        throw new Error('Weather API request failed');
      }
      
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      toast({
        title: "Weather Data Error",
        description: "Unable to fetch weather data. Please check your API key.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const initializeMap = async () => {
      setIsLoading(true);
      
      // Simulate map loading
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);

      // Fetch initial weather data for demo location (New York)
      await fetchWeatherData(location);
    };

    initializeMap();
  }, [apiKey]);

  const refreshWeatherData = () => {
    fetchWeatherData(location);
    toast({
      title: "Weather Data Refreshed",
      description: "Latest weather information has been loaded.",
    });
  };

  if (isLoading) {
    return (
      <Card className="h-[600px] shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span>Live Weather Map</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <RefreshCw className="h-12 w-12 text-primary mx-auto animate-spin" />
              <p className="text-muted-foreground">Loading weather map...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weather Controls */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-primary" />
              <span>Weather API Settings</span>
            </div>
            <Button onClick={refreshWeatherData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">WeatherAPI.com API Key</label>
              <Input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your WeatherAPI.com API key"
                type="password"
                className="bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <div className="flex space-x-2">
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter city name or coordinates"
                  className="bg-background"
                />
                <Button onClick={() => fetchWeatherData(location)}>
                  Search
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Data Display */}
      {weatherData && (
        <Card className="shadow-card bg-gradient-to-br from-card via-card to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cloud className="h-5 w-5 text-primary" />
                <span>Current Weather - {weatherData.location.name}, {weatherData.location.country}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Last updated: {new Date(weatherData.location.localtime).toLocaleTimeString()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-xl border border-orange-200 dark:border-orange-800">
                <Thermometer className="h-10 w-10 text-orange-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">{weatherData.current.temp_c}°C</div>
                <div className="text-sm font-medium text-orange-600 dark:text-orange-300">Temperature</div>
                <div className="text-xs text-muted-foreground mt-2">
                  Feels like {weatherData.current.feelslike_c}°C
                </div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <Droplets className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{weatherData.current.humidity}%</div>
                <div className="text-sm font-medium text-blue-600 dark:text-blue-300">Humidity</div>
                <div className="text-xs text-muted-foreground mt-2">
                  Pressure: {weatherData.current.pressure_mb} mb
                </div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20 rounded-xl border border-gray-200 dark:border-gray-800">
                <Cloud className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                <div className="text-lg font-bold text-gray-700 dark:text-gray-400 capitalize">{weatherData.current.condition.text}</div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Conditions</div>
                <div className="text-xs text-muted-foreground mt-2">
                  Visibility: {weatherData.current.vis_km} km
                </div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="h-10 w-10 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">AQI</span>
                </div>
                <div className="text-3xl font-bold text-green-700 dark:text-green-400">{weatherData.current.air_quality?.["us-epa-index"] || "N/A"}</div>
                <div className="text-sm font-medium text-green-600 dark:text-green-300">Air Quality</div>
                <div className="text-xs text-muted-foreground mt-2">
                  Wind: {weatherData.current.wind_kph} km/h
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Map Placeholder */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span>Global Weather Map</span>
            <Badge variant="outline">Interactive</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={mapContainer}
            className="h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-border flex items-center justify-center"
          >
            <div className="text-center space-y-4">
              <MapPin className="h-16 w-16 text-primary mx-auto" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Interactive Weather Map</h3>
                <p className="text-muted-foreground max-w-md">
                  This area will display a fully interactive world map with real-time weather overlays, 
                  temperature zones, precipitation data, and wind patterns.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Badge variant="secondary">Temperature Overlay</Badge>
                  <Badge variant="secondary">Precipitation</Badge>
                  <Badge variant="secondary">Wind Patterns</Badge>
                  <Badge variant="secondary">Cloud Cover</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherMap;