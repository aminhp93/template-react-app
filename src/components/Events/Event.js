import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import history from 'utils/history';
import { EventType, EventStatus } from 'constants/common';
import Delete from 'components/Modals/Delete';
import userInfo from 'utils/userInfo';
import EventService from 'services/Event';
import { getTimeInTimeZone } from 'utils/time';
import { getSpaceText } from './utils';


const logger = new Logger();

class EventItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: false,
      confirmDelete: false,
      deleting: false,
    };
  }

  componentDidMount() {
    window.document.addEventListener('click', this.hideDropDown);
  }

  componentWillUnmount() {
    window.document.removeEventListener('click', this.hideDropDown);
  }

  toggleDropDown = () => { this.setState({ dropdownOpen: !this.state.dropdownOpen }); };

  hideDropDown = (e) => {
    if (this.dropDownToggleRef && !this.dropDownToggleRef.contains(e.target)) {
      this.setState({ dropdownOpen: false });
    }
  };

  showConfirmDelete = () => this.setState({ confirmDelete: true });

  hideConfirmDelete = () => this.setState({ confirmDelete: false });

  delete = () => {
    EventService.deleteEvent(this.props.event.slug)
      .then(() => this.props.onDelete())
      .catch((error) => logger.error(error));
  };

  openEventDetailPage = (e) => {
    if (!this.state.dropdownOpen && !this.state.confirmDelete) {
      if (!this.dropDownToggleRef || !this.dropDownToggleRef.contains(e.target)) {
        window.open(`/events/${this.props.event.slug}`, '_blank');
      }
    }
  };

  render() {
    const { event } = this.props;
    const { dropdownOpen, confirmDelete, deleting } = this.state;
    const startTime = getTimeInTimeZone(event.start_time, 'YYYY-MM-DD HH:mm:ss', event.time_zone);
    const endTime = getTimeInTimeZone(event.end_time, 'YYYY-MM-DD HH:mm:ss', event.time_zone);
    return (
      <tr
        className={`event-row ${event.status === EventStatus.DRAFT ? 'event-row-draft' : 'event-row-published'}`}
        onClick={this.openEventDetailPage}
      >
        <td className="event-date text-center" style={{ width: '15%', minWidth: '50px' }}>
          <p className="event-day">{format(startTime, 'DD')}</p>
          <p className="event-month">{format(startTime, 'MMM')}</p>
        </td>
        <td
          className="event-title"
          style={{
            backgroundColor: '#adadad',
            backgroundImage: event.cover_image ? `linear-gradient(rgba(0, 0, 0, .6), rgba(0, 0, 0, .3)), url('${event.cover_image}')` : '',
          }}
        >
          <div className="event-title-name">
            {event.name}
          </div>
          {event.location
            && (
            <button
              className="btn btn-location btn-xs mt-2"
              style={{ color: 'white' }}
            >
              {event.location.address}
            </button>
            )}
        </td>
        <td className={`event-info ${event.status === EventStatus.DRAFT ? 'event-info-draft' : 'event-info-published'}`}>
          <div className="event-info-detail">
            {startTime
              && (
                <>
                  <i className="fa fa-clock-o fa-lg mr-2" aria-hidden="true" />
                  {format(startTime, 'h:mm a')}
                  {' '}
                  -
                  {format(endTime, 'h:mm a')}
                  {' '}
                  {event.time_zone && event.time_zone.toUpperCase()}
                </>
              )}
            {' '}
            <br />
            {event.address
              && (
                <>
                  <i className="fa fa-map-marker fa-lg ml-05 mr-2" aria-hidden="true" />
                  {' '}
                  {event.address}
                </>
              )}
          </div>
          {(event.type === EventType.UPCOMING || event.status === EventStatus.DRAFT)
            && (
            <p className="event-info-spaces">
              {getSpaceText(event.available_space)}
            </p>
            )}
          {userInfo.isStaff() && userInfo.getUserId() === event.creator
            && (
            <div className="event-info-actions">
              <i
                ref={(ref) => this.dropDownToggleRef = ref}
                className="fa fa-ellipsis-v fa-lg pointer float-right px-2 py-1"
                onClick={this.toggleDropDown}
              />
              {dropdownOpen
                && (
                <div className="post-container--dropdown">
                  <div className="card bg-white">
                    <div
                      className="post-container--dropdown--item pointer"
                      onClick={() => history.push(`/events/${event.slug}/edit`)}
                    >
                      Edit
                    </div>
                  </div>
                  <div className="card bg-white">
                    <div
                      className="post-container--dropdown--item pointer"
                      onClick={this.showConfirmDelete}
                    >
                      Delete
                    </div>
                  </div>
                </div>
                )}
            </div>
            )}
          {event.status === EventStatus.DRAFT
            && (
            <button className="btn btn-draft btn-xs mt-2">
              DRAFT
            </button>
            )}
          {confirmDelete
            && (
            <Delete
              isOpen={confirmDelete}
              close={() => this.setState({ confirmDelete: false })}
              delete={this.delete}
              deleting={deleting}
              targetType="event"
            />
            )}
        </td>
      </tr>
    );
  }
}

EventItem.propTypes = {
  event: PropTypes.objectOf(PropTypes.any),
  onDelete: PropTypes.func.isRequired,
};

export default EventItem;
