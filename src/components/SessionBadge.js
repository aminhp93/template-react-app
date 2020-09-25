import React from 'react';
import PropTypes from 'prop-types';
import { getSessionCssClass, getUserSessionDisplay } from 'utils/userInfo';

const SessionBadge = ({ creator }) => ((creator && creator.current_session)
  ? (
    <span className={`actor__session session-tag ${getSessionCssClass(creator)}`}>
      {getUserSessionDisplay(creator)}
    </span>
  ) : null
);

SessionBadge.propTypes = {
  creator: PropTypes.objectOf(PropTypes.any),
};

export default SessionBadge;
