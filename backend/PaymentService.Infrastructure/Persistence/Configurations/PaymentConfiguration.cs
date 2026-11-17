using Microsoft.EntityFrameworkCore;
using PaymentService.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace PaymentService.Infrastructure.Persistence.Configurations;
public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.WalletNumber).HasMaxLength(50).IsRequired();
        builder.Property(p => p.Amount).HasPrecision(18,2);

        builder.Property(p => p.Account).IsRequired().HasMaxLength(100);

        builder.Property(p => p.Email).IsRequired().HasMaxLength(254);

        builder.Property(p => p.Phone).HasMaxLength(20);

        builder.Property(p => p.Comment).HasMaxLength(500);

        builder.Property(p => p.Currency).HasConversion<string>().HasMaxLength(3).IsRequired();

        builder.Property(p => p.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
    }
}