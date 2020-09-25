import request from 'utils/request';
import QueryString from 'utils/queryString';
import {ConversationUrls} from 'config/api';

/**
 * New ConversationService that invokes to API v3 endpoints
 */
const ConversationService = {
  fetchConversationList(params?: any) {
    return request({
      method: 'GET',
      url: ConversationUrls.fetchConversationList,
      params,
      paramsSerializer: (p) => QueryString.stringify(p),
    });
  },
  fetchReconnectChannelsDmgsList(teamId: number, data: any) {
    // const data = [
    //     {
    //       id: 36,
    //       updatedActionTime: "2020-08-03T23:51:08.557350Z"
    //     },
    //     {
    //       id: 35,
    //       updatedActionTime: "2020-08-03T23:51:08.557350Z"
    //     },
    // ];
    return request({
      method: 'POST',
      url: ConversationUrls.reConnect(teamId),
      data,
    });
  },
  fetchDMGList(params?: any) {
    return request({
      method: 'GET',
      url: ConversationUrls.fetchDMGList,
      params,
      paramsSerializer: (p) => QueryString.stringify(p),
    });
  },

  fetchDmgById (dmgId: number) {
    return request({
      method: 'GET',
      url: ConversationUrls.dmgById(dmgId),
    });
  },

  fetchChannelById(channelId: number) {
    return request({
      method: 'GET',
      url: ConversationUrls.channelById(channelId),
    });
  },

  fetchPublicChannelById(channelId: number) {
    return request({
      method: 'GET',
      url: ConversationUrls.publicChannelById(channelId),
    });
  },

  createChannel(data?: any) {
    return request({
      method: 'POST',
      url: ConversationUrls.createChannel,
      data,
    });
  },

  editChannel(id: number, data?: any) {
    return request({
      method: 'PATCH',
      url: ConversationUrls.editChannel(id),
      data,
    });
  },

  deleteChannel(id: number) {
    return request({
      method: 'DELETE',
      url: ConversationUrls.deleteChannel(id),
    });
  },

  leaveChannel(id) {
    return request({
      method: 'POST',
      url: ConversationUrls.leaveChannel(id),
    });
  },

  addChannelMember(id: number, data?: any) {
    return request({
      method: 'POST',
      url: ConversationUrls.addChannelMember(id),
      data,
    });
  },

  searchPublicChannels(params) {
    return request({
      method: 'GET',
      params,
      url: ConversationUrls.searchPublicChannels,
      paramsSerializer: (p) => QueryString.stringify(p),
    });
  },

  publicChannelBySlug(slug, params) {
    return request({
      method: 'GET',
      params,
      url: ConversationUrls.publicChannelBySlug(slug),
      paramsSerializer: (p) => QueryString.stringify(p),
    });
  },

  joinChannel(id) {
    return request({
      method: 'POST',
      url: ConversationUrls.joinChannel(id),
    });
  },

  checkDMG(data: any) {
    return request({
      method: 'POST',
      url: ConversationUrls.checkDMG,
      data,
    });
  },

  createDMG(data: any) {
    return request({
      method: 'POST',
      url: ConversationUrls.createDMG,
      data,
    });
  },

  updateDMG(id, data?: any) {
    return request({
      method: 'PATCH',
      url: ConversationUrls.updateDMG(id),
      data,
    });
  },

  leaveGroup(id: number) {
    return request({
      method: 'POST',
      url: ConversationUrls.leaveGroup(id),
    });
  },

  changeChannelAdmin(channelId: number, userId: number, data) {
    return request({
      method: 'PUT',
      url: ConversationUrls.changeChannelAdmin(channelId, userId),
      data,
    });
  },

  removeChannelMember(channelId: number, userId: number) {
    return request({
      method: 'DELETE',
      url: ConversationUrls.removeChannelMember(channelId, userId),
    });
  },

  addGroupMember(id: number, data?: any) {
    return request({
      method: 'POST',
      url: ConversationUrls.addGroupMember(id),
      data,
    });
  },

  removeGroupMember(channelId: number, userId: number) {
    return request({
      method: 'DELETE',
      url: ConversationUrls.removeGroupMember(channelId, userId),
    });
  },

  markChannelAsRead(channelId: number, messageId: number) {
    return request({
      method: 'POST',
      url: ConversationUrls.readChannel(channelId),
      data: { messageIds: [ messageId ] }
    })
  },

  markDMGAsRead(conversationId: number, messageId: number) {
    return request({
      method: 'POST',
      url: ConversationUrls.readDMG(conversationId),
      data: { messageIds: [ messageId ] }
    })
  },
  searchChannelsDmgs(params: any, url?: string) {
    return request({
      method: 'GET',
      url: ConversationUrls.searchChannelsDmgs,
      params: url ? new URL(url).searchParams : params,
      paramsSerializer: (p) => QueryString.stringify(p)
    })
  },
  fetchArchivedChannels(params) {
    return request({
      method: 'GET',
      params,
      url: ConversationUrls.archivedChannels,
      paramsSerializer: (p) => QueryString.stringify(p),
    });
  },
};

export default ConversationService;
