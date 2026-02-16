namespace CarConsoleApplication.Entities;

public class LightSettings
{
    public int Id { get; set; }
    public string HeadlightMode { get; set; } = string.Empty;
    public string FogLightMode { get; set; } = string.Empty;
    public int Brightness { get; set; }
    public int Angle { get; set; }
    public bool AutoHighBeam { get; set; } 
}
