import request from 'utils/request';
import { MessageUrls } from 'config/api';
import QueryString from 'utils/queryString';

/**
 * New Message service that calls to API v3 endpoints
 */
const MessageService = {
  createMessage(data: any) {
    return request({
      method: 'POST',
      url: MessageUrls.createMessage,
      data,
    });
  },
  updateMessage(id: number, data: any) {
    return request({
      method: 'PUT',
      url: MessageUrls.updateMessage(id),
      data,
    });
  },
  fetchMessageList(params, url?: string) {
    return request({
      method: 'GET',
      url: MessageUrls.fetchMessageList,
      params: url ? new URL(url).searchParams : params,
    });
  },
  fetchReconnectMessageList(data: any) {
    // const data = [
    //     {
    //       channel: 36,
    //       updatedActionTime: "2020-08-03T23:51:08.557350Z"
    //     },
    //     {
    //       channel: 35,
    //       updatedActionTime: "2020-08-03T23:51:08.557350Z"
    //     },
    // ];
    return request({
      method: 'POST',
      url: MessageUrls.reConnect,
      data,
    });
  },
  fetchSavedMessageList(params, url?: string) {
    return request({
      method: 'GET',
      url: MessageUrls.fetchSavedMessageList,
      params: url ? new URL(url).searchParams : params,
    });
  },
  deleteMessage(messageId: number) {
    return request({
      method: 'DELETE',
      url: MessageUrls.deleteMessage(messageId),
    });
  },
  pinMessage(messageId: number, data: any) {
    return request({
      method: 'POST',
      url: MessageUrls.pinMessage(messageId),
      data,
    });
  },
  savedMessage(messageId: number, data: any) {
    return request({
      method: 'POST',
      url: MessageUrls.savedMessage(messageId),
      data,
    });
  },
  reactMessage(messageId: number, data: any) {
    return request({
      method: 'POST',
      url: MessageUrls.reactMessage(messageId),
      data,
    });
  },
  searchMessage(params: any, url?: string) {
    if (url) {
      return request({
        method: 'GET',
        url: MessageUrls.searchMessage,
        params: new URL(url).searchParams,  
      });
    }
    return request({
      method: 'GET',
      url: MessageUrls.searchMessage,
      params,
      paramsSerializer: (p) => QueryString.stringify(p),

    });
  },
  searchFilterSuggestion(params: any, url?: string) {
    return request({
      method: 'GET',
      url: MessageUrls.searchFilterSuggestion,
      params: url ? new URL(url).searchParams : params,
      paramsSerializer: (p) => QueryString.stringify(p),

    });
  },
  getMessagesAround(id: number) {
    return request({
      method: 'GET',
      url: MessageUrls.getMessagesAround(id),
    });
  }
};

export default MessageService;
