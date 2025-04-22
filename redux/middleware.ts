import { Middleware } from '@reduxjs/toolkit';
import { RootState } from './store';

export const persistState: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const result = next(action);
  
  // Persist Slack state to localStorage
  if (action.type.startsWith('slack/')) {
    const { slack } = store.getState();
    if (typeof window !== 'undefined') {
      localStorage.setItem('slackState', JSON.stringify(slack));
    }
  }
  
  return result;
}; 