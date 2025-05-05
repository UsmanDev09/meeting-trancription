import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SlackState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  teamInfo: {
    id: string;
    name: string;
    domain: string;
    token:string;
  } | null;
}

const initialState: SlackState = {
  isConnected: false,
  isLoading: false,
  error: null,
  teamInfo: null,
};

const slackSlice = createSlice({
  name: 'slack',
  initialState,
  reducers: {
    setSlackConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setSlackLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSlackError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTeamInfo: (state, action: PayloadAction<SlackState['teamInfo']>) => {
      state.teamInfo = action.payload;
    },
    resetSlackState: (state) => {
      state.isConnected = false;
      state.isLoading = false;
      state.error = null;
      state.teamInfo = null;
    },
  },
});

export const {
  setSlackConnected,
  setSlackLoading,
  setSlackError,
  setTeamInfo,
  resetSlackState,
} = slackSlice.actions;

export default slackSlice.reducer; 