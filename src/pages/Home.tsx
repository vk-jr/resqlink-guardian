import Layout from "@/components/Layout";
import MLOutputCard from "@/components/MLOutputCard";
import AlertSection from "@/components/AlertSection";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Zap, 
  Globe, 
  Activity,
  TrendingUp,
  MapPin
} from "lucide-react";

const Home = () => {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto py-8">
            <div className="text-center space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold">
                <span className="text-primary">
                  Landslide Early Warning
                </span>
                <br />
                <span className="text-foreground">System</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Advanced AI-powered monitoring system providing real-time landslide risk assessment 
                and emergency alerts to protect communities worldwide.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 max-w-3xl mx-auto mt-8">
                <Card className="shadow-card">
                  <CardContent className="p-2 text-center">
                    <div className="p-1 bg-primary/10 rounded-lg w-fit mx-auto mb-1">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-xl font-bold text-primary">24/7</div>
                    <div className="text-xs text-muted-foreground">Monitoring</div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-card">
                  <CardContent className="p-2 text-center">
                    <div className="p-1 bg-success/10 rounded-lg w-fit mx-auto mb-1">
                      <Zap className="h-4 w-4 text-success" />
                    </div>
                    <div className="text-xl font-bold text-success">87%</div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-card">
                  <CardContent className="p-2 text-center">
                    <div className="p-1 bg-accent/10 rounded-lg w-fit mx-auto mb-1">
                      <Globe className="h-4 w-4 text-accent" />
                    </div>
                    <div className="text-xl font-bold text-accent">150+</div>
                    <div className="text-xs text-muted-foreground">Sensors</div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-card">
                  <CardContent className="p-2 text-center">
                    <div className="p-1 bg-warning/10 rounded-lg w-fit mx-auto mb-1">
                      <TrendingUp className="h-4 w-4 text-warning" />
                    </div>
                    <div className="text-xl font-bold text-warning">12k+</div>
                    <div className="text-xs text-muted-foreground">Protected</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <div className="space-y-8">
            {/* Current ML Status */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <MapPin className="h-6 w-6 text-primary" />
                <span>Current Risk Assessment</span>
              </h2>
              <MLOutputCard showHeader={false} />
            </div>

            {/* Emergency Alert Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <Shield className="h-6 w-6 text-destructive" />
                <span>Emergency Response</span>
              </h2>
              <AlertSection />
            </div>

            {/* Mission Statement */}
            <Card className="shadow-card bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold">Our Mission</h3>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    ResQlink combines cutting-edge sensor technology, machine learning algorithms, 
                    and real-time weather data to provide the earliest possible warning of landslide 
                    risks, helping save lives and protect communities.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 pt-4">
                    <Badge variant="outline" className="px-3 py-1">
                      <Activity className="h-3 w-3 mr-1" />
                      Real-time Monitoring
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1">
                      <Zap className="h-3 w-3 mr-1" />
                      AI-Powered Predictions
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1">
                      <Shield className="h-3 w-3 mr-1" />
                      Community Protection
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;