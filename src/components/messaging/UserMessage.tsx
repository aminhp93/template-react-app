import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { get, partition } from 'lodash';
import ReactHtmlParser from 'react-html-parser';
import { distanceInWordsToNow } from 'date-fns';
import clsx from 'clsx';
import { Tooltip } from 'antd';
import { MessageType } from 'types';
import { format } from 'markdown';
import { Gallery } from 'components/messaging/Gallery';
import { FileMedia } from 'components/messaging/FileMedia';
import { GifMedia } from 'components/messaging/GifMedia';
import { default as MessageComposer } from 'components/messaging/MessageComposer';
import {
  DEFAULT_PROFILE_IMAGE_URL,
  AdditionalChannelModelMentions,
  SYSTEM_AVATAR,
} from 'constants/common';
import { getUserProgramAbbr } from 'utils/userInfo';
import { resendMessage as resendMessageAction } from 'reducers/messages';

import {
  getUserFullName,
  mapMention,
  transformProfileToMentionData,
} from './utils';

import { ResendMessagePlugin } from './ResendMessagePlugin';


import PINNED_ICON_URL from '@img/pin.svg';
import SAVED_ICON_URL from '@img/bookmark.svg';

interface IProps {
  users?: any;
  handleOpenOptionList?: any;
  mentions?: any;
  type?: MessageType;
  files?: any;
  content: string;
  isEditing?: boolean;
  isEdited?: boolean;
  created?: string;
  creator?: number;
  id?: number;
  pinnedAt?: string;
  isSaved?: boolean;
  pinnedUser?: number;
  onFinishEdit?: (params?: any) => void;
  selectedConversation?: any;
  pinnedListDisplay?: any;
  actionPlugin?: any;
  authUser?: any;
  reactions: any;
  /**
   * Indicate if the message was failed to send
   */
  hasError?: any;
  /**
   * Callback to resend a failed message
   */
  resendMessage?: (params?: any) => Promise<any>;
  highlight?: any;
  inSearch?: any;
  notShowPinnedIcon?: boolean;
  notShowSavedIcon?: boolean;
  itemTimestamp?: any;
}

class UserMessage extends React.PureComponent<IProps> {
  state = {
    isLoading: true,
  };

  /**
   * This transformer is only specific for mention tag,
   * providing a left-click menu context to see DM or profile of mentioned user
   */
  // eslint-disable-next-line consistent-return
  htmlParserTransformForMention = (node, index) => {
    const { handleOpenOptionList, mentions, users } = this.props;
    const mappedMentions = [
      ...mapMention(mentions, users),
      ...AdditionalChannelModelMentions,
    ];
    if (
      get(node, 'type') === 'tag' &&
      get(node, 'name') === 'a' &&
      get(node, 'attribs.class', '').includes('mention')
    ) {
      const { href } = get(node, 'attribs', {});
      const mention = node.attribs.class.split('--');
      const mentionData = mappedMentions.find(
        (data) =>
          data.target && `${data.target.id}` === mention[mention.length - 1]
      );
      return (
        <a
          href={href}
          key={index}
          onClick={(event) => {
            event.preventDefault();
            handleOpenOptionList(event.pageX, event.pageY, mentionData);
          }}
        >
          <span>{(mentionData.target || {}).fullName}</span>
        </a>
      );
    }
  };

  htmlParserTransformForHighlight = (node, index) => {    
    if (
      get(node, 'type') === 'text' &&
      get(node, 'data').match(/\[highlight\](.*?)\[\/highlight\]/g)
      
    ) {
      const content = get(node, 'data').replace(/\[highlight\](.*?)\[\/highlight\]/g, "<span class='m-highlight'>$1</span>")
      return ReactHtmlParser(content)
    }
  }; 

  showChatUserOptions = (event) => {
    const { users, handleOpenOptionList, creator } = this.props;
    event.preventDefault();
    handleOpenOptionList(
      event.pageX,
      event.pageY,
      transformProfileToMentionData(users[creator])
    );
  };

  renderContentMessage = () => {
    const { users, mentions, content, isEdited, inSearch, highlight } = this.props;
    const mappedMentions = [
      ...mapMention(mentions, users),
      ...AdditionalChannelModelMentions,
    ];
  
    return (
      <div className="mb-0 text-prewrap text-break">
        <span className="message-text">
          {
            inSearch
            ? (
              ReactHtmlParser(format(highlight, null, true), {
                transform: this.htmlParserTransformForHighlight,
              })
            )
            : (
              ReactHtmlParser(format(content, { mentions: mappedMentions }), {
                transform: this.htmlParserTransformForMention,
              })
            )
          }
          
          {isEdited && (
            <small className="message-item--edited ml-1">(edited)</small>
          )}
        </span>
      </div>
    );
  };

