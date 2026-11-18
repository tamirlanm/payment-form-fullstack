using System.Net;

namespace PaymentService.Application.Exceptions;

public class NotFoundException : BaseException
{
    public NotFoundException(string message) : base(message, HttpStatusCode.NotFound){}
}