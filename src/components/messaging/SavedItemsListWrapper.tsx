import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { get, debounce } from 'lodash';

import { TMessage } from 'types'

import {
  fetchSavedMessageList
} from 'reducers/messages';
import { updateSecondaryView } from 'reducers/views';
import LoadingIndicator from "components/messaging/LoadingIndicator";
import SavedItemsItemDetail from 'components/messaging/SavedItemsItemDetail';
import CLOSE_ICON_URL from "@img/close.svg";

interface IProps {
  selectedTeamId: number;
  fetchSavedMessageList: any;
  savedMessages: [TMessage];
  updateSecondaryView: any;
}

interface IState {
  loading: boolean;
}

class SavedItemsListWrapper extends React.PureComponent<IProps, IState> {
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
        this.fetchSavedItemsList().then(() => {
            const savedItemsListDOM = this.getSavedItemsList();
            if (savedItemsListDOM) {
                savedItemsListDOM.addEventListener('scroll', this.handleScroll);
            }
        });
    }

    componentDidUpdate(prevProps) {
        const { selectedTeamId } = this.props;
        if (prevProps.selectedTeamId !== selectedTeamId) {
          this.nextUrl = null;
          this.hasMore = true;
          // this.props.emptyThreadListSuccess();
          this.fetchSavedItemsList().then(() => {
              // TODO
          });
        }
    }

    getSavedItemsList = () => document.getElementById('saved-items-list-wrapper');

    handleScroll = () => {
        const savedItemsListDOM = this.getSavedItemsList();
        if (!savedItemsListDOM) return;
        const { scrollHeight, clientHeight, scrollTop } = savedItemsListDOM;
        if (clientHeight + scrollTop >= scrollHeight) {
          this.fetchSavedItemsList().then(() => {
              // TODO
          });
        }
    };

    fetchSavedItemsList = async () => {
        try {
            if (!this.hasMore) return;
            this.setState({ loading: true });
            const response = await this.props.fetchSavedMessageList(this.nextUrl);
            this.setState({ loading: false });
            this.hasMore = !!response.data.next;
            this.nextUrl = response.data.next;
        } catch (error) {
            this.setState({ loading: false });
        }
    };

    render() {
        const { loading } = this.state;
        const { savedMessages, updateSecondaryView } = this.props;
        return (
            <div className="saved-items">
                <h6 className="saved-items--title chat-tab-title d-flex justify-content-between border-bottom p-3 mb-0">
                    <span>Saved Items</span>
                    <img
                        src={CLOSE_ICON_URL}
                        alt="plus"
                        className="cursor-pointer"
                        onClick={() => updateSecondaryView(null)}
                    />
                </h6>
                <div id="saved-items-list-wrapper" className="saved-items--list">
                    {savedMessages.map((message, index) => (
                        <div className="saved-items--list__item" key={index}>
                          <SavedItemsItemDetail key={index} message={message} />
                        </div>
                    ))}
                </div>
                {loading && <LoadingIndicator />}
                {!savedMessages.length && (
                  <div className="text-center p-4">
                    {`Saved items you're involved in will be collected right here.`}
                  </div>
                )}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const messages = get(state, 'messages') || {};
    const selectedTeamId = get(state, 'selectedTeamId');
    return {
        selectedTeamId: get(state, 'selectedTeamId'),
        savedMessages: Object.values(messages).filter(item => item.isSaved && (item.team === selectedTeamId || !item.team)).sort((a, b) => { return b.timeSaved.localeCompare(a.timeSaved) }),
    };
};

const mapDispatchToProps = {
    fetchSavedMessageList,
    updateSecondaryView
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(SavedItemsListWrapper, { name: "SavedItemsListWrapper"}));