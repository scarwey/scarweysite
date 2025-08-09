using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ECommerce.API.Models;
using ECommerce.API.Services.Interfaces;

namespace ECommerce.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        // GET: api/orders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetMyOrders()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var orders = await _orderService.GetUserOrdersAsync(userId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching orders", error = ex.Message });
            }
        }

        // GET: api/orders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var order = await _orderService.GetOrderByIdAsync(id, userId);

                if (order == null)
                {
                    return NotFound();
                }

                return Ok(order);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching the order", error = ex.Message });
            }
        }

        // POST: api/orders
        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder([FromBody] CreateOrderModel model)
        {
            try
            {
                //  deme y ntemi validasyonu - Sadece kap da  deme kabul et
                if (string.IsNullOrEmpty(model.PaymentMethod) ||
                    !model.PaymentMethod.Equals("cash_on_delivery", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new
                    {
                        message = "Ge ersiz  deme y ntemi. Sadece kap da  deme kabul edilmektedir.",
                        allowedPaymentMethods = new[] { "cash_on_delivery" }
                    });
                }

                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                // PaymentMethod'u standardize et
                var standardizedPaymentMethod = "Kapýda  Ödeme";

                var order = await _orderService.CreateOrderAsync(userId, model.AddressId, standardizedPaymentMethod);

                return CreatedAtAction("GetOrder", new { id = order.Id }, new
                {
                    order.Id,
                    order.OrderNumber,
                    order.OrderDate,
                    order.Status,
                    order.TotalAmount,
                    PaymentMethod = standardizedPaymentMethod,
                    Message = "Sipari iniz ba ar yla olu turuldu.  r n teslim edilirken  deme yapacaks n z."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Sipari  olu turulurken bir hata olu tu", error = ex.Message });
            }
        }

        // PUT: api/orders/5/cancel
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _orderService.CancelOrderAsync(id, userId);

                if (!result)
                {
                    return BadRequest(new { message = "Sipari  iptal edilemez" });
                }

                return Ok(new { message = "Sipari  ba ar yla iptal edildi" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Sipari  iptal edilirken bir hata olu tu", error = ex.Message });
            }
        }

        // GET: api/orders/track/{orderNumber}
        [HttpGet("track/{orderNumber}")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> TrackOrder(string orderNumber)
        {
            try
            {
                var order = await _orderService.GetOrderByOrderNumberAsync(orderNumber);

                if (order == null)
                {
                    return NotFound(new { message = "Sipari  bulunamad " });
                }

                return Ok(new
                {
                    order.OrderNumber,
                    order.OrderDate,
                    order.Status,
                    order.ShippingCity,
                    ItemCount = order.OrderItems?.Count ?? 0,
                    TotalAmount = order.TotalAmount,
                    PaymentMethod = "Kap da  deme",
                    PaymentStatus = "Teslimat s ras nda  denecek"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Sipari  takip edilirken bir hata olu tu", error = ex.Message });
            }
        }

        // GET: api/orders/summary
        [HttpGet("summary")]
        public async Task<ActionResult<object>> GetOrdersSummary()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                var totalSpent = await _orderService.GetUserTotalSpentAsync(userId);
                var orderCount = await _orderService.GetUserOrderCountAsync(userId);
                var statusSummary = await _orderService.GetOrderStatusSummaryAsync(userId);

                return Ok(new
                {
                    totalOrders = orderCount,
                    totalSpent,
                    ordersByStatus = statusSummary.Select(kvp => new
                    {
                        status = kvp.Key.ToString(),
                        count = kvp.Value
                    }),
                    paymentInfo = new
                    {
                        primaryMethod = "Kap da  deme",
                        description = "T m sipari ler teslimat s ras nda  denmektedir"
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Sipari   zeti al n rken bir hata olu tu", error = ex.Message });
            }
        }

        // GET: api/orders/payment-methods - Yeni endpoint: Desteklenen  deme y ntemlerini d nd r r
        [HttpGet("payment-methods")]
        [AllowAnonymous]
        public ActionResult<object> GetPaymentMethods()
        {
            return Ok(new
            {
                supportedMethods = new[]
                {
                    new
                    {
                        id = "cash_on_delivery",
                        name = "Kap da  deme",
                        description = " r n teslim edilirken nakit olarak  deyebilirsiniz",
                        isActive = true,
                        isDefault = true
                    }
                },
                message = " u anda sadece kap da  deme kabul edilmektedir"
            });
        }
    }

    // Request Models
    public class CreateOrderModel
    {
        public int AddressId { get; set; }

        // Varsay lan de er kap da  deme olarak de i tirildi
        public string PaymentMethod { get; set; } = "cash_on_delivery";
    }
}