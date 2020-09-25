import * as React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

import ConfirmModal from './messaging/ConfirmModal';
import { updateSkillConfirm } from 'reducers/users';
import { ModalKey } from 'types';

interface IProps {
  onModalClose: any;
  cb: any;
  updateSkillConfirm: any;
}


class ConfirmSkillModalWrapper extends React.PureComponent<IProps> {


  handleOnOk = () => {
    this.props.cb();
    this.props.updateSkillConfirm();
  };

  render() {
    const { onModalClose } = this.props;
    
    return (
      <ConfirmModal
        modalKey={ModalKey.CONFIRM_SKILL}
        okText="OK"
        title="Just one more step!"
        onOk={this.handleOnOk}
        onCancel={onModalClose}
        disabled={false}
        className="confirm-skill"
      >
        <div>
          <div>
            {`After adding a skill, you will be invited to a public channel according to the skill
              you have selected. To discuss or ask a question in a certain field, you can use
              these channels. `}
          </div>
          <div className="confirm-skill-text">
            {`You have the option to leave these channels at any time.`}
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
    updateSkillConfirm
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConfirmSkillModalWrapper);
