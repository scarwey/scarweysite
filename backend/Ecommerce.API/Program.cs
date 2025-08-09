using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;
using ECommerce.API.Data;
using ECommerce.API.Models;
using ECommerce.API.Services;
using ECommerce.API.Services.Interfaces;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Http.Features;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// File Upload Configuration - Dosya yükleme için gerekli
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 10 * 1024 * 1024; // 10MB limit
    options.ValueLengthLimit = int.MaxValue;
    options.ValueCountLimit = int.MaxValue;
    options.KeyLengthLimit = int.MaxValue;
});

// Database Context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ✅ Cloudinary Configuration
builder.Services.Configure<CloudinarySettings>(
    builder.Configuration.GetSection("Cloudinary"));

// ✅ Service Registrations
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IRefundService, RefundService>();

// HttpClient for Email Service
builder.Services.AddHttpClient<EmailService>();

// Email Configuration
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));

// Identity Configuration
builder.Services.AddIdentity<User, IdentityRole<int>>(options =>
{
    // Password settings
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;

    // User settings
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders()
.AddRoles<IdentityRole<int>>();

// JWT Authentication - NULL SAFE 🛡️
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"];

// ✅ CRITICAL NULL CHECK - Prevents CS8604 warning
if (string.IsNullOrEmpty(secretKey))
{
    throw new InvalidOperationException("JWT Secret key is not configured in appsettings.json");
}

var secretKeyBytes = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // ✅ NULL SAFE JWT SETTINGS - Prevents CS8604 warnings
    var issuer = jwtSettings["Issuer"];
    var audience = jwtSettings["Audience"];

    if (string.IsNullOrEmpty(issuer) || string.IsNullOrEmpty(audience))
    {
        throw new InvalidOperationException("JWT Issuer and Audience must be configured in appsettings.json");
    }

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(secretKeyBytes),
        ClockSkew = TimeSpan.Zero
    };
});

// ✅ TEK VE TEMİZ CORS POLICY - DÜZELTME
builder.Services.AddCors(options =>
{
    options.AddPolicy("MainPolicy", corsBuilder =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // Development: Daha esnek
            corsBuilder.WithOrigins(
                    "http://localhost:3000",
                    "http://localhost:3001",
                    "https://scarweysite.vercel.app"
                   )
                   .AllowAnyHeader()
                   .AllowAnyMethod()
                   .AllowCredentials()
                   .SetPreflightMaxAge(TimeSpan.FromMinutes(5));
        }
        else
        {
            // Production: Sıkı güvenlik
            corsBuilder.WithOrigins("https://scarweysite.vercel.app")
                   .AllowAnyHeader()
                   .AllowAnyMethod()
                   .AllowCredentials()
                   .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
        }
    });
});

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// ✅ SWAGGER SADECE DEVELOPMENT'DA
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "E-Commerce API",
            Version = "v1",
            Description = "E-Commerce API for React Frontend - Development Mode"
        });

        // JWT Authentication for Swagger
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });

        // Session ID Header for Swagger
        c.AddSecurityDefinition("SessionId", new OpenApiSecurityScheme
        {
            Description = "Session ID header for guest users. Enter any session ID (e.g., 'test-session-123')",
            Name = "X-Session-Id",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey
        });

        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            },
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "SessionId"
                    }
                },
                Array.Empty<string>()
            }
        });
    });
}

var app = builder.Build();

// Configure the HTTP request pipeline.

// ✅ SWAGGER SADECE DEVELOPMENT'DA
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "E-Commerce API V1");
        c.RoutePrefix = "swagger"; // /swagger URL'si
    });

    // Development'da directory browsing
    app.UseDirectoryBrowser();
}

app.UseHttpsRedirection();

// Static Files - Resim dosyalarının servis edilmesi için ÇOK ÖNEMLİ!
app.UseStaticFiles();

// ✅ TEMİZ CORS KULLANIMI
app.UseCors("MainPolicy");

app.UseAuthentication();
app.UseAuthorization();

// Health check endpoints
app.MapGet("/", () => new {
    message = "E-Commerce API is running!",
    version = "1.0.0",
    environment = app.Environment.EnvironmentName,
    timestamp = DateTime.UtcNow
});

app.MapGet("/health", () => new {
    status = "Healthy",
    timestamp = DateTime.UtcNow
});

app.MapControllers();

// wwwroot klasör yapısını oluştur
var webRootPath = app.Environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
var imagesPath = Path.Combine(webRootPath, "images", "products");
Directory.CreateDirectory(imagesPath);

// Seed Database (Optional - for initial data)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var logger = services.GetRequiredService<ILogger<Program>>();

        logger.LogInformation("Starting database migration...");
        await context.Database.MigrateAsync();
        logger.LogInformation("Database migration completed successfully.");

        // Seed data can be added here later
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
        throw; // Production'da hata durumunda uygulama başlamasın
    }
}

app.Run();