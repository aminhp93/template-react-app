import * as Sentry from '@sentry/react';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import toastr from 'toastr';
import { get } from 'lodash';
import { Button } from 'antd';
import { format } from 'date-fns';

import { joinChannel } from 'reducers/conversations';

interface IProps {
  selectedConversation: any;
  users: any;
  joinChannel: any;
}

interface IState {
  loading: boolean;
}

class PreviewChannel extends PureComponent<IProps, IState> {
  state = {
    loading: false
  };

  join = async () => {
    try {
        const { selectedConversation, joinChannel } = this.props;
        this.setState({ loading: true });
        await joinChannel({ id: selectedConversation.id });
        this.setState({ loading: false });
    } catch (error) {
        toastr.error(error);
        this.setState({ loading: false });
    }
  };

  render() {
    const { selectedConversation, users } = this.props;
    const { loading } = this.state;
    const { conversationName, creator, created, isArchived } = selectedConversation;
    const formattedCreated = format(new Date(created), 'MMMM Do YYYY');
    const fullName = (users[creator] || {}).fullName;


    return (
      <div className="preview-channel m-3 p-4 text-center">
        <div className="preview-channel__title">
          You are viewing
          <span className="preview-channel__channel-name ml-1">{conversationName}</span>
        </div>
        <div className="preview-channel__sub-title">
          {`Created by ${fullName} on ${formattedCreated}`}
        </div>
        {!isArchived && (<Button className="btn btn-primary mt-2" onClick={this.join} disabled={loading} loading={loading}>Join channel</Button>)}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const conversations = get(state, 'conversations') || {};
  const selectedConversationId = get(state, 'selectedConversationId');
  const selectedConversation = conversations[selectedConversationId] || {};
  return {
    selectedConversation,
    users: get(state, 'users')
  };
};

const mapDispatchToProps = {
  joinChannel
};

export default connect(mapStateToProps, mapDispatchToProps)(PreviewChannel);
