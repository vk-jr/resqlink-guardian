import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, AlertCircle, Brain, RefreshCw, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SensorData {
  id: number;
  timestamp: string;
  notification: string;
  alert: string;
  landslide_risk: string;
  predicted_soil_moisture: number;
  predicted_pore_pressure: number;
  risk_probability: number;
  confidence: number;
  reasoning: string;
  rainfall_24h_mm: number;
  rainfall_3h_mm: number;
}

interface MLOutputCardProps {
  className?: string;
  showHeader?: boolean;
  showGraphs?: boolean;
  limit?: number;
}

const MLOutputCard = ({ className, showHeader = true, showGraphs = true, limit = 20 }: MLOutputCardProps) => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sensor_data')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        toast({
          title: "Error fetching data",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      if (data && data.length > 0) {
        setSensorData(data.reverse());
        setLastUpdate(new Date());
        toast({
          title: "Data refreshed",
          description: `Fetched ${data.length} records successfully`,
        });
      } else {
        toast({
          title: "No data available",
          description: "No sensor data found",
          variant: "warning",
        });
      }
      
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    const subscription = supabase
      .channel('sensor_data_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_data',
        },
        (payload) => {
          setSensorData(currentData => {
            const newData = [...currentData, payload.new as SensorData];
            if (newData.length > limit) newData.shift();
            return newData;
          });
          setLastUpdate(new Date());
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [limit]);

  if (isLoading) {
    return (
      <Card className={cn("shadow-card", className)}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <span>ML Prediction Status</span>
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded mb-4"></div>
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sensorData.length) return null;

  const latestData = sensorData[sensorData.length - 1];
  const labels = sensorData.map(data => new Date(data.timestamp).toLocaleTimeString());

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Real-time ML Predictions'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      }
    }
  };

  const moistureData = {
    labels,
    datasets: [
      {
        label: 'Predicted Soil Moisture',
        data: sensorData.map(data => data.predicted_soil_moisture),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        fill: true,
      }
    ]
  };

  const pressureData = {
    labels,
    datasets: [
      {
        label: 'Predicted Pore Pressure',
        data: sensorData.map(data => data.predicted_pore_pressure),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        fill: true,
      }
    ]
  };

  const riskData = {
    labels,
    datasets: [
      {
        label: 'Risk Probability',
        data: sensorData.map(data => data.risk_probability),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        fill: true,
      }
    ]
  };

  const rainfallData = {
    labels,
    datasets: [
      {
        label: '24h Rainfall (mm)',
        data: sensorData.map(data => data.rainfall_24h_mm),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y1',
      },
      {
        label: '3h Rainfall (mm)',
        data: sensorData.map(data => data.rainfall_3h_mm),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        yAxisID: 'y1',
      }
    ]
  };

  const rainfallOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Rainfall (mm)'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    },
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'Rainfall Measurements'
      }
    }
  };

  const getAlertColor = (landslide_risk: string) => {
    switch (landslide_risk.toLowerCase()) {
      case 'high':
        return { bg: 'bg-destructive/10', border: 'border-destructive', text: 'text-destructive' };
      case 'medium':
        return { bg: 'bg-warning/10', border: 'border-warning', text: 'text-warning' };
      default:
        return { bg: 'bg-success/10', border: 'border-success', text: 'text-success' };
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          ML Predictions & Sensor Data
        </CardTitle>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className={cn(
            "transition-colors",
            getAlertColor(latestData.landslide_risk).border,
            getAlertColor(latestData.landslide_risk).bg
          )}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className={cn("h-4 w-4", getAlertColor(latestData.landslide_risk).text)} />
                  <span className="text-sm font-medium">Current Status</span>
                </div>
                <Badge variant={latestData.landslide_risk.toLowerCase() === "high" ? "destructive" : "default"}>
                  {latestData.landslide_risk}
                </Badge>
              </div>
              <div className="mt-3">
                <p className="text-sm text-muted-foreground">{latestData.notification}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Risk Analysis</span>
                </div>
                <div className="text-2xl font-bold">{(latestData.risk_probability * 100).toFixed(1)}%</div>
              </div>
              <div className="mt-3">
                <p className="text-sm text-muted-foreground">Confidence: {latestData.confidence}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Alert Status</span>
                </div>
                <Badge>{latestData.alert}</Badge>
              </div>
              <div className="mt-3">
                <p className="text-sm text-muted-foreground">{latestData.reasoning}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphs */}
        {showGraphs && (
          <div className="space-y-6">
            <div className="h-[300px] p-4 border rounded-lg">
              <h3 className="font-medium mb-4">Rainfall Measurements</h3>
              <Line options={rainfallOptions} data={rainfallData} />
            </div>
            <div className="h-[300px] p-4 border rounded-lg">
              <h3 className="font-medium mb-4">Predicted Soil Moisture</h3>
              <Line options={chartOptions} data={moistureData} />
            </div>
            <div className="h-[300px] p-4 border rounded-lg">
              <h3 className="font-medium mb-4">Predicted Pore Pressure</h3>
              <Line options={chartOptions} data={pressureData} />
            </div>
            <div className="h-[300px] p-4 border rounded-lg">
              <h3 className="font-medium mb-4">Risk Probability Trend</h3>
              <Line options={chartOptions} data={riskData} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MLOutputCard;
