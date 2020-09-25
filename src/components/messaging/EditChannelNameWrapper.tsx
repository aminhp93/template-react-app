import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { Input } from 'antd';

import ConfirmModal from './ConfirmModal';
import { editChannel, updateDMG } from 'reducers/conversations';
import { EditChannelType, ModalKey, ConversationType } from 'types';
import { MAX_CHARACTER_NAME_COUNT } from 'constants/common';

interface IProps {
  editChannel?: any;
  onModalClose: any;
  selectedConversation: any;
  updateDMG: any;
}

interface IState {
  data: string;
}

class EditChannelNameWrapper extends React.PureComponent<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      data: get(props.selectedConversation, EditChannelType.Name),
    };
  }
  handleInputChange = (e) => {
    this.setState({
      data: e.target.value,
    });
  };

  handleOnOk = () => {
    const { data } = this.state;
    if (this.isGroup()) {
      this.props.updateDMG({ conversationName: data })
    } else {
      this.props.editChannel({ conversationName: data })
    }
  };


  isGroup = () => {
    const { selectedConversation } = this.props;
    return [ConversationType.Group, ConversationType.DirectMessage].includes(selectedConversation.conversationType);
  };

  render() {
    const { onModalClose, selectedConversation } = this.props;
    const { data } = this.state;
    const conversationName = get(selectedConversation, EditChannelType.Name);
    const count = (data || '').length;
    const isGroup = this.isGroup();
    const placeholder = isGroup ? 'Group Name' : 'Channel Name'
    const title = isGroup ? 'Edit Group Name' : 'Edit Channel Name'
    return (
      <ConfirmModal
        modalKey={ModalKey.EDIT_CHANNEL}
        okText="Save"
        title={title}
        onOk={this.handleOnOk}
        onCancel={onModalClose}
        disabled={(data === conversationName || !data) ? true : false}
      >
        <div className="form-group">
          <Input
            type="text"
            name="name"
            className="form-control form-control--single small"
            placeholder={placeholder}
            defaultValue={conversationName}
            maxLength={MAX_CHARACTER_NAME_COUNT}
            onChange={this.handleInputChange}
          />
          <span
            className={`mt-2 mb-3 d-block ${
              count === MAX_CHARACTER_NAME_COUNT ? 'cl-red' : 'cl-green'
            }`}
          >
            {`Current characters count: ${count}/${MAX_CHARACTER_NAME_COUNT}`}
          </span>
        </div>
      </ConfirmModal>
    );
  }
}

const mapStateToProps = (state) => {
  const conversations = get(state, 'conversations') || {};
  const selectedConversationId = get(state, 'selectedConversationId');
  return {
    selectedConversation: conversations[selectedConversationId] || {},
  };
};

const mapDispatchToProps = {
  editChannel,
  updateDMG,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sentry.withProfiler(EditChannelNameWrapper, { name: "EditChannelNameWrapper"}));
