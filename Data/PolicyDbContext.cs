using Microsoft.EntityFrameworkCore;
using PolicyManagementApi.Models;

namespace PolicyManagementApi.Data;

public class PolicyDbContext(DbContextOptions<PolicyDbContext> options) : DbContext(options)
{
    public DbSet<Policy> Policies => Set<Policy>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Policy>()
            .HasIndex(p => p.PolicyNumber)
            .IsUnique();
        modelBuilder.Entity<Policy>()
            .Property(p => p.MonthlyPremium)
            .HasPrecision(12, 2);
    }
}
