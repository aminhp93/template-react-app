import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { get, debounce } from 'lodash';
import { Modal, List, Tabs, Button, AutoComplete, Checkbox } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import ReactHtmlParser from 'react-html-parser';

import { ConversationType, SecondaryView } from 'types';
import { searchMessage, fetchMessageList, searchFilterSuggestion } from 'reducers/messages';
import { searchChannel, searchGroupAndDMG, selectConversation } from 'reducers/conversations';
import { updateScollingSuccess } from 'reducers/scrolling';
import { addShowLatestMessagesSuccess } from 'reducers/showLatestMessages';
import { updateSecondaryView } from 'reducers/views';
import { searchUserInConversation } from 'reducers/users';

import Reaction from './Reaction';
import UserMessage from './UserMessage';
import { UserAvatar } from 'components/messaging/UserAvatar';

import emitter, { EVENT_KEYS } from 'utils/event';

import LOCK_ICON_URL from '@img/lock.svg';
import NETWORK_ICON_URL from '@img/network.svg';
import MASK_GROUP_1_URL from '@img/Mask-Group-1.svg';
import PROFILE_ICON_URL from '@img/profile.svg';
import FILTER_ICON_URL from '@img/filter.svg';


const { TabPane } = Tabs;
const { Option } = AutoComplete;

interface IProps {
  searchMessage: any,
  users: any,
  conversations: any,
  messages: any,
  authUser: any,

  fetchMessageList: any,
  updateScollingSuccess: any,
  addShowLatestMessagesSuccess: any,
  updateSecondaryView: any,
  selectedConversationId: number,
  searchChannel: any,
  searchGroupAndDMG: any,
  selectConversation: any,
  searchUserInConversation: any,
  searchFilterSuggestion: any,
}

interface IState {
  visible: boolean,
  searchMessageResult: any,
  searchChannelResult: any,
  searchGroupDMGResult: any,
  textSearch: any,
  paginateMessageObj: any,
  paginateChannelObj: any,
  paginateGroupDMGObj: any,
  currentMessagePage: number,
  currentChannelPage: number,
  currentGroupDMGPage: number,
  tab: string,
  suggestionList: any,
  filterSuggestions: any,
  showFilterSearchUser: boolean;
  filterSearchUserList: any,
  textFilterSearchUser: string;
}

class Search extends React.PureComponent<IProps, IState> {
  firstCall: boolean;

  constructor(props) {
    super(props);
    this.state = this.getDefaultState();
    this.firstCall = false;
    this.searchSuggestion = debounce(this.searchSuggestion, 400)
  }

  getDefaultState = () => {
    return {
      visible: false,
      searchMessageResult: null,
      searchChannelResult: [],
      searchGroupDMGResult: [],
      textSearch: '',
      paginateMessageObj: {},
      paginateChannelObj: {},
      paginateGroupDMGObj: {},
      currentMessagePage: 1,
      currentChannelPage: 1,
      currentGroupDMGPage: 1,
      tab: 'messages',
      suggestionList: [],
      filterSuggestions: {},
      showFilterSearchUser: false,
      filterSearchUserList: [],
      textFilterSearchUser: '',
    }
  }

  search = () => {
    const { 
      searchMessage, 
      selectedConversationId, 
      searchChannel, 
      searchGroupAndDMG, 
      searchFilterSuggestion
    } = this.props;
    const { textSearch, filterSuggestions } = this.state;
    try {
      if (!/\S/.test(textSearch)) return;
      emitter.emit(
        EVENT_KEYS.SEARCH_MESSAGE,
        {
          searchText: textSearch,
          channelId: selectedConversationId,
        },
      );
      const users = filterSuggestions.users && filterSuggestions.users.filter(i => i.checked).map(i => i.id)
      const promise1 = searchMessage({ textSearch, users })
      let promise2
      if (!this.firstCall) {
        promise2 = searchFilterSuggestion({ textSearch, users})
      }
      
      // const promise2 = searchChannel({ keyword: textSearch, page: 1 })
      // const promise3 = searchGroupAndDMG({ keyword: textSearch, page: 1 })
      const listPromises = [promise1, promise2]
      Promise.all(listPromises)
        .then(([resMessage, resSearchFilterSuggestion, resChannel, resGroupDMG]) => {
          this.firstCall = true
          const setStateObj: any = {
            searchMessageResult: resMessage.data.results,
            // searchChannelResult: resChannel.data.results,
            // searchGroupDMGResult: resGroupDMG.data.results,
            paginateMessageObj: resMessage.data,
            // paginateChannelObj: resChannel.data,
            // paginateGroupDMGObj: resGroupDMG.data,
            currentMessagePage: 1,
            // currentChannelPage: 1,
            // currentGroupDMGPage: 1,
            suggestionList: [],
          }
          if (resSearchFilterSuggestion && resSearchFilterSuggestion.data) {
            setStateObj.filterSuggestions = resSearchFilterSuggestion.data
          }
          this.setState(setStateObj)

        })
    } catch (error) {
      this.setState({
        searchMessageResult: [],
        searchChannelResult: [],
        searchGroupDMGResult: [],
        suggestionList: []
      })
    }
  }

