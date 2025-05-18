import React, { useState, useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import { Style, Icon, Stroke } from "ol/style";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

// Triglav center coordinates
const TRIGLAV_CENTER = [13.849, 46.38];

// Mock data for the replay
const replayData = {
  events: [
    {
      id: 1,
      timestamp: "2024-03-20T10:00:00Z",
      type: "start",
      droneId: "D3",
      coordinates: [13.845, 46.378], // Starting from Station S1
      description: "Drone D3 started mission from Station S1",
    },
    {
      id: 2,
      timestamp: "2024-03-20T10:05:00Z",
      type: "waypoint",
      droneId: "D3",
      coordinates: [13.83, 46.37],
      description: "Drone D3 reached first waypoint",
    },
    {
      id: 3,
      timestamp: "2024-03-20T10:10:00Z",
      type: "delivery",
      droneId: "D3",
      coordinates: [13.815, 46.365],
      description: "Drone D3 reached destination point",
    },
  ],
  stations: [
    {
      id: "S1",
      coordinates: [13.845, 46.378],
      name: "Station S1",
    },
    {
      id: "S2",
      coordinates: [13.855, 46.384],
      name: "Station S2",
    },
  ],
  drones: [
    {
      id: "D3",
      coordinates: [13.845, 46.378], // Starting position at Station S1
      name: "Drone D3",
    },
  ],
  route: {
    droneId: "D3",
    coordinates: [
      [13.845, 46.378], // Start at S1
      [13.842, 46.376],
      [13.838, 46.374],
      [13.834, 46.372],
      [13.83, 46.37], // First waypoint
      [13.825, 46.368],
      [13.82, 46.366],
      [13.815, 46.365], // Final destination
    ],
  },
};

const Replay = () => {
  const mapRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [map, setMap] = useState(null);
  const [droneFeature, setDroneFeature] = useState(null);
  const [routeFeature, setRouteFeature] = useState(null);
  const animationRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat(TRIGLAV_CENTER),
        zoom: 13,
      }),
    });

    setMap(initialMap);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      initialMap.setTarget(undefined);
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    // Create vector source for all features
    const vectorSource = new VectorSource();

    // Add stations
    replayData.stations.forEach((station) => {
      const stationFeature = new Feature({
        geometry: new Point(fromLonLat(station.coordinates)),
      });

      stationFeature.setStyle(
        new Style({
          image: new Icon({
            src: "/medical-station-icon.svg",
            scale: 1.2,
            anchor: [0.5, 1],
          }),
        })
      );

      stationFeature.set("type", "station");
      stationFeature.set("name", station.name);
      vectorSource.addFeature(stationFeature);
    });

    // Create drone feature
    const drone = new Feature({
      geometry: new Point(fromLonLat(replayData.drones[0].coordinates)),
    });

    drone.setStyle(
      new Style({
        image: new Icon({
          src: "/drone-icon.svg",
          scale: 1,
          anchor: [0.5, 0.5],
        }),
      })
    );

    drone.set("type", "drone");
    drone.set("name", replayData.drones[0].name);
    vectorSource.addFeature(drone);

    // Create route feature
    const route = new Feature({
      geometry: new LineString(
        replayData.route.coordinates.map((coord) => fromLonLat(coord))
      ),
    });

    route.setStyle(
      new Style({
        stroke: new Stroke({
          color: "red",
          width: 3,
          lineDash: [5, 5],
        }),
      })
    );

    vectorSource.addFeature(route);

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    map.addLayer(vectorLayer);
    setDroneFeature(drone);
    setRouteFeature(route);

    return () => {
      map.removeLayer(vectorLayer);
    };
  }, [map]);

  const animateDrone = (startCoord, endCoord, duration, onComplete) => {
    const start = fromLonLat(startCoord);
    const end = fromLonLat(endCoord);
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentCoord = [
        start[0] + (end[0] - start[0]) * progress,
        start[1] + (end[1] - start[1]) * progress,
      ];

      droneFeature.getGeometry().setCoordinates(currentCoord);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const startAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentStep(0);

    // First leg: Start to Waypoint
    animateDrone(
      replayData.events[0].coordinates,
      replayData.events[1].coordinates,
      2000,
      () => {
        setCurrentStep(1);
        // Wait for 0.5 seconds at waypoint
        setTimeout(() => {
          // Second leg: Waypoint to Destination
          animateDrone(
            replayData.events[1].coordinates,
            replayData.events[2].coordinates,
            2000,
            () => {
              setCurrentStep(2);
              setIsAnimating(false);
            }
          );
        }, 500);
      }
    );
  };

  const resetReplay = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setCurrentStep(0);
    setIsAnimating(false);
    if (droneFeature) {
      droneFeature
        .getGeometry()
        .setCoordinates(fromLonLat(replayData.events[0].coordinates));
    }
  };

  return (
    <div className="p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Mission Replay</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button onClick={startAnimation} disabled={isAnimating}>
              Start Replay
            </Button>
            <Button
              variant="outline"
              onClick={resetReplay}
              disabled={isAnimating}
            >
              Reset
            </Button>
          </div>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            {replayData.events.map((event, index) => (
              <div key={event.id} className="relative pl-8 pb-8">
                <div
                  className={`absolute left-3 top-1 w-3 h-3 rounded-full ${
                    index <= currentStep ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
                <div
                  className={`${
                    index <= currentStep ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  <div className="font-medium">{event.type}</div>
                  <div className="text-sm">{event.description}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div
        ref={mapRef}
        className="w-full h-[800px] rounded-lg border border-gray-200"
      />
    </div>
  );
};

export default Replay;
