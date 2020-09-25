import React from 'react';
import PropTypes from 'prop-types';

const PeopleList = ({ title, content }) => (
  <div className="event-people-going mb-3">
    <div className="scroll-list">
      <p className="scroll-list__header text-center">
        {title}
      </p>
      <ul className="scroll-list__content">
        {content}
      </ul>
    </div>
  </div>
);

PeopleList.propTypes = {
  title: PropTypes.string,
  content: PropTypes.arrayOf(PropTypes.node),
};

export default PeopleList;