  onChange = (data) => {
    this.setState({ textSearch: data })
    if (!data || String(data).trim().length === 0) {
      this.setState({
          suggestionList: [],
          searchMessageResult: null,
          searchChannelResult: [],
          searchGroupDMGResult: [],
      })
      return;
    }
    this.searchSuggestion(data);
  }

  searchSuggestion = async (data) => {
    try {
      const { searchChannel } = this.props;	
      let suggestionList = [{ value: data, isDefault: true }]
      const res = await searchChannel({ keyword: data, page: 1 })	
      suggestionList = suggestionList.concat(get(res.data, 'results') || [])

      this.setState({
        suggestionList,
        searchMessageResult: null,
        searchChannelResult: [],
        searchGroupDMGResult: [],
      })
    } catch {
      this.setState({
        suggestionList: [],
        searchMessageResult: null,
        searchChannelResult: [],
        searchGroupDMGResult: [],
      })
    }
  }

  clickView = (messageId) => {
    const { messages } = this.props;
    const message = messages[messageId]
    if (message.parent) {
      this.viewInThreadDetail(messageId);
    } else {
      this.viewInChannel(messageId)
    }
  }

  viewInChannel = async (messageId) => {
    const { 
      messages, 
      fetchMessageList, 
      updateScollingSuccess, 
      addShowLatestMessagesSuccess, 
      selectedConversationId,
      selectConversation
     } = this.props;
    const message = messages[messageId]
    selectConversation(message.channel)
    updateScollingSuccess(true)

    await fetchMessageList({ before: message.created });
    await fetchMessageList({ after: message.created });
    this.setState({
      visible: false,
      textSearch: '',
      searchMessageResult: null,
      searchChannelResult: [],
      searchGroupDMGResult: [],
      suggestionList: []
    })

    setTimeout(() => {
      const pinnedMessageElement = document.getElementById(`${messageId}`);
      if (pinnedMessageElement) {
        pinnedMessageElement.scrollIntoView();
        addShowLatestMessagesSuccess(selectedConversationId)
      }
      this.highlight(messageId);
      updateScollingSuccess(false)
    },0)

  }

  viewInThreadDetail = (messageId) => {
    const { updateSecondaryView, messages } = this.props;
    const message = messages[messageId]
    updateSecondaryView(SecondaryView.THREAD_DETAIL, message.parent);
    this.setState({
      visible: false,
      textSearch: '',
      searchMessageResult: null,
      searchChannelResult: [],
      searchGroupDMGResult: [],
      suggestionList: []
    })
    setTimeout(() => {
      const pinnedMessageElement = document.getElementById(`${messageId}`);
      if (pinnedMessageElement) {
        pinnedMessageElement.scrollIntoView();
      }
      this.highlight(messageId);
    }, 300);
  }

  highlight(messageId) {
    const pinnedMessageElement = document.getElementById(`${messageId}`);
    if (pinnedMessageElement) {
      pinnedMessageElement.classList.add('pinned-highlight');
      setTimeout(() => {
        pinnedMessageElement.classList.remove('pinned-highlight')
      }, 3000);
    }
  }

