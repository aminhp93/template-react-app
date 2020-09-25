import * as Sentry from '@sentry/react';
import React from 'react';
import { connect } from 'react-redux';
import { get, debounce } from 'lodash';
import { Radio, Tooltip, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import { ConversationType } from 'types';
import { searchPublicChannels, getHiddenConversations, getArchivedChannels } from 'reducers/conversations';

import CreateChannelWrapper from './CreateChannelWrapper';
import ConfirmModal from './ConfirmModal';
import ChannelList from './ChannelList';
import LoadingIndicator from './LoadingIndicator';

import  EYE_OPEN_ICON_URL from '@img/eye-open.png';


export type IProps = {
  selectedConversation: any;
  selectedTeamId: number;
  groupAndDmg?: boolean;

  searchPublicChannels: any;
  getArchivedChannels: any;
  getHiddenConversations: any;
}

export type IState = {
  loading: boolean;
  listData: any;
  keyword: string;
  page: number;
  modal: string;
  end: boolean;
  type: string;
  show: boolean;
}

class BrowseChannelWrapper extends React.PureComponent<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = this.getInitState();

    this.fetchPublicChannels = debounce(this.fetchPublicChannels, 300);
  }

  getInitState = () => {
    return {
      loading: false,
      listData: [],
      keyword: '',
      page: 1,
      modal: '',
      end: false,
      type: 'publicChannels',
      show: false
    }
  };

  fetchPublicChannels = async (reset = false) => {
    const { selectedTeamId, searchPublicChannels } = this.props;
    const { page, keyword, listData } = this.state;
    if (!selectedTeamId) return;

    try {
      this.setState({ loading: true });
      const response = await searchPublicChannels({ term: String(keyword).trim(), page: reset ? 1 : page });
      this.setState({
        loading: false,
        listData: reset ? response.data.results : [...listData, ...response.data.results],
        end: response.data.next === null,
      });
    } catch (error) {
      this.setState({
        loading: false,
        listData: [],
      });
    }
  };

  fetchHiddenConversations = async (reset = false) => {
    const { getHiddenConversations, groupAndDmg } = this.props;
    const { page, keyword, listData } = this.state;

    try {
      this.setState({ loading: true });
      const response = await getHiddenConversations({ keyword: String(keyword).trim(), page: reset ? 1 : page, groupAndDmg });
      this.setState({
        loading: false,
        listData: reset ? response.data.results : [...listData, ...response.data.results],
        end: response.data.next === null,
      });
    } catch (error) {
      this.setState({
        loading: false,
        listData: [],
      });
    }
  };

  fetchArchivedChannels = async (reset = false) => {
    const { selectedTeamId, getArchivedChannels } = this.props;
    const { page, keyword, listData } = this.state;
    if (!selectedTeamId) return;

    try {
      this.setState({ loading: true });
      const response = await getArchivedChannels({ term: String(keyword).trim(), page: reset ? 1 : page });
      this.setState({
        loading: false,
        listData: reset ? response.data.results : [...listData, ...response.data.results],
        end: response.data.next === null,
      });
    } catch (error) {
      this.setState({
        loading: false,
        listData: [],
      });
    }
  };

  loadMore = () => {
    const { groupAndDmg } = this.props;
    const { loading, end, type } = this.state;
    if (!loading && !end) {
      this.setState((prevState) => ({ page: prevState.page + 1 }), () => {
        if (type === 'hiddenChannels' || groupAndDmg) {
          this.fetchHiddenConversations()
        } else if (type === 'publicChannels') {
          this.fetchPublicChannels();
        } else if (type === 'archivedChannels') {
          this.fetchArchivedChannels();
        }
      });
    }
  };

  openCreatePublicChannel = () => {
    this.setState({ modal: 'CreateChannelWrapper'})
  };

  search = () => {
    const { type } = this.state;
    const { groupAndDmg } = this.props;

    this.setState({ page: 1 }, () => {
      if (type === 'hiddenChannels' || groupAndDmg) {
        this.fetchHiddenConversations(true)
      } else if (type === 'publicChannels') {
        this.fetchPublicChannels(true);
      } else if (type === 'archivedChannels') {
        this.fetchArchivedChannels(true);
      }
    });
  };

  handleChangeKeyword = (e) => {
    this.setState({ keyword: e.target.value })
  };

  handleTypeChange = (e) => {
    const { loading } = this.state;
    if (loading) return;
    const type = e.target.value;
    if (type === this.state.type) return;
    switch (type) {
      case 'hiddenChannels':
          this.setState({ listData: [], type, page: 1, end: false }, () => this.fetchHiddenConversations());
        break;
      case 'publicChannels':
          this.setState({ listData: [], type, page: 1, end: false }, () => this.fetchPublicChannels());
          break;
      case 'archivedChannels':
          this.setState({ listData: [], type, page: 1, end: false }, () => this.fetchArchivedChannels());
          break;
      default:
        break;
    }
  };

  clearInput = () => {
    this.setState({ keyword: '' }, () => this.search())
  };

  render() {
    const { searchPublicChannels, groupAndDmg } = this.props;
    const { keyword, modal, listData, loading, type, show } = this.state;
    return (
      <>
        {
          groupAndDmg
          ? <div onClick={() => {
            this.setState({ show: true, listData: [] }, () => this.fetchHiddenConversations())
          }}>
              <Tooltip placement="top" title="View hidden conversations">
                <img src={EYE_OPEN_ICON_URL} alt="view hidden conversation"/>
              </Tooltip>
            </div>
          : <span
              className="channel__list__item channel-more"
              onClick={() => {
                this.setState({ show: true, listData: [] }, () => this.fetchPublicChannels())
              }}
            >
              More...
            </span>
        }

      { show && <ConfirmModal
          className="m-browse-channel-wrapper"
          title={null}
          onOk={searchPublicChannels}
          onCancel={() => this.setState(this.getInitState())}
          footer={false}
        >
          <div className="d-flex justify-content-between mb-3 mt-3">
            <h5 className="title-modal m-0" style={{ lineHeight: '39px' }}>{groupAndDmg? 'Hidden conversations' : 'Join a channel'}</h5>
            {
              !groupAndDmg && <div className="text-right">
                <button
                  className="btn btn-primary m-button-confirm"
                  onClick={this.openCreatePublicChannel}
                >
                  Create channel
                </button>
              </div>
            }

          </div>
          <div className="form-group">
            <label className="form-control-label">{groupAndDmg ? 'You can find all conversations that was hidden' : 'You can find and join any public channels'}</label>
            {
              !groupAndDmg &&
              <div className="m-browse-channel-wrapper-type">
                <Radio.Group value={type} onChange={this.handleTypeChange}>
                  <Radio.Button value="publicChannels">Public channels</Radio.Button>
                  <Radio.Button value="archivedChannels">Archived channels</Radio.Button>
                  <Radio.Button value="hiddenChannels">Hidden channels</Radio.Button>
                </Radio.Group>
              </div>
            }

            <div className="form-group">
              <i className="fa fa-search" aria-hidden="true" />
              <Input
                suffix={keyword ? <div className="m-clear-input" onClick={this.clearInput}>Clear</div> : null}
                prefix={<SearchOutlined />}
                size="large"
                placeholder="Search"
                value={keyword}
                onChange={this.handleChangeKeyword}
                onPressEnter={this.search}
              />
            </div>
          </div>
          <ChannelList
            groupAndDmg={groupAndDmg}
            allowClick={type === 'hiddenChannels' || groupAndDmg || type === 'archivedChannels'}
            channels={listData}
            loadMore={this.loadMore}
            onModalClose={() => this.setState(this.getInitState())}
          />
          {
            loading ? <LoadingIndicator /> : null
          }
        </ConfirmModal>
      }
      {
        modal === 'CreateChannelWrapper' &&
          <CreateChannelWrapper
            createType={ConversationType.Public}
            onModalClose={() => this.setState({ modal: '' })}
          />
      }
      </>

    )
  }
}

const mapStateToProps = (state) => {
  const conversations = get(state, 'conversations') || {};
  const selectedConversationId = get(state, 'selectedConversationId');
  return {
    selectedConversation: conversations[selectedConversationId] || {},
    selectedTeamId: get(state, 'selectedTeamId')
  }
};

const mapDispatchToProps = {
  searchPublicChannels,
  getArchivedChannels,
  getHiddenConversations
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(BrowseChannelWrapper, { name: "BrowseChannelWrapper"}));
