import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  Activity, 
  Droplets, 
  Thermometer, 
  Zap,
  RefreshCw,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { supabase, type SensorData } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const SensorDashboard = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  // Generate realistic sensor data for demo
  const generateSensorData = (): SensorData[] => {
    const now = new Date();
    const data: SensorData[] = [];
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        id: `sensor_${i}`,
        timestamp: timestamp.toISOString(),
        rainfall: Math.random() * 50 + (i < 5 ? 20 : 0), // Higher rainfall in recent hours
        vibration: Math.random() * 10 + (i < 3 ? 5 : 0), // Higher vibration recently
        temperature: 20 + Math.random() * 15,
        moisture: 30 + Math.random() * 40,
        location: `Sensor ${i % 3 + 1}`
      });
    }
    
    return data;
  };

  const fetchSensorData = async () => {
    setIsLoading(true);
    try {
      // In a real application, this would fetch from Supabase
      // const { data, error } = await supabase
      //   .from('sensor_readings')
      //   .select('*')
      //   .order('timestamp', { ascending: false })
      //   .limit(24);

      // For demo purposes, generate realistic data
      const data = generateSensorData();
      setSensorData(data);
      setLastUpdate(new Date());
      
      toast({
        title: "Sensor Data Updated",
        description: "Latest sensor readings have been loaded.",
      });
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      toast({
        title: "Data Fetch Error",
        description: "Unable to load sensor data. Using cached data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchSensorData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatChartData = () => {
    return sensorData.map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      rainfall: item.rainfall,
      vibration: item.vibration,
      temperature: item.temperature,
      moisture: item.moisture
    }));
  };

  const getAverageReading = (field: keyof SensorData) => {
    if (sensorData.length === 0) return 0;
    const values = sensorData.map(item => item[field] as number).filter(val => typeof val === 'number');
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const getRiskLevel = () => {
    const avgRainfall = getAverageReading('rainfall');
    const avgVibration = getAverageReading('vibration');
    
    if (avgRainfall > 30 || avgVibration > 7) return 'high';
    if (avgRainfall > 15 || avgVibration > 4) return 'medium';
    return 'low';
  };

  const chartData = formatChartData();
  const riskLevel = getRiskLevel();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-40 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Droplets className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Rainfall</p>
                <p className="text-2xl font-bold">{getAverageReading('rainfall').toFixed(1)}mm</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Vibration</p>
                <p className="text-2xl font-bold">{getAverageReading('vibration').toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Thermometer className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Temperature</p>
                <p className="text-2xl font-bold">{getAverageReading('temperature').toFixed(1)}°C</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${
                riskLevel === 'high' ? 'bg-red-100' : 
                riskLevel === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                <AlertTriangle className={`h-5 w-5 ${
                  riskLevel === 'high' ? 'text-red-600' : 
                  riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <p className={`text-2xl font-bold capitalize ${
                  riskLevel === 'high' ? 'text-red-600' : 
                  riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {riskLevel}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Sensor Data Dashboard</span>
              <Badge variant="outline">Live</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <p className="text-sm text-muted-foreground">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
              <Button onClick={fetchSensorData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Rainfall & Vibration Chart */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Rainfall & Vibration Levels (24h)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="rainfall" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Rainfall (mm)"
              />
              <Line 
                type="monotone" 
                dataKey="vibration" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Vibration"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Temperature & Moisture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-orange-500" />
              <span>Temperature Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#f97316" 
                  fill="#f97316"
                  fillOpacity={0.3}
                  name="Temperature (°C)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              <span>Soil Moisture</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="moisture" 
                  fill="#06b6d4"
                  name="Moisture (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SensorDashboard;