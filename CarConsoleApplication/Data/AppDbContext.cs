using Microsoft.EntityFrameworkCore;
using CarConsoleApplication.Entities;

namespace CarConsoleApplication.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<AppSettings> AppSettings => Set<AppSettings>();
        public DbSet<RoutePoint> RoutePoints => Set<RoutePoint>();
        public DbSet<MenuItem> MenuItems { get; set; }

        #region Entities
        public DbSet<ClimateSettings> ClimateSettings => Set<ClimateSettings>();
        public DbSet<DisplaySettings> DisplaySettings => Set<DisplaySettings>();
        public DbSet<DrivingSettings> DrivingSettings => Set<DrivingSettings>();
        public DbSet<LightSettings> LightsSettings => Set<LightSettings>();
        public DbSet<SeatingSettings> SeatingSettings => Set<SeatingSettings>();
        public DbSet<ServiceSettings> ServiceSettings => Set<ServiceSettings>();
        public DbSet<SoftwareSettings> SoftwareSettings => Set<SoftwareSettings>();
        public DbSet<VehicleSettings> VehicleSettings => Set<VehicleSettings>();
        #endregion

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<RoutePoint>()
                .HasIndex(x => x.Sequence);
        }
    }
}
