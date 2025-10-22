using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SignalR.Client;

namespace Backend.Hubs
{
    public class RealtimeHub : Hub
    {
        private static HubConnection? _iotConnection;

        public RealtimeHub()
        {
            // Skapa en SignalR-klient för att ansluta till IoT-servern
            if (_iotConnection == null)
            {
                _iotConnection = new HubConnectionBuilder()
                    .WithUrl("http://localhost:5103/hub/telemetry")
                    .WithAutomaticReconnect()
                    .Build();

                // Lyssna på inkommande data från IoT-servern
                _iotConnection.On<string, string, object, DateTime>("measurementReceived", async (deviceId, type, value, time) =>
                {
                    Console.WriteLine($"📩 Received from IoT: DeviceId={deviceId}, Type={type}, Value={value}, Time={time}");

                    // Skicka vidare till frontend via vår egen hub
                    await Clients.All.SendAsync("measurementReceived", new
                    {
                        deviceId,
                        type,
                        value,
                        time
                    });
                });

                // Starta anslutningen till IoT-servern
                Task.Run(async () =>
                {
                    try
                    {
                        await _iotConnection.StartAsync();
                        Console.WriteLine("✅ Connected to IoT server.");

                        // Anropa JoinTenant för att ansluta till rätt tenant
                        await _iotConnection.InvokeAsync("JoinTenant", "innovia");
                        Console.WriteLine("✅ Joined tenant: innovia");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"❌ Failed to connect to IoT server: {ex.Message}");
                    }
                });
            }
        }

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"✅ Client connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            Console.WriteLine($"❌ Client disconnected: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }
    }
}