import "./App.css";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Admin from "./pages/Admin";
import Booking from "./pages/Booking";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Resource from "./pages/Resource";
import Layout from "./pages/Layout"; // "ram" med Header + Footer
import Login from "./pages/Login";
import ProtectedRoute from "./components/protectedRoute";
import { useEffect, useState } from "react";

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [isTokenLoading, setIsTokenLoading] = useState(true);
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Error loading token:", error);
        localStorage.removeItem("token");
      }
      setIsTokenLoading(false);
    };
    loadToken();
  }, []);
  if (isTokenLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              {token ? <Admin token={token} /> : <div>Loading...</div>}
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/:resourceId/:date/:slot"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resource/:resourceId"
          element={
            <ProtectedRoute>
              <Resource />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
