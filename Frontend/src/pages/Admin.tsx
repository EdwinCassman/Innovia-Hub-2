import React, { useState, useEffect } from "react";
import "../styles/Admin.css";
import BookingsTab from "../components/BookingsTab";
import UsersTab from "../components/UsersTab";
import ResourcesTab from "../components/ResourcesTab";
import { connection } from "../signalRConnection";
import { ToastContainer, toast } from "react-toastify";
import DeviceList from "../components/DeviceList";
import RealTimeData from "../components/RealTimeData";
import "react-toastify/dist/ReactToastify.css";

interface AdminProps {
  token: string;
}

const Admin: React.FC<AdminProps> = ({ token }) => {
  const [activeTab, setActiveTab] = useState("bookings");
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  useEffect(() => {
    const page = localStorage.getItem("activePage");
    if (page) {
      setActiveTab(page);
    }
    document.body.classList.add("adminBg");
    return () => {
      document.body.classList.remove("adminBg");
    };
  }, []);

  useEffect(() => {
    const handler = (update: any) => {
      toast.info(
        `en ${update.resourceName} har blivit bokad på ${update.date} under ${update.timeSlot}`
      );
      console.log(update);
    };
    connection.on("ReceiveBookingUpdate", handler);
    return () => {
      connection.off("ReceiveBookingUpdate", handler);
    };
  }, []);

  useEffect(() => {
    const handler = (update: any) => {
      toast.info(
        `en ${update.resourceName} har blivit Avbokad på ${update.date} under ${update.timeSlot}`
      );
      console.log(update);
    };
    connection.on("ReceiveDeleteBookingUpdate", handler);
    return () => {
      connection.off("ReceiveDeleteBookingUpdate", handler);
    };
  }, []);

  if (!token) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="adminHeaderHolder">
        <header className="header">
          <div>
            <h1>Adminpanel</h1>
          </div>
        </header>
      </div>

      <nav className="tabs">
        <button
          className={`tab ${activeTab === "bookings" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("bookings");
            localStorage.setItem("activePage", "bookings");
          }}>
          BOKNINGAR
        </button>
        <button
          className={`tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("users");
            localStorage.setItem("activePage", "users");
          }}>
          ANVÄNDARE
        </button>
        <button
          className={`tab ${activeTab === "resources" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("resources");
            localStorage.setItem("activePage", "resources");
          }}>
          RESURSER
        </button>
        <button
          className={`tab ${activeTab === "devices" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("devices");
            localStorage.setItem("activePage", "devices");
          }}>
          ENHETER
        </button>
        <button
          className={`tab ${activeTab === "realtime" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("realtime");
            localStorage.setItem("activePage", "realtime");
          }}>
          REALTIDSDATA
        </button>
      </nav>

      <div className="content">
        {activeTab === "bookings" && <BookingsTab token={token} />}
        {activeTab === "users" && <UsersTab token={token} />}
        {activeTab === "resources" && <ResourcesTab token={token} />}
        {activeTab === "devices" && (
          <DeviceList
            onDeviceSelect={(deviceId: string) => {
              console.log("Updating selectedDeviceId:", deviceId);
              setSelectedDeviceId(deviceId);
            }}
          />
        )}
        {activeTab === "realtime" && selectedDeviceId && (
          <>
            {console.log("Selected Device ID:", selectedDeviceId)}
            <RealTimeData deviceId={selectedDeviceId} />
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