  renderMessageItem = (data) => {
    const { conversations, messages } = this.props;
    const { channel, id, replyCount, conversationName } = data;

    const conversationType = (conversations[channel] || {}).conversationType
    const inThread = messages[id] && messages[id].parent

    return (
      <div className="m-item" onClick={() => this.clickView(id)}>
        <div className="m-title-container">
          <div className="m-title-wrapper">
            <div className="m-title-source">
              <img
                src={
                  conversationType === ConversationType.Private
                    ? LOCK_ICON_URL
                    : NETWORK_ICON_URL
                }
                alt="conversation"
              />{conversationName}
            </div>
          </div>
          <div className="m-view-in-channel">{ inThread ? 'View in thread' : 'View in channel'}</div>
        </div>

        <div className="m-content-container">
          <UserMessage
            inSearch
            {...data}
          >
            <Reaction message={data} />
          </UserMessage>
          {
            replyCount === 0
            ? null
            : <div className="m-reply-count">
              <img
                src={MASK_GROUP_1_URL}
                alt="replyCount"
              />
              {replyCount} {replyCount > 1 ? ' replies' : ' reply'}
              </div>
          }
        </div>
      </div>
    )
  }

  renderConversationItem = (data) => {
    const { selectConversation } = this.props;
    const { textSearch } = this.state;
    const { conversationName, topic, members, id } = data;
    const regex = new RegExp(textSearch, 'g')

    const xxx = conversationName.replace(regex, `<span class='m-highlight'>${textSearch}</span>`)
    return (
      <div className="m-item" onClick={() => {
        selectConversation(id)
        this.setState({
          visible: false,
          textSearch: '',
          searchMessageResult: null,
          searchChannelResult: [],
          searchGroupDMGResult: [],
          suggestionList: []
        })
      }}>
        <div className="m-title-container">
          <div className="m-title-wrapper">
            <div className="m-title-source">
              <img src={NETWORK_ICON_URL} alt="conversation" />
              <span>{ReactHtmlParser(xxx)}</span>
            </div>
          </div>
          <div className="m-view-in-channel">{'View channel'}</div>
        </div>
        <div className="m-item-topic">{topic}</div>
        <div className="m-item-members">
          <img src={PROFILE_ICON_URL} alt="Participants" />
          <span>{(members || []).length} {(members || []).length > 1 ? 'members' : 'member' }</span>
        </div>
      </div>
    )
  }

  goToNext = async () => {
    const { searchMessage, searchChannel, searchGroupAndDMG } = this.props;
    const {
      paginateMessageObj,
      paginateChannelObj,
      paginateGroupDMGObj,
      currentMessagePage,
      currentChannelPage,
      currentGroupDMGPage,
      tab
    } = this.state;
    if (tab === 'messages') {
      const res = await searchMessage(null, paginateMessageObj.next)      
      this.setState({
        searchMessageResult: res.data.results,
        paginateMessageObj: res.data,
        currentMessagePage: currentMessagePage + 1,
      })
    } else if (tab === 'channels') {
      const res = await searchChannel(null, paginateChannelObj.next)
      this.setState({
        searchChannelResult: res.data.results,
        paginateChannelObj: res.data,
        currentChannelPage: currentChannelPage + 1,
      })
    } else if (tab === 'groupDMGs') {
      const res = await searchGroupAndDMG(null, paginateGroupDMGObj.next)
      this.setState({
        searchGroupDMGResult: res.data.results,
        paginateGroupDMGObj: res.data,
        currentGroupDMGPage: currentGroupDMGPage + 1,
      })
    }
  }

  goToPrevious = async () => {
    const { searchMessage, searchChannel, searchGroupAndDMG } = this.props;
    const {
      paginateMessageObj,
      paginateChannelObj,
      paginateGroupDMGObj,
      currentMessagePage,
      currentChannelPage,
      currentGroupDMGPage,
      tab
    } = this.state;
    if (tab === 'messages') {
      const res = await searchMessage(null, paginateMessageObj.previous)
      this.setState({
        searchMessageResult: res.data.results,
        paginateMessageObj: res.data,
        currentMessagePage: currentMessagePage - 1,
      })
    } else if (tab === 'channels') {
      const res = await searchChannel(null, paginateChannelObj.previous)
      this.setState({
        searchChannelResult: res.data.results,
        paginateChannelObj: res.data,
        currentChannelPage: currentChannelPage - 1,
      })
    } else if (tab === 'groupDMGs') {
      const res = await searchGroupAndDMG(null, paginateGroupDMGObj.previous)
      this.setState({
        searchGroupDMGResult: res.data.results,
        paginateGroupDMGObj: res.data,
        currentGroupDMGPage: currentGroupDMGPage - 1,
      })
    }
  }

