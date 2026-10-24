import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api";

function getMessage(error, fallback) {
  return error.response?.data?.message || fallback;
}

export const fetchMyAppointments = createAsyncThunk(
  "appointments/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/appointments/my");
      return data.appointments;
    } catch (error) {
      return rejectWithValue(
        getMessage(error, "Could not load appointments")
      );
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  "appointments/cancel",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/appointments/${id}/cancel`);
      return data.appointment;
    } catch (error) {
      return rejectWithValue(
        getMessage(error, "Could not cancel appointment")
      );
    }
  }
);

const appointmentSlice = createSlice({
  name: "appointments",
  initialState: {
    items: [],
    loading: false,
    error: ""
  },
  reducers: {
    clearAppointmentError(state) {
      state.error = "";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAppointments.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchMyAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Could not load appointments";
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        const item = state.items.find(
          (appointment) => appointment._id === action.payload._id
        );

        if (item) {
          item.status = action.payload.status;
        }
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.error = action.payload || "Could not cancel appointment";
      });
  }
});

export const { clearAppointmentError } = appointmentSlice.actions;
export default appointmentSlice.reducer;
