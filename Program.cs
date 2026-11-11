using Microsoft.EntityFrameworkCore;
using PolicyManagementApi.Data;
using PolicyManagementApi.Models;
using PolicyManagementApi.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<PolicyDbContext>(options => options.UseSqlite(builder.Configuration.GetConnectionString("Policies")));
builder.Services.AddScoped<IPolicyService, PolicyService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PolicyDbContext>();
    db.Database.EnsureCreated();
    if (!db.Policies.Any())
    {
        db.Policies.AddRange(
            new Policy { PolicyNumber = "POL-2026-001", PolicyholderName = "Northstar Civils", CoverType = "Construction", MonthlyPremium = 2450m, StartDate = new DateOnly(2026, 1, 15), IsActive = true },
            new Policy { PolicyNumber = "POL-2026-002", PolicyholderName = "Mabena Infrastructure", CoverType = "Plant and Equipment", MonthlyPremium = 3875m, StartDate = new DateOnly(2026, 2, 1), IsActive = true },
            new Policy { PolicyNumber = "POL-2026-003", PolicyholderName = "UrbanBuild Projects", CoverType = "General Liability", MonthlyPremium = 1920m, StartDate = new DateOnly(2025, 8, 10), IsActive = false },
            new Policy { PolicyNumber = "POL-2026-004", PolicyholderName = "Blue Ridge Contractors", CoverType = "Construction", MonthlyPremium = 3120m, StartDate = new DateOnly(2026, 5, 20), IsActive = true }
        );
        db.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "Healthy", application = "Policy Management Portal" }));
app.Run();

public partial class Program { }
