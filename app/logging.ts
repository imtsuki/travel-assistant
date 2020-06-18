import { atom } from 'recoil';

export const logItemsState = atom<{ timestamp: string; message: string }[]>({
  key: 'logItemsState',
  default: [],
});

export const log = (message: string) => ({
  timestamp: new Date().toTimeString(),
  message: message,
});
