import {DispatchType, RootStateType, ThunkActionType} from "store";
import * as Sentry from '@sentry/browser';
import { keyBy, uniq } from 'lodash';

import {SecondaryView, ConversationType} from "types";
import PushNotificationService from "services/PushNotification";
import {fetchUserNotification} from "reducers/userNotifications";
import TeamService from "services/Team";
import {replaceTeamList, selectTeam} from "reducers/teams";
import {fetchTeamNotifications} from "reducers/teamNotifications";
import {getChannelsNotifications, getDMGsNotifications, fetchReconnectChannelsDmgsList, selectConversation} from "reducers/conversations";
import {fetchMessageList, fetchReconnectMessageList} from "reducers/messages";
import {fetchUsersList} from "reducers/users";
import {mapMessageList} from "components/messaging/utils";
import {updateDisableAroundAPISuccess} from "reducers/disableAroundAPI";
import {fetchThreadNotificationForTeam} from "reducers/threadNotifications";
import {fetchThreadList, getThreadDetail} from "reducers/threads";

export const reconnect: ThunkActionType = () => async (
  dispatch: DispatchType,
  getStoreValue: () => RootStateType
) => {
    const {
        authUser,
        teams,
        conversations,
        messages,
        selectedTeamId,
        selectedConversationId
    } = getStoreValue();
    // Check have login
    if (authUser && authUser.id) {
        // Update again token push notification
        PushNotificationService.activateToken().then((res) => {
            Sentry.captureMessage('Re-activate browser token SUCCEEDED');
        }).catch((error) => {
            Sentry.captureMessage(`Re-activate browser token FAILED || ${error}`);
        });
        // Fetch user notification - menu
        await dispatch(fetchUserNotification());
        const responseTeam = await TeamService.fetchTeams();
        const dataTeam = keyBy(responseTeam.data, 'id');
        // Replace team
        await dispatch(replaceTeamList(dataTeam));
        await dispatch(fetchTeamNotifications());
        // Select team again
        if (!teams[selectedTeamId]) {
            const newSelectedTeamId = responseTeam.data[0].id;
            await dispatch(selectTeam(newSelectedTeamId));
            // Fetch thread notification
            await dispatch(fetchThreadNotificationForTeam(newSelectedTeamId));
        } else {
            // Fetch all conversation change in disconnect time
            await dispatch(fetchReconnectChannelsDmgsList());
            // Fetch all notification of channel / dmgs in disconnect time
            await dispatch(getChannelsNotifications({team: selectedTeamId}));
            await dispatch(getDMGsNotifications());
            // Fetch all message change in disconnect time
            await dispatch(fetchReconnectMessageList());
            // Fetch thread notification
            await dispatch(fetchThreadNotificationForTeam(selectedTeamId));
            // Get new message in selected conversation
            if (conversations[selectedConversationId]) {
                // all message after created time of last message
                // `selectConversation` has already fetch the latest 20 messages, but what
                // we actually want is all the messages after the last one. This need to be
                // called before `selectConversation` to preserve the last message value
                let next = true;
                let nextUrl = null;
                const messageList = mapMessageList(messages, selectedConversationId);
                dispatch(updateDisableAroundAPISuccess(true));
                while (next) {
                    const res = await dispatch(fetchMessageList({after: messageList[messageList.length - 1].created}, nextUrl));
                    if (res.data && res.data.next) {
                        next = true;
                        nextUrl = res.data.next
                    } else {
                        next = false;
                        dispatch(updateDisableAroundAPISuccess(false))
                    }
                }
                dispatch(selectConversation(selectedConversationId));
            }
            // Fetch thread list or thread history if it open
            const {secondaryView, selectedThreadDetail} = getStoreValue();
            if (secondaryView === SecondaryView.THREAD_LIST) {
                dispatch(fetchThreadList());
            } else if (secondaryView === SecondaryView.THREAD_DETAIL) {
                dispatch(getThreadDetail(selectedThreadDetail));
            }
        }
        // Update status user - temporary solution includes: DM and users have message in selected conv
        let usersInCurrentSelectedConv = [];
        if (conversations[selectedConversationId]) {
            usersInCurrentSelectedConv = Object.values(messages).filter((item: any) => item.channel === selectedConversationId).filter((i: any) => i.creator).map((i: any) => i.creator)
        }
        let usersInAllDM = [];
        Object.values(conversations).filter((i: any) => i.conversationType === ConversationType.DirectMessage).map((i: any) => {
            usersInAllDM = usersInAllDM.concat(i.members)
        })
        const fetchListUser = usersInCurrentSelectedConv.concat(usersInAllDM)
        dispatch(fetchUsersList({
            ids: uniq(fetchListUser),
            limit: false,
        }))
    } else {
        // TODO
        Sentry.captureMessage('Failed reconnect because does not get user!');
    }
};