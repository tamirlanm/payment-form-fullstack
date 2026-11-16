using PaymentService.Domain.Enums;
namespace PaymentService.Domain.Entities;
public class Payment
{
    public Guid Id {get; private set;}
    public string WalletNumber {get; private set;} = string.Empty;
    public string Account {get; private set;} = string.Empty;
    public string Email {get; private set;} = string.Empty;
    public string? Phone {get; private set;} 
    public decimal Amount {get; private set;}
    public Currency Currency {get; private set;}
    public string? Comment {get; private set;}
    public PaymentStatus Status {get; private set;}
    public DateTimeOffset CreatedAt {get; private set;}

    private Payment(){}

    public Payment(
        string walletNumber, 
        string account, 
        string email,
        string? phone,
        decimal amount,
        Currency currency,
        string? comment
    )
    {
        if (string.IsNullOrWhiteSpace(walletNumber))
        {
            throw new ArgumentException("Необходимо указать номер кошелька.", nameof(walletNumber));
        }
        if (string.IsNullOrWhiteSpace(account))
        {
            throw new ArgumentException("Необходимо указать аккаунт.", nameof(account));
        }
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("Необходимо указать email.", nameof(email));
        }
        if(amount <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(amount), "Сумма должна быть больше нуля.");
        }
        if(!Enum.IsDefined(currency))
        {
            throw new ArgumentException("Неподдерживаемая валюта", nameof(currency)); 
        }

        Id = Guid.NewGuid();
        WalletNumber = walletNumber.Trim();
        Account = account.Trim();
        Email = email.Trim();
        Phone = string.IsNullOrWhiteSpace(phone) ? null : phone.Trim();
        Amount = amount;
        Currency = currency;
        Comment = string.IsNullOrWhiteSpace(comment) ? null : comment.Trim();
        Status = PaymentStatus.Created;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public void Reject()
    {
        Status = PaymentStatus.Rejected;
    }
}