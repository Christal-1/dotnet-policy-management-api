using System.ComponentModel.DataAnnotations;

namespace PolicyManagementApi.Contracts;

public class CreatePolicyRequest
{
    [Required, StringLength(30, MinimumLength = 4)]
    public string PolicyNumber { get; set; } = string.Empty;
    [Required, StringLength(100, MinimumLength = 2)]
    public string PolicyholderName { get; set; } = string.Empty;
    [Required, StringLength(60)]
    public string CoverType { get; set; } = string.Empty;
    [Range(typeof(decimal), "0.01", "10000000", ParseLimitsInInvariantCulture = true)]
    public decimal MonthlyPremium { get; set; }
    public DateOnly StartDate { get; set; }
}
