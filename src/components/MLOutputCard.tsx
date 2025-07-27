import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, AlertCircle, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
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
}

const MLOutputCard = ({ className, showHeader = true, showGraphs = true }: MLOutputCardProps) => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching sensor data...');
        const { data, error } = await supabase
          .from('sensor_data')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        console.log('Received data:', data);
        
        if (data && data.length > 0) {
          setSensorData(data.reverse());
          console.log('Updated state with sensor data');
        } else {
          console.log('No data received from Supabase');
        }
        
      } catch (error) {
        console.error('Error fetching sensor data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up real-time subscription
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
            console.log('Received real-time update:', payload.new);
            const newData = [...currentData, payload.new as SensorData];
            if (newData.length > 20) newData.shift();
            return newData;
          });
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Refresh data every 5 seconds
    const interval = setInterval(fetchData, 5000);

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);

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
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary" />
          <span>ML Predictions & Sensor Data</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={cn("border", 
            getAlertColor(latestData.landslide_risk).border,
            getAlertColor(latestData.landslide_risk).bg
          )}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{latestData.landslide_risk}</div>
              <p className="text-sm text-muted-foreground">{latestData.notification}</p>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Risk Probability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{(latestData.risk_probability * 100).toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground">Confidence: {latestData.confidence}%</p>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Alert Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{latestData.alert}</div>
              <p className="text-sm text-muted-foreground">{latestData.reasoning}</p>
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
