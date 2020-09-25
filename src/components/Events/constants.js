export const STRINGIFY_FIELDS = ['sessions', 'restricted_groups'];
export const RESTRICTED_GROUPS = ['non_insight'];

export const FlatpickrOptions = {
  altInput: true,
  altFormat: 'H:i, F j, Y',
  dateFormat: 'Y-m-d H:i',
};

export const defaultEvent = {
  start_time: null,
  end_time: null,
  last_rsvp_time: null,
  name: '',
  sessions: [],
  address: '',
  about: '',
  space: null,
  contact: '',
  time_zone: null,
  location_id: null,
  image: null,
  restricted_groups: RESTRICTED_GROUPS,
  allow_guests: false,
};

export const TimeZoneOptions = [
  { label: 'PST (UTC -7)', value: 'pst' },
  { label: 'EST (UTC -5)', value: 'est' },
  { label: 'CT (UTC -4)', value: 'ct' },
  { label: 'MT (UTC -6)', value: 'mt' },
];
