using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CarConsoleApplication.Migrations
{
    /// <inheritdoc />
    public partial class AddSettingsTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClimateSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TargetTemperatureC = table.Column<int>(type: "integer", nullable: false),
                    FanSpeed = table.Column<short>(type: "smallint", nullable: false),
                    ZoneDriver = table.Column<bool>(type: "boolean", nullable: false),
                    ZonePassenger = table.Column<bool>(type: "boolean", nullable: false),
                    ZoneRear = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClimateSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DisplaySettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Brightness = table.Column<int>(type: "integer", nullable: false),
                    AutoBrightness = table.Column<bool>(type: "boolean", nullable: false),
                    Theme = table.Column<string>(type: "text", nullable: false),
                    Language = table.Column<string>(type: "text", nullable: false),
                    Units = table.Column<string>(type: "text", nullable: false),
                    TextSize = table.Column<string>(type: "text", nullable: false),
                    ScreenTimeoutSeconds = table.Column<int>(type: "integer", nullable: false),
                    ReduceMotion = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DisplaySettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DrivingSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DriveMode = table.Column<string>(type: "text", nullable: false),
                    RegenLevel = table.Column<short>(type: "smallint", nullable: false),
                    LaneAssistEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    LaneAssistIntensity = table.Column<short>(type: "smallint", nullable: false),
                    CruiseDefaultKmh = table.Column<int>(type: "integer", nullable: false),
                    TrafficSignRecognition = table.Column<bool>(type: "boolean", nullable: false),
                    ParkingSensorsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    CollisionWarningEnabled = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DrivingSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LightsSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    HeadlightMode = table.Column<string>(type: "text", nullable: false),
                    Brightness = table.Column<int>(type: "integer", nullable: false),
                    AutoHighBeam = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LightsSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SeatingSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DriverSeatPreset = table.Column<short>(type: "smallint", nullable: false),
                    PassengerSeatPreset = table.Column<short>(type: "smallint", nullable: false),
                    SeatHeatingDriverLevel = table.Column<short>(type: "smallint", nullable: false),
                    SeatHeatingPassengerLevel = table.Column<short>(type: "smallint", nullable: false),
                    SeatVentDriverLevel = table.Column<short>(type: "smallint", nullable: false),
                    SeatVentPassengerLevel = table.Column<short>(type: "smallint", nullable: false),
                    EasyEntry = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SeatingSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ServiceSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ServiceReminderEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    ServiceIntervalKm = table.Column<int>(type: "integer", nullable: false),
                    ServiceIntervalMonths = table.Column<int>(type: "integer", nullable: false),
                    LastServiceAtKm = table.Column<int>(type: "integer", nullable: false),
                    LastServiceDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PreferredServiceCenter = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SoftwareSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AutoUpdate = table.Column<bool>(type: "boolean", nullable: false),
                    UpdateChannel = table.Column<string>(type: "text", nullable: false),
                    DiagnosticsSharing = table.Column<bool>(type: "boolean", nullable: false),
                    CrashReports = table.Column<bool>(type: "boolean", nullable: false),
                    TimeZone = table.Column<string>(type: "text", nullable: false),
                    Use24HourClock = table.Column<bool>(type: "boolean", nullable: false),
                    ResetToDefaultsAllowed = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SoftwareSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VehicleSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AutoLock = table.Column<bool>(type: "boolean", nullable: false),
                    AutoUnlockOnPark = table.Column<bool>(type: "boolean", nullable: false),
                    DoorLockSound = table.Column<bool>(type: "boolean", nullable: false),
                    MirrorFoldOnLock = table.Column<bool>(type: "boolean", nullable: false),
                    WipersServicePosition = table.Column<bool>(type: "boolean", nullable: false),
                    TirePressureUnit = table.Column<string>(type: "text", nullable: false),
                    SpeedLimitWarningEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    SpeedLimitOffsetKmh = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VehicleSettings", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClimateSettings");

            migrationBuilder.DropTable(
                name: "DisplaySettings");

            migrationBuilder.DropTable(
                name: "DrivingSettings");

            migrationBuilder.DropTable(
                name: "LightsSettings");

            migrationBuilder.DropTable(
                name: "SeatingSettings");

            migrationBuilder.DropTable(
                name: "ServiceSettings");

            migrationBuilder.DropTable(
                name: "SoftwareSettings");

            migrationBuilder.DropTable(
                name: "VehicleSettings");
        }
    }
}
