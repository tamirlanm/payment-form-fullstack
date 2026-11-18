namespace  PaymentService.Application.DTOs;

public sealed record CreatePaymentRequest(
    string WalletNumber,
    string Account,
    string Email,
    decimal Amount,
    string Currency,
    string? Phone = null,
    string? Comment = null
);
