import { createSlice } from "@reduxjs/toolkit";

function getSavedUser() {
  try {
    const value = localStorage.getItem("appointify_user");
    return value ? JSON.parse(value) : null;
  } catch {
    localStorage.removeItem("appointify_user");
    return null;
  }
}

const initialState = {
  user: getSavedUser(),
  token: localStorage.getItem("appointify_token") || null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;

      localStorage.setItem("appointify_token", token);
      localStorage.setItem("appointify_user", JSON.stringify(user));
    },
    updateUser(state, action) {
      state.user = action.payload;
      localStorage.setItem(
        "appointify_user",
        JSON.stringify(action.payload)
      );
    },
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("appointify_token");
      localStorage.removeItem("appointify_user");
    }
  }
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
