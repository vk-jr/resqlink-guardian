import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Maximize2
} from "lucide-react";

interface ImageData {
  src: string;
  title: string;
  description: string;
}

const images: ImageData[] = [
  {
    src: "/Landslide_inventory.png",
    title: "Landslide Inventory",
    description: "Placeholder description for Landslide Inventory. This will be updated with actual content."
  },
  {
    src: "/Landslide_Susceptibility.jpg",
    title: "Landslide Susceptibility",
    description: "Placeholder description for Landslide Susceptibility. This will be updated with actual content."
  },
  {
    src: "/Risk.png",
    title: "Risk Assessment",
    description: "Placeholder description for Risk Assessment. This will be updated with actual content."
  },
  {
    src: "/kerala.png",
    title: "Kerala Landslide Map",
    description: "Placeholder description for Kerala landslide map. This will be updated with actual content."
  }
];

const LandslideDocuments = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextImage = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, []);

  const previousImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const toggleAutoplay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = () => {
    const element = document.getElementById('image-container');
    if (!document.fullscreenElement && element) {
      element.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isPlaying) {
      intervalId = setInterval(nextImage, 5000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, nextImage]);

  return (
    <Card className="shadow-xl">
      <CardContent className="p-6">
        <div className="text-2xl font-bold mb-6 flex items-center justify-between">
          <span>Landslide Documents</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleAutoplay}
              className="h-8 w-8"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              className="h-8 w-8"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Section */}
          <div 
            id="image-container" 
            className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}
          >
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <img
                src={images[currentIndex].src}
                alt={images[currentIndex].title}
                className="w-full h-full object-contain"
              />
              
              {/* Navigation Buttons */}
              <div className="absolute inset-0 flex items-center justify-between p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={previousImage}
                  className="h-8 w-8 bg-background/80 hover:bg-background"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextImage}
                  className="h-8 w-8 bg-background/80 hover:bg-background"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Image Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'bg-primary w-4'
                        : 'bg-primary/50'
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              {images[currentIndex].title}
            </h3>
            <p className="text-muted-foreground">
              {images[currentIndex].description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LandslideDocuments;
