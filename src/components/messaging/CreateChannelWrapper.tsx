import * as Sentry from '@sentry/react';
import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { Input } from 'antd';

import ConfirmModal from './ConfirmModal';
import { createChannel } from 'reducers/conversations';
import { ConversationType, ModalKey } from 'types';
import RadioButton from './RadioButton';
import { MAX_CHARACTER_NAME_COUNT, MAX_CHARACTER_PURPOSE_COUNT } from 'constants/common';


export type IProps = {
  createChannel?: any;
  onModalClose: any;
  selectedConversation: any;
  createType: ConversationType
}

export type IState = {
  isPrivate: boolean;
  name: string;
  purpose: string;
}

class CreateChannelWrapper extends React.PureComponent<IProps, IState> {
  state: IState = {
    isPrivate: this.props.createType === ConversationType.Private,
    name: '', 
    purpose: '',
  }

  handleInputChange = (e) => {
    this.setState({ name: e.target.value });
  }

  handleInputChangePurpose = (e) => {
    this.setState({ purpose: e.target.value });
  };

  handleChangeIsPrivate = isPrivate => {
    if (isPrivate !== this.state.isPrivate) this.setState({ isPrivate });
  };

  render() {
    const { createChannel, onModalClose} = this.props;
    const { isPrivate, name, purpose } = this.state;
    const countName = (name || '').length;
    const countPurpose = (purpose || '').length;

   return (
    <ConfirmModal
      modalKey={ModalKey.CREATE_CHANNEL}
      okText="Create channel"
      title="Create a channel"
      onOk={() => createChannel({ 
        conversationType: isPrivate ? ConversationType.Private : ConversationType.Public,
        conversationName: name,
        purpose
      })}
      onCancel={onModalClose}
      disabled={!name ? true : false}
    >
      <div className="form-group">
        <label className="form-control-label">Name</label>
        <Input
          type="text"
          name="name"
          className="form-control form-control--single"
          placeholder="Channel Name"
          maxLength={MAX_CHARACTER_NAME_COUNT}
          value={name}
          onChange={this.handleInputChange}
        />
        <span
          className={`mt-2 mb-3 d-block ${
            countName === MAX_CHARACTER_NAME_COUNT ? 'cl-red' : 'cl-green'
          }`}
        >
          {`Current characters count: ${countName}/${MAX_CHARACTER_NAME_COUNT}`}
        </span>
      </div>
      <div className="form-group">
        <label className="form-control-label">Purpose (Optional)</label>
        <Input
          type="text"
          name="purpose"
          className="form-control form-control--single"
          placeholder="What's this channel about?"
          maxLength={MAX_CHARACTER_PURPOSE_COUNT}
          value={purpose}
          onChange={this.handleInputChangePurpose}
        />
        <span
          className={`mt-2 mb-3 d-block ${
            countPurpose === MAX_CHARACTER_NAME_COUNT ? 'cl-red' : 'cl-green'
          }`}
        >
          {`Current characters count: ${countPurpose}/${MAX_CHARACTER_PURPOSE_COUNT}`}
        </span>
      </div>
      <span className="form-group d-flex align-items-center mb-5">
        <span
          className="form-group channel-type p-8 font-weight-bold"
          style={{ flex: '0.6 1 5%', alignSelf: 'self-start' }}
        >
          Channel type
        </span>
        <div>
          <div
            className={`mb-3 pointer ${isPrivate ? 'channel-type-disabled' : ''}`}
            onClick={() => this.handleChangeIsPrivate(false)}
          >
            <RadioButton
              className="ml-2"
              style={{ marginTop: '1.2rem' }}
              checked={!isPrivate}
            />
            <span className="mr-4 ml-2">
              <i className="fa fa-group" /> <b>Public Channel</b> <br />
            </span>
            <div className="ml-5 mt-2">
              People can find and join Public channels
            </div>
          </div>
          <div
            className={`mt-2 pointer ${!isPrivate ? 'channel-type-disabled' : ''}`}
            onClick={() => this.handleChangeIsPrivate(true)}
          >
            <RadioButton
              className="ml-2"
              style={{ marginTop: '1.2rem' }}
              checked={isPrivate}
            />
            <span className="mr-4 ml-2">
              <i className="fa fa-lock" /> <b>Private Channel</b> <br />
            </span>
            <div className="ml-5 mt-2">
              When a channel is set to private, it can only be viewed or joined by invitation.
            </div>
          </div>
        </div>
      </span>
    </ConfirmModal>
   )
  }
}

const mapStateToProps = (state) => {
  const conversations = get(state, 'conversations') || {};
  const selectedConversationId = get(state, 'selectedConversationId');
  return {
    selectedConversation: conversations[selectedConversationId] || {}
  }
}

const mapDispatchToProps = {
  createChannel
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(CreateChannelWrapper, { name: "CreateChannelWrapper"}));
