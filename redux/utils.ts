import { RootState } from './store';

export const selectSlackConnection = (state: RootState) => state.slack.isConnected;
export const selectSlackTeamInfo = (state: RootState) => state.slack.teamInfo;
export const selectSlackLoading = (state: RootState) => state.slack.isLoading;
export const selectSlackError = (state: RootState) => state.slack.error;

export const isSlackConnected = (state: RootState) => state.slack.isConnected;
export const getSlackTeamName = (state: RootState) => state.slack.teamInfo?.name;
export const getSlackTeamId = (state: RootState) => state.slack.teamInfo?.id; 
export const getSlackToken = (state:RootState)=>state.slack.teamInfo?.token;