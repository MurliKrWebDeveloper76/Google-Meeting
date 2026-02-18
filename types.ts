
export interface UserInfo {
  id: string;
  name: string;
}

export interface MeetingState {
  roomId: string;
  isInCall: boolean;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ERROR = 'ERROR'
}
