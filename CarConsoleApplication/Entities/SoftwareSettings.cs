namespace CarConsoleApplication.Entities;

public class SoftwareSettings
{
    public int Id { get; set; }
    public bool AutoUpdate { get; set; }
    public string UpdateChannel { get; set; } = string.Empty;
    public bool DiagnosticsSharing { get; set; }
    public bool CrashReports { get; set; }
    public string TimeZone { get; set; } = string.Empty;
    public bool Use24HourClock { get; set; }
    public bool ResetToDefaultsAllowed { get; set; }
}
