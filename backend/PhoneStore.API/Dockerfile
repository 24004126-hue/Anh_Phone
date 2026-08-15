# Stage 1: Build .NET 8 API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["PhoneStore.API.csproj", "./"]
RUN dotnet restore "PhoneStore.API.csproj"

COPY . .
RUN dotnet publish "PhoneStore.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Minimal Production Runtime (Alpine)
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 10000
EXPOSE 5055

ENV ASPNETCORE_HTTP_PORTS=8080
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "PhoneStore.API.dll"]
