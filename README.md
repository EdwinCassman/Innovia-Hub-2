# Innovia Hub – Intranät och bokningssystem

Detta repo innehåller projektarbetet för kursuppgiften **Innovia Hub**.

## Om uppgiften

Innovia Hub är ett intranät och bokningssystem för coworkingcentret Innovia Hub. Systemet är byggt för att underlätta vardagen för både medlemmar och administratörer.

För användaren
- Medlemmar kan logga in och boka resurser i realtid, som skrivbord, mötesrum, VR-headsets och AI-servrar.
- Systemet visar aktuellt tillgängliga tider och uppdateras automatiskt via SignalR när någon annan gör en bokning – användaren ser direkt om en tid blir upptagen.
- En responsiv och enkel frontend gör att systemet kan användas på dator, surfplatta och mobil.

För administratören
- Administratörer har en egen panel där de kan hantera användare, resurser och bokningar.
- De kan aktivera/inaktivera resurser, ta bort bokningar eller uppdatera information om medlemmar.
- All data hanteras via ett API som backend tillhandahåller.

Tekniska funktioner
- Backend är byggt i ASP.NET Core med Entity Framework Core och Identity för autentisering och behörigheter.
- Bokningar och användare lagras i en SQL-databas (MySQL).
- Realtidskommunikation sker med SignalR, vilket gör att alla användare får live-uppdateringar utan att behöva ladda om sidan.
- Frontend är byggd i React (Vite) och kommunicerar med backend via ett REST API och en SignalR-klient.


## Vår Stack

- **Backend:** ASP.NET Core (C#)
- **Frontend:** React (Vite)
- **Databas:** SQL (MySQL)
- **Realtidskommunikation:** SignalR
- **API (framtid):** Mockat sensor-API

---

## Kom igång – Installation (Backend + Frontend)

Krav på verktyg/versioner
- **.NET SDK:** 9.0
- **Node.js:** 18 eller 20 rekommenderas
- **MySQL:** igång lokalt på `localhost:3307` (går att ändra i `Backend/appsettings.json`)

Nedan följer en steg-för-steg guide för att köra projektet lokalt.

### 1. Backend

Öppna en terminal i `Backend/` och kör:
```powershell
cd Backend
dotnet restore
dotnet build
dotnet run
```

Backend startar på `http://localhost:5022` (API-bas: `http://localhost:5022/api`).

Notera:
- Projektet seedar data och en admin-användare vid första körningen (se `Services/DbSeeder.cs`).
- Standard-admin skapas med: användarnamn `admin`, lösenord `Admin@123`, roll `admin`.
- Du kan inte bli admin när du registrerar dig. För att logga in som admin, använd e-postadressen `admin@example.com` och lösenordordet `Admin@123`
- SignalR hub körs på `/bookingHub`.
- Databasanslutning styrs av `ConnectionStrings:DefaultConnection` i `Backend/appsettings.json`.
  - Du kan byta port/användare/lösen här eller via user secrets/ miljövariabler.

### 2. Starta Frontend

Frontend använder Vite och läser API-bas via `VITE_API_URL`.

1. Skapa en .env i `Frontend` med:
```env
VITE_API_URL=http://localhost:5022/api
```

Öppna en ny terminal i `Frontend/` och kör:
```powershell
cd Frontend
npm install
npm run dev
```

Frontend startar på `http://localhost:5173` 

---

## Strukturen
- `Backend/` – ASP.NET Core API, EF Core, Identity, SignalR
- `Frontend/` – React + Vite, React Router, SignalR-klient

## Databasen
- Starta MySQL lokalt och säkerställ att konfigurationen matchar `appsettings.json` (se ovan).
- Databasen och seed-data skapas automatiskt första gången du kör backend.

---

## Felsökning

- CORS-fel mellan frontend och backend:
  - Kontrollera att backend tillåter anrop från `http://localhost:5173`.
  - Säkerställ att `VITE_API_URL` pekar på rätt adress (`http://localhost:5022/api`).

- Databasanslutning misslyckas:
  - Verifiera att MySQL kör på port `3307` eller uppdatera `appsettings.json` till din port.
  - Kontrollera användare/lösenord och att databasen finns/kan skapas.


## CHATBOT - Jarvis

Chatboten använder sig av en ChatGpt-modell (gpt-4.1).
HTTP-klient (IHttpClientFactory) används för att kommunicera med OpenAi:s API.

För att kunna använda Chatbotten behövs en API-nyckel från OpenAI som ska ligga i en .env-fil:
DB_HOST= !HOST!
DB_PORT=3306
DB_USER=tester
DB_PASSWORD= !Lösenord!
DB_NAME=innoviahub
OPEN_API_KEY="Din API-nyckel"

- ChatController.cs 
  - ChatController.cs har en POST-endpoint /api/Chat
  - Tar emot frågor från användaren och skickar den till OpenAI:s API
  - Den hanterar historik genom att inkludera meddelanden i Input-fältet
  - Returnerar svaret från OpenAI till frontend


- ChatBot.tsx
  - messages håller koversationens historik
  - question håller användarens aktuella fråga
  - API anrop skickar användarens fråga till backend via fetch
  - meddelanden visar koversationer mellan användaren och chatboten


## TEST INLOGGNING

Login för Admin:

Användarnamn: admin@example.com
Lösenord: Admin@123

Login för normal användare:
Det går att skapa ett eget, annars:

Användarnamn: TestUser
Email: TestUser@test.com
Lösenord: test@123


## FUNKTIONER JAG HAR VIDAREUTVECKLAT SJÄLV

AI Chatbot - Jarvis
IoT - Realtidsuppdatering av enheter