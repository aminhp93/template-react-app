import * as Sentry from '@sentry/react';
import * as React from 'react';
import { get } from 'lodash'
import { connect } from 'react-redux';

import Status from './Status';
import { Modal, Tooltip } from 'antd';

import { DEFAULT_PROFILE_IMAGE_URL } from '../../constants/common';
import { updateUserStatus } from 'reducers/users';
import {
  SmileOutlined
} from '@ant-design/icons';

import ARROW_DOWN_ICON_URL from '@img/arrow-down-sign-to-navigate.svg';

interface IProps {
  authUser: any,
  onlineUsers: any,
  users: any,
  reactions: any,

  updateUserStatus: any,
}

interface IState {
  visibleStatus: any,
  visibleModal: boolean,
}

class UserInfoWrapper extends React.PureComponent<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      visibleStatus: false,
      visibleModal: false
    }
  }

  clearStatus = async () => {
    const { updateUserStatus } = this.props;
    const data = {
      "emoji": '',
      "status": ''
    }
    await updateUserStatus(data)
    this.setState({ visibleModal: false })
  }

  render() {
    const { authUser, onlineUsers, users, reactions } = this.props;
    const { visibleModal, visibleStatus } = this.state;
    const currentUser = users[authUser.id] || {};
    const { profileImage, status, fullName, id } = currentUser;
    const src = profileImage || DEFAULT_PROFILE_IMAGE_URL;
    const isOnline = onlineUsers.indexOf(id) > -1;
    const emojiSrc = (reactions[(status || {}).emoji] || {}).src;
    const statusContent = (status || {}).status 

    return (
      <>
      <div className="m-conversation_sidebar__current_user" onClick={() => {
        this.setState({ 
          visibleModal: true 
        })
      }}>
          <div className="m-current_user__avatar m-avatar-container">
          <div className={isOnline ? 'm-online-status' : 'm-offline-status'} />
            <img src={src} className="rounded-circle m-current_user__avatar__image" />
          </div>
          <div className="m-current_user__name">
            {fullName}
          </div>
          {emojiSrc && 
            <Tooltip placement="top" title={<><img src={emojiSrc} style={{ width: "18px", height: "18px" }}/> <span>{statusContent}</span></>}>
              <img src={emojiSrc} style={{ width: "18px", height: "18px", marginRight: "4px" }}/> 
            </Tooltip>
          }
          <img src={ARROW_DOWN_ICON_URL} />
          
      </div>
      { visibleModal && 
        <Modal 
          visible={visibleModal}
          footer={null}
          wrapClassName="m-status-modal"
          mask={false}
          onCancel={() => this.setState({ visibleModal: false })}>
            <div className="m-status-text flex" onClick={() => this.setState({ visibleStatus: true, visibleModal: false })}>
              {
                (emojiSrc || statusContent)
                  ? <>
                    {emojiSrc && <img src={emojiSrc} style={{ width: "18px", height: "18px" }}/>} 
                    {statusContent}
                  </>
                  : <>
                    <div className="m-default-icon-status"><SmileOutlined style={{ fontSize: "18px" }} /></div>
                    Update your status
                  </>
              }
            </div>
            {(statusContent || emojiSrc ) && <div className="m-clear-status" onClick={this.clearStatus}>Clear status</div>}
            
        </Modal> }
      { visibleStatus && <Status onModalClose={() => this.setState({ visibleStatus: false })}/> }
      </>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    authUser: get(state, 'authUser') || {},
    onlineUsers: get(state, 'onlineUsers'),
    users: get(state, 'users') || {},
    reactions: get(state, 'reactions') || {}
  };
};

const mapDispatchToProps = {
  updateUserStatus
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(UserInfoWrapper, { name: "UserInfoWrapper"}));