
using FluentValidation;
using PaymentService.Domain.Enums;
using PaymentService.Application.DTOs;
using PaymentService.Application.Interfaces;

namespace PaymentService.Application.Validators;

public class CreatePaymentValidation : AbstractValidator<CreatePaymentRequest>
{
    public CreatePaymentValidation(IPaymentRepository paymentRepository)
    {
        RuleFor(x => x.WalletNumber).NotEmpty().WithMessage("Wallet Number is required").MaximumLength(50).Matches(@"^\d+$").WithMessage("Wallet Number must contain only digits");
        
        RuleFor(x => x.Account).NotEmpty().WithMessage("Account is required").MaximumLength(100);
        
        RuleFor(x => x.Amount).GreaterThan(0);
        
        RuleFor(x => x.Email).NotEmpty().WithMessage("Email is required").EmailAddress().WithMessage("The email address is not valid").MaximumLength(254);
    
        RuleFor(x => x.Phone).Matches(@"^\+[1-9]\d{1,14}$").WithMessage("Number of phone is need to be in international format, for example: +77771234567").MaximumLength(20);
        
        RuleFor(x => x.Comment).MaximumLength(500);
        
        RuleFor(x => x.Currency).NotEmpty().WithMessage("Currency is required").Must(value => Enum.GetNames<Currency>()
                .Contains(value, StringComparer.OrdinalIgnoreCase))
            .WithMessage("Unsupported currency. Allowed: RUB, USD, EUR.");
    }
}

