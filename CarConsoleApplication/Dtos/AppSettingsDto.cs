namespace CarConsoleApplication.Dtos
{
    public class AppSettingsDto
    {
        public int Id { get; set; }
        public string Theme { get; set; } = null!;
        public string Language { get; set; } = null!;
        public string Units { get; set; } = null!;
        public int MapDefaultZoom { get; set; }
        public int RouteRefreshSeconds { get; set; }
        public bool NotificationsEnabled { get; set; }
        public double RouteStartLat { get; set; }
        public double RouteStartLon { get; set; }
        public double RouteEndLat { get; set; }
        public double RouteEndLon { get; set; }
    }
}
