import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "./authTypes";
import { MockUser } from "@/data/mockUser";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // nhấn nút đăng nhập 
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    // đăng nhập thành công
    loginSuccess: (state, action: PayloadAction<MockUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false; 
      state.error = null;
    },
    // có lỗi
    loginFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isAuthenticated = false;
      state.loading = false; 
    },
    // đăng xuất
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;