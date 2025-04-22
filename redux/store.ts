import { configureStore, Middleware } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import slackReducer from './slices/slackSlice';
import { persistState } from './middleware';

// Define the state shape
export interface RootState {
  auth: ReturnType<typeof authReducer>;
  slack: ReturnType<typeof slackReducer>;
}

// Load persisted state from localStorage
const loadPersistedState = () => {
  if (typeof window !== 'undefined') {
    const persistedSlackState = localStorage.getItem('slackState');
    if (persistedSlackState) {
      return {
        slack: JSON.parse(persistedSlackState),
      };
    }
  }
  return undefined;
};

// Create the store with proper typing
export const store = configureStore({
  reducer: {
    auth: authReducer,
    slack: slackReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistState as Middleware),
  preloadedState: loadPersistedState(),
});

export type AppDispatch = typeof store.dispatch; 