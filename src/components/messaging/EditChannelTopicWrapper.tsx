import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

import ConfirmModal from './ConfirmModal';
import { editChannel, updateDMG } from 'reducers/conversations';
import { EditChannelType, ModalKey, ConversationType } from 'types';
import { MAX_CHARACTER_PURPOSE_COUNT } from 'constants/common';

interface IProps {
  editChannel?: any;
  onModalClose: any;
  selectedConversation: any;
  updateDMG?: any;
}

interface IState {
  data: string;
}

class EditChannelTopicWrapper extends React.PureComponent<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      data: get(props.selectedConversation, EditChannelType.Topic),
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
      this.props.updateDMG({ topic: data })
    } else {
      this.props.editChannel({ topic: data })
    }
  };

  isGroup = () => {
    const { selectedConversation } = this.props;
    return [ConversationType.Group, ConversationType.DirectMessage].includes(selectedConversation.conversationType);
  };

  render() {
    const { onModalClose, selectedConversation } = this.props;
    const { data } = this.state;
    const topic = get(selectedConversation, EditChannelType.Topic);
    const count = (data || '').length;
    const isGroup = this.isGroup();
    const placeholder = isGroup ? 'Group Topic' : 'Channel Topic'
    const title = isGroup ? 'Set group topic' : 'Set channel topic'

    return (
      <ConfirmModal
        modalKey={ModalKey.EDIT_CHANNEL}
        okText='Save'
        title={title}
        onOk={this.handleOnOk}
        onCancel={onModalClose}
        disabled={false}
      >
        <div className='set-channel-topic isEdit'
        >
          <div className="form-group">
            <textarea
              name="name"
              className="form-control form-control--single small"
              placeholder={placeholder}
              defaultValue={topic}
              maxLength={MAX_CHARACTER_PURPOSE_COUNT}
              onChange={this.handleInputChange}
            />
            <span className={`mt-2 mb-3 d-block ${count === MAX_CHARACTER_PURPOSE_COUNT ? 'cl-red' : 'cl-green'}`}>
              {`Current characters count: ${count}/${MAX_CHARACTER_PURPOSE_COUNT}`}
            </span>
          </div>
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
)(Sentry.withProfiler(EditChannelTopicWrapper, { name: "EditChannelTopicWrapper"}));
