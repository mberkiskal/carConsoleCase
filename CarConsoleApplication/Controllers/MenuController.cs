using CarConsoleApplication.Data;
using CarConsoleApplication.Dtos;
using CarConsoleApplication.Helpers.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarConsoleApplication.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuController : ControllerBase
{
    private readonly AppDbContext _db;
    public MenuController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<MenuItemDto>>> Get([FromQuery] MenuLocation? location)
    {
        var q = _db.MenuItems
            .AsNoTracking()
            .Where(x => x.IsEnabled);

        if (location.HasValue)
            q = q.Where(x => x.Location == location.Value);

        var items = await q
            .OrderBy(x => x.Order)
            .Select(x => new MenuItemDto
            {
                Key = x.Key,
                Label = x.Label,
                Route = x.Route,
                Location = x.Location
            })
            .ToListAsync();

        return Ok(items);
    }
}
