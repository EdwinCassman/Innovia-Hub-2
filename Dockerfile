# =============================
# Stage 1: Build React frontend
# =============================
FROM node:22 AS frontend
WORKDIR /app

# Copy root package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the Frontend folder and build React app
COPY Frontend/ ./Frontend
WORKDIR /app/Frontend
RUN npm run build

# =============================
# Stage 2: Build .NET backend
# =============================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY Backend/*.csproj ./Backend/
RUN dotnet restore ./Backend/*.csproj

# Copy the rest of backend code
COPY Backend/ ./Backend/
WORKDIR /src/Backend
RUN dotnet publish -c Release -o /app/publish

# =============================
# Stage 3: Final runtime image
# =============================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Copy backend
COPY --from=build /app/publish ./

# Copy frontend build into wwwroot
COPY --from=frontend /app/Frontend/build ./wwwroot

# Expose port
EXPOSE 80

# Entry point
ENTRYPOINT ["dotnet", "Backend.dll"]
