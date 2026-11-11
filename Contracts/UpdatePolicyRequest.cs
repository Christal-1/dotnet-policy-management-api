using System.ComponentModel.DataAnnotations;

namespace PolicyManagementApi.Contracts;

public class UpdatePolicyRequest
{
    [Required, StringLength(100, MinimumLength = 2)]
    public string PolicyholderName { get; set; } = string.Empty;
    [Range(typeof(decimal), "0.01", "10000000", ParseLimitsInInvariantCulture = true)]
    public decimal MonthlyPremium { get; set; }
    public bool IsActive { get; set; }
}
