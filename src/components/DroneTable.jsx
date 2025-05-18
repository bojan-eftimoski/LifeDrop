import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";

const getStatusStyle = (status) => {
  switch (status) {
    case "en-route":
      return "bg-red-100 text-red-700";
    case "idle":
      return "bg-green-100 text-green-700";
    case "charging":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

// Function to calculate ETA based on coordinates
const calculateETA = (drone, station) => {
  if (!drone || !station) return null;

  // Calculate distance in kilometers using Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = ((station.lat - drone.lat) * Math.PI) / 180;
  const dLon = ((station.lon - drone.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((drone.lat * Math.PI) / 180) *
      Math.cos((station.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Assuming drone speed of 60 km/h
  const speed = 60;
  const timeInHours = distance / speed;
  const timeInMinutes = Math.round(timeInHours * 60);

  return timeInMinutes;
};

export default function DroneTable({
  drones = [],
  onSendDrone,
  stations = [],
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Battery</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>ETA</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drones.map((drone) => {
            const station = stations.find((s) => s.id === drone.station);
            const eta =
              (drone.id === "D2" || drone.id === "D3") &&
              drone.status === "en-route"
                ? calculateETA(drone, station)
                : null;

            return (
              <TableRow key={drone.id}>
                <TableCell>{drone.id}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                      drone.status
                    )}`}
                  >
                    {drone.status}
                  </span>
                </TableCell>
                <TableCell>{drone.battery}%</TableCell>
                <TableCell>
                  {drone.lat.toFixed(4)}, {drone.lon.toFixed(4)}
                </TableCell>
                <TableCell>
                  {eta !== null ? (
                    <span className="text-blue-600 font-medium">{eta} min</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {drone.status === "en-route" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSendDrone(drone.id)}
                    >
                      Send Drone
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="opacity-50 cursor-not-allowed"
                    >
                      Send Drone
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
