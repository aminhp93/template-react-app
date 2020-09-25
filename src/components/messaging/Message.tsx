import * as Sentry from '@sentry/react';
/**
 * The wholly Message component which represent a message in the system
 */
import * as React from 'react'
import { get } from 'lodash'
import { connect } from 'react-redux'
import { Button, Dropdown, Menu } from 'antd'
import { CommentOutlined, DeleteOutlined, EditOutlined, MoreOutlined, PushpinOutlined } from '@ant-design/icons'
import { distanceInWordsToNow, parse } from 'date-fns';
import { format } from 'markdown';
import ReactHtmlParser from 'react-html-parser';

import { SYSTEM_AVATAR } from 'constants/common';
import { MessageType, TConversation, TMessageType, TUser } from 'types';

import { UserAvatar } from 'components/messaging/UserAvatar';
import { CHANNEL_MENTION, HERE_MENTION } from './EditorPluginHelpers';

import { mapMention } from './utils';
import Media from './Media';

interface IMessageProps {
  id: number;
  authUser: any;
  conversation: TConversation;
  content?: string;
  /**
   * The id of the creator of this message
   */
  creator?: number;
  created?: string;
  children?: string | React.ReactNode[];
  isEdited?: boolean;
  mentions?: any;
  files?: any;
  type?: TMessageType;
  users: TUser[];
}

interface IActionsProps {
  /**
   * Indicate whether the message associated with this action menu is pinned or not
   */
  isPinned: boolean;

  /**
   * Indicate whether this actions menu is for the creator of the message
   */
  forCreator: boolean;

  /**
   * Callback invoked when user clicks on `Delete`
   */
  onDelete?: () => void;

  /**
   * Callback invoked when user clicks on `Edit`
   */
  onEdit?: () => void;

  /**
   * Callback invoked when user clicks on 'Pin to this channel` or `Unpin from this channel`
   */
  onPin?: () => void;

  /**
   * Callback invoked whne user clicks on `eply`
   */
  onReply?: () => void;
}

export function Actions(props) {
  const renderMenu = (): JSX.Element => {
    const {
      forCreator,
      isPinned,
      onDelete,
      onEdit,
      onPin,
      onReply,
    } = props;

    return (
      <Menu>
        <Menu.Item key="reply" onClick={onReply}>
          <CommentOutlined />
          Reply
        </Menu.Item>
        {forCreator && (
          <Menu.Item key="edit" onClick={onEdit}>
            <EditOutlined />
            Edit
          </Menu.Item>
        )}
         {forCreator && (
          <Menu.Item key="delete" onClick={onDelete}>
            <DeleteOutlined />
              Delete
          </Menu.Item>
        )}
        <Menu.Item key="pin" onClick={onPin}>
          <PushpinOutlined />
          {isPinned ? 'Unpin from' : 'Pin to'} this channel
        </Menu.Item>
      </Menu>
    )
  };

  return (
    <Dropdown overlay={renderMenu()} trigger={['click']} placement="bottomRight">
      <Button icon={<MoreOutlined style={{ fontSize: 12, fontWeight: 600 }} />} className="m-message__actions-button" />
    </Dropdown>
  );
}

interface IAvatarProps {
  creator: number;
  users?: TUser[];
}

export function Avatar(props) {
  const SYSTEM_USER = {
    name: 'System',
    profileImage: SYSTEM_AVATAR
  };

  const { creator, users } = props;

  return (
    <UserAvatar
      user={creator ? users[creator] : SYSTEM_USER}
      className="chat-avatar mr-2 ml-0 z-depth-1 pointer"
    />
  );
}

interface IHeaderProps {
  authUser?: any;
  creator?: number;
  created?: string;
  type: TMessageType;
  users?: TUser[];
}

export function Header(props) {
  const { created, creator, type, users } = props;
  const user: TUser | Record<string, unknown> = users[creator] || {};
  const isSystemMessage = type === MessageType.SystemMessage;

  const menu = (
    <Menu>
      <Menu.Item>View profile</Menu.Item>
    </Menu>
  );

  return (
    <div className="m-message__header header clearfix">
      {
        isSystemMessage
        ? (
          <span className="m-message__user primary-font mr-1 font-weight-bold">
            System
          </span>
        )
        : (
          <Dropdown overlay={menu} overlayStyle={{ maxWidth: 160, minWidth: 160 }} trigger={['click']} placement="bottomLeft">
            <div className="m-message__user font-weight-bold primary-font mr-1 pointer pull-left">
              {user.fullName}
            </div>
          </Dropdown>
        )
      }
      <small className="message-item--timestamp text-muted ml-2">
        {`${distanceInWordsToNow(parse(created))} ago`}
      </small>
    </div>
  );
}

class Message extends React.Component<IMessageProps> {
  /**
   * This transformer is only specific for mention tag,
   * providing a left-click menu context to see DM or profile of mentioned user
   */
  // eslint-disable-next-line consistent-return
  private htmlParserTransformForMention = (node, index) => {
    const { mentions, users } = this.props;
    const mappedMentions = [...mapMention(mentions, users), ...CHANNEL_MENTION, ...HERE_MENTION]

    if (get(node, 'type') === 'tag' && get(node, 'name') === 'a' && get(node, 'attribs.class', '').includes('mention')) {
      const { href } = get(node, 'attribs', {});
      const mention = node.attribs.class.split('--');
      const mentionData = mappedMentions.find((data) => data.target && (`${data.target.id}` === mention[mention.length - 1]));
      return (
        <a
          href={href}
          key={index}
          onClick={e => e.preventDefault()}
        >
          <span>
            {(mentionData.target || {}).fullName}
          </span>
        </a>
      );
    }
  };

  public renderMessageContent = (): JSX.Element => {
    const { users, mentions, content, isEdited } = this.props;
    const mappedMentions = [...mapMention(mentions, users), ...CHANNEL_MENTION, ...HERE_MENTION]
    return (
      <div className="mb-0 text-prewrap text-break">
        <span className="message-text">
          {ReactHtmlParser(format(content, { mentions: mappedMentions }), { transform: this.htmlParserTransformForMention })}
          {isEdited && (
            <small className="message-item--edited ml-1">(edited)</small>
          )}
        </span>
      </div>
    )
  }

  public render(): JSX.Element {
    const { authUser, children, creator, files, users, type, created, id } = this.props;

    return (
      <li className="message-item d-flex py-2 px-3 m-message-item">
        <Avatar creator={creator} users={users} />
        <div className="chat-body white z-depth-1 rounded w-94">
          <Header
            type={type}
            creator={creator}
            created={created}
            users={users}
            authUser={authUser}
          />
          {this.renderMessageContent()}
          <Media fromChatMessage files={files} messageId={id} />
        </div>
        {children}
      </li>
    )
  }
}

const mapStateToProps = (state) => {
  const authUser = get(state, 'authUser');
  const users = get(state, 'users');
  const conversations = get(state, 'conversations');
  const selectedConversationId = get(state, 'selectedConversationId');
  const conversation = conversations[selectedConversationId]

  return { authUser, conversation, users }
}

export default connect(mapStateToProps, null)(Sentry.withProfiler(Message, { name: "Message"}))
