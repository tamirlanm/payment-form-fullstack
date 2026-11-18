namespace PaymentService.Application.DTOs;
public sealed record PaymentResponse(
    Guid Id,
    string WalletNumber,
    string Account,
    string Email,
    string? Phone,
    decimal Amount,
    string Currency,
    string? Comment,
    string Status,
    DateTimeOffset CreatedAt
);