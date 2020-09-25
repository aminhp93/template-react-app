import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

interface IProps {
  pinnedAt: any,
  pinnedBy: any,
  authUser: any,
  users: any,
}

class PinnedBadge extends React.PureComponent<IProps> {
  render() {
    const { pinnedAt, pinnedBy, authUser, users } = this.props;
    const user = users[pinnedBy] || {};
    if (!pinnedAt) return null;
    return (
      <div className="badge pin-badge ml-2">
        Pinned
        <div className="pinned-by">
          {`Pinned by ${user.id === authUser.id ? 'you' : user.fullName}`}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    authUser: get(state, 'authUser') || {},
    users: get(state, 'users') || {},
  };
};

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(PinnedBadge, { name: "PinnedBadge"}));
