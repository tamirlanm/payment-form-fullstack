using System.Net;
namespace PaymentService.Application.Exceptions;

public class BadRequestException : BaseException
{
    public BadRequestException(string message) : base(message, HttpStatusCode.BadRequest){}
}

ц