import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Sample sensor data types
export interface SensorData {
  id: number;
  timestamp: string;
  soil_moisture: number;
  pore_water_pressure: number;
  distance_cm: number;
  vibration_detected: boolean;
  vibration_intensity: number;
  danger: boolean;
  confidence: number;
  reasoning: string;
  notification: string;
  alert: boolean;
  rainfall: number;
}

// ML Prediction types
export interface MLPrediction {
  id: string;
  timestamp: string;
  prediction: 'safe' | 'warning' | 'danger';
  confidence: number;
  recommendation: string;
}