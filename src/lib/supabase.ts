import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axhllqkehjppzhjyjumg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4aGxscWtlaGpwcHpoanlqdW1nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIxODAxNCwiZXhwIjoyMDY3Nzk0MDE0fQ.m8Ye09Nt7pZf4cIdIQpNoC0hMzJXHl83KoiLgUSXy4A';

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