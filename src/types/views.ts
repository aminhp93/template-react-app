/**
 * Collection of types for different views in Messaging
 */
export enum PrimaryView {
  ConversationDetail = 'CONVERSATION_DETAIL',
  ConversationPlaceholder = 'CONVERSATION_PLACEHOLDER',
  CreateConversation = 'CREATE_CONVERSATION'
}

export type TPrimaryView = PrimaryView.ConversationDetail
  | PrimaryView.ConversationPlaceholder
  | PrimaryView.CreateConversation;


export enum SecondaryView {
  THREAD_LIST = 'THREAD_LIST',
  THREAD_DETAIL = 'THREAD_DETAIL',
  CONVERSATION_INFO = 'CONVERSATION_INFO',
  SAVED_MESSAGE_LIST = 'SAVED_MESSAGE_LIST'
}