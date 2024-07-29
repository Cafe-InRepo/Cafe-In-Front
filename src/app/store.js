// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import languageReducer from '../features/languageSlice';
import basketReducer from '../features/basketSlice';
import localStorageMiddleware from '../middleware/localStorageMiddleware';
import { loadState } from '../utils/loadState';

const preloadedState = loadState();

export const store = configureStore({
  reducer: {
    language: languageReducer,
    basket: basketReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(localStorageMiddleware),
  preloadedState,
});
