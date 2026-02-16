using CarConsoleApplication.Helpers.Enums;

namespace CarConsoleApplication.Entities;

public class MenuItem
{
    public int Id { get; set; }
    public string Key { get; set; } = null!;
    public string Label { get; set; } = null!;
    public int Order { get; set; }
    public bool IsEnabled { get; set; }
    public MenuLocation Location { get; set; }
    public string Route { get; set; } = null!;
}
