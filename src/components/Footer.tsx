import * as React from 'react';

class Footer extends React.Component {

  render() {
    return (
      <footer className="footer">
        <p className="text-center mb-2 px-2">
          If you have any questions or issues, please feel free to email us at
          <a
            className="text-link"
            href="mailto:community-support@insightdata.com"
            target="_top"
          >
            {' '}
            community-support@insightdatascience.com
          </a>
          .
          <br />
          We normally reply within 24 hours.
        </p>
        <p className="text-center">
          ©
          {(new Date()).getFullYear()}
          {' '}
          Insight Data
        </p>
      </footer>
    );
  }
}

export default Footer;
