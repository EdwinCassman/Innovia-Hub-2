using MQTTnet;
using MQTTnet.Client;
using Microsoft.AspNetCore.SignalR;
using System.Text;
using System.Text.Json;
using Backend.Hubs;

public class MqttService
{
    // SignalR HUB CONTEXT FÖR ATT SKICKA MEDDELANDEN TILL FRONTEND
    private readonly IHubContext<RealtimeHub> _hubContext;
    // MQTT CLIENT SOM ANVÄNDS FÖR ATT ANSLUTA TILL BROKERN
    private readonly IMqttClient _mqttClient;
    // MQTT OPTIONS SOM DEFINIERAR ANSLUTNINGSINSTÄLLNINGAR
    private readonly MqttClientOptions _mqttOptions;

    // Mapping för att översätta deviceId från Edge.Simulator till UUID från DeviceRegistry
    private static readonly Dictionary<string, string> DeviceIdMapping = new()
    {
        { "device-1", "65e33050-e4c5-4149-a9a5-2fced42cf167" },
        { "device-2", "3067b1ab-922d-4134-8d04-0febb97e1bc9" },
        { "device-3", "5f575b37-3d40-4ad3-9fec-7899f9640cf9" },
        { "device-4", "a88f8a88-9fca-4fa0-bf34-dd15fb4b57ad" },
        { "device-5", "9597540f-85c5-46ff-acbf-bbacd70939b7" },
        { "device-6", "778db581-2aec-4864-b2c0-32fc38aa6ea0" },
        { "device-7", "5a5bf592-a974-4462-924d-f57382b8b2b0" },
        { "device-8", "0108746e-b913-4cc0-868b-782a73942deb" },
        { "device-9", "a350017b-b2cd-466f-bb9d-38c0d9c56b2d" },
        { "device-10", "3b70a429-dc7a-4d6a-83e0-18f0d9d88e64" }
    };

    // KONSTRUKTOR SOM INITIALISERAR MQTT CLIENT OCH HÄNGER PÅ EVENT HANDLERS
    public MqttService(IHubContext<RealtimeHub> hubContext)
    {
        _hubContext = hubContext;

        var mqttFactory = new MqttFactory();
        _mqttClient = mqttFactory.CreateMqttClient();

        _mqttOptions = new MqttClientOptionsBuilder()
            .WithClientId("BackendClient")
            .WithTcpServer("localhost", 1883)
            .Build();

        // ANSLUTNING TILL MQTT BROKER
        _mqttClient.ConnectedAsync += async e =>
        {
            Console.WriteLine("Connected to MQTT broker.");

            try
            {
                await _mqttClient.SubscribeAsync("tenants/innovia/devices/+/measurements");
                Console.WriteLine("Subscribed to topic: tenants/innovia/devices/+/measurements");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to subscribe to topic: {ex.Message}");
            }
        };

        // FRÅNKOPPLING FRÅN MQTT BROKER OCH AUTOMATISK ÅTERANSLUTNING
        _mqttClient.DisconnectedAsync += async e =>
        {
            Console.WriteLine("Disconnected from MQTT broker. Reconnecting in 5 seconds...");
            await Task.Delay(TimeSpan.FromSeconds(5));

            try
            {
                await _mqttClient.ConnectAsync(_mqttOptions);
                Console.WriteLine("Reconnected successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Reconnection failed: {ex.Message}");
            }
        };

        // HANTERING AV INKOMMANDE MQTT-MEDDELANDEN
        _mqttClient.ApplicationMessageReceivedAsync += async e =>
        {
            try
            {
        
                if (e.ApplicationMessage.Payload == null)
                {
                    Console.WriteLine("Received MQTT message with null payload.");
                    return;
                }

                string payloadString = Encoding.UTF8.GetString(e.ApplicationMessage.Payload);
                Console.WriteLine($"Received MQTT message: {payloadString}");


                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true 
                };

                // DESERIALISERING AV MQTT-MEDDELANDET
                var message = JsonSerializer.Deserialize<MqttMessage>(payloadString, options);

                if (message == null)
                {
                    Console.WriteLine("Failed to deserialize MQTT message.");
                    return;
                }

                Console.WriteLine($"Deserialized MQTT message: DeviceId={message.DeviceId}, Timestamp={message.Timestamp}");

                if (message.Metrics == null || message.Metrics.Count == 0)
                {
                    Console.WriteLine("MQTT message has null or empty Metrics.");
                    return;
                }

                // MAPPA DEVICE ID TILL UUID
                if (!DeviceIdMapping.TryGetValue(message.DeviceId, out var mappedDeviceId))
                {
                    Console.WriteLine($"Unknown deviceId: {message.DeviceId}");
                    return;
                }

                // LOOPAR OCH SKICKAR DATA TILL SIGNALR HUBBEN
                foreach (var metric in message.Metrics)
                {
                    Console.WriteLine($"Metric: Type={metric.Type}, Value={metric.Value}, Unit={metric.Unit}");
                    await _hubContext.Clients.All.SendAsync("measurementReceived", new
                    {
                        deviceId = mappedDeviceId, // Använder de mappade UUID:t
                        type = metric.Type,
                        value = metric.Value,
                        time = message.Timestamp
                    });
                    Console.WriteLine($"Sent data to SignalR: Mapped DeviceId={mappedDeviceId}, Type={metric.Type}, Value={metric.Value}, Time={message.Timestamp}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing MQTT message: {ex.Message}");
            }
        };
    }

    // START OCH STOPP AV MQTT TJÄNSTEN
    public async Task StartAsync()
    {
        try
        {
            await _mqttClient.ConnectAsync(_mqttOptions);
            Console.WriteLine("MQTT client connected successfully.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to connect to MQTT broker: {ex.Message}");
        }
    }

    public async Task StopAsync()
    {
        if (_mqttClient.IsConnected)
        {
            await _mqttClient.DisconnectAsync();
            Console.WriteLine("MQTT client disconnected.");
        }
    }
}

public class MqttMessage
{
    public string DeviceId { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.MinValue;
    public List<Metric> Metrics { get; set; } = new List<Metric>();
}

public class Metric
{
    public string Type { get; set; } = string.Empty;
    public double Value { get; set; } = 0.0;
    public string Unit { get; set; } = string.Empty;
}