namespace CarConsoleApplication.Dtos
{
    public class DisplaySettingsDto
    {
        public int Id { get; set; }
        public int Brightness { get; set; }
        public bool AutoBrightness { get; set; }
        public string Theme { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public string Units { get; set; } = string.Empty;
        public string TextSize { get; set; } = string.Empty;
        public int ScreenTimeoutSeconds { get; set; }
        public bool ReduceMotion { get; set; }
    }
}
