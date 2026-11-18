
namespace PaymentService.Application.DTOs;

public sealed record PaymentStatisticsResponse(
    int TotalCount,
    List<CurrencyStatisticsResponse> ByCurrency
);

