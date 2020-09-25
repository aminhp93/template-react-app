import { TFile } from './files';
import { TConversationType } from './conversations';

export interface IMessageMention {
  id: number;
  target: any;
}

export interface IMessageReaction {
  count: number;
  name: string;
  ts: string;
  users: number[];
}
export interface IThreadPreview {
  id: number;
  replyCount: number;
  users?: number[];
}

export enum MessageType {
  UserMessage = 'USER_MESSAGE',
  SystemMessage = 'SYSTEM_MESSAGE',
  GifMessage = 'GIF_MESSAGE',
}

export type TMessageType =
  | MessageType.UserMessage
  | MessageType.SystemMessage
  | MessageType.GifMessage;

export type TMessage = {
  id: number;
  channel?: number;
  content: string;
  created?: string;
  creator?: number | null;
  files?: TFile[];
  isEdited?: boolean;
  isRemoved?: boolean;
  mentions?: IMessageMention[];
  modified?: string;
  pinnedAt?: string | null;
  pinnedUser?: number | null;
  replyCount?: number;
  lastMembers?: number[] | null;
  lastReplyCreated?: string | null;
  parent?: number | null;
  type?: TMessageType;
  temporaryId?: string | number;
  // Used for resending a failed message
  hasError?: boolean;
  isNew?: boolean;
  isTemporary?: boolean;
  reactions?: IMessageReaction[];
  isSaved?: boolean;
  timeSaved?: string;
  conversationType?: TConversationType;
  conversationName?: string;
};

export type TReaction = {
  displayName: string;
  group: string;
  isDefault: boolean;
  name: string;
  order: number;
  src: string;
  unicode: string;
}