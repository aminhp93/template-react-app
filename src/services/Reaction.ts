import request from 'utils/request';
import QueryString from 'utils/queryString';
import { ReactionUrls } from 'config/api';

/**
 * New ReactionService that invokes to API v3 endpoints
 */
const ReactionService = {
    fetchReactions(params?: any) {
        return request({
            method: 'GET',
            url: ReactionUrls.fetchReactions,
            params,
            paramsSerializer: (p) => QueryString.stringify(p),
        });
    },
}

export default ReactionService;
