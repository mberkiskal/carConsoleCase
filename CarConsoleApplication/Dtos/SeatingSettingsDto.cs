namespace CarConsoleApplication.Dtos
{
    public class SeatingSettingsDto
    {
        public int Id { get; set; }
        public short DriverSeatPreset { get; set; }
        public short PassengerSeatPreset { get; set; }
        public short SeatHeatingDriverLevel { get; set; }
        public short SeatHeatingPassengerLevel { get; set; }
        public short SeatVentDriverLevel { get; set; }
        public short SeatVentPassengerLevel { get; set; }
        public bool EasyEntry { get; set; }
    }
}
