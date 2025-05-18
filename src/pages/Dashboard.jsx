import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fromLonLat } from "ol/proj";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { Style, Icon } from "ol/style";

import MapPanel from "../components/MapPanel";
import DroneTable from "../components/DroneTable";
import EmergencyModal from "../components/UserDrawer";
import { useFakeAlerts } from "../hooks/useFakeAlerts";
import { getDrones } from "../api/drones";
import { getStations } from "../api/stations";
import stationsData from "../data/stations.json";
import dronesData from "../data/drones.json";

// Simple quadratic bezier function
function getBezierCurve(p0, p1, p2, segments = 50) {
  const curve = [];
  for (let t = 0; t <= 1; t += 1 / segments) {
    const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0];
    const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1];
    curve.push([x, y]);
  }
  return curve;
}

// Function to create a path with multiple curves
function createMultiCurvePath(start, end, numCurves = 2) {
  const path = [];
  const segmentLength = 1 / numCurves;

  for (let i = 0; i < numCurves; i++) {
    const segmentStart = i === 0 ? start : path[path.length - 1];
    const segmentEnd =
      i === numCurves - 1
        ? end
        : [
            start[0] + (end[0] - start[0]) * (i + 1) * segmentLength,
            start[1] + (end[1] - start[1]) * (i + 1) * segmentLength,
          ];

    // Calculate control point with offset
    const midPoint = [
      (segmentStart[0] + segmentEnd[0]) / 2,
      (segmentStart[1] + segmentEnd[1]) / 2,
    ];

    // Alternate the curve direction
    const offset = 0.02 * (i % 2 === 0 ? 1 : -1);
    const controlPoint = [midPoint[0] + offset, midPoint[1] + offset];

    const curvePoints = getBezierCurve(segmentStart, controlPoint, segmentEnd);
    path.push(...curvePoints);
  }

  return path;
}

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drones, setDrones] = useState(dronesData);
  const [stations, setStations] = useState(stationsData);
  const [animatingDrones, setAnimatingDrones] = useState(new Set());
  const animationRefs = useRef({});
  const activeAlert = useFakeAlerts();

  const { data: apiDrones } = useQuery({
    queryKey: ["drones"],
    queryFn: getDrones,
  });

  const { data: apiStations } = useQuery({
    queryKey: ["stations"],
    queryFn: getStations,
  });

  // Update local state when API data changes
  useEffect(() => {
    if (apiDrones) {
      setDrones(apiDrones);
    }
  }, [apiDrones]);

  useEffect(() => {
    if (apiStations) {
      setStations(apiStations);
    }
  }, [apiStations]);

  // Open modal when there's an active alert
  useEffect(() => {
    if (activeAlert) {
      setIsModalOpen(true);
    }
  }, [activeAlert]);

  // Cleanup function for animations
  const cleanupAnimation = (droneId) => {
    if (animationRefs.current[droneId]) {
      cancelAnimationFrame(animationRefs.current[droneId]);
      delete animationRefs.current[droneId];
    }
    setAnimatingDrones((prev) => {
      const next = new Set(prev);
      next.delete(droneId);
      return next;
    });
  };

  // Cleanup all animations when component unmounts
  useEffect(() => {
    const cleanup = () => {
      Object.keys(animationRefs.current).forEach((droneId) => {
        if (animationRefs.current[droneId]) {
          cancelAnimationFrame(animationRefs.current[droneId]);
          delete animationRefs.current[droneId];
        }
      });
      setAnimatingDrones(new Set());
    };

    return cleanup;
  }, []);

  const findNearestStation = (drone) => {
    let nearestStation = null;
    let minDistance = Infinity;

    stations.forEach((station) => {
      const distance = Math.sqrt(
        Math.pow(station.lat - drone.lat, 2) +
          Math.pow(station.lon - drone.lon, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestStation = station;
      }
    });

    return nearestStation;
  };

  const animateDrone = (droneId, destination) => {
    const drone = drones.find((d) => d.id === droneId);
    if (!drone) return;

    const station = stations.find((s) => s.id === drone.station);
    if (!station) return;

    const startCoords = [station.lon, station.lat];
    const endCoords = [destination.lon, destination.lat];
    const duration = 2000; // 2 seconds
    const startTime = Date.now();

    // Create the path with multiple curves
    const numCurves = droneId === "D3" ? 3 : 2;
    const pathPoints = createMultiCurvePath(startCoords, endCoords, numCurves);
    const totalPoints = pathPoints.length;

    // Add drone to animating set
    setAnimatingDrones((prev) => new Set([...prev, droneId]));

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Calculate which point on the path to use
      const pointIndex = Math.floor(progress * (totalPoints - 1));
      const currentPoint = pathPoints[pointIndex];

      // Update drone position
      setDrones((prevDrones) =>
        prevDrones.map((d) =>
          d.id === droneId
            ? { ...d, lon: currentPoint[0], lat: currentPoint[1] }
            : d
        )
      );

      if (progress < 1) {
        animationRefs.current[droneId] = requestAnimationFrame(animate);
      } else {
        // Animation complete
        cleanupAnimation(droneId);
      }
    };

    animationRefs.current[droneId] = requestAnimationFrame(animate);
  };

  const handleSendDrone = (droneId) => {
    const drone = drones.find((d) => d.id === droneId);
    if (!drone) return;

    const station = stations.find((s) => s.id === drone.station);
    if (!station) return;

    // For D2, move to the left
    if (droneId === "D2") {
      animateDrone(droneId, {
        lon: station.lon - 0.2,
        lat: station.lat,
      });
    }
    // For D3, move down
    else if (droneId === "D3") {
      animateDrone(droneId, {
        lon: station.lon,
        lat: station.lat - 0.2,
      });
    }
    // For other drones, use their current position
    else {
      animateDrone(droneId, {
        lon: drone.lon,
        lat: drone.lat,
      });
    }
  };

  return (
    <div className="p-6 space-y-10">
      <ToastContainer />

      {/* Drone Table on top */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Drone Status</h2>
        <DroneTable
          drones={drones}
          onSendDrone={handleSendDrone}
          stations={stations}
        />
      </div>

      {/* Map centered below */}
      <div className="flex justify-center w-full">
        <div className="w-full max-w-4xl">
          <h2 className="text-2xl font-bold mb-4">Map View</h2>
          <MapPanel
            drones={drones}
            stations={stations}
            animatingDrones={animatingDrones}
          />
        </div>
      </div>

      {/* Emergency Modal rendered last for highest overlay */}
      <EmergencyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={activeAlert}
      />
    </div>
  );
}
