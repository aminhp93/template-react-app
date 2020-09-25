import React from 'react';
import PropTypes from 'prop-types';

const PageHero = (props) => (
  <div className="page-hero">
    <div className="container">
      {(props.title || props.description)
        ? (
          <div className="row">
            <div className="col-12">
              <h1 className="text-center page-title">{props.title}</h1>
              <h5 className="text-center page-description">{props.description}</h5>
            </div>
          </div>
        )
        : props.children}
    </div>
  </div>
);

PageHero.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.objectOf(PropTypes.any),
};

export default PageHero;
