import Pusher, { Channel } from 'pusher-js';
import * as Sentry from '@sentry/browser';
import { ConsoleLogger as Logger } from '@aws-amplify/core';

import config from 'config';
import { getHeaders, MESSAGING_URLS } from 'config/api';
import { dispatch } from 'store';

import { MessagingEvent } from 'actions/messaging';

import {
  updateConversationSuccess,
  realtimeCreateConversation,
  realtimeJoinChannel,
  realtimeAssignChannelAdmin,
  realtimeLeaveConversation,
  realtimeDeleteConversation,
  realtimeRemoveChannelMember,
  realtimeReadChannel,
} from 'reducers/conversations';

import {
  realtimeSendMessage,
  realtimeUpdateMessage,
  realtimeRemoveMessage,
  realtimeAddReaction,
  realtimeRemoveReaction,
} from 'reducers/messages';

import {
  createTeamSuccess,
  TTeamPayload,
  realtimeJoinTeam,
  removeTeamMemberSuccess,
  updateTeamSuccess,
  realtimeReadTeam,
  realtimeAssignTeamAdmin,
  realtimeLeaveTeam,
} from 'reducers/teams';

import { realtimeCreateThread } from 'reducers/threads';

import { realtimeReadThread } from 'reducers/threadNotifications';
import { getUserNotitficationSuccess } from 'reducers/userNotifications';
import {
  getOnlineUsersSuccess,
  addOnlineUserSuccess,
  removeOnlineUserSuccess,
} from 'reducers/onlineUsers';
import { reconnect } from 'reducers/reconnect';
import request from 'utils/request';
import {
  TConversation,
  IReadChannelPayload,
  IReadTeamPayload,
  IReadThreadPayload,
  ITeamMembership,
  TMessage,
} from 'types';

import { realtimeGlobalSignOut, updateUserListSuccess } from 'reducers/users';

const logger = new Logger(__filename);

/* Bind Pusher internal logger to our own logger, save us from
 * having to manually debug all Pusher events. Note that this is
 * global to Pusher, so events from legacy messaging will also show up. */
const pusherLogger = new Logger('Pusher');
Pusher.log = pusherLogger.debug.bind(pusherLogger);

export class MessagingService {
  _pusher?: Pusher;
  _channel?: Channel;
  _presence_members_channel: Channel;

