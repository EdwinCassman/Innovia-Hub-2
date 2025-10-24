using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class InnoviaController : ControllerBase
{
    private readonly HttpClient _httpClient;

    public InnoviaController(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    [HttpGet("devices")]
    public async Task<IActionResult> GetDevices()
    {
        var tenantId = "eb289b4d-ded7-4b83-9cc6-5c7afaca4475"; // Tenant ID just nu hårdkodad
        var response = await _httpClient.GetAsync($"http://localhost:5101/api/tenants/{tenantId}/devices");

        if (!response.IsSuccessStatusCode)
        {
            return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
        }

        var devices = await response.Content.ReadAsStringAsync();
        return Ok(JsonSerializer.Deserialize<object>(devices));
    }

    [HttpGet("devices/{deviceId}/data")]
    public async Task<IActionResult> GetDeviceData(string deviceId, [FromQuery] string from, [FromQuery] string to)
    {
        var response = await _httpClient.GetAsync($"http://localhost:5104/portal/innovia/devices/{deviceId}/series?type=co2&from={from}&to={to}");

        if (!response.IsSuccessStatusCode)
        {
            return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
        }

        var data = await response.Content.ReadAsStringAsync();
        return Ok(JsonSerializer.Deserialize<object>(data));
    }
}
