import { configureStore } from '@reduxjs/toolkit';
import basketReducer from '../features/basketSlice';
import languageReducer from '../features/languageSlice'; // Import the language reducer
import localStorageMiddleware from '../middleware/localStorageMiddleware';
import { loadState } from '../utils/loadState';

const preloadedState = loadState();

export const store = configureStore({
  reducer: {
    basket: basketReducer,
    language: languageReducer, // Add the language reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(localStorageMiddleware),
  preloadedState,
});
