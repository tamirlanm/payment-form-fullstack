using PaymentService.Domain.Entities;
namespace PaymentService.Application.Interfaces;

public interface IPaymentRepository
{
    Task AddAsync(Payment payment);
    Task<List<Payment>> GetAllAsync();
}