  render() {
    const {
      users,
      created,
      mentions,
      creator,
      files,
      actionPlugin,
      id,
      isEditing,
      pinnedAt,
      pinnedUser,
      isSaved,
      pinnedListDisplay,
      content,
      type,
      selectedConversation,
      authUser,
      children,
      hasError,
      notShowPinnedIcon,
      notShowSavedIcon,
      itemTimestamp,
      reactions
    } = this.props;
    const user = users[creator];
    const src = !get(user, 'isRemoved', false) && (user || {}).profileImage || DEFAULT_PROFILE_IMAGE_URL;
    const fullName = getUserFullName(user);
    const isSystemMessage = type === MessageType.SystemMessage;
    const inPreviewMode = !(selectedConversation.members || []).includes(authUser.id);
    const srcStatus = (reactions[((user || {}).status || {}).emoji] || {}).src;
    const titleStatus = ((user || {}).status || {}).status;

    const [gifs, others] = partition(files, (f) => f.fileType === 'image/gif');
    const [images, docs] = partition(others, (f) => f.fileType.startsWith('image'));

    const pinnedUserDetail = users[pinnedUser] || {};
    const timestamp = itemTimestamp || distanceInWordsToNow(created);
    const viewMessage = !isEditing && (
      <li
        id={pinnedListDisplay ? `${id}-pinned` : `${id}`}
        className={clsx('message-item d-flex py-2 px-3 m-message-item')}
      >
        <img
          src={isSystemMessage ? SYSTEM_AVATAR : src}
          alt="avatar"
          className="chat-avatar rounded-circle mr-2 ml-0 z-depth-1 pointer"
          onClick={(isSystemMessage || get(user, 'isRemoved', true)) ? null : this.showChatUserOptions}
        />

        <div className="chat-body white z-depth-1 rounded w-94">
          <div className="header clearfix">
            {isSystemMessage ? (
              <span className="message-item--chat-user primary-font">
                System
              </span>
            ) : (
              <div
                className="message-item--chat-user primary-font pointer pull-left m-message_user"
                onClick={(isSystemMessage || get(user, 'isRemoved', true)) ? null : this.showChatUserOptions}
              >
                {user && !user.isRemoved && user.isNonAlumniStaff ? (
                  <span className="username" style={{ color: '#ff6961' }}>
                    {fullName}
                  </span>
                ) : (
                  <span className="username">{fullName}</span>
                )}
                {
                  srcStatus && <Tooltip placement="top" title={<><img src={srcStatus} style={{ width: "18px", height: "18px"}}/> <span>{titleStatus}</span></>}>
                    <img src={srcStatus} style={{ width: "18px", height: "18px"}}/>
                  </Tooltip>
                }
                {user && !user.isRemoved && user.sessionShortName && (
                  <span
                    className={`session-tag ${getUserProgramAbbr(user)}-accent`}
                  >
                    {user.sessionShortName}
                  </span>
                )}
              </div>
            )}

            {!notShowPinnedIcon && !pinnedListDisplay && !!pinnedAt && (
                <Tooltip placement="top" title={`Pinned by ${pinnedUserDetail.id === authUser.id ? 'you' : pinnedUserDetail.fullName}`}>
                  <span className="pinned-message ml-2"><img src={PINNED_ICON_URL} alt={`Pinned by ${pinnedUserDetail.id === authUser.id ? 'you' : pinnedUserDetail.fullName}`} /></span>
                </Tooltip>
            )}

            {!notShowSavedIcon && isSaved && (
                <Tooltip placement="top" title="Saved">
                  <span className="saved-message ml-2"><img src={SAVED_ICON_URL} alt="Saved" /></span>
                </Tooltip>
            )}

            <small
              className={clsx('message-item--timestamp text-muted ml-2', {
                'pull-right': pinnedListDisplay,
              })}
            >
              {`${timestamp} ago`}
            </small>

          </div>

          {this.renderContentMessage()}

          {images.length > 0 && <Gallery images={images} />}

          {gifs.map((gif) => (
            <GifMedia key={gif.fileKey} file={gif} />
          ))}

          {docs.map((doc) => (
            <FileMedia key={doc.fileKey} file={doc} />
          ))}

          {children}

          {hasError && (
            <ResendMessagePlugin
              messageId={id}
              resendMessage={this.props.resendMessage}
            />
          )}
        </div>

        {!pinnedListDisplay &&
          !isSystemMessage &&
          !inPreviewMode &&
          !selectedConversation.isArchived &&
          !hasError &&
          actionPlugin}
      </li>
    );

    // Create a TMessage-like object here for the MessageComposer
    const message = {
      id,
      content,
      creator,
      created,
      files,
      mentions,
    };
    const editMessage = isEditing && (
      <li key={id} className="message-item m-message-item d-flex py-2 px-3">
        <MessageComposer
          message={message}
          isEditing={isEditing}
          onFinishEdit={this.props.onFinishEdit}
          conversation={selectedConversation}
        />
      </li>
    );

    return (
      <>
        {viewMessage}
        {editMessage}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  const conversations = get(state, 'conversations') || {};
  const selectedConversationId = get(state, 'selectedConversationId');
  return {
    selectedConversationId,
    selectedConversation: conversations[selectedConversationId] || {},
    authUser: get(state, 'authUser') || {},
    messages: get(state, 'messages') || {},
    users: get(state, 'users') || {},
    reactions: get(state, 'reactions'), 
  };
};

const mapDispatchToProps = {
  resendMessage: resendMessageAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(UserMessage, { name: "UserMessage"}));
