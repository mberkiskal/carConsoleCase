using CarConsoleApplication.Data;
using CarConsoleApplication.Dtos;
using CarConsoleApplication.Entities;
using CarConsoleApplication.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarConsoleApplication.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoutesController : ControllerBase
{
    private readonly AppDbContext _db;

    public RoutesController(AppDbContext db) => _db = db;

    [HttpGet("default")]
    public async Task<ActionResult<List<RoutePointDto>>> GetDefault()
    {
        var points = await _db.RoutePoints
            .AsNoTracking()
            .OrderBy(x => x.Sequence)
            .Select(x => new RoutePointDto
            {
                Sequence = x.Sequence,
                Latitude = x.Latitude,
                Longitude = x.Longitude
            })
            .ToListAsync();

        if (points.Count < 2)
            return NotFound("RoutePoints not found (need at least 2). Create via POST /api/routes/default or POST /api/routes/generate.");

        return Ok(points);
    }

    [HttpPost("default")]
    public async Task<IActionResult> ReplaceDefault([FromBody] List<RoutePointDto> points)
    {
        if (points == null || points.Count < 2)
            return BadRequest("At least 2 points are required.");

        var hasDup = points.GroupBy(p => p.Sequence).Any(g => g.Count() > 1);
        if (hasDup)
            return BadRequest("Sequence values must be unique.");

        _db.RoutePoints.RemoveRange(_db.RoutePoints);
        await _db.SaveChangesAsync();

        var entities = points
            .OrderBy(p => p.Sequence)
            .Select(p => new RoutePoint
            {
                Sequence = p.Sequence,
                Latitude = p.Latitude,
                Longitude = p.Longitude
            });

        await _db.RoutePoints.AddRangeAsync(entities);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("generate")]
    public async Task<IActionResult> GenerateRoute([FromServices] RoutingService routingService)
    {
        var settings = await _db.AppSettings.AsNoTracking().FirstOrDefaultAsync();
        if (settings == null)
            return NotFound(new { message = "AppSettings not found" });

        var coords = await routingService.GetRouteCoordinates(
            settings.RouteStartLat, settings.RouteStartLon,
            settings.RouteEndLat, settings.RouteEndLon
        );

        if (coords.Count < 2)
            return BadRequest(new { message = "OSRM returned insufficient coordinates" });

        var finalCoords = routingService.SimplifyRoute(coords, targetCount: 250);

        _db.RoutePoints.RemoveRange(_db.RoutePoints);
        await _db.SaveChangesAsync();

        var routePoints = finalCoords.Select((c, idx) => new RoutePoint
        {
            Sequence = idx,
            Latitude = c.Latitude,
            Longitude = c.Longitude
        });

        await _db.RoutePoints.AddRangeAsync(routePoints);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Route generated", count = finalCoords.Count });
    }
}