  async init(channelId: string) {
    this._pusher = new Pusher(config.pusher.key, {
      cluster: config.pusher.cluster,

      authorizer: (channel: Channel) => ({
        authorize: async (socketId, callback) => {
          try {
            const response = await this.getPusherAuthenticationToken(
              channel.name,
              socketId
            );
            callback(false, response.data);
          } catch (error) {
            logger.error(error);
            callback(true, error);
          }
        },
      }),
    });

    this._pusher.connection.bind('state_change', (states) => {
      const message = `${JSON.stringify(states.previous)}  --> ${JSON.stringify(
        states.current
      )}`;
      Sentry.captureMessage(`State change pusher || ${message}`);
      logger.debug(`State change pusher || ${message}`);
      if (states.previous === 'unavailable' && states.current === 'connected') {
        dispatch(reconnect);
      }
    });

    this._pusher.connection.bind('connected', () => {
      logger.debug('Subscribing to channel', `private-${channelId}`);

      this._presence_members_channel = this._pusher.subscribe(
        'presence-members'
      );

      this._presence_members_channel.bind(
        'pusher:subscription_succeeded',
        (status) => {
          const members =
            Object.keys(status.members).map((i) => Number(i)) || [];
          dispatch(getOnlineUsersSuccess(members));
        }
      );

      this._presence_members_channel.bind('pusher:member_added', (member) => {
        dispatch(addOnlineUserSuccess(member.id));
      });

      this._presence_members_channel.bind('pusher:member_removed', (member) => {
        dispatch(removeOnlineUserSuccess(member.id));
      });

      this._channel = this._pusher.subscribe(`private-${channelId}`);

      this._channel.bind('pusher:subscription_error', (status) => {
        logger.error(
          `Error subscribing to channel ${channelId}, status: ${status}`
        );
      });

      this.bindWithChunked(MessagingEvent.CREATE_TEAM, (payload) => {
        dispatch(createTeamSuccess(payload));
      });

      this.bindWithChunked(MessagingEvent.JOIN_TEAM, (payload) => {
        dispatch(realtimeJoinTeam(payload));
      });

      this.bindWithChunked(
        MessagingEvent.UPDATE_TEAM,
        (payload: TTeamPayload) => {
          dispatch(updateTeamSuccess(payload));
        }
      );

      this.bindWithChunked(MessagingEvent.LEAVE_TEAM, (payload) => {
        dispatch(realtimeLeaveTeam(payload));
      });

      this.bindWithChunked(
        MessagingEvent.ASSIGN_TEAM_ADMIN,
        (payload: ITeamMembership) => {
          dispatch(realtimeAssignTeamAdmin(payload));
        }
      );

      this.bindWithChunked(
        MessagingEvent.CREATE_CONVERSATION,
        (payload: TConversation) => {
          dispatch(realtimeCreateConversation(payload));
        }
      );

      this.bindWithChunked(MessagingEvent.JOIN_CONVERSATION, (payload) => {
        dispatch(realtimeJoinChannel(payload));
      });

      this.bindWithChunked(
        MessagingEvent.UPDATE_CONVERSATION,
        (payload: TConversation) => {
          dispatch(updateConversationSuccess(payload));
        }
      );

      this.bindWithChunked(
        MessagingEvent.DELETE_CONVERSATION,
        (payload: TTeamPayload) => {
          dispatch(realtimeDeleteConversation(payload));
        }
      );

      this.bindWithChunked(
        MessagingEvent.LEAVE_CONVERSATION,
        (payload: TTeamPayload) => {
          dispatch(realtimeLeaveConversation(payload));
        }
      );

      this.bindWithChunked(MessagingEvent.REMOVE_USER, (payload) => {
        const { channel, team } = payload;
        if (channel) {
          dispatch(realtimeRemoveChannelMember(payload));
        } else if (team) {
          dispatch(removeTeamMemberSuccess(payload));
        }
      });

      this.bindWithChunked(
        MessagingEvent.REMOVE_MESSAGE,
        (payload: TMessage) => {
          dispatch(realtimeRemoveMessage(payload));
        }
      );

      this.bindWithChunked(MessagingEvent.SEND_MESSAGE, (payload) => {
        dispatch(realtimeSendMessage(payload));
      });

      this.bindWithChunked(MessagingEvent.UPDATE_MESSAGE, (payload) => {
        dispatch(realtimeUpdateMessage(payload));
      });

      this.bindWithChunked(MessagingEvent.ASSIGN_CHANNEL_ADMIN, (payload) => {
        dispatch(realtimeAssignChannelAdmin(payload));
      });

      this.bindWithChunked(MessagingEvent.UNREAD_THREAD, (payload) => {
        dispatch(realtimeUpdateMessage(payload));
      });

      this.bindWithChunked(
        MessagingEvent.READ_THREAD,
        (payload: IReadThreadPayload) => {
          dispatch(realtimeReadThread(payload));
        }
      );

      this.bindWithChunked(
        MessagingEvent.READ_TEAM,
        (payload: IReadTeamPayload) => {
          dispatch(realtimeReadTeam(payload));
        }
      );

      this.bindWithChunked(
        MessagingEvent.READ_CHANNEL,
        (payload: IReadChannelPayload) => {
          dispatch(realtimeReadChannel(payload));
        }
      );

      this.bindWithChunked(MessagingEvent.CREATE_THREAD, (payload) => {
        dispatch(realtimeCreateThread(payload));
      });

      this.bindWithChunked(MessagingEvent.SEND_NOTIFICATION, (payload) => {
        dispatch(getUserNotitficationSuccess(payload));
      });

      this.bindWithChunked(MessagingEvent.REACTION_ADDED, (payload) => {
        dispatch(realtimeAddReaction(payload));
      });

      this.bindWithChunked(MessagingEvent.REACTION_REMOVED, (payload) => {
        dispatch(realtimeRemoveReaction(payload));
      });

      this.bindWithChunked(MessagingEvent.GLOBAL_SIGN_OUT, (payload) => {
        dispatch(realtimeGlobalSignOut(payload));
      });

      this.bindWithChunked(MessagingEvent.UPDATE_USER_STATUS, (payload) => {
        dispatch(updateUserListSuccess(payload));
      });
    });

    this._pusher.connection.bind('error', (e) => {
      logger.error(e);
      Sentry.captureMessage(`Disconnect pusher || ${JSON.stringify(e)}`);
    });
  }

  async getPusherAuthenticationToken(channel: string, socketId: string) {
    const headers = await getHeaders();
    return request({
      method: 'POST',
      headers,
      data: { channel_name: channel, socket_id: socketId },
      url: MESSAGING_URLS.pusherAuthentication(),
    });
  }

  bindWithChunked(event: string, callback: any) {
    this._channel.bind(event, callback); // Allow normal un chunked events.

    // Now the chunked variation. Allows arbitrarily long messages.
    const events = {};
    this._channel.bind(`chunked-${event}`, (data: any) => {
      if (!Object.prototype.hasOwnProperty.call(events, data.id)) {
        events[data.id] = { chunks: [], receivedFinal: false };
      }
      const ev = events[data.id];
      ev.chunks[data.index] = data.chunk;
      if (data.final) ev.receivedFinal = true;
      if (
        ev.receivedFinal &&
        ev.chunks.length === Object.keys(ev.chunks).length
      ) {
        callback(JSON.parse(ev.chunks.join('')));
        delete events[data.id];
      }
    });
  }
}

export default new MessagingService();
