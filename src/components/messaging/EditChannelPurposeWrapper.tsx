import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { Input } from 'antd';

import ConfirmModal from './ConfirmModal';
import { editChannel } from 'reducers/conversations';
import { EditChannelType, ModalKey } from 'types';
import { MAX_CHARACTER_PURPOSE_COUNT } from 'constants/common';

interface IProps {
  editChannel?: any;
  onModalClose: any;
  selectedConversation: any;
}

interface IState {
  data: string;
}

class EditChannelPurposeWrapper extends React.PureComponent<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      data: get(props.selectedConversation, EditChannelType.Purpose)
    }
  }
  handleInputChange = (e) => {
    this.setState({
      data: e.target.value
    })
  };

  render() {
    const { editChannel, onModalClose, selectedConversation} = this.props;
    const { data } = this.state;
    const purpose = get(selectedConversation, EditChannelType.Purpose)
    const count = (data || '').length;
   return (
    <ConfirmModal
      modalKey={ModalKey.EDIT_CHANNEL}
      okText="Save"
      title="Edit channel purpose"
      onOk={() => editChannel({ purpose: data})}
      onCancel={onModalClose}
      disabled={false}
    >
      <div className="form-group">
        <Input
          type="text"
          name="purpose"
          className="form-control form-control--single small"
          placeholder="Channel Purpose"
          defaultValue={purpose}
          maxLength={MAX_CHARACTER_PURPOSE_COUNT}
          onChange={this.handleInputChange}
        />
        <span className={`mt-2 mb-3 d-block ${count === MAX_CHARACTER_PURPOSE_COUNT ? 'cl-red' : 'cl-green'}`}>
          {`Current characters count: ${count}/${MAX_CHARACTER_PURPOSE_COUNT}`}
        </span>
      </div>
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
  editChannel
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(EditChannelPurposeWrapper, { name: "EditChannelPurposeWrapper"}))
  