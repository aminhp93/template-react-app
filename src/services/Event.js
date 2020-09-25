import { EventUrls, getHeaders, filterUrls } from 'config/api';
import request from 'utils/request';

const EventService = {
  async getAllLocations() {
    return request({
      method: 'GET',
      headers: await getHeaders(),
      url: filterUrls.locations,
    }).then((res) => res);
  },
  async getEvents(params) {
    return request({
      method: 'GET',
      headers: await getHeaders(),
      url: EventUrls.getAllOrCreate,
      params,
    }).then((res) => res);
  },
  async createEvent(data) {
    const headers = await getHeaders();
    return request({
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data',
      },
      url: EventUrls.getAllOrCreate,
      data,
    }).then((res) => res);
  },
  async getEventDetail(slug) {
    return request({
      method: 'GET',
      headers: await getHeaders(),
      url: EventUrls.getDetailOrUpdateOrDelete(slug),
    }).then((res) => res);
  },
  async updateEvent(slug, data) {
    const headers = await getHeaders();
    return request({
      method: 'put',
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data',
      },
      url: EventUrls.getDetailOrUpdateOrDelete(slug),
      data,
    }).then((res) => res);
  },
  async deleteEvent(slug) {
    return request({
      method: 'delete',
      headers: await getHeaders(),
      url: EventUrls.getDetailOrUpdateOrDelete(slug),
    }).then((res) => res);
  },
  async createReservation(slug) {
    return request({
      method: 'post',
      headers: await getHeaders(),
      url: EventUrls.eventReservations(slug),
    }).then((res) => res);
  },
  async removeReservation(slug) {
    return request({
      method: 'delete',
      headers: await getHeaders(),
      url: EventUrls.eventReservations(slug),
    }).then((res) => res);
  },
  async inviteGuests(slug, data) {
    return request({
      method: 'post',
      headers: await getHeaders(),
      url: EventUrls.eventGuests(slug),
      data,
    }).then((res) => res);
  },
  async removeGuest(slug, params) {
    return request({
      method: 'delete',
      headers: await getHeaders(),
      url: EventUrls.eventGuests(slug),
      params,
    }).then((res) => res);
  },
};

export default EventService;
