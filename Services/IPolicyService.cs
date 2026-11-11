using PolicyManagementApi.Contracts;
using PolicyManagementApi.Models;

namespace PolicyManagementApi.Services;

public interface IPolicyService
{
    Task<IReadOnlyList<Policy>> GetAllAsync(CancellationToken ct);
    Task<Policy?> GetAsync(int id, CancellationToken ct);
    Task<Policy> CreateAsync(CreatePolicyRequest request, CancellationToken ct);
    Task<bool> UpdateAsync(int id, UpdatePolicyRequest request, CancellationToken ct);
}
