import * as Sentry from '@sentry/react';
import React from 'react';
import { get, keyBy, chunk, debounce } from 'lodash';
import { connect } from 'react-redux';
import { Tooltip, Popover, Input, Tabs, notification } from 'antd';
import { default as NetworkSerivce, NetworkStatus } from 'services/Network';
import {
  BuildOutlined,
  FireOutlined,
  FlagOutlined,
  CoffeeOutlined,
  BulbOutlined,
  TeamOutlined,
  SmileOutlined,
  HeartOutlined,
  EnvironmentOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import List from 'react-virtualized/dist/commonjs/List';

import {
  removeReaction,
  addReaction
} from 'reducers/messages';
import { GroupEmojiType, TMessage, TReaction, TUser } from 'types';
import { DEFAULT_ADD_IMAGE_STATUS } from 'constants/common';


const { TabPane } = Tabs;

interface IProps {
  users: TUser[],
  removeReaction: any,
  addReaction: any,
  message?: TMessage,
  reactions: TReaction[],
  authUser: TUser,
  emoji: any,

  cb?: any,
  actionPlugin?: boolean,
  updateStatus?: boolean,
}

interface IState {
  visible: boolean,
  hoverReaction: any,
  currentGroup: string,
  filterContext: string,
  selectedReaction: string,
  network: NetworkStatus
}


class ListReaction extends React.PureComponent <IProps, IState> {
  constructor(props) {
    super(props);
    const { users, authUser } = this.props;
    const currentUser: any = users[authUser.id] || {};
    this.state = {
      visible: false,
      hoverReaction: null,
      currentGroup: GroupEmojiType.All,
      filterContext: null,
      network: NetworkStatus.ONLINE,
      selectedReaction: props.emoji || (currentUser.status || {}).emoji,
    };
    this.filter = debounce(this.filter, 800)
  }

  handleVisibleChange = visible => {
    if (this.state.network === NetworkStatus.OFFLINE) return;
    this.setState({ visible });
    if (!visible) {
      this.props.cb && this.props.cb();
    }
  };

  clickReaction = reaction => {
    const { message, authUser, updateStatus } = this.props;
  
    if (this.state.network === NetworkStatus.OFFLINE) return;
    if (updateStatus) {
      this.setState({ 
        visible: false, 
        selectedReaction: reaction.name 
      });
      this.props.cb && this.props.cb(reaction.name)
    } else {
      const { reactions } = message;
      const reactionsObj = keyBy(reactions, 'name');
      const { name } = reaction;
      try {
        if (reactionsObj[name] && reactionsObj[name].users.includes(authUser.id)) {
          this.props.removeReaction({ messageId: message.id, name })
        } else {
          this.props.addReaction({ messageId: message.id, name })
        }
  
        this.setState({ visible: false });
        this.props.cb && this.props.cb();
      } catch (e) {
        notification.error({
          message: 'Error!',
          placement: 'bottomLeft',
          duration: 5,
        });
      }
    }
    
  };

  filterGroup = (key) => {
    this.setState({ currentGroup: key })
  };

  searchEmoji = (e) => {
    const data = e.target.value;
    this.filter(data);
  };

  filter = (filterContext) => {
    this.setState({
      filterContext
    })
  };

  rowRenderer = ({
    key, // Unique key within array of rows
    index, // Index of row within collection
    // isScrolling, // The List is currently being scrolled
    // isVisible, // This row is visible within the List (eg it is not an overscanned row)
    style, // Style object to be applied to row (to position it)
  }) => {
    const mappedListReactions = this.getListReactions();
    const row = mappedListReactions[index];
    return (
      <div key={key} style={style}>
        <div className="m-reaction-row">
          {
            row.map((i, index2) => {
              return (
                <div className="m-reaction-button"
                     key={index2}
                     onClick={() => this.clickReaction(i)}>
                  <img src={i.src}  alt={i.name}/>
                </div>
              )
            })
          }
        </div>
      </div>
    );
  };

  getListReactions = () => {
    const { reactions: listReactions } = this.props;
    const { currentGroup, filterContext } = this.state;
    let filterReactions ;
    if (currentGroup === GroupEmojiType.All) {
      const listSmileysEmotion = [];
      const listPeopleBody = [];
      const listAnimalsNature = [];
      const listFoodDrink = [];
      const listTravelPlaces = [];
      const listActivities = [];
      const listObjects = [];
      const listSymbols = [];
      const listFlags = [];
      Object.values(listReactions).map(i => {
        switch (i.group) {
          case GroupEmojiType.SmileysEmotion:
            listSmileysEmotion.push(i);
            break;
          case GroupEmojiType.PeopleBody:
            listPeopleBody.push(i);
            break;
          case GroupEmojiType.AnimalsNature:
            listAnimalsNature.push(i);
            break;
          case GroupEmojiType.FoodDrink:
            listFoodDrink.push(i);
            break;
          case GroupEmojiType.TravelPlaces:
            listTravelPlaces.push(i);
            break;
          case GroupEmojiType.Activities:
            listActivities.push(i);
            break;
          case GroupEmojiType.Objects:
            listObjects.push(i);
            break;
          case GroupEmojiType.Symbols:
            listSymbols.push(i);
            break;
          case GroupEmojiType.Flags:
            listFlags.push(i);
            break;
          default:
            break;
        }
      });

      filterReactions = listSmileysEmotion
        .concat(listPeopleBody)
        .concat(listAnimalsNature)
        .concat(listFoodDrink)
        .concat(listTravelPlaces)
        .concat(listActivities)
        .concat(listObjects)
        .concat(listSymbols)
        .concat(listFlags)
    } else {
      filterReactions = Object.values(listReactions).filter(i => i.group === currentGroup);
    }

    if (filterContext) {
      filterReactions = Object.values(listReactions).filter(i => ((i.displayName || '').toLowerCase()).includes(filterContext.toLowerCase()));

    }
    filterReactions = chunk(filterReactions, 9);
    return filterReactions
  };

  componentDidMount() {
    NetworkSerivce.addListener(this.onNetworkStatusChanged);
  }

  onNetworkStatusChanged = (status) => {
    this.setState({
      network: status
    })
  };

  componentDidUpdate (prevProps) {
    if (this.props.emoji !== prevProps.emoji) {
      let selectedReaction = this.props.emoji 
      if (!this.props.emoji) {
        selectedReaction = '';
      }
      this.setState({ selectedReaction })
    }
  }

  renderSelectedReaction = () => {
    let content = <i className="fa fa-plus" />
    const { actionPlugin, reactions, updateStatus } = this.props;
    const { selectedReaction } = this.state;
    let src
    if (actionPlugin) {
      content = <SmileOutlined className="m-medium-size"/>
    } else if (updateStatus) {      
      if (selectedReaction) {
        src = reactions[selectedReaction].src          
        content = <img style={{ width: '18px', height: '18px', marginBottom: "1px" }} src={src}/>
      } else {
        return <div className="m-default-icon-status"><SmileOutlined style={{ fontSize: "18px" }} /></div>
      }
    }

    return <span className="m-reaction-button-add">
      {content}
    </span>   
  }

  render() {
    const { updateStatus } = this.props;
    const { currentGroup, filterContext, visible } = this.state;
    const mappedListReactions = this.getListReactions();
    // console.log('ListReaction')
    return (
      <Popover
        className={`m-reaction-list-popover ${updateStatus ? 'm-update-status' : ''}`}
        placement="topRight"
        content={
          <>
            <div className="m-reaction-list-container">
              <Tabs defaultActiveKey={GroupEmojiType.All} onChange={this.filterGroup}>
                <TabPane tab={<AppstoreOutlined />} key={GroupEmojiType.All}/>
                <TabPane tab={<SmileOutlined/>} key={GroupEmojiType.SmileysEmotion}/>
                <TabPane tab={<TeamOutlined />} key={GroupEmojiType.PeopleBody}/>
                <TabPane tab={<FireOutlined />} key={GroupEmojiType.AnimalsNature}/>
                <TabPane tab={<CoffeeOutlined />} key={GroupEmojiType.FoodDrink}/>
                <TabPane tab={<EnvironmentOutlined />} key={GroupEmojiType.TravelPlaces}/>
                <TabPane tab={<BuildOutlined />} key={GroupEmojiType.Activities}/>
                <TabPane tab={<BulbOutlined />} key={GroupEmojiType.Objects}/>
                <TabPane tab={<HeartOutlined />} key={GroupEmojiType.Symbols}/>
                <TabPane tab={<FlagOutlined />} key={GroupEmojiType.Flags}/>
              </Tabs>
              <div className="m-reaction-search">
                <Input placeholder="Search" onChange={this.searchEmoji}/>
              </div>
              <div className="m-reaction-group-title">
                {filterContext ? 'Search Results' : currentGroup}
              </div>
              <div className="m-reaction-list">
                <List
                  width={300}
                  height={210}
                  rowCount={Object.values(mappedListReactions).length}
                  rowHeight={30}
                  rowRenderer={this.rowRenderer}
                />
              </div>
            </div>
          </>
        }
        trigger="click"
        visible={visible}
        onVisibleChange={this.handleVisibleChange}
      >
        {
          visible
            ?
            <div className="m-reaction-button add">
              {this.renderSelectedReaction()}
            </div>
          : <Tooltip title="Add reaction...">
              <div className="m-reaction-button add">
                {this.renderSelectedReaction()}
              </div>
            </Tooltip>
        }
      </Popover>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    authUser: get(state, 'authUser') || {},
    users: get(state, 'users') || {},
    reactions: get(state, 'reactions') || {},
  };
};

const mapDispatchToProps = {
  addReaction,
  removeReaction,
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(ListReaction, { name: "ListReaction"}))
