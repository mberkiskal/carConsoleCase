namespace CarConsoleApplication.Entities;

public class ClimateSettings
{
    public int Id { get; set; }
    public int TargetTemperatureC { get; set; }
    public short FanSpeed { get; set; }
    public bool ZoneDriver { get; set; }
    public bool ZonePassenger { get; set; }
    public bool ZoneRear { get; set; }
}
