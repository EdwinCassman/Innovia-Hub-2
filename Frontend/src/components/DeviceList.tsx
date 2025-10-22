import React, { useEffect, useState } from "react";
import { getDevices } from "../api/api"; // Importera funktionen från api.ts
import "../styles/DeviceList.css";

type Device = {
  id: string;
  model: string;
  serial: string;
};

const DeviceList = ({ onDeviceSelect }: { onDeviceSelect: (deviceId: string) => void }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null); // Hantera vald enhet

  useEffect(() => {
    getDevices()
      .then((data) => {
        console.log("Devices fetched:", data); // Logga de hämtade enheterna
        setDevices(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching devices:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading devices...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <ul className="device-list">
      {devices.map((device) => (
        <li
          key={device.id}
          className={`device-item ${selectedDeviceId === device.id ? "selected" : ""}`}
          onClick={() => {
            console.log("Selected device:", device.id); // Logga den valda enheten
            setSelectedDeviceId(device.id); // Uppdatera vald enhet
            onDeviceSelect(device.id); // Skicka vald enhet till föräldrakomponenten
          }}
        >
          {device.model} ({device.serial})
        </li>
      ))}
    </ul>
  );
};

export default DeviceList;