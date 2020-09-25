import { TMessage } from './messages';

export enum ConversationType {
  Public = 'O',
  Private = 'P',
  Group = 'G',
  DirectMessage = 'D',
}

export type TConversationType =
  | ConversationType.Public
  | ConversationType.Private
  | ConversationType.Group
  | ConversationType.DirectMessage;

export type TConversation = {
  id: number;
  conversationName?: string;
  conversationType: TConversationType;
  slug: string;
  topic?: string;
  purpose?: string;
  creator: number;
  team: number;
  created: string;
  modified: string;
  isFavorite: boolean;
  isMute: boolean;
  isHide: boolean;
  isArchived: boolean;
  messages?: {
    [key: number]: TMessage | null;
  };
  isRead: boolean;
  mentionCount: number;
  members: number[];
  admins?: number[];
  lastMemberReply: number;
  isTeamDefault: boolean;
  isRemoved: boolean;
  isNew: boolean;
};

export enum EditChannelType {
  Name = 'conversationName',
  Purpose = 'purpose',
  Topic = 'topic',
}

export interface IReadChannelPayload {
  channel: number;
  isRead: boolean;
  mentionCount: number;
}
