
using Microsoft.AspNetCore.Mvc;
using PaymentService.Application.DTOs;
using PaymentService.Application.Interfaces;

namespace PaymentService.Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    public PaymentsController(IPaymentService paymentService){
        _paymentService = paymentService;
    }

    [HttpPost]
    public async Task<ActionResult<PaymentResponse>> CreatePayment([FromBody] CreatePaymentRequest request)
    {
        var payment = await _paymentService.CreatePaymentAsync(request);
        return StatusCode(StatusCodes.Status201Created, payment);
    }
    
    [HttpGet]
    public async Task<ActionResult<List<PaymentResponse>>> GetAll()
    {
        var payments = await _paymentService.GetAllPaymentsAsync();
        return Ok(payments);
    }

    [HttpGet("stats")]
    public async Task<ActionResult<PaymentStatisticsResponse>> GetStatistics()
    {
        var statistics = await _paymentService.GetStatisticsAsync();
        return Ok(statistics);
    }
}