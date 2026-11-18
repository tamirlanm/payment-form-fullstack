
using PaymentService.Domain.Entities;
using PaymentService.Domain.Enums;
using PaymentService.Application.DTOs;
using PaymentService.Application.Interfaces;
using PaymentService.Application.Validators;
using FluentValidation;
using PaymentService.Application.Exceptions;

namespace PaymentService.Application.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IValidator<CreatePaymentRequest> _validator;
    
    public PaymentService(IPaymentRepository paymentRepository, IValidator<CreatePaymentRequest> validator)
    {
        _paymentRepository = paymentRepository;
        _validator = validator;
    }

    public async Task<PaymentResponse> CreatePaymentAsync(CreatePaymentRequest createPaymentRequest)
    {
        var validationResult = await _validator.ValidateAsync(createPaymentRequest);
        if (!validationResult.IsValid)
        {
            var errors = string.Join(",", validationResult.Errors.Select(x => x.ErrorMessage));
            throw new BadRequestException($"Error validation: {errors}");
        }
        var currency = Enum.Parse<Currency>(
            createPaymentRequest.Currency,
            ignoreCase: true
        );

        var payment = new Payment(
            createPaymentRequest.WalletNumber,
            createPaymentRequest.Account,
            createPaymentRequest.Email,
            createPaymentRequest.Phone,
            createPaymentRequest.Amount,
            currency,
            createPaymentRequest.Comment
        );
        await _paymentRepository.AddAsync(payment);
        return ToResponse(payment);
    }

    public async Task<List<PaymentResponse>> GetAllPaymentsAsync()
    {
        var payments = await _paymentRepository.GetAllAsync();
        return payments.Select(ToResponse).ToList();
    }

    public async Task<PaymentStatisticsResponse> GetStatisticsAsync()
    {
        var payments = await _paymentRepository.GetAllAsync();
        
        var byCurrency = payments.GroupBy(x => x.Currency).Select(currencyGroup =>
        {
            var dailyStats = currencyGroup.GroupBy(p => DateOnly.FromDateTime(p.CreatedAt.UtcDateTime))
                .OrderBy(g => g.Key).Select(dayGroup 
                    => new DailyPaymentStatisticsResponse(
                    dayGroup.Key,
                    dayGroup.Count(),
                    dayGroup.Sum(day => day.Amount))).ToList();
            return new CurrencyStatisticsResponse(
                currencyGroup.Key.ToString(),
                currencyGroup.Sum(x => x.Amount),
                currencyGroup.Count(),
                dailyStats);
        }).ToList();

        return new PaymentStatisticsResponse(
            payments.Count,
            byCurrency);
    }
    private static PaymentResponse ToResponse(Payment payment)
    {
        return new PaymentResponse(
            payment.Id,
            payment.WalletNumber,
            payment.Account,
            payment.Email,
            payment.Phone,
            payment.Amount,
            payment.Currency.ToString(),
            payment.Comment,
            payment.Status.ToString(),
            payment.CreatedAt
        );
    }
}

