import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api";

export const fetchServices = createAsyncThunk(
  "services/fetch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/services", { params });
      return data.services;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Could not load services"
      );
    }
  }
);

const serviceSlice = createSlice({
  name: "services",
  initialState: {
    items: [],
    loading: false,
    error: ""
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Could not load services";
      });
  }
});

export default serviceSlice.reducer;
