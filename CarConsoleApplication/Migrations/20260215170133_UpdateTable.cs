using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarConsoleApplication.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Angle",
                table: "LightsSettings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "FogLightMode",
                table: "LightsSettings",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Angle",
                table: "LightsSettings");

            migrationBuilder.DropColumn(
                name: "FogLightMode",
                table: "LightsSettings");
        }
    }
}
