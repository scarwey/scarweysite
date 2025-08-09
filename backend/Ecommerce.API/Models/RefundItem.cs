namespace ECommerce.API.Models
{
    public class RefundItem : BaseEntity
    {
        public int RefundRequestId { get; set; }
        public int OrderItemId { get; set; }
        public int Quantity { get; set; }
        public string Reason { get; set; } = string.Empty;
        public decimal RefundAmount { get; set; }

        // Navigation Properties
        public virtual RefundRequest RefundRequest { get; set; } = null!;
        public virtual OrderItem OrderItem { get; set; } = null!;
    }
}