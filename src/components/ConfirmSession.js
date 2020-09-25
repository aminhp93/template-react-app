import React from 'react';
import PropTypes from 'prop-types';
import LoadingIndicator from 'components/LoadingIndicator';

const ConfirmSession = (props) => (
  <div className="sign-up text-center">
    <div className="sign-up--main-text">Your Insight session</div>
    <div className="sign-up--card welcome-page">
      <p className="mb-4">
        Your session cannot be edited later. Please confirm the following
        session is correct:
      </p>
      <p className="mb-4 text-center font-weight-bold">
        Session:
        {' '}
        {props.sessionTitle}
      </p>
      {props.loading
        ? <LoadingIndicator />
        : (
          <div className="control-buttons">
            <button
              id="backToSelectButton"
              className="btn btn-default btn-lg px-4 mt-2 mr-2"
              onClick={props.selectSession}
            >
              BACK
            </button>
            <button
              id="confirmSessionButton"
              className="btn btn-primary btn-lg px-4 mt-2"
              onClick={props.confirmSession}
            >
              CONFIRM
            </button>
          </div>
        )}
    </div>
  </div>
);

ConfirmSession.propTypes = {
  sessionTitle: PropTypes.string,
  selectSession: PropTypes.func,
  confirmSession: PropTypes.func,
  loading: PropTypes.bool,
};

export default ConfirmSession;
