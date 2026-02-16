using CarConsoleApplication.Data;
using CarConsoleApplication.Dtos;
using CarConsoleApplication.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarConsoleApplication.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly AppDbContext _db;

    public SettingsController(AppDbContext db) => _db = db;

    #region Navigation
    [HttpGet("navigation")]
    public async Task<ActionResult<NavigationSettingsDto>> GetNavigation()
    {
        var settings = await _db.AppSettings.AsNoTracking().FirstOrDefaultAsync();
        if (settings is null) return NotFound("Settings not found.");

        return Ok(new NavigationSettingsDto { Theme = settings.Theme });
    }

    [HttpPut("navigation")]
    public async Task<ActionResult<NavigationSettingsDto>> UpdateNavigation([FromBody] NavigationSettingsDto dto)
    {
        var theme = (dto.Theme ?? "dark").ToLowerInvariant();
        if (theme != "dark" && theme != "light")
            return BadRequest("Theme must be 'dark' or 'light'.");

        var settings = await _db.AppSettings.FirstOrDefaultAsync();
        if (settings is null)
            return NotFound("Settings not found.");

        settings.Theme = theme;
        await _db.SaveChangesAsync();

        return Ok(new NavigationSettingsDto { Theme = settings.Theme });
    }
    #endregion

    #region Climate
    [HttpGet("climate")]
    public async Task<ActionResult<ClimateSettingsDto>> GetClimate()
    {
        var entity = await _db.ClimateSettings.AsNoTracking().FirstOrDefaultAsync();
        if (entity is null) return NotFound("Climate Settings not found!");

        return Ok(ToDto(entity));
    }

    [HttpPut("climate")]
    public async Task<ActionResult<ClimateSettingsDto>> UpdateClimate([FromBody] ClimateSettingsDto dto)
    {
        if (dto.TargetTemperatureC < 16 || dto.TargetTemperatureC > 30)
            return BadRequest("Target Temperature must be 16 - 30.");

        if (dto.FanSpeed < 0 || dto.FanSpeed > 5)
            return BadRequest("Fan Speed must be 0 - 5.");

        var entity = await _db.ClimateSettings.FirstOrDefaultAsync();
        if (entity is null) return NotFound("Climate Settings not found!");

        Apply(entity, dto);
        await _db.SaveChangesAsync();

        return Ok(ToDto(entity));
    }
    #endregion

    #region Seating
    [HttpGet("seating")]
    public async Task<ActionResult<SeatingSettingsDto>> GetSeating()
    {
        var entity = await _db.SeatingSettings.AsNoTracking().FirstOrDefaultAsync();
        if (entity is null) return NotFound("Seating Settings not found!");

        return Ok(ToDto(entity));
    }

    [HttpPut("seating")]
    public async Task<ActionResult<SeatingSettingsDto>> UpdateSeating([FromBody] SeatingSettingsDto dto)
    {
        if (dto.DriverSeatPreset < 1 || dto.DriverSeatPreset > 3)
            return BadRequest("Driver Seat Preset must be 1 - 3.");

        if (dto.PassengerSeatPreset < 1 || dto.PassengerSeatPreset > 3)
            return BadRequest("Passenger Seat Preset must be 1 - 3.");

        static bool LevelOk(short v) => v >= 0 && v <= 3;

        if (!LevelOk(dto.SeatHeatingDriverLevel) ||
            !LevelOk(dto.SeatHeatingPassengerLevel) ||
            !LevelOk(dto.SeatVentDriverLevel) ||
            !LevelOk(dto.SeatVentPassengerLevel))
            return BadRequest("Seat heating/vent levels must be 0 - 3.");

        var entity = await _db.SeatingSettings.FirstOrDefaultAsync();
        if (entity is null) return NotFound("SeatingSettings not found!");

        Apply(entity, dto);
        await _db.SaveChangesAsync();

        return Ok(ToDto(entity));
    }
    #endregion

    #region Display
    [HttpGet("display")]
    public async Task<ActionResult<DisplaySettingsDto>> GetDisplay()
    {
        var entity = await _db.DisplaySettings.AsNoTracking().FirstOrDefaultAsync();
        if (entity is null) return NotFound("Display Settings not found!");

        return Ok(ToDto(entity));
    }

    [HttpPut("display")]
    public async Task<ActionResult<DisplaySettingsDto>> UpdateDisplay([FromBody] DisplaySettingsDto dto)
    {
        if (dto.Brightness < 0 || dto.Brightness > 100)
            return BadRequest("Brightness must be 0 - 100.");

        if (dto.ScreenTimeoutSeconds < 30 || dto.ScreenTimeoutSeconds > 600)
            return BadRequest("Screen Timeout Seconds must be 30 - 600.");

        var entity = await _db.DisplaySettings.FirstOrDefaultAsync();
        if (entity is null) return NotFound("Display Settings not found!");

        Apply(entity, dto);
        await _db.SaveChangesAsync();

        return Ok(ToDto(entity));
    }
    #endregion

    #region Vehicle
    [HttpGet("vehicle")]
    public async Task<ActionResult<VehicleSettingsDto>> GetVehicle()
    {
        var entity = await _db.VehicleSettings.AsNoTracking().FirstOrDefaultAsync();
        if (entity is null) return NotFound("VehicleSettings not found!");

        return Ok(ToDto(entity));
    }

    [HttpPut("vehicle")]
    public async Task<ActionResult<VehicleSettingsDto>> UpdateVehicle([FromBody] VehicleSettingsDto dto)
    {
        if (dto.SpeedLimitOffsetKmh < 0 || dto.SpeedLimitOffsetKmh > 20)
            return BadRequest("Speed Limit Offset Km/h must be 0 - 20.");

        var allowedUnits = new[] { "bar", "psi" };
        if (!allowedUnits.Contains(dto.TirePressureUnit))
            return BadRequest("Tire Pressure Unit must be 'bar' or 'psi'.");

        var entity = await _db.VehicleSettings.FirstOrDefaultAsync();
        if (entity is null) return NotFound("VehicleSettings not found!");

        Apply(entity, dto);
        await _db.SaveChangesAsync();

        return Ok(ToDto(entity));
    }
    #endregion

    #region Service
    [HttpGet("service")]
    public async Task<ActionResult<ServiceSettingsDto>> GetService()
    {
        var entity = await _db.ServiceSettings.AsNoTracking().FirstOrDefaultAsync();
        if (entity is null) return NotFound("ServiceSettings not found!");

        return Ok(ToDto(entity));
    }

    [HttpPut("service")]
    public async Task<ActionResult<ServiceSettingsDto>> UpdateService([FromBody] ServiceSettingsDto dto)
    {
        if (dto.ServiceIntervalKm < 5000 || dto.ServiceIntervalKm > 30000)
            return BadRequest("Service Interval Km must be 5000 - 30000.");

        if (dto.ServiceIntervalMonths < 3 || dto.ServiceIntervalMonths > 24)
            return BadRequest("Service Interval Months must be 3 - 24.");

        if (dto.LastServiceAtKm < 0)
            return BadRequest("Last Service At Km must be >= 0.");

        var entity = await _db.ServiceSettings.FirstOrDefaultAsync();
        if (entity is null) return NotFound("ServiceSettings not found!");

        Apply(entity, dto);
        await _db.SaveChangesAsync();

        return Ok(ToDto(entity));
    }
    #endregion

    #region Driving
    [HttpGet("driving")]
    public async Task<ActionResult<DrivingSettingsDto>> GetDriving()
    {
        var entity = await _db.DrivingSettings.AsNoTracking().FirstOrDefaultAsync();
        if (entity is null) return NotFound("DrivingSettings not found!");

        return Ok(ToDto(entity));
    }

    [HttpPut("driving")]
    public async Task<ActionResult<DrivingSettingsDto>> UpdateDriving([FromBody] DrivingSettingsDto dto)
    {
        var allowedModes = new[] { "Eco", "Normal", "Sport" };
        if (!allowedModes.Contains(dto.DriveMode))
            return BadRequest("Drive Mode must be Eco/Normal/Sport.");

        if (dto.RegenLevel < 0 || dto.RegenLevel > 3)
            return BadRequest("Regenerate Level must be 0 - 3.");

        if (dto.LaneAssistIntensity < 0 || dto.LaneAssistIntensity > 3)
            return BadRequest("Lane Assist Intensity must be 0 - 3.");

        if (dto.CruiseDefaultKmh < 0 || dto.CruiseDefaultKmh > 200)
            return BadRequest("Cruise Default Kmh must be 0 - 200.");

        var entity = await _db.DrivingSettings.FirstOrDefaultAsync();
        if (entity is null) return NotFound("Driving Settings not found!");

        Apply(entity, dto);
        await _db.SaveChangesAsync();

        return Ok(ToDto(entity));
    }
    #endregion

    #region Software
    [HttpGet("software")]
    public async Task<ActionResult<SoftwareSettingsDto>> GetSoftware()
    {
        var entity = await _db.SoftwareSettings.AsNoTracking().FirstOrDefaultAsync();
        if (entity is null) return NotFound("Software Settings not found!");

        return Ok(ToDto(entity));
    }

    [HttpPut("software")]
    public async Task<ActionResult<SoftwareSettingsDto>> UpdateSoftware([FromBody] SoftwareSettingsDto dto)
    {
        // Basic validation (DTO üzerinden)
        dto.TimeZone ??= "Europe/Istanbul";
        dto.UpdateChannel ??= "Stable";

        var allowedChannel = new[] { "Stable", "Beta" };
        if (!allowedChannel.Contains(dto.UpdateChannel))
            return BadRequest("UpdateChannel must be Stable or Beta.");

        if (string.IsNullOrWhiteSpace(dto.TimeZone))
            return BadRequest("TimeZone is required.");

        var entity = await _db.SoftwareSettings.FirstOrDefaultAsync();
        if (entity is null) return NotFound("SoftwareSettings not found!");

        Apply(entity, dto);
        await _db.SaveChangesAsync();

        return Ok(ToDto(entity));
    }
    #endregion

    #region Lights
    [HttpGet("lights")]
    public async Task<ActionResult<LightSettingsDto>> GetLights()
    {
        var entity = await _db.LightsSettings.AsNoTracking().FirstOrDefaultAsync();
        if (entity is null) return NotFound("Light Settings not found!");

        return Ok(ToDto(entity));
    }

    [HttpPut("lights")]
    public async Task<ActionResult<LightSettingsDto>> UpdateLights([FromBody] LightSettingsDto dto)
    {
        var allowedHeadlight = new[] { "Off", "Parking", "On", "Auto" };
        var allowedFog = new[] { "Off", "Front", "Back", "Both" };

        if (!allowedHeadlight.Contains(dto.HeadlightMode))
            return BadRequest("Headlight Mode must be Off/Parking/On/Auto.");

        if (!allowedFog.Contains(dto.FogLightMode))
            return BadRequest("FogLight Mode must be Off/Front/Back/Both.");

        if (dto.Brightness < 0 || dto.Brightness > 100)
            return BadRequest("Brightness must be 0 - 100.");

        if (dto.Angle < -5 || dto.Angle > 5)
            return BadRequest("Angle must be -5 - 5.");

        var entity = await _db.LightsSettings.FirstOrDefaultAsync();
        if (entity is null) return NotFound("Light Settings not found!");

        Apply(entity, dto);
        await _db.SaveChangesAsync();

        return Ok(ToDto(entity));
    }
    #endregion

    // -------------------------
    // Mapping helpers (Entity <-> DTO)
    // -------------------------

    private static ClimateSettingsDto ToDto(ClimateSettings e) => new()
    {
        Id = e.Id,
        TargetTemperatureC = e.TargetTemperatureC,
        FanSpeed = e.FanSpeed,
        ZoneDriver = e.ZoneDriver,
        ZonePassenger = e.ZonePassenger,
        ZoneRear = e.ZoneRear
    };

    private static void Apply(ClimateSettings e, ClimateSettingsDto dto)
    {
        e.TargetTemperatureC = dto.TargetTemperatureC;
        e.FanSpeed = dto.FanSpeed;
        e.ZoneDriver = dto.ZoneDriver;
        e.ZonePassenger = dto.ZonePassenger;
        e.ZoneRear = dto.ZoneRear;
    }

    private static SeatingSettingsDto ToDto(SeatingSettings e) => new()
    {
        Id = e.Id,
        DriverSeatPreset = e.DriverSeatPreset,
        PassengerSeatPreset = e.PassengerSeatPreset,
        SeatHeatingDriverLevel = e.SeatHeatingDriverLevel,
        SeatHeatingPassengerLevel = e.SeatHeatingPassengerLevel,
        SeatVentDriverLevel = e.SeatVentDriverLevel,
        SeatVentPassengerLevel = e.SeatVentPassengerLevel,
        EasyEntry = e.EasyEntry
    };

    private static void Apply(SeatingSettings e, SeatingSettingsDto dto)
    {
        e.DriverSeatPreset = dto.DriverSeatPreset;
        e.PassengerSeatPreset = dto.PassengerSeatPreset;
        e.SeatHeatingDriverLevel = dto.SeatHeatingDriverLevel;
        e.SeatHeatingPassengerLevel = dto.SeatHeatingPassengerLevel;
        e.SeatVentDriverLevel = dto.SeatVentDriverLevel;
        e.SeatVentPassengerLevel = dto.SeatVentPassengerLevel;
        e.EasyEntry = dto.EasyEntry;
    }

    private static DisplaySettingsDto ToDto(DisplaySettings e) => new()
    {
        Id = e.Id,
        Brightness = e.Brightness,
        AutoBrightness = e.AutoBrightness,
        Theme = e.Theme,
        Language = e.Language,
        Units = e.Units,
        TextSize = e.TextSize,
        ScreenTimeoutSeconds = e.ScreenTimeoutSeconds,
        ReduceMotion = e.ReduceMotion
    };

    private static void Apply(DisplaySettings e, DisplaySettingsDto dto)
    {
        e.Brightness = dto.Brightness;
        e.AutoBrightness = dto.AutoBrightness;
        e.Theme = dto.Theme;
        e.Language = dto.Language;
        e.Units = dto.Units;
        e.TextSize = dto.TextSize;
        e.ScreenTimeoutSeconds = dto.ScreenTimeoutSeconds;
        e.ReduceMotion = dto.ReduceMotion;
    }

    private static VehicleSettingsDto ToDto(VehicleSettings e) => new()
    {
        Id = e.Id,
        AutoLock = e.AutoLock,
        AutoUnlockOnPark = e.AutoUnlockOnPark,
        DoorLockSound = e.DoorLockSound,
        MirrorFoldOnLock = e.MirrorFoldOnLock,
        WipersServicePosition = e.WipersServicePosition,
        TirePressureUnit = e.TirePressureUnit,
        SpeedLimitWarningEnabled = e.SpeedLimitWarningEnabled,
        SpeedLimitOffsetKmh = e.SpeedLimitOffsetKmh
    };

    private static void Apply(VehicleSettings e, VehicleSettingsDto dto)
    {
        e.AutoLock = dto.AutoLock;
        e.AutoUnlockOnPark = dto.AutoUnlockOnPark;
        e.DoorLockSound = dto.DoorLockSound;
        e.MirrorFoldOnLock = dto.MirrorFoldOnLock;
        e.WipersServicePosition = dto.WipersServicePosition;
        e.TirePressureUnit = dto.TirePressureUnit;
        e.SpeedLimitWarningEnabled = dto.SpeedLimitWarningEnabled;
        e.SpeedLimitOffsetKmh = dto.SpeedLimitOffsetKmh;
    }

    private static ServiceSettingsDto ToDto(ServiceSettings e) => new()
    {
        Id = e.Id,
        ServiceReminderEnabled = e.ServiceReminderEnabled,
        ServiceIntervalKm = e.ServiceIntervalKm,
        ServiceIntervalMonths = e.ServiceIntervalMonths,
        LastServiceAtKm = e.LastServiceAtKm,
        LastServiceDate = e.LastServiceDate,
        PreferredServiceCenter = e.PreferredServiceCenter
    };

    private static void Apply(ServiceSettings e, ServiceSettingsDto dto)
    {
        e.ServiceReminderEnabled = dto.ServiceReminderEnabled;
        e.ServiceIntervalKm = dto.ServiceIntervalKm;
        e.ServiceIntervalMonths = dto.ServiceIntervalMonths;
        e.LastServiceAtKm = dto.LastServiceAtKm;
        e.LastServiceDate = dto.LastServiceDate;
        e.PreferredServiceCenter = dto.PreferredServiceCenter;
    }

    private static DrivingSettingsDto ToDto(DrivingSettings e) => new()
    {
        Id = e.Id,
        DriveMode = e.DriveMode,
        RegenLevel = e.RegenLevel,
        LaneAssistEnabled = e.LaneAssistEnabled,
        LaneAssistIntensity = e.LaneAssistIntensity,
        CruiseDefaultKmh = e.CruiseDefaultKmh,
        TrafficSignRecognition = e.TrafficSignRecognition,
        ParkingSensorsEnabled = e.ParkingSensorsEnabled,
        CollisionWarningEnabled = e.CollisionWarningEnabled
    };

    private static void Apply(DrivingSettings e, DrivingSettingsDto dto)
    {
        e.DriveMode = dto.DriveMode;
        e.RegenLevel = dto.RegenLevel;
        e.LaneAssistEnabled = dto.LaneAssistEnabled;
        e.LaneAssistIntensity = dto.LaneAssistIntensity;
        e.CruiseDefaultKmh = dto.CruiseDefaultKmh;
        e.TrafficSignRecognition = dto.TrafficSignRecognition;
        e.ParkingSensorsEnabled = dto.ParkingSensorsEnabled;
        e.CollisionWarningEnabled = dto.CollisionWarningEnabled;
    }

    private static SoftwareSettingsDto ToDto(SoftwareSettings e) => new()
    {
        Id = e.Id,
        AutoUpdate = e.AutoUpdate,
        UpdateChannel = e.UpdateChannel,
        DiagnosticsSharing = e.DiagnosticsSharing,
        CrashReports = e.CrashReports,
        TimeZone = e.TimeZone,
        Use24HourClock = e.Use24HourClock,
        ResetToDefaultsAllowed = e.ResetToDefaultsAllowed
    };

    private static void Apply(SoftwareSettings e, SoftwareSettingsDto dto)
    {
        e.AutoUpdate = dto.AutoUpdate;
        e.UpdateChannel = dto.UpdateChannel;
        e.DiagnosticsSharing = dto.DiagnosticsSharing;
        e.CrashReports = dto.CrashReports;
        e.TimeZone = dto.TimeZone;
        e.Use24HourClock = dto.Use24HourClock;
        e.ResetToDefaultsAllowed = dto.ResetToDefaultsAllowed;
    }

    private static LightSettingsDto ToDto(LightSettings e) => new()
    {
        Id = e.Id,
        HeadlightMode = e.HeadlightMode,
        FogLightMode = e.FogLightMode,
        Brightness = e.Brightness,
        Angle = e.Angle,
        AutoHighBeam = e.AutoHighBeam
    };

    private static void Apply(LightSettings e, LightSettingsDto dto)
    {
        e.HeadlightMode = dto.HeadlightMode;
        e.FogLightMode = dto.FogLightMode;
        e.Brightness = dto.Brightness;
        e.Angle = dto.Angle;
        e.AutoHighBeam = dto.AutoHighBeam;
    }
}
