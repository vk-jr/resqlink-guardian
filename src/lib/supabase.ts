import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Sample sensor data types
export interface SensorData {
  id: string;
  timestamp: string;
  rainfall: number;
  vibration: number;
  temperature: number;
  moisture: number;
  location: string;
}

// ML Prediction types
export interface MLPrediction {
  id: string;
  timestamp: string;
  prediction: 'safe' | 'warning' | 'danger';
  confidence: number;
  recommendation: string;
}