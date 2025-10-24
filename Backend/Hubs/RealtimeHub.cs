using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SignalR.Client;

namespace Backend.Hubs
{
    public class RealtimeHub : Hub
    {
        private static HubConnection? _iotConnection;

        public RealtimeHub()
        {
            // SKAPAR EN SIGNAL-R KLIENT SOM ANSLUTER TILL IOT-SERVERN
            if (_iotConnection == null)
            {
                _iotConnection = new HubConnectionBuilder()
                    .WithUrl("http://localhost:5103/hub/telemetry")
                    .WithAutomaticReconnect()
                    .Build();

                // LYSSNAR PÅ INKOMMANDE FRÅN IOT-SERVERN
                _iotConnection.On<string, string, object, DateTime>("measurementReceived", async (deviceId, type, value, time) =>
                {
                    Console.WriteLine($"Received from IoT: DeviceId={deviceId}, Type={type}, Value={value}, Time={time}");

                    // SKICKAR VIDARE TILL FRONTEND 
                    await Clients.All.SendAsync("measurementReceived", new
                    {
                        deviceId,
                        type,
                        value,
                        time
                    });
                });

                // STARTAR ANSLUTNINGEN ASYNKRONT
                Task.Run(async () =>
                {
                    try
                    {
                        await _iotConnection.StartAsync();
                        Console.WriteLine("Connected to IoT server.");

                        // ANROPAR METODEN JoinTenant PÅ IOT-SERVERN FÖR ATT ANSLUTA TILL RÄTT TENANT
                        await _iotConnection.InvokeAsync("JoinTenant", "innovia");
                        Console.WriteLine("Joined tenant: innovia");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Failed to connect to IoT server: {ex.Message}");
                    }
                });
            }
        }

        // LOGGAR NÄR EN KLIENT ANSLUTER
        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"Client connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        // LOGGAR NÄR EN KLIENT DISKONNEKTERAR
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            Console.WriteLine($"Client disconnected: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }
    }
}