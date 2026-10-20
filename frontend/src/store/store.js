import { configureStore } from "@reduxjs/toolkit";
import appointmentReducer from "./appointmentSlice";
import authReducer from "./authSlice";
import serviceReducer from "./serviceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    services: serviceReducer,
    appointments: appointmentReducer
  }
});
