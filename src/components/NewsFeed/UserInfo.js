import * as React from 'react';
import { getPositionDisplay, getUserAvatar, getUserNameDisplay } from 'utils/userInfo';
import SessionBadge from 'components/SessionBadge';
import { UserContext } from 'containers/authentication'

import STAR_URL from '@img/star.png';


class UserInfo extends React.Component {
  static contextType = UserContext

  render() {
    // FIXME: unify the use of UserInfo instance / raw data
    const user = this.context.data

    return (
      <div className="card user-info--card">
        <div className="card--body">
          <div className="user-info--avatar">
            <img src={getUserAvatar(user)} alt={getUserNameDisplay(user)} className="user-info--image" />
          </div>
          <div className="user-info--name">
            <span>{getUserNameDisplay(user)}</span>
          </div>
          <div className="user-info--session">
            <SessionBadge creator={user} />
          </div>
          <div className="user-info--position">
            <span>{getPositionDisplay(user)}</span>
          </div>
          <div className="user-info--reputation mt-2">
            <img src={STAR_URL} alt="Heart" />
            <span>
              {user.reputation}
              {' '}
              Thanks
            </span>
          </div>
        </div>
      </div>
    );
  }
}
export default UserInfo;
