import { configureStore, createSlice } from "@reduxjs/toolkit";
let theme = "dark";
try {
  const saved = localStorage.getItem("apex-theme");
  if (["dark", "light", "system"].includes(saved)) theme = saved;
} catch {
  /* Optional preference storage. */
}
const preferences = createSlice({
  name: "preferences",
  initialState: { theme },
  reducers: {
    setTheme(state, action) {
      if (["dark", "light", "system"].includes(action.payload))
        state.theme = action.payload;
    },
  },
});
export const { setTheme } = preferences.actions;
export const store = configureStore({
  reducer: { preferences: preferences.reducer },
});
