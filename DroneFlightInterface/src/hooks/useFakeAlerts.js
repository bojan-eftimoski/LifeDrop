import { useState, useEffect } from "react";
import { toast } from "react-toastify";

// Mock user data for alerts
const mockUsers = [
  {
    id: "U001",
    name: "John Doe",
    bloodType: "O+",
    allergies: ["Penicillin", "Peanuts"],
    conditions: ["Asthma"],
    emergencyContact: {
      name: "Jane Doe",
      phone: "+1 234 567 8900",
    },
    location: {
      latitude: 40.7128,
      longitude: -74.006,
    },
  },
  {
    id: "U002",
    name: "Alice Smith",
    bloodType: "A-",
    allergies: ["Shellfish"],
    conditions: ["Diabetes"],
    emergencyContact: {
      name: "Bob Smith",
      phone: "+1 234 567 8901",
    },
    location: {
      latitude: 40.7589,
      longitude: -73.9851,
    },
  },
];

export function useFakeAlerts() {
  const [activeAlert, setActiveAlert] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly select a user
      const randomUser =
        mockUsers[Math.floor(Math.random() * mockUsers.length)];

      // Show toast notification
      toast.error(
        `Emergency Alert: ${randomUser.name} has triggered their emergency button!`,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );

      // Set active alert
      setActiveAlert(randomUser);

      // Clear alert after 30 seconds
      setTimeout(() => {
        setActiveAlert(null);
      }, 30000);
    }, 1000000); // Trigger every 25 seconds

    return () => clearInterval(interval);
  }, []);

  return activeAlert;
}
