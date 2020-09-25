import * as Sentry from '@sentry/react';
import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { Tooltip } from 'antd';

import { TReaction, ModalKey } from 'types';
import ConfirmModal from './ConfirmModal';



interface IProps {
  users: any,
  message: any,
  reactions: any,
}

interface IState {
  modal: any,
}

class ListUserReaction extends React.PureComponent <IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      modal: null
    }
  }

  onModalClose = () => {
    this.setState({ modal: null })
  }

  render() {
    const { modal } = this.state;
    const { message, reactions, users } = this.props;
    const userReactions = (message || {}).reactions || [];
    return (
      <>
        {modal === ModalKey.LIST_USER_REACTION
        ? (
          <ConfirmModal
            modalKey={ModalKey.LIST_USER_REACTION}
            title="Reactions"
            onCancel={this.onModalClose}
            footer={false}
          >
            <div className='m-list-user-reaction-container'>
              {
                userReactions.map((i, index) => {
                  let listUsernameText = ''
                  i.users.map((user, index) => {
                    if (index === 0) {
                      listUsernameText += users[user].fullName
                    } else {
                      listUsernameText += `, ${users[user].fullName}`
                    }
                  })
                  return <div key={index} className="m-list-user-reaction-row">
                    <img src={reactions[i.name].src} alt={i.displayName} />
                    <div className="m-list-username-text">{listUsernameText}</div>
                  </div>
                })
              }
            </div>
          </ConfirmModal>
        ) : null}
        <Tooltip title="All reactions">
          <div className="m-reaction-button add" onClick={() => this.setState({ modal: ModalKey.LIST_USER_REACTION})}>
            <span className="m-reaction-button-add"><i className="fa fa-search" /></span>
          </div>
        </Tooltip>
      </>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    users: get(state, 'users') || {},
    reactions: get(state, 'reactions') || {},
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(ListUserReaction, { name: "ListUserReaction"}))
