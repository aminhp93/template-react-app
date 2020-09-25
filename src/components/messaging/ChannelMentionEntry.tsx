import * as Sentry from '@sentry/react';
import * as React from 'react';
import clsx from 'clsx';
import { has } from 'lodash';

import { getUserProgramAbbr } from 'utils/userInfo';
import {
  ChannelMentionTypeIds,
  DEFAULT_PROFILE_IMAGE_URL,
} from 'constants/common';

function ChannelMentionEntry(props) {
  const { mention, isFocused, theme, searchValue, ...parentProps } = props;

  if (!mention)
    return null;

  const hasChannelMention = has(ChannelMentionTypeIds, mention.id);

  return (
    <div
      {...parentProps}
      className={`mentionSuggestions--entry ${isFocused ? 'focus' : ''}`}
    >
      <div className="mentionSuggestions--entry__container">
        <div className="mentionSuggestions--entry__container--left">
          <img
            src={mention.avatar || DEFAULT_PROFILE_IMAGE_URL}
            className={clsx('mentionSuggestions--entry__avatar', {
              'mentionSuggestions--entry__avatar--channel': hasChannelMention,
            })}
            role="presentation"
            alt="avatar"
          />
        </div>

        <div className="mentionSuggestions--entry__container--right">
          <div className="mentionSuggestions--entry__text d-flex flex-row">
            <div className={clsx({ 'font-weight-bold': hasChannelMention })}>
              {hasChannelMention ? '@' : null}
              {mention.name}
              {mention && mention.sessionShortName && (
                <span
                  className={`session-tag ${getUserProgramAbbr(
                    mention
                  )}-accent`}
                  style={{ marginLeft: 10 }}
                >
                  {mention.sessionShortName}
                </span>
              )}
            </div>
            <div className="ml-1">
              {mention.id === ChannelMentionTypeIds.here &&
                'Notify every online member in this channel.'}
              {mention.id === ChannelMentionTypeIds.channel &&
                'Notify everyone in this channel.'}
            </div>
          </div>
          {mention.position && (
            <div className="mentionSuggestions--entry__title">
              {mention.position}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sentry.withProfiler(ChannelMentionEntry, { name: "ChannelMentionEntry"});