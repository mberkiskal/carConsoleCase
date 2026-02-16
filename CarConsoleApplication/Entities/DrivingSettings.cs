namespace CarConsoleApplication.Entities;

public class DrivingSettings
{
    public int Id { get; set; }
    public string DriveMode { get; set; } = string.Empty;
    public short RegenLevel { get; set; }
    public bool LaneAssistEnabled { get; set; }
    public short LaneAssistIntensity { get; set; }
    public int CruiseDefaultKmh { get; set; }
    public bool TrafficSignRecognition { get; set; }
    public bool ParkingSensorsEnabled { get; set; }
    public bool CollisionWarningEnabled { get; set; }
}
