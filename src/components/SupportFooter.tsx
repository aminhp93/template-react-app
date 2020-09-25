import * as React from 'react';

const styles = {
  container: {
    marginTop: 40,
    color: '#556f7b',
  },
  link: {
    textDecoration: null,
    color: '#5779d9',
  },
};

export const SupportFooter: React.SFC = () => (
  <div className="text-center" style={styles.container}>
    If you have any technical issue, please reach out to us at{' '}
    <a
      href="mailto:community-support@insightdatascience.com"
      target="_blank"
      rel="noreferrer"
      style={styles.link}
    >
      community-support@insightdatascience.com
    </a>
    . We normally answer within 24 hours.
  </div>
);
