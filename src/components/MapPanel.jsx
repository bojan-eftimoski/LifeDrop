import React, { useEffect, useRef } from "react";
import OpenLayersMap from "./OpenLayersMap";

// Helper function to check if coordinates are valid
const isValidCoordinates = (lat, lng) => {
  return typeof lat === "number" && typeof lng === "number";
};

// Helper to offset drones around a station
const getOffsetPosition = (lat, lng, index, total) => {
  // Offset drones in a small circle around the station
  const radius = 0.001; // ~100m
  const angle = (2 * Math.PI * index) / total;
  return [lat + radius * Math.cos(angle), lng + radius * Math.sin(angle)];
};

const stationIconUrl = "/medical-station-icon.svg";
const droneIconUrl = "/drone-icon.svg";
const triglavCenter = [13.849, 46.38]; // [lng, lat]

const personLocations = [
  { lat: 46.172, lng: 13.83 },
  { lat: 46.4, lng: 13.65 },
];

export default function MapPanel({
  drones = [],
  stations = [],
  animatingDrones = new Set(),
}) {
  // Group drones by stationId
  const dronesByStation = stations.map((station) => {
    const stationDrones = drones.filter(
      (drone) =>
        drone.station === station.id && isValidCoordinates(drone.lat, drone.lon)
    );
    return { ...station, drones: stationDrones };
  });

  // Prepare markers for OpenLayersMap
  const stationMarkers = stations
    .filter((station) => isValidCoordinates(station.lat, station.lon))
    .map((station) => ({
      lat: station.lat,
      lng: station.lon,
      iconUrl: stationIconUrl,
      popupContent: `Station ${station.id}`,
    }));

  const droneMarkers = drones
    .filter((drone) => isValidCoordinates(drone.lat, drone.lon))
    .map((drone) => {
      const marker = {
        lat: drone.lat,
        lng: drone.lon,
        iconUrl: droneIconUrl,
        popupContent: `Drone ${drone.id}`,
        isAnimating: animatingDrones.has(drone.id),
        id: drone.id,
      };

      // If the drone is animating, add start and end coordinates
      if (animatingDrones.has(drone.id)) {
        const station = stations.find((s) => s.id === drone.station);
        if (station) {
          // For D2, move to the left
          if (drone.id === "D2") {
            marker.startCoords = [station.lon, station.lat];
            marker.endCoords = [station.lon - 0.2, station.lat];
          }
          // For D3, move down
          else if (drone.id === "D3") {
            marker.startCoords = [station.lon, station.lat];
            marker.endCoords = [station.lon, station.lat - 0.2];
          }
          // For other drones, use their current position
          else {
            marker.startCoords = [station.lon, station.lat];
            marker.endCoords = [drone.lon, drone.lat];
          }
        }
      }

      return marker;
    });

  const personMarkers = personLocations.map((location, index) => ({
    lat: location.lat,
    lng: location.lng,
    iconUrl: "/person-icon.svg",
    popupContent: `Person ${index + 1}`,
    isPerson: true,
  }));

  const allMarkers = [...personMarkers, ...stationMarkers, ...droneMarkers];

  return (
    <div className="w-full h-[750px] rounded-lg overflow-hidden border border-border bg-white shadow-lg">
      <OpenLayersMap
        center={triglavCenter}
        zoom={11}
        markers={allMarkers}
        height={750}
        animatingDrones={animatingDrones}
      />
    </div>
  );
}
