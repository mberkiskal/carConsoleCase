namespace CarConsoleApplication.Dtos
{
    public class ServiceSettingsDto
    {
        public int Id { get; set; }
        public bool ServiceReminderEnabled { get; set; }
        public int ServiceIntervalKm { get; set; }
        public int ServiceIntervalMonths { get; set; }
        public int LastServiceAtKm { get; set; }
        public DateTime LastServiceDate { get; set; }
        public string PreferredServiceCenter { get; set; } = string.Empty;
    }
}
