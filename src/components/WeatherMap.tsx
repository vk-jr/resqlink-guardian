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
  const { toast } = useToast();

  const fetchWeatherData = async (lat: number = 40.7128, lon: number = -74.0060) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
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
      await fetchWeatherData();
    };

    initializeMap();
  }, [apiKey]);

  const refreshWeatherData = () => {
    fetchWeatherData();
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
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">OpenWeather API Key</label>
              <Input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your OpenWeather API key"
                type="password"
              />
            </div>
            <Button onClick={() => fetchWeatherData()} className="mt-6">
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weather Data Display */}
      {weatherData && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cloud className="h-5 w-5 text-primary" />
              <span>Current Weather - {weatherData.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Thermometer className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{Math.round(weatherData.main.temp)}°C</div>
                <div className="text-sm text-muted-foreground">Temperature</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Feels like {Math.round(weatherData.main.feels_like)}°C
                </div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Droplets className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{weatherData.main.humidity}%</div>
                <div className="text-sm text-muted-foreground">Humidity</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Pressure: {weatherData.main.pressure} hPa
                </div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Cloud className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <div className="text-2xl font-bold capitalize">{weatherData.weather[0].description}</div>
                <div className="text-sm text-muted-foreground">Conditions</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Visibility: {weatherData.visibility / 1000} km
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