import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { map, debounce, includes, get } from 'lodash';
import { Button } from 'antd';

import { getDistanceInWordsToNow } from './utils';
import { joinChannel, selectConversation } from 'reducers/conversations';


interface IChannelItemProps {
  authUser: any;
  channel: any;
  allowClick: boolean;
  groupAndDmg: boolean;

  onModalClose: any;
  joinChannel: any;
  selectConversation: any;
}


class ChannelItem extends React.PureComponent<IChannelItemProps> {
  state = {
    loading: false
  };

  join = async () => {
    try {
      const { channel, joinChannel, onModalClose } = this.props;
      this.setState({ loading: true });
      await joinChannel({ id: channel.id });
      onModalClose();
      this.setState({ loading: false });
    } catch (error) {
      this.setState({ loading: false });
    }
  };

  preview = () => {
    const { onModalClose, channel, selectConversation } = this.props;
    selectConversation(channel.id);
    onModalClose()
  };

  handleClick = () => {
    const { allowClick } = this.props;
    if (!allowClick) return;
    this.preview()
  };

  render() {
    const { channel, authUser, allowClick, groupAndDmg } = this.props;
    const { loading } = this.state;
    const { conversationName, members, modified, isArchived } = channel || {};
    const currentUserId = authUser.id;
    const joinedTime = getDistanceInWordsToNow(modified);
    return (
      <div className={`media pl-3 pt-3 pb-3 members-list__item ${allowClick ? 'allow-click' : ''}`} onClick={this.handleClick}>
        <div className="media-body">
          <h5 className="mt-0 mb-0 members-list__item--name">{conversationName}</h5>
          {
            groupAndDmg
              ? <div className="m-joined-time">{joinedTime}</div>
            : (
              includes(members, currentUserId)
                ? <span className="members-list__item--sub-title">Joined</span>
                : (
                  <>
                    {!isArchived && (<Button loading={loading} disabled={loading} className="m-btn-primary m-btn-small-size mr-2" onClick={this.join}>Join</Button>)}
                    <Button className="m-btn-default m-btn-small-size" onClick={this.preview}>Preview</Button>
                  </>
                )
            )
          }

        </div>
      </div>
    );
  }
}

interface IProps {
  selectedTeamId: number;
  loadMore: any;
  channels: any;
  authUser: any;
  allowClick: boolean;
  groupAndDmg: boolean;

  onModalClose: any;
  joinChannel: any;
  selectConversation: any;
}

class ChannelList extends React.PureComponent<IProps> {
  channelListRef: any;
  constructor(props) {
    super(props);

    this.handleScroll = debounce(this.handleScroll, 300);
    this.channelListRef = React.createRef();
  }

  componentDidMount() {
    if (this.channelListRef) {
      this.channelListRef.current.addEventListener('scroll', this.handleScroll);
    }
  }

  componentWillUnmount() {
    if (this.channelListRef) {
      this.channelListRef.current.removeEventListener('scroll', this.handleScroll);
    }
  }

  handleScroll = ({ target }) => {
    // hit bottom
    if (target && (target.scrollHeight - target.scrollTop === target.clientHeight)) {
      const { loadMore } = this.props;
      loadMore();
    }
  };

  render() {
    const {
      channels, authUser, onModalClose, selectConversation, joinChannel, allowClick, groupAndDmg
    } = this.props;
    return (
      <div className="members-list" ref={this.channelListRef}>
        {
          channels && channels.length > 0
            ? map(channels, (channel) => (
              <ChannelItem
                groupAndDmg={groupAndDmg}
                key={channel.id}
                channel={channel}
                onModalClose={onModalClose}
                selectConversation={selectConversation}
                joinChannel={joinChannel}
                authUser={authUser}
                allowClick={allowClick}
              />
            ))
            : <span>There is no channel with that name</span>
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const conversations = get(state, 'conversations') || {};
  const selectedConversationId = get(state, 'selectedConversationId');
  return {
    selectedConversation: conversations[selectedConversationId] || {},
    selectedTeamId: get(state, 'selectedTeamId'),
    authUser: get(state, 'authUser') || {},
  }
};

const mapDispatchToProps = {
  joinChannel,
  selectConversation
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(ChannelList, { name: "ChannelList"}));
