import * as  React from 'react';
import history from 'utils/history';

const Welcome = () => (
  <div className="sign-up text-center">
    <div className="sign-up--main-text">Welcome!</div>
    <div className="sign-up--card text-left welcome-page">
      <p className="text-dark">
        You have successfully created an account.
        To access our platform, please follow the instruction below:
      </p>
      <ul className="list-square pl-3">
        <li><h6 className="text-dark">Are you an alum?</h6></li>
        <p>
          Please contact our support team at
          <a className="text-link" to="mailto:community-support@insightdatascience.com" target="_blank" rel="noreferrer">community-support@insightdatascience.com</a>
          .
        </p>
        <li><h6 className="text-dark">Are you a fellow?</h6></li>
        <p>
          Please update your session info for account approval and
          we will approve your account within 1 hour.
        </p>
      </ul>
      <div className="text-center">
        <button
          id="welcomPageContinue"
          className="btn btn-primary btn-lg px-4 mt-2"
          onClick={() => history.push('/directory')}
        >
          Continue
        </button>
      </div>
    </div>
  </div>
);

export default Welcome;
