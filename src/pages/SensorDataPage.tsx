import Layout from "@/components/Layout";
import SensorDashboard from "@/components/SensorDashboard";

const SensorDataPage = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Sensor Data Dashboard
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Real-time monitoring of environmental sensors measuring rainfall, ground vibration, 
              temperature, and soil moisture to detect landslide risk indicators.
            </p>
          </div>
          
          <SensorDashboard />
        </div>
      </div>
    </Layout>
  );
};

export default SensorDataPage;