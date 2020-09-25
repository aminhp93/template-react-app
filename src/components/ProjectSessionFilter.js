import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import LoadingIndicator from './LoadingIndicator';

import CATEGORY_ICON_URL from '@img/ic-category.svg';


const ProjectSessionFitler = (props) => (
  <>
    <div className="sidebar-button menu" style={{ width: '95%' }}>
      <img className="mr-2" src={CATEGORY_ICON_URL} width={16} alt="Filter by sessions" />
      SESSIONS
    </div>
    {props.sessions.length === 0 && <LoadingIndicator />}
    {props.sessions.length > 0 && props.sessions.map((session) => (
      <div
        key={session.id}
        className={clsx(
          'sidebar-filter-item pointer',
          { active: props.sessionFilter === session.value },
        )}
        style={{ width: '95%' }}
        onClick={() => props.handleChangeSession(session.value)}
      >
        {session.title}
        {props.sessionFilter === session.value
          && <i className="fa fa-check pull-right mr-2 mt-1" />}
      </div>
    ))}
  </>
);

ProjectSessionFitler.propTypes = {
  sessions: PropTypes.arrayOf(PropTypes.object),
  sessionFilter: PropTypes.string,
};

export default ProjectSessionFitler;
