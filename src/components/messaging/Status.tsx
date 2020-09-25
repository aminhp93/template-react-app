import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import moment from 'moment';
import { Select, AutoComplete, DatePicker, TimePicker } from 'antd';

import ConfirmModal from './ConfirmModal';
import ListReaction from './ListReaction';

import { editChannel, updateDMG } from 'reducers/conversations';
import { updateUserStatus } from 'reducers/users';
import { ModalKey } from 'types';
import { USER_STATUS_TYPE, DEFAULT_STATUS_OPTIONS, DEFAULT_ADD_IMAGE_STATUS } from 'constants/common';

const { Option } = AutoComplete;

interface IProps {
  users: any,
  authUser: any,
  reactions: any,

  onModalClose: any;
  selectedConversation: any;
  updateDMG: any;
  updateUserStatus: any;
}

interface IState {
  status: string,
  emoji: string,
  clearType: string,
  clearAfterDate: string,
  clearAfterTime: string,
}

class Status extends React.PureComponent<IProps, IState> {
  constructor(props) {
    super(props);
    const { authUser, users } = props;
    const status = ((users[authUser.id] || {}).status || {}).status || ''
    const emoji = ((users[authUser.id] || {}).status || {}).emoji;
    this.state = {
      status,
      emoji,
      clearType: '',
      clearAfterDate: moment().format('YYYY-MM-DD'),
      clearAfterTime: moment().format('h:mm A')

    };
  }
  handleInputChange = (e) => {
    this.setState({
      status: e.target.value,
    });
  };

  handleOnOk = () => {
    const { updateUserStatus } = this.props;
    const { emoji, status, clearType, clearAfterDate, clearAfterTime } = this.state;
    let emojiData = emoji
    if (emoji && status) {
      // 
    } else if (emoji && !status) {
      // 
    } else if (!emoji && status) {
      emojiData = DEFAULT_ADD_IMAGE_STATUS
    } else {
      // 
    }

    const data = {
      "emoji": emojiData,
      "status": status,
      // "clearType": clearType,
      // "clearAfterDate": clearAfterDate,
      // "clearAfterTime": clearAfterTime
    }
    updateUserStatus(data)
  };

  handleChange2 = (data) => {
    this.setState({
      clearType: data
    })
  }

  changeDate = (data, dataString) => {
    console.log(data, dataString)
    this.setState({
      clearAfterDate: dataString
    })
  }

  changeTime = (data, dataString) => {
    console.log(data, dataString)
    this.setState({
      clearAfterTime: dataString
    })
  }

  renderClearOptions = () => {
    const { clearType, status, clearAfterDate, clearAfterTime } = this.state;
    if (!status) return null
    
    const clearTimeList = [
      {
        key: USER_STATUS_TYPE.DONT_CLEAR,
        value: 'Dont clear'
      },
      {
        key: USER_STATUS_TYPE.THIRTY_MINUTES,
        value: '30 minutes'
      },
      {
        key: USER_STATUS_TYPE.ONE_HOUR,
        value: '1 hour'
      },
      {
        key: USER_STATUS_TYPE.FOUR_HOURS,
        value: '4 hours'
      },
      {
        key: USER_STATUS_TYPE.TODAY,
        value: 'Today'
      },
      {
        key: USER_STATUS_TYPE.THIS_WEEK,
        value: 'This week'
      },
      {
        key: USER_STATUS_TYPE.CHOOSE_DATE_AND_TIME,
        value: 'Choose date and time'
      },
    ]
    return (
      <div className="m-clear-options-container">
        <div className="m-clear-after">
          <div className="m-clear-after-text">Clear after</div>
          <div>
            <Select defaultValue={clearTimeList[0].key} style={{ width: '200px' }} onChange={this.handleChange2}>
              {
                clearTimeList.map(i => {
                  return <Option value={i.key} key={i.key}>{i.value}</Option>
                })
              }
            </Select>
          </div>
        </div>
        {
          clearType === USER_STATUS_TYPE.CHOOSE_DATE_AND_TIME && (
            <div className="">
              <DatePicker onChange={this.changeDate} format="YYYY-MM-DD" value={moment(clearAfterDate)}/>
              <TimePicker onChange={this.changeTime} use12Hours format="h:mm A" value={moment(clearAfterTime)}/>
            </div>
          )
        }
      </div>
    )
  }

  handleChange = status => {
    if (status.length > 80) return;
    this.setState({ status });
  };

  onSelect = (data, obj) => {
    const { emoji, content: status } = obj.data;
    this.setState({
      emoji,
      status
    })
  }

  reset = () => {
    this.setState({ 
      status: '',
      emoji: ''
    })
  }

  render() {
    const { onModalClose, reactions } = this.props;
    const { status, emoji } = this.state;
    const options = DEFAULT_STATUS_OPTIONS.map(d => {
      const src = (reactions[d.emoji] || {}).src;
      return <Option value={d.content} key={d.key} data={d}>
        <img src={src} style={{ width: "18px", height: "18px" }}/> 
        {d.content}
      </Option>
    });

    return (
      <ConfirmModal
        modalKey={ModalKey.UPDATE_STATUS}
        okText="Save"
        title="Set a status"
        onOk={this.handleOnOk}
        onCancel={onModalClose}
        disabled={false}
        className="m-status-modal"
      >
          <ListReaction updateStatus cb={(emoji) => this.setState({ emoji })} emoji={emoji}/>
          <div className="m-clear-icon-container">
            <div className="m-clear-input" onClick={this.reset}>Clear</div>
          </div>
          <AutoComplete
            open={!status}
            autoFocus
            showSearch
            dropdownClassName="m-status-select"
            value={status}
            placeholder="What's your status?"
            style={{ width: '100%' }}
            defaultActiveFirstOption={true}
            showArrow={false}
            filterOption={false}
            onChange={this.handleChange}
            notFoundContent={null}
            onSelect={this.onSelect}
          >
            {options}
          </AutoComplete>
          {/* {this.renderClearOptions()} */}
      </ConfirmModal>
    );
  }
}

const mapStateToProps = (state) => {
  const conversations = get(state, 'conversations') || {};
  const selectedConversationId = get(state, 'selectedConversationId');
  return {
    selectedConversation: conversations[selectedConversationId] || {},
    reactions: get(state, 'reactions') || {},
    authUser: get(state, 'authUser') || {},
    users: get(state, 'users') || {},
  };
};

const mapDispatchToProps = {
  editChannel,
  updateDMG,
  updateUserStatus
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sentry.withProfiler(Status, { name: "Status"}));
