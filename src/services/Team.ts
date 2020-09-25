import request from 'utils/request';
import { TeamUrls } from 'config/api';

/**
 * New TeamService that invokes to API v3 endpoints
 */
const TeamService = {
  fetchTeams(params?: any) {
    return request({
      method: 'GET',
      url: TeamUrls.fetchTeams,
      params,
    });
  },

  fetchTeamById(teamId: number) {
    return request({
      method: 'GET',
      url: TeamUrls.fetchTeamById(teamId),
    });
  },

  createTeam(data?: any) {
    return request({
      method: 'POST',
      url: TeamUrls.createTeam,
      data,
    });
  },

  updateTeam(teamId: number, data?: any) {
    return request({
      method: 'PUT',
      url: TeamUrls.updateTeam(teamId),
      data,
    });
  },

  leaveTeam(teamId: number) {
    return request({
      method: 'POST',
      url: TeamUrls.leaveTeam(teamId),
    });
  },

  addTeamMember(teamId: number, data: any) {
    return request({
      method: 'POST',
      url: TeamUrls.addTeamMember(teamId),
      data,
    });
  },

  removeTeamMember(teamId: number, userId: number) {
    return request({
      method: 'DELETE',
      url: TeamUrls.removeTeamMember(teamId, userId),
    });
  },

  updateMembership(teamId: number, userId: number, data?: any) {
    return request({
      method: 'PUT',
      url: TeamUrls.updateMembership(teamId, userId),
      data,
    });
  },

  reorder(data: { team: number, order: number }[]) {
    return request({
      method: 'PUT',
      url: TeamUrls.orders,
      data,
    });
  }
};

export default TeamService;
