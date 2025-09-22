export interface Participant {
  id: string;
  name: string;
  stream?: MediaStream;
  isMuted: boolean;
  isVideoOff: boolean;
  isLocal?: boolean;
  isScreenShare?: boolean;
}

export interface Message {
  id: number;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
}

export type VirtualBackground =
  | { type: 'none' }
  | { type: 'blur' }
  | { type: 'image'; url: string };
