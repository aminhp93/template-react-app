import * as Sentry from '@sentry/react';
import * as React from 'react';
import { get } from 'lodash';
import clsx from 'clsx';
import { Skeleton } from 'antd';

import { DEFAULT_PROFILE_IMAGE_URL } from 'constants/common';

export function UserAvatar({ className = null, system = false, user }) {
  if (!user) {
    return (
      <Skeleton
        avatar
        active
        title={false}
        paragraph={false}
        className="avatar-skeleton"
      />
    );
  }

  let userProfileImage = DEFAULT_PROFILE_IMAGE_URL;

  if (user && get(user, 'profileImage') && !get(user, 'isRemoved', false)) {
    userProfileImage = get(user, 'profileImage');
  }

  return (
    <img
      src={userProfileImage}
      alt="avatar"
      className={clsx(className, 'rounded-circle')}
    />
  );
}
export default Sentry.withProfiler(UserAvatar, { name: "UserAvatar"});
