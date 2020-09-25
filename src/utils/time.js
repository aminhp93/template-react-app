import moment from 'moment';
import { formatToTimeZone } from 'date-fns-timezone';
import { EventTimeZone } from 'constants/common';

export function getDateFromTimeString(timeString) {
  const newDate = new Date(timeString).toString().split(' ');
  return `${newDate[1]} ${newDate[2]}, ${newDate[3]}`;
}


export const getTimeInTimeZone = (time, format, timeZone) => {
  if (!time || !format || !timeZone) return null;
  return formatToTimeZone(new Date(time), format, {
    timeZone: EventTimeZone[timeZone],
  });
};

export const formatDate = (date, oldFormat, newFormat) => {
  if (!date) return null;
  return moment(date, oldFormat).format(newFormat);
};
