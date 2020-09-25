import request from 'utils/request';
import { ThreadUrls } from 'config/api';

/**
 * New Message service that calls to API v3 endpoints
 */
const ThreadService = {
  fetchThreadList(params, url?: string) {
    return request({
      method: 'GET',
      url: ThreadUrls.fetchThreadList,
      params: url ? new URL(url).searchParams : params,
    });
  },
  getThreadDetail(messageId: number) {
    return request({
        method: 'GET',
        url: ThreadUrls.getThreadDetail(messageId),
      });
  },
  getMarkReadThread(messageId: number) {
    return request({
      method: 'POST',
      url: ThreadUrls.getMarkReadThread(messageId),
    })
  }
};

export default ThreadService;
