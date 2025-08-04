import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

interface SOSLocation {
  latitude: number;
  longitude: number;
  id: string;
}

const EmergencyMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [sosLocations, setSOSLocations] = useState<SOSLocation[]>([]);
  const [map, setMap] = useState<any>(null);

  // Fetch SOS locations from Supabase
  const fetchSOSLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, latitude, longitude')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('Error fetching SOS locations:', error);
        return;
      }

      setSOSLocations(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    // Load Leaflet CSS
    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(linkEl);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (mapRef.current && window.L) {
        // Initialize map centered on Kerala
        const map = window.L.map(mapRef.current, {
          center: [10.8505, 76.2711], // Kerala coordinates
          zoom: 7,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        setMap(map);

        // Fetch initial SOS locations
        fetchSOSLocations();

        // Set up real-time subscription for SOS locations
        const channel = supabase
          .channel('users_sos')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'users',
            },
            () => {
              fetchSOSLocations();
            }
          )
          .subscribe();

        return () => {
          map.remove();
          supabase.removeChannel(channel);
        };
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Update markers when SOS locations change
  useEffect(() => {
    if (map && sosLocations.length > 0) {
      // Clear existing markers
      map.eachLayer((layer: any) => {
        if (layer instanceof window.L.Marker) {
          map.removeLayer(layer);
        }
      });

      // Add new markers for each SOS location
      sosLocations.forEach((location) => {
        const sosIcon = window.L.divIcon({
          html: `
            <div class="bg-destructive text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
              SOS
            </div>
          `,
          className: 'custom-div-icon',
        });

        window.L.marker([location.latitude, location.longitude], { icon: sosIcon })
          .addTo(map)
          .bindPopup(`
            <div class="p-2 text-center">
              <div class="font-bold text-red-600 mb-1">EMERGENCY SOS</div>
              <div class="text-sm">Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</div>
            </div>
          `);
      });
    }
  }, [sosLocations, map]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full min-h-[300px] rounded-lg overflow-hidden"
    />
  );
};

export default EmergencyMap;