  renderContentSearch = () => {
    const {
      searchMessageResult,
      searchChannelResult,
      searchGroupDMGResult,
      paginateMessageObj,
      paginateChannelObj,
      paginateGroupDMGObj,
      currentMessagePage,
      currentChannelPage,
      currentGroupDMGPage,
      tab,
    } = this.state;

    let list
    let currentPage
    let count = 0
    if (tab === 'messages') {
      list = <List
        size="large"
        header={null}
        footer={null}
        bordered
        dataSource={searchMessageResult}
        renderItem={i => <List.Item>{this.renderMessageItem(i)}</List.Item>}
      />
      currentPage = currentMessagePage
      count = paginateMessageObj.count;
    } else if (tab === 'channels') {
      list = <List
        size="large"
        header={null}
        footer={null}
        bordered
        dataSource={searchChannelResult}
        renderItem={i => <List.Item>{this.renderConversationItem(i)}</List.Item>}
      />
      currentPage = currentChannelPage
      count = paginateChannelObj.count;
    } else if (tab === 'groupDMGs') {
      list = <List
        size="large"
        header={null}
        footer={null}
        bordered
        dataSource={searchGroupDMGResult}
        renderItem={i => <List.Item>{this.renderConversationItem(i)}</List.Item>}
      />
      currentPage = currentGroupDMGPage
      count = paginateGroupDMGObj.count;
    } else {
      list = null
    }
    const remainder = count % 10;
    const totalPage = remainder === 0 ? count / 10 : (count - remainder) / 10 + 1;
    return <>
      <div className="m-search-content-container">
        {
          (searchMessageResult.length === 0 && tab === 'messages') || (searchChannelResult.length === 0 && tab === 'channels') || ( searchGroupDMGResult.length === 0 && tab === 'groupDMGs')
            ? <div className='m-no-content'>There is no result with that keyword</div>
            : list            
        }
        {this.renderFilterSearch()}
      </div>
      {
        searchMessageResult.length === 0 && tab === 'messages'
        ? null
        : (
          <div className="m-pagination">
            <div className="m-button-previous" onClick={this.goToPrevious}>{currentPage === 1 ? null : 'Previous'}</div>
            <div>Page {currentPage} of {totalPage}</div>
            <div className="m-button-next" onClick={this.goToNext}>{currentPage === totalPage ? null : 'Next'}</div>
          </div>
        )
      }
      
    </>
  }

  renderFilterSearch = () => {
    return <div className="m-search-filter">
      <div className="m-search-filter-title flex">
        <img src={FILTER_ICON_URL} alt="filter-search"/>
        <div>Filter your search</div>
      </div>
      <div className="s-small">
        Shared by
      </div>
      {this.renderFilterUser()}
      {this.renderFilterSearchUser()}
    </div>
  }

  handleClickCheckbox = (data) => {
    const { filterSuggestions } = this.state;
    if (filterSuggestions.users)  {
      filterSuggestions.users.map(i => {
        if (i.id === data.id) {
          if (i.checked) {
            i.checked = false
          } else {
            i.checked = true
          }
        }
        return i
      })
    }
    
    this.setState({
      filterSuggestions
    }, () => {
      this.forceUpdate()
      this.search()
    })
  };

  renderFilterUser = () => {
    const { filterSuggestions } = this.state;
    const { users } = filterSuggestions;
    return <div className="m-search-filter-user">
      <List
        header={null}
        footer={null}
        bordered
        dataSource={users || []}
        renderItem={i => <List.Item>{this.renderFilterUserItem(i)}</List.Item>}
      />
    </div>
  }

  renderFilterUserItem = (data) => {
    const { users } = this.props;
    return (
      <div className="flex m-item">
        <Checkbox checked={data.checked} onChange={e => this.handleClickCheckbox(data)}/>
        <UserAvatar user={users[data.id]} />
        <div>{(users[data.id] || {}).fullName}</div>
      </div>
    )
  }

  onChangeTextFilterSearchUser = async (data) => {
    this.setState({ textFilterSearchUser: data })
    const { filterSuggestions } = this.state;
    const params = {
      term: data,
      channel: this.props.selectedConversationId
    };
    const response = await this.props.searchUserInConversation(params);
    const { users } = response;
    const excludedIds = filterSuggestions.users && filterSuggestions.users.filter(i => i.checked).map(i => i.id)
    const filterSearchUserList = users.filter(i => !excludedIds.includes(i.id))
    this.setState({
      filterSearchUserList
    })
    
  }

