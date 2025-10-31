# =============================
# Stage 1: Build React frontend
# =============================
FROM node:22 AS frontend
WORKDIR /app

# Copy only package files first for caching
COPY ClientApp/package*.json ./
RUN npm install

# Copy the rest of the React app
COPY ClientApp/ ./

# Build React app (default output is 'build' folder)
RUN npm run build

# =============================
# Stage 2: Build .NET backend
# =============================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy all files and restore dependencies
COPY *.sln ./
COPY *.csproj ./
RUN dotnet restore

# Copy remaining backend code
COPY . ./

# Publish the backend
RUN dotnet publish -c Release -o /app/publish

# =============================
# Stage 3: Final runtime image
# =============================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Copy backend
COPY --from=build /app/publish ./

# Copy frontend build into wwwroot so .NET can serve it
COPY --from=frontend /app/build ./wwwroot

# Expose port (optional)
EXPOSE 80

# Set entrypoint
ENTRYPOINT ["dotnet", "YourBackend.dll"]
