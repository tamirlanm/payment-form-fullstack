
using PaymentService.Application.DTOs;
using PaymentService.Domain.Entities;

namespace PaymentService.Application.Interfaces;

public interface IPaymentService  
{
    
    Task<PaymentResponse> CreatePaymentAsync(CreatePaymentRequest createPaymentRequest);
    Task<List<PaymentResponse>> GetAllPaymentsAsync();
    Task<PaymentStatisticsResponse> GetStatisticsAsync();
}