  renderFilterSearchUser = () => {
    const placeholder = 'Find more teammates'
    const { showFilterSearchUser, textFilterSearchUser, filterSearchUserList } = this.state;
 
    return <div className="m-filter-search-user-container">
        {
          !showFilterSearchUser
          ? <div className="m-filter-search-user-more" onClick={() => this.setState({ showFilterSearchUser: true })}>More...</div>
          : <>
              <div className="m-search-icon-container">
                <SearchOutlined style={{fontSize: '16px'}}/>
                </div>
                <div className="m-clear-icon-container">
                  {textFilterSearchUser ? <div className="m-clear-input" onClick={() => this.setState({ textFilterSearchUser: '' })}>Clear</div> : null}
                </div>
                <AutoComplete
                  autoFocus={true}
                  value={textFilterSearchUser}
                  dropdownClassName="123"
                  onSelect={this.selectFilterSearchUser}
                  dataSource={filterSearchUserList.map((i) => (
                    <Option key={i.id} value={i.id} data={i.id}>
                      {this.renderFilterSearchUserItem(i)}
                    </Option>
                  ))}
                  onChange={this.onChangeTextFilterSearchUser}
                  placeholder={placeholder}
                />
              </>
        }
    </div>
  }

  selectFilterSearchUser = (id) => {
    const { filterSuggestions } = this.state;
    let add = true
    if (filterSuggestions.users) {
      filterSuggestions.users.map(i => {
        if (i.id === id) {
          i.checked = true
          add = false
        }
        return i
      })
    }

    if (add) {
      filterSuggestions.users.push({ id, checked: true })
    }
 
    this.setState({
      textFilterSearchUser: '',
      filterSuggestions
    }, () => this.search())
  }

  renderFilterSearchUserItem = (data) => {
    const { users } = this.props;
    return <div className="m-filter-search-user-item">
      <div className="m-filter-search-user-item-avatar"><UserAvatar user={users[data.id]} /></div>
      <div>{data.fullName}</div>
    </div>
  }

  renderSuggestionList = () => {
    const { suggestionList, textSearch } = this.state;
    if (suggestionList.length === 0) return null
    return (
      <div className="m-search-suggestion">
        <div className="m-search-suggestion-text-container" onClick={this.search}>
          <div className="m-search-suggestion-text-icon"><SearchOutlined style={{ fontSize: '16px' }}/></div>
          <span>{textSearch}</span>
          <span className="m-search-suggestion-text-suffix">{`\u2013 Search messages and more`}</span>
        </div>
        <List
          size="large"
          header={null}
          footer={null}
          bordered
          dataSource={suggestionList}
          renderItem={i => <List.Item>{this.renderSuggestionItem(i)}</List.Item>}
        />
      </div>
    )
  }

  renderSuggestionItem = conversation => {
    const { users, authUser } = this.props;
    const { conversationName, conversationType, lastMemberReply, creator, isDefault, value } = conversation
    let img = <img src={NETWORK_ICON_URL} alt="conversation" className="m-channel-icon"/>
    if (conversationType === "G" || conversationType === "D") {
      let dmMember = conversation.members[0];
      if (conversation.members.length > 1) {
        dmMember = conversation.members.filter((m) => m !== authUser.id)[0];
      }
      const isGroup = conversationType === ConversationType.Group;
      const secondUserAvatar = conversation.members.filter(
        (m) => m !== (lastMemberReply ? lastMemberReply : creator)
      )[0];

      if (isGroup) {
        if (conversation.members.length === 1) {
          img = <div className="m-avatar-container">
              <div/>
              <UserAvatar user={authUser.id} />
            </div>
        } else {
          img = <div className="group-avatar m-avatar-container">
          <div className="group-avatar--item">
            <UserAvatar user={users[secondUserAvatar]} />
          </div>
          <div className="group-avatar--item">
            <UserAvatar user={users[lastMemberReply ? lastMemberReply : creator]} />
          </div>
        </div>
        }
      } else {
        img = <div className="m-avatar-container">
          <UserAvatar user={users[dmMember]} />
        </div>
      }
    }
    let type = 'channel'
    if (conversationType === 'D') {
      type = 'direct message'
    } else if (conversationType === 'G') {
      type = 'group'
    }
    return (
      <div className="m-item">
        <div className="m-title-container">
          <div className="m-title-wrapper">
            <div className="m-title-source">
              {isDefault ? <div className="m-search-suggestion-text-icon"><SearchOutlined style={{ fontSize: '20px' }} /></div> : img}
              <span>{isDefault ? value : conversationName}</span>
              {isDefault ? <span className="m-search-suggestion-text-suffix">{`\u2013 Search messages and more`}</span>: null}
            </div>
          </div>
          {
            isDefault
            ? null
            : <div className="m-item-view">
              View {type}
            </div>
          }
        </div>
      </div>
    )
  }

