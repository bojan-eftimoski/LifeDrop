import React, { useState } from "react";
import EmergencyModal from "../components/UserDrawer";
import OpenLayersMap from "../components/OpenLayersMap";

// Dummy emergencies data
const emergencies = [
  {
    id: "E001",
    name: "Alice Smith",
    bloodType: "A-",
    allergies: ["Shellfish"],
    conditions: ["Diabetes"],
    emergencyContact: { name: "Bob Smith", phone: "+1 234 567 8901" },
    location: { latitude: 40.7589, longitude: -73.9851 },
    status: "Active",
    description:
      "Severe allergic reaction reported. Immediate assistance required.",
    time: "2024-06-01T14:23:00Z",
  },
  {
    id: "E002",
    name: "John Doe",
    bloodType: "O+",
    allergies: [],
    conditions: ["Asthma"],
    emergencyContact: { name: "Jane Doe", phone: "+1 555 123 4567" },
    location: { latitude: 40.7306, longitude: -73.9352 },
    status: "Resolved",
    description: "Asthma attack, resolved on site.",
    time: "2024-06-01T13:10:00Z",
  },
];

const emergencyIconUrl =
  "https://cdn-icons-png.flaticon.com/512/535/535234.png";
// Triglav National Park center [lng, lat]
const triglavCenter = [13.849, 46.38];

export default function Emergencies() {
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [modalEmergency, setModalEmergency] = useState(null);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-6">Emergencies</h1>
      <div className="bg-white rounded-lg shadow divide-y divide-border">
        {emergencies.map((emergency) => (
          <div
            key={emergency.id}
            className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <div className="font-semibold text-lg">{emergency.name}</div>
              <div className="text-sm text-muted-foreground">
                {emergency.description}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Status: {emergency.status} &bull;{" "}
                {new Date(emergency.time).toLocaleString()}
              </div>
            </div>
            <button
              className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition"
              onClick={() => setSelectedEmergency(emergency)}
            >
              See More Details
            </button>
          </div>
        ))}
      </div>

      {/* Inline See More Details section */}
      {selectedEmergency && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-border shadow space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Emergency Details</h2>
            <button
              className="px-4 py-2 bg-emerald-600 text-white rounded shadow hover:bg-emerald-700 focus:bg-emerald-700 transition font-semibold"
              onClick={() => setModalEmergency(selectedEmergency)}
            >
              Show in Modal
            </button>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              User Information
            </h3>
            <p className="mt-1 font-semibold">
              {selectedEmergency.name || "Unknown"}
            </p>
            <p className="text-sm text-muted-foreground">
              ID: {selectedEmergency.id || "N/A"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Medical Information
            </h3>
            <div className="mt-2 space-y-2">
              <p>
                <span className="font-medium">Blood Type:</span>{" "}
                {selectedEmergency.bloodType || "N/A"}
              </p>
              <p>
                <span className="font-medium">Allergies:</span>{" "}
                {selectedEmergency.allergies?.length
                  ? selectedEmergency.allergies.join(", ")
                  : "None"}
              </p>
              <p>
                <span className="font-medium">Conditions:</span>{" "}
                {selectedEmergency.conditions?.length
                  ? selectedEmergency.conditions.join(", ")
                  : "None"}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Emergency Contact
            </h3>
            <p className="mt-1">
              {selectedEmergency.emergencyContact?.name || "N/A"}
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedEmergency.emergencyContact?.phone || "N/A"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Location
            </h3>
            <p className="mt-1">
              {selectedEmergency.location &&
              typeof selectedEmergency.location.latitude === "number" &&
              typeof selectedEmergency.location.longitude === "number"
                ? `${selectedEmergency.location.latitude.toFixed(
                    4
                  )}, ${selectedEmergency.location.longitude.toFixed(4)}`
                : "N/A"}
            </p>
            <div className="w-full h-48 rounded overflow-hidden border mt-2">
              <OpenLayersMap
                center={triglavCenter}
                zoom={11}
                height={192}
                markers={[
                  {
                    lat: selectedEmergency.location.latitude,
                    lng: selectedEmergency.location.longitude,
                    iconUrl: emergencyIconUrl,
                    popupContent: "Emergency Location",
                  },
                ]}
              />
            </div>
          </div>
        </div>
      )}

      {/* Emergency Modal with small map */}
      <EmergencyModal
        isOpen={!!modalEmergency}
        onClose={() => setModalEmergency(null)}
        user={modalEmergency}
      >
        {modalEmergency && modalEmergency.location && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Pinned Location
            </h3>
            <div className="w-full h-48 rounded overflow-hidden border">
              <OpenLayersMap
                center={triglavCenter}
                zoom={11}
                height={192}
                markers={[
                  {
                    lat: modalEmergency.location.latitude,
                    lng: modalEmergency.location.longitude,
                    iconUrl: emergencyIconUrl,
                    popupContent: "Emergency Location",
                  },
                ]}
              />
            </div>
          </div>
        )}
      </EmergencyModal>
    </div>
  );
}
