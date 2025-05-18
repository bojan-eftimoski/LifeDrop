import React from "react";
import { Link } from "react-router-dom";

export default function EmergencyModal({ isOpen, onClose, user, children }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      {/* Modal */}
      <div className="fixed inset-0 z-60 flex items-center justify-center">
        <div className="relative bg-white border border-border shadow-2xl rounded-xl w-full max-w-lg mx-4 p-8 animate-fadeIn">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full text-xl"
            aria-label="Close"
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold mb-6 text-center">
            Emergency Alert
          </h2>

          {user && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  User Information
                </h3>
                <p className="mt-1 font-semibold">{user.name || "Unknown"}</p>
                <p className="text-sm text-muted-foreground">
                  ID: {user.id || "N/A"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Medical Information
                </h3>
                <div className="mt-2 space-y-2">
                  <p>
                    <span className="font-medium">Blood Type:</span>{" "}
                    {user.bloodType || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Allergies:</span>{" "}
                    {user.allergies?.length
                      ? user.allergies.join(", ")
                      : "None"}
                  </p>
                  <p>
                    <span className="font-medium">Conditions:</span>{" "}
                    {user.conditions?.length
                      ? user.conditions.join(", ")
                      : "None"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Emergency Contact
                </h3>
                <p className="mt-1">{user.emergencyContact?.name || "N/A"}</p>
                <p className="text-sm text-muted-foreground">
                  {user.emergencyContact?.phone || "N/A"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Location
                </h3>
                <p className="mt-1">
                  {user.location &&
                  typeof user.location.latitude === "number" &&
                  typeof user.location.longitude === "number"
                    ? `${user.location.latitude.toFixed(
                        4
                      )}, ${user.location.longitude.toFixed(4)}`
                    : "N/A"}
                </p>
              </div>
            </div>
          )}
          {children}
          <div className="mt-8 flex justify-center">
            <Link
              to="/emergencies"
              className="px-6 py-2 bg-emerald-600 text-white rounded shadow hover:bg-emerald-700 focus:bg-emerald-700 transition font-semibold"
            >
              Go to Emergencies Page
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
