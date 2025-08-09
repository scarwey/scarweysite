# 1. Build aşaması
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Proje dosyasını kopyala ve restore et
COPY *.csproj ./
RUN dotnet restore

# Tüm dosyaları kopyala ve build et
COPY . ./
RUN dotnet publish -c Release -o out

# 2. Runtime aşaması
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Uygulamayı başlat
ENTRYPOINT ["dotnet", "Ecommerce.API.dll"]
