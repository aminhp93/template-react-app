import React from 'react';
import userInfo from 'utils/userInfo';

const PinnedBadge = ({ pinned, pinnedBy }) => (pinned ? (
  <div className="badge pin-badge ml-2">
    Pinned
    <div className="pinned-by">
      Pinned by
      {' '}
      {pinnedBy.id === userInfo.getUserId() ? 'you' : `${pinnedBy.first_name} ${pinnedBy.last_name}`}
    </div>
  </div>
) : null);

export default PinnedBadge;
