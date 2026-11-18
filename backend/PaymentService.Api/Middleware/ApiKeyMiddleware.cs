
using System.Security.Cryptography;
using System.Text;

namespace PaymentService.Api.Middleware;

public class ApiKeyMiddleware
{
    private readonly RequestDelegate _next;
    private const string HeaderName = "X-Api-Key";

    public ApiKeyMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IConfiguration configuration)
    {
        if (!context.Request.Path.StartsWithSegments("/api/payments"))
        {
            await _next(context);
            return;
        }
        
        var expectedKey = configuration["ApiSecurityKey:Key"] ?? throw new InvalidOperationException("ApiSecurityKey is not configured");
        var providedKey = context.Request.Headers[HeaderName].ToString();
        
        var valid = !string.IsNullOrEmpty(providedKey) && CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(providedKey), Encoding.UTF8.GetBytes(expectedKey));

        if (!valid)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new
            {
                error = "Invalid or missing Api Key."
            });
        }
        
        await _next(context);
    }
}