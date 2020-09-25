import { TMessage, ConversationType } from 'types';
import ConversationService from 'services/Conversation';
import {
  updateConversationSuccess,
} from 'reducers/conversations';


export type ReadQueue = {
  lastMessageId: number,
  timeout: any,
}

const queues: {
  [key: string]: ReadQueue
} = {};


/**
 * Instead of blindly hammering the server with read quests, we queue a few read
 * requests for a paticular conversation and flush it after a timeout. This really
 * helped when a user is scrolling through the chat history.
 */
export const read = (message: TMessage, conversationType?: ConversationType) => (dispatch) => {
  // Excluding MessageItem from the thread list
  if (!conversationType) {
    return
  }

  const key = `${conversationType}-${message.parent || message.channel}`;
  let queue = queues[key];

  if (!queue) {
    queue = queues[key] = { lastMessageId: 0, timeout: null }
  }

  // Server has already handled this case, but we also do it here for optimization
  if (message.id <= queue.lastMessageId) {
    return
  }

  clearTimeout(queue.timeout);

  queue.lastMessageId = message.id;

  // All the dispatches here are just for reference, currently we don't use
  // these actions
  queue.timeout = setTimeout(() => {
    // Thread replies won't be displayed in normal chat history, just thread
    // so it is safe to assume that thread replies will always mean thread read
    // if (message.parent) {
    //   ThreadService.getMarkReadThread(message.parent);
    //   return
    // }
    if (message.parent) return;

    if ([ConversationType.Group, ConversationType.DirectMessage].includes(conversationType)) {
      ConversationService.markDMGAsRead(message.channel, message.id).then((res) => {
        if (res && res.status === 200) {
          dispatch(updateConversationSuccess(res.data));
        }
      });
    } else {
      ConversationService.markChannelAsRead(message.channel, message.id).then((res) => {
        if (res && res.status === 200) {
          dispatch(updateConversationSuccess(res.data));
        }
      });
    }

    dispatch({
      conversationType,
      type: 'READ',
      channelId: message.channel,
      threadId: message.parent,
      messageId: message.id
    })
  }, 200)
};