  reset = () => {
    this.setState(this.getDefaultState());
    this.firstCall = false
  }

  render() {
    const {
      searchMessageResult,
      visible,
      textSearch,
      paginateMessageObj,
      paginateChannelObj,
      paginateGroupDMGObj,
      suggestionList
    } = this.state;
    const { selectConversation } = this.props;
    const countMessages = paginateMessageObj.count;
    const countChannels = paginateChannelObj.count;
    const countGroupDMGs = paginateGroupDMGObj.count;
    const placeholder = "What do you want to search for today?"

    return (
      <div className="m-search">
        {visible ? <Modal
            title={null}
            visible={visible}
            onOk={() => this.setState({ visible: false })}
            onCancel={this.reset}
            footer={null}
            maskClosable={false}
            wrapClassName={`m-search-modal ${textSearch && searchMessageResult ? 'm-text-search' : ''}`}
        >
          <div className="m-search-icon-container">
              <SearchOutlined style={{fontSize: '20px'}}/>
          </div>
          <div className="m-clear-icon-container">
            {textSearch ? <div className="m-clear-input" onClick={this.reset}>Clear</div> : null}
          </div>
          <AutoComplete
            autoFocus={true}
            defaultActiveFirstOption={true}
            value={textSearch}
            dropdownClassName={'m-search-suggestion'}
            onSelect={(data, obj) => {
              this.firstCall = false
              if (obj.data.isDefault) {
                this.search()
              } else {
                selectConversation(obj.data.id)
                this.setState({
                  visible: false,
                  textSearch: '',
                  searchMessageResult: null,
                  searchChannelResult: [],
                  searchGroupDMGResult: [],
                  suggestionList: []
                })
              }
            }}
            dataSource={suggestionList.map((i) => (
              <Option key={i.isDefault ? i.value : i.id} value={i.isDefault ? i.value : ''} data={i}>
                {this.renderSuggestionItem(i)}
              </Option>
            ))}
            onChange={this.onChange}
            placeholder={placeholder}
          />
          
          {
            textSearch
            ? (
              searchMessageResult
              ? (
                <div className="m-search-result">
                  <Tabs defaultActiveKey="messages" onChange={tab => this.setState({ tab })}>
                    <TabPane tab={`Messages (${countMessages})`} key="messages" />
                    {/* <TabPane tab={`Channels (${countChannels})`} key="channels" /> */}
                    {/* <TabPane tab={`Conversations (${countGroupDMGs})`} key="groupDMGs" /> */}
                  </Tabs>
                  {this.renderContentSearch()}

                </div>
              )
              : <div className="m-search-instruction">Press Enter to start search</div>
            )
            : <div className="m-search-instruction">Press Enter to start search</div>
          }
        </Modal>
        :null}
        <div className="m-button-search">
          <Button onClick={() => this.setState({ visible: true })}>
            <SearchOutlined />  Search
          </Button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    conversations: get(state, 'conversations') || {},
    users: get(state, 'users'),
    messages: get(state, 'messages') || {},
    selectedConversationId: get(state, 'selectedConversationId'),
    authUser: get(state, 'authUser')
  };
};

const mapDispatchToProps = {
  searchMessage,
  searchChannel,
  searchGroupAndDMG,
  fetchMessageList,
  updateScollingSuccess,
  addShowLatestMessagesSuccess,
  updateSecondaryView,
  selectConversation,
  searchUserInConversation,
  searchFilterSuggestion
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sentry.withProfiler(Search, { name: "Search"}));
