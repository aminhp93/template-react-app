import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { get, debounce } from 'lodash';

import {
  resetNewThreadSuccess,
  emptyThreadListSuccess,
  fetchThreadList,
} from 'reducers/threads';
import { updateSecondaryView } from 'reducers/views';

import ThreadListItem from './ThreadListItem';
import LoadingIndicator from './LoadingIndicator';
import { mapThreadList } from './utils';

import CLOSE_ICON_URL from '@img/close.svg';


interface IProps {
  selectedTeamId: number;
  messages: any;
  threads: any;
  newThreads: any;

  emptyThreadListSuccess: any;
  fetchThreadList: any;
  updateSecondaryView: any;
  resetNewThreadSuccess: any;
}

interface IState {
  loading: boolean;
}
class ThreadListWrapper extends React.PureComponent<IProps, IState> {
  hasMore: boolean;
  nextUrl: string;

  constructor(props: IProps) {
    super(props);
    this.state = {
      loading: false,
    };
    this.hasMore = true;
    this.nextUrl = null;
    this.handleScroll = debounce(this.handleScroll, 300);
  }

  componentDidMount() {
    this.fetchThreadHistories();
    const threadDOMList = this.getThreadDOMList();
    if (threadDOMList) {
      threadDOMList.addEventListener('scroll', this.handleScroll);
    }
  }

  componentDidUpdate(prevProps) {
    const { selectedTeamId } = this.props;
    if (prevProps.selectedTeamId !== selectedTeamId) {
      this.nextUrl = null;
      this.hasMore = true;
      this.props.emptyThreadListSuccess();
      this.fetchThreadHistories();
    }
  }

  componentWillUnmount() {
    const threadDOMList = this.getThreadDOMList();
    if (threadDOMList) {
      threadDOMList.removeEventListener('scroll', this.handleScroll);
    }
  }

  getThreadDOMList = () => document.getElementById('thread-list-wrapper');

  handleScroll = () => {
    const threadListDOM = this.getThreadDOMList();
    if (!threadListDOM) return;
    const { scrollHeight, clientHeight, scrollTop } = threadListDOM;
    if (clientHeight + scrollTop >= scrollHeight) {
      this.fetchThreadHistories();
    }
  };

  fetchThreadHistories = async () => {
    try {
      if (!this.hasMore) return;
      this.setState({ loading: true });
      const response = await this.props.fetchThreadList(this.nextUrl);
      this.setState({ loading: false });
      this.hasMore = !!response.data.next;
      this.nextUrl = response.data.next;
    } catch (error) {
      this.setState({ loading: false });
    }
  };

  refresh = () => {
    this.props.resetNewThreadSuccess();
    this.props.emptyThreadListSuccess();
    this.nextUrl = null;
    this.hasMore = true;
    this.fetchThreadHistories();
  };

  render() {
    // console.log('Thread list')
    const { loading } = this.state;
    const { messages, threads, newThreads, updateSecondaryView } = this.props;
    const threadList = mapThreadList(messages, threads);

    return (
      <div className="thread-history">
        <h6 className="thread-history--title chat-tab-title d-flex justify-content-between border-bottom p-3 mb-0">
          <span>Threads</span>
          <img
            src={CLOSE_ICON_URL}
            alt="plus"
            className="cursor-pointer"
            onClick={() => updateSecondaryView(null)}
          />
        </h6>
        {newThreads > 0 && (
          <div
            className="thread-history--list thread-history--new-thread"
            onClick={this.refresh}
          >
            <span>
              {`${newThreads} new ${
                newThreads === 1 ? 'thread' : 'threads'
              } (Click to refresh)`}
            </span>
          </div>
        )}
        <div id="thread-list-wrapper" className="thread-history--list">
          {threadList.map((item, index) => (
            <div className="thread-history--list__item" key={index}>
              <ThreadListItem key={index} message={item} />
            </div>
          ))}
        </div>

        {loading && <LoadingIndicator />}
        {threadList.length === 0 && (
          <div className="text-center p-4">
            {`Threads you're involved in will be collected right here.`}
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    selectedTeamId: get(state, 'selectedTeamId'),
    messages: get(state, 'messages') || {},
    threads: get(state, 'threads') || {},
    newThreads: get(state, 'newThreads'),
  };
};

const mapDispatchToProps = {
  fetchThreadList,
  updateSecondaryView,
  resetNewThreadSuccess,
  emptyThreadListSuccess,
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(ThreadListWrapper, { name: "ThreadListWrapper"}));
