import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, AlertCircle, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface MLPrediction {
  prediction: 'safe' | 'warning' | 'danger';
  confidence: number;
  recommendation: string;
  timestamp: string;
}

interface MLOutputCardProps {
  className?: string;
  showHeader?: boolean;
}

const MLOutputCard = ({ className, showHeader = true }: MLOutputCardProps) => {
  const [mlData, setMlData] = useState<MLPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate ML prediction data - in real app this would come from your ML API
  useEffect(() => {
    const simulateMLPrediction = () => {
      // Simulate varying predictions for demo
      const predictions = [
        {
          prediction: 'danger' as const,
          confidence: 87,
          recommendation: "⚠️ Landslide Likely — Recommend Alert Issuance and Citizen Notification",
          timestamp: new Date().toISOString()
        },
        {
          prediction: 'warning' as const,
          confidence: 65,
          recommendation: "⚡ Elevated Risk — Monitor conditions closely and prepare alerts",
          timestamp: new Date().toISOString()
        },
        {
          prediction: 'safe' as const,
          confidence: 92,
          recommendation: "✅ Low Risk — Continue normal monitoring protocols",
          timestamp: new Date().toISOString()
        }
      ];
      
      // Simulate higher chance of danger/warning for demo
      const randomIndex = Math.random() < 0.6 ? 0 : Math.random() < 0.8 ? 1 : 2;
      return predictions[randomIndex];
    };

    const fetchMLData = () => {
      setIsLoading(true);
      // Simulate API delay
      setTimeout(() => {
        setMlData(simulateMLPrediction());
        setIsLoading(false);
      }, 1000);
    };

    fetchMLData();
    // Update every 30 seconds
    const interval = setInterval(fetchMLData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getPredictionIcon = (prediction: string) => {
    switch (prediction) {
      case 'danger':
        return <AlertTriangle className="h-6 w-6" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6" />;
      case 'safe':
        return <Shield className="h-6 w-6" />;
      default:
        return <AlertCircle className="h-6 w-6" />;
    }
  };

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case 'danger':
        return "text-destructive";
      case 'warning':
        return "text-warning";
      case 'safe':
        return "text-success";
      default:
        return "text-muted-foreground";
    }
  };

  const getPredictionBg = (prediction: string) => {
    switch (prediction) {
      case 'danger':
        return "gradient-danger";
      case 'warning':
        return "gradient-warning";
      case 'safe':
        return "gradient-success";
      default:
        return "bg-muted";
    }
  };

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

  if (!mlData) return null;

  return (
    <Card className={cn("shadow-card", className)}>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className={cn("p-2 rounded-lg", getPredictionBg(mlData.prediction))}>
              {getPredictionIcon(mlData.prediction)}
            </div>
            <span>ML Prediction Status</span>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn("p-3 rounded-full", getPredictionBg(mlData.prediction))}>
              {getPredictionIcon(mlData.prediction)}
            </div>
            <div>
              <h3 className={cn("text-2xl font-bold capitalize", getPredictionColor(mlData.prediction))}>
                {mlData.prediction} Status
              </h3>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(mlData.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn("text-lg px-3 py-1", getPredictionColor(mlData.prediction))}
          >
            {mlData.confidence}% confidence
          </Badge>
        </div>
        
        <div className={cn("p-4 rounded-lg border-l-4", 
          mlData.prediction === 'danger' ? "bg-destructive/10 border-destructive" :
          mlData.prediction === 'warning' ? "bg-warning/10 border-warning" :
          "bg-success/10 border-success"
        )}>
          <p className="font-medium text-sm">{mlData.recommendation}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MLOutputCard;