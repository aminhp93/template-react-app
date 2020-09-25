import React from 'react';
import { Link } from 'react-router-dom';

import LoadingIndicator from 'components/LoadingIndicator';
import EventService from 'services/Event';
import userInfo from 'utils/userInfo';
import makePageTitle from 'utils/common';
import { getTimeInTimeZone } from 'utils/time';
import emitter, { EVENT_KEYS } from 'utils/event';
import EventItem from './Event';
import { EventType, EventStatus } from '../../constants/common';


class EventResource extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      drafts: [],
      draftLoading: false,
      upcommingEvents: [],
      previousEvents: [],
      loading: false,
      page: 1,
      end: false,
    };
  }

  componentDidMount = () => {
    this.fetch();
    window.addEventListener('scroll', this.checkScrollFetchMore);
    document.title = makePageTitle('Event Directory');
  };

  componentWillUnmount() {
    window.removeEventListener('scroll', this.checkScrollFetchMore);
  }

  fetch = () => {
    if (userInfo.isStaff()) this.fetchDrafts();
    this.fetchEvents();
  };

  fetchDrafts = () => {
    const params = { status: EventStatus.DRAFT };
    this.setState({ draftLoading: true });
    EventService.getEvents(params)
      .then((res) => {
        this.setState({
          drafts: res.data.results,
          draftLoading: false,
        });
      })
      .catch(() => {
        this.setState({ draftLoading: false });
      });
  };

  fetchEvents = () => {
    const params = { page: this.state.page };
    this.setState({ loading: true });
    EventService.getEvents(params)
      .then((res) => {
        const upcommingEvents = [...this.state.upcommingEvents];
        const previousEvents = [...this.state.previousEvents];
        res.data.results.forEach((event) => {
          if (event.type === EventType.UPCOMING) upcommingEvents.push(event);
          if (event.type === EventType.PREVIOUS) previousEvents.push(event);
        });
        this.setState({
          upcommingEvents: upcommingEvents.sort((a, b) => new Date(getTimeInTimeZone(a.start_time, 'YYYY-MM-DD HH:mm:ss', a.time_zone))
            - new Date(getTimeInTimeZone(b.start_time, 'YYYY-MM-DD HH:mm:ss', b.time_zone))),
          previousEvents,
          loading: false,
          end: res.data.next === null,
        });
        // Add amplitude event
        emitter.emit(EVENT_KEYS.VIEW_EVENTS, {
          userId: userInfo.getUserId(),
        });
      })
      .catch(() => {
        this.setState({ loading: false, end: true });
      });
  };

  fetchMore() {
    if (!this.state.loading && !this.state.end) {
      this.setState({
        page: this.state.page + 1,
      }, () => this.fetchEvents());
    }
  }

  checkScrollFetchMore = () => {
    if (window.innerHeight + window.scrollY
        > document.getElementsByClassName('main-page')[0].clientHeight - 200) {
      this.fetchMore();
    }
  };

  handleDelete = () => {
    this.setState({
      drafts: [],
      upcommingEvents: [],
      previousEvents: [],
      page: 1,
      end: false,
    }, () => this.fetch());
  };

  render() {
    const {
      drafts, upcommingEvents, previousEvents, loading, draftLoading,
    } = this.state;
    return (
      <div className="main-page" style={{ backgroundColor: '#f2f4f6' }}>
        <div className="container">
          <div style={{ maxWidth: '1000px', margin: '0px auto', paddingTop: '60px' }}>
            <div className="event-list">
              {userInfo.isStaff()
                && (
                  <>
                    <button
                      className="btn btn-primary btn-create-event float-right text-center"
                    >
                      <Link to="/events/create" style={{ color: 'white' }}>CREATE EVENT</Link>
                    </button>
                    {draftLoading && <LoadingIndicator />}
                    {drafts && drafts.length > 0 && (
                      <>
                        <span className="up-comming-event-title">DRAFT EVENTS</span>
                        <table className="event-list-tbl mt-3">
                          <tbody>
                            {drafts.map((event) => (
                              <EventItem key={event.id} event={event} onDelete={this.handleDelete} />
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}
                  </>
                )}
              {upcommingEvents && upcommingEvents.length > 0 && (
                <>
                  <span className="up-comming-event-title">UPCOMING EVENTS</span>
                  <table className="event-list-tbl mt-3">
                    <tbody>
                      {upcommingEvents.map((event) => (
                        <EventItem key={event.id} event={event} onDelete={this.handleDelete} />
                      ))}
                    </tbody>
                  </table>
                </>
              )}
              {previousEvents && previousEvents.length > 0 && (
                <>
                  <span className="up-comming-event-title">PREVIOUS EVENTS</span>
                  <table className="event-list-tbl mt-3">
                    <tbody>
                      {previousEvents.map((event) => (
                        <EventItem key={event.id} event={event} onDelete={this.handleDelete} />
                      ))}
                    </tbody>
                  </table>
                </>
              )}
              {loading && <LoadingIndicator />}
              <div className="mb-3" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default EventResource;
