import * as signalR from "@microsoft/signalr";

const token = localStorage.getItem("token");

// SIGNAL R FÖR BOKNINGAR
export const connection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5022/bookingHub", {
    accessTokenFactory: () => token || ""
  })
  .withAutomaticReconnect()
  .build();


// SIGNAL R FÖR REALTIME DATA FÖR ENHETERNA
// !!! Frontend ansluter nu bara till backend (5022) istället för både backend och realtime server (5103) !!!
export const realtimeConnection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5022/hub/realtime", {
    withCredentials: true,
  })
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Information)
  .build();

export const startRealtimeConnection = async () => {
  if (realtimeConnection.state === "Disconnected") {
    try {
      await realtimeConnection.start();
      console.log("Realtime connection started.");

      realtimeConnection.on("measurementReceived", (data) => {
        console.log("Realtime data received:", data);
      });
    } catch (err) {
      console.error("Error starting realtime connection:", err);
    }
  }
};
