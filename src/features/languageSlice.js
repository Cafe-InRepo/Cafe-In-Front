import { createSlice } from '@reduxjs/toolkit';

// Load the initial language from localStorage, defaulting to 'English' if not found
const initialLanguage = localStorage.getItem('language') || 'English';

export const languageSlice = createSlice({
  name: 'language',
  initialState: {
    language: initialLanguage,
  },
  reducers: {
    changeLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload); // Save the new language to localStorage
    },
  },
});

export const { changeLanguage } = languageSlice.actions;
export default languageSlice.reducer;
