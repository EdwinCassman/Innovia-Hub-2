import * as signalR from "@microsoft/signalr";

const token = localStorage.getItem("token");

export const connection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5022/bookingHub", {
    accessTokenFactory: () => token || ""
  })
  .withAutomaticReconnect()
  .build();

// Frontend ansluter nu bara till backend (5022)
export const realtimeConnection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5022/hub/realtime", {
    withCredentials: true, // Viktigt för autentisering om det behövs
  })
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Information)
  .build();

export const startRealtimeConnection = async () => {
  if (realtimeConnection.state === "Disconnected") {
    try {
      await realtimeConnection.start();
      console.log("✅ Realtime connection started.");

      // Lyssna på inkommande data
      realtimeConnection.on("measurementReceived", (data) => {
        console.log("📩 Realtime data received:", data);
      });
    } catch (err) {
      console.error("❌ Error starting realtime connection:", err);
    }
  }
};
