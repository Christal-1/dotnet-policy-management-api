using Microsoft.AspNetCore.Mvc;
using PolicyManagementApi.Contracts;
using PolicyManagementApi.Models;
using PolicyManagementApi.Services;

namespace PolicyManagementApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PoliciesController(IPolicyService service, ILogger<PoliciesController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Policy>>> GetAll(CancellationToken ct) =>
        Ok(await service.GetAllAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Policy>> Get(int id, CancellationToken ct)
    {
        var policy = await service.GetAsync(id, ct);
        return policy is null ? NotFound() : Ok(policy);
    }

    [HttpPost]
    public async Task<ActionResult<Policy>> Create(CreatePolicyRequest request, CancellationToken ct)
    {
        try
        {
            var policy = await service.CreateAsync(request, ct);
            logger.LogInformation("Created policy {PolicyNumber}", policy.PolicyNumber);
            return CreatedAtAction(nameof(Get), new { id = policy.Id }, policy);
        }
        catch (ArgumentException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdatePolicyRequest request, CancellationToken ct) =>
        await service.UpdateAsync(id, request, ct) ? NoContent() : NotFound();
}
