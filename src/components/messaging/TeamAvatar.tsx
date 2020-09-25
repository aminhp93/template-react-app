import * as Sentry from '@sentry/react';
import React, { ReactNode } from 'react';

import _isEmpty from 'lodash/isEmpty';
import _isString from 'lodash/isString';

import { TTeam } from 'types';

interface ITeamAvatarProps {
  team: TTeam;
}

const colors = [
  '#5779d9',
  '#49a99b',
  '#f28d45',
  '#513f7a',
  '#ff6961',
  '#b1b1b1',
  '#e2b84d',
  '#36454f',
];

/**
 * A simple hash to generate random number from a given string.
 */
const toOneDigitNumber = (value): number => {
  const { length } = value;
  let sum = 0;

  for (let index = 0; index < length; index += 1) {
    sum += value.charCodeAt(index);
  }

  return sum % colors.length;
};

/**
 * Generate a short name by picking up the first letters of 3 words
 */
const getTeamInitials = (name: string): string => {
  if (!name) return '';

  return name
    .trim()
    .split(' ')
    .slice(0, 3)
    .map((token) => token[0].toUpperCase())
    .join('');
};

/**
 * Pick a color by a given string name
 */
const getHexColorForName = (value: string): string =>
  colors[toOneDigitNumber(value)];

const renderImageAvatar = (image: string): JSX.Element => (
  <img src={image} className="m-team_sidebar__avatar__image" />
);

const renderTextAvatar = (text: string): JSX.Element => (
  <div
    className="m-team_sidebar__avatar__text"
    style={{ backgroundColor: getHexColorForName(text) }}
  >
    {getTeamInitials(text)}
  </div>
);

export function TeamAvatar({ team }) {
  if (team.image) {
    return renderImageAvatar(team.image);
  }

  return renderTextAvatar(team.displayName);
}
export default Sentry.withProfiler(TeamAvatar, { name: "TeamAvatar"});
