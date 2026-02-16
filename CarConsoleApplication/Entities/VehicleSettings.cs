namespace CarConsoleApplication.Entities;

public class VehicleSettings
{
    public int Id { get; set; }
    public bool AutoLock { get; set; }
    public bool AutoUnlockOnPark { get; set; }
    public bool DoorLockSound { get; set; }
    public bool MirrorFoldOnLock { get; set; }
    public bool WipersServicePosition { get; set; }
    public string TirePressureUnit { get; set; } = string.Empty;
    public bool SpeedLimitWarningEnabled { get; set; }
    public int SpeedLimitOffsetKmh { get; set; }
}
