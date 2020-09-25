import * as Sentry from '@sentry/react';
import * as React from 'react';
import { Tooltip } from 'antd';

import { dispatch } from 'store'
import { ConversationType, PrimaryView } from 'types';
import { updatePrimaryView } from 'reducers/views';

import CreateChannelWrapper from './CreateChannelWrapper';

import WHITE_PLUS_ICON_URL from '@img/white-plus.svg';


interface ICreateButtonProps {
  createButtonTooltip: string;
  onClick?(e: React.MouseEvent<HTMLElement>): void;
}

export function CreateConversationButton(props) {
  return (
    <Tooltip placement="top" title={props.createButtonTooltip}>
      <div className="create-button" onClick={props.onClick}>
        <img src={WHITE_PLUS_ICON_URL} alt="create conversation icon" />
      </div>
    </Tooltip>
  );
}

interface IProps {
  createButtonTooltip?: string;
  createType: ConversationType;
}

interface IState {
  showModal: boolean;
}

class CreateConversationWrapper extends React.Component<IProps, IState> {
  state: IState = {
    showModal: false,
  };

  closeModal = () => {
    this.setState({ showModal: false })
  };

  handleButtonClick = () => {
    const { createType } = this.props;
    if ([ConversationType.Public, ConversationType.Private].indexOf(createType) > -1) {
      this.setState({ showModal: true })
    } else {
      dispatch(updatePrimaryView(PrimaryView.CreateConversation))
    }
  };

  render(): React.ReactNode {
    const { showModal } = this.state;
    const { createButtonTooltip, createType } = this.props;

    return (
      <>
        <CreateConversationButton
          createButtonTooltip={createButtonTooltip}
          onClick={this.handleButtonClick}
        />
        {showModal &&
          <CreateChannelWrapper
            createType={createType}
            onModalClose={this.closeModal}
          />
        }
      </>
    );
  }
}

export default Sentry.withProfiler(CreateConversationWrapper, { name: "CreateConversationWrapper"});
