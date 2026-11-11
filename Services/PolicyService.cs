using Microsoft.EntityFrameworkCore;
using PolicyManagementApi.Contracts;
using PolicyManagementApi.Data;
using PolicyManagementApi.Models;

namespace PolicyManagementApi.Services;

public class PolicyService(PolicyDbContext db) : IPolicyService
{
    public async Task<IReadOnlyList<Policy>> GetAllAsync(CancellationToken ct) =>
        await db.Policies.AsNoTracking().OrderBy(p => p.PolicyNumber).ToListAsync(ct);

    public Task<Policy?> GetAsync(int id, CancellationToken ct) =>
        db.Policies.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<Policy> CreateAsync(CreatePolicyRequest request, CancellationToken ct)
    {
        var duplicate = await db.Policies.AnyAsync(p => p.PolicyNumber == request.PolicyNumber, ct);
        if (duplicate) throw new ArgumentException("A policy with this policy number already exists.");

        var policy = new Policy
        {
            PolicyNumber = request.PolicyNumber.Trim(),
            PolicyholderName = request.PolicyholderName.Trim(),
            CoverType = request.CoverType.Trim(),
            MonthlyPremium = request.MonthlyPremium,
            StartDate = request.StartDate
        };
        db.Policies.Add(policy);
        await db.SaveChangesAsync(ct);
        return policy;
    }

    public async Task<bool> UpdateAsync(int id, UpdatePolicyRequest request, CancellationToken ct)
    {
        var policy = await db.Policies.FindAsync([id], ct);
        if (policy is null) return false;

        policy.PolicyholderName = request.PolicyholderName.Trim();
        policy.MonthlyPremium = request.MonthlyPremium;
        policy.IsActive = request.IsActive;
        await db.SaveChangesAsync(ct);
        return true;
    }
}
