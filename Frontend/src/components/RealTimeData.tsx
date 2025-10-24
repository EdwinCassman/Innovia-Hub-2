import React, { useEffect, useState } from "react";
import { realtimeConnection, startRealtimeConnection } from "../signalRConnection";
import "../styles/RealTimeData.css";

type TelemetryData = {
  deviceId: string;
  type: string;
  value: string | number;
  time: string;
};

interface RealTimeDataProps {
  deviceId: string;
}

const RealTimeData: React.FC<RealTimeDataProps> = ({ deviceId }) => {
  const [data, setData] = useState<TelemetryData[]>([]);
  const [error, setError] = useState<string | null>(null);
  console.log("Rendering RealTimeData for deviceId:", deviceId);

  useEffect(() => {
    let isMounted = true;

    const initializeConnection = async () => {
      try {
        await startRealtimeConnection();

        // LYSSNAR PÅ INKOMMANDE MÄTNINGAR FRÅN SIGNALR
        realtimeConnection.on("measurementReceived", (measurement: TelemetryData) => {
          if (isMounted && measurement.deviceId === deviceId) {
            setData((prevData) => [measurement, ...prevData]);
          }
        });
      } catch (err) {
        console.error("Error initializing SignalR connection:", err);
        setError("Failed to connect to realtime updates.");
      }
    };

    initializeConnection();

    return () => {
      isMounted = false;

      // STOPPAR SIGNALR-ANSLUTNINGEN
      if (realtimeConnection.state === "Connected") {
        realtimeConnection.stop()
          .then(() => console.log("Realtime connection stopped."))
          .catch((err) => console.error("Error stopping realtime connection:", err));
      }
    };
  }, [deviceId]);

  if (error) {
    return <div className="realtime-data-container">Error: {error}</div>;
  }

  return (
    <div className="realtime-data-container">
      <h1>Realtime Data for Device {deviceId}</h1>
      {data.length === 0 ? (
        <p>No data available for this device.</p>
      ) : (
        <ul className="realtime-data-list">
          {data.map((item, index) => (
            <li key={index} className="realtime-data-item">
              <span className="type">Type: {item.type}</span>
              <span className="value">Value: {item.value}</span>
              <span className="time">Time: {item.time}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RealTimeData;