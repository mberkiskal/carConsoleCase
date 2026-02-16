using System.Text.Json;

namespace CarConsoleApplication.Services
{
    public class RoutingService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<RoutingService> _logger;
        private const string OSRM_BASE_URL = "http://router.project-osrm.org";

        public RoutingService(HttpClient httpClient, ILogger<RoutingService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<List<(double Latitude, double Longitude)>> GetRouteCoordinates(
            double startLat, double startLon,
            double endLat, double endLon)
        {
            try
            {
                var startLonStr = startLon.ToString(System.Globalization.CultureInfo.InvariantCulture);
                var startLatStr = startLat.ToString(System.Globalization.CultureInfo.InvariantCulture);
                var endLonStr = endLon.ToString(System.Globalization.CultureInfo.InvariantCulture);
                var endLatStr = endLat.ToString(System.Globalization.CultureInfo.InvariantCulture);

                var url =
                    $"{OSRM_BASE_URL}/route/v1/driving/{startLonStr},{startLatStr};{endLonStr},{endLatStr}?overview=full&geometries=geojson";

                _logger.LogInformation("Calling OSRM API: {Url}", url);

                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();

                var osrmResponse = JsonSerializer.Deserialize<OsrmResponse>(
                    json,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (osrmResponse?.Routes == null || osrmResponse.Routes.Count == 0)
                {
                    _logger.LogWarning("No routes found from OSRM.");
                    return new List<(double, double)>();
                }

                var coordinates = osrmResponse.Routes[0].Geometry.Coordinates;

                var result = coordinates.Select(c => (Latitude: c[1], Longitude: c[0])).ToList();

                _logger.LogInformation("Retrieved {Count} route coordinates from OSRM.", result.Count);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling OSRM API");
                throw;
            }
        }

        public List<(double Latitude, double Longitude)> SimplifyRoute(
            List<(double Latitude, double Longitude)> coordinates,
            int targetCount = 250)
        {
            if (coordinates == null || coordinates.Count == 0)
                return new List<(double, double)>();

            if (coordinates.Count <= targetCount)
                return coordinates;

            var step = coordinates.Count / targetCount;
            if (step < 1) step = 1;

            var simplified = new List<(double, double)>();
            simplified.Add(coordinates[0]);

            for (int i = step; i < coordinates.Count - 1; i += step)
            {
                simplified.Add(coordinates[i]);
            }

            simplified.Add(coordinates[^1]);

            return simplified;
        }
    }

    public class OsrmResponse
    {
        public List<OsrmRoute> Routes { get; set; } = new();
    }

    public class OsrmRoute
    {
        public OsrmGeometry Geometry { get; set; } = new();
    }

    public class OsrmGeometry
    {
        public List<List<double>> Coordinates { get; set; } = new();
    }
}
