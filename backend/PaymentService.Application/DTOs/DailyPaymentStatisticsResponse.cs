namespace PaymentService.Application.DTOs;

public sealed record DailyPaymentStatisticsResponse(
    DateOnly Date,
    int Count,
    decimal Amount
);