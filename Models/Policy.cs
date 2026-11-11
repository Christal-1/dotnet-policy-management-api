namespace PolicyManagementApi.Models;

public class Policy
{
    public int Id { get; set; }
    public string PolicyNumber { get; set; } = string.Empty;
    public string PolicyholderName { get; set; } = string.Empty;
    public string CoverType { get; set; } = string.Empty;
    public decimal MonthlyPremium { get; set; }
    public DateOnly StartDate { get; set; }
    public bool IsActive { get; set; } = true;
}
