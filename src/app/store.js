// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import basketReducer from '../features/basketSlice';
import localStorageMiddleware from '../middleware/localStorageMiddleware';
import { loadState } from '../utils/loadState';

const preloadedState = loadState();

export const store = configureStore({
  reducer: {
    basket: basketReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(localStorageMiddleware),
  preloadedState,
});
