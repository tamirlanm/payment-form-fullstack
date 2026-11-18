using PaymentService.Domain.Entities;

namespace PaymentService.Application.DTOs;
public sealed record CurrencyStatisticsResponse
(
    string Currency,
    decimal TotalAmount,
    int Count,
    List<DailyPaymentStatisticsResponse> DailyStats
);