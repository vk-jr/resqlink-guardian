import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

interface SOSLocation {
  latitude: number;
  longitude: number;
  id: string;
  name: string;
  phone: string;
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
        .select('id, latitude, longitude, name, phone')
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
            <div class="relative">
              <div class="absolute -inset-3 bg-red-500 rounded-full opacity-25 animate-ping"></div>
              <div class="absolute -inset-3 bg-red-500 rounded-full opacity-25 animate-ping" style="animation-delay: 0.5s"></div>
              <div class="relative bg-gradient-to-r from-red-500 to-rose-600 text-white px-3 py-1 rounded-lg shadow-lg font-bold flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
                SOS
              </div>
            </div>
          `,
          className: 'custom-div-icon',
          iconSize: [60, 30],
          iconAnchor: [30, 15],
        });

        window.L.marker([location.latitude, location.longitude], { icon: sosIcon })
          .addTo(map)
          .bindPopup(`
            <div class="p-3 text-center">
              <div class="font-bold text-red-600 mb-2">EMERGENCY SOS</div>
              <div class="text-sm mb-2">
                <div class="font-semibold">${location.name}</div>
                <div class="text-gray-600 mb-2">${location.phone}</div>
                <div class="text-xs text-gray-500">Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</div>
              </div>
              <a href="tel:${location.phone}" class="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium">
                Call Now
              </a>
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
