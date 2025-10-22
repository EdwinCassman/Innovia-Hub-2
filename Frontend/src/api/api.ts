import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL;
const api = axios.create({
  baseURL: API_BASE_URL,
});

//AUTH - Register
export const registerUser = async (
  email: string,
  password: string,
  name: string
) => {
  const res = await api.post("/auth/register", { email, password, name });
  console.log(res.data);
  return res.data;
};

//AUTH - Log in
export const loginUser = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  console.log("API Response:", res.data);
  localStorage.setItem("userName", res.data.userName);
  localStorage.setItem("userId", res.data.id);
  return res.data;
};

//BOOKING - Get all bookings
export const getAllBookings = async (token: string) => {
  const res = await api.get("/booking", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
// Booking Get filtered Bookings
export const getFilteredBookings = async (token: string, date: Date | null) => {
  const dateStr = date!.toISOString().slice(0, 10);
  const res = await api.get(`/booking/date?date=${dateStr}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};
//BOOKING - Get a users booking
export const getUserBookings = async (userId: string, token: string) => {
  const res = await api.get(`/booking/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

//TIMESlOTS
export const getFreeSlots = async (
  date: string | Date,
  resourceTypeId: number,
  token: string
) => {
  let formattedDate: string;

  if (date instanceof Date) {
    // always "YYYY-MM-DD"
    formattedDate = date.toISOString().split("T")[0];
  } else {
    // if already a string, convert to Date first
    formattedDate = new Date(date).toISOString().split("T")[0];
  }

  const payload = { date: formattedDate };
  console.log("🚀 Sending payload to backend:", payload);

  const res = await api.post<string[]>(
    `/booking/${resourceTypeId}/freeSlots`, // match backend casing
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data;
};

//BOOKING - Create a booking
export const createBooking = async (
  booking: {
    date: string;
    timeSlot: string;
    resourceTypeId: number;
    userId: string;
  },
  token: string
) => {
  const res = await api.post("/booking", booking, {
    headers: { Authorization: `Bearer ${token} ` },
  });
  return res.data;
};

//BOOKING - Remove a booking
export const deleteBooking = async (bookingId: number, token: string) => {
  const res = await api.delete(`/booking/${bookingId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

//BOOKING - Change Resource Status
export const changeResourceStatus = async (
  resourceId: number,
  token: string
) => {
  const res = await api.patch(
    `/booking/resource/${resourceId}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};
export const getAllResources = async (token: string) => {
  const res = await api.get("/resource", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
export const getResourceById = async (token: string,id:number) => {
  const res = await api.get(`/resource/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};



//USERS - Ge All Users
export const getAllUsers = async (
  token: string,
  filter?: { name?: string; email?: string }
) => {
  const res = await api.get("/users", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    params: filter,
  });
  return res.data;
};

//USERS - Get specific user
export const getUserById = async (id: string, token: string) => {
  const res = await api.get(`/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  return res.data;
};

//USERS - Update user
export const updateUserById = async (
  id: string,
  token: string,
  name: string,
  email: string
) => {
  const res = await api.post(
    `/users/${id}`,
    { email, name },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return res.data;
};

export const deleteUserById = async (id: string, token: string) => {
  const res = await api.delete(`/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
};

export const getDevices = async () => {
  try {
    console.log("Fetching devices...");
    const res = await api.get(`/innovia/devices`, {
      withCredentials: true,
    });
    console.log("Devices fetched:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error fetching devices:", error);
    throw error;
  }
};

export const getDeviceData = async (
  deviceId: string,
  from: string,
  to: string
) => {
  try {
    console.log(`Fetching data for device ${deviceId} from ${from} to ${to}...`);
    const res = await api.get(`/innovia/devices/${deviceId}/data`, {
      params: { from, to },
      withCredentials: true,
    });
    console.log("Device data fetched:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error fetching device data:", error);
    throw error;
  }
};