import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Dropzone from 'react-dropzone';
import Flatpickr from 'react-flatpickr';
import Select from 'react-select';
import toastr from 'toastr';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { format } from 'date-fns';
import SessionService from 'services/Session';
import EventService from 'services/Event';
import LoadingIndicator from 'components/LoadingIndicator';
import history from 'utils/history';
import { getTimeInTimeZone } from 'utils/time';
import { IMAGE_TYPES } from 'utils/media';
import { EventStatus } from 'constants/common';
import InputErrorMessage from 'components/InputErrorMessage';
import Checkbox, {
  computeParentNextState, computeParentState, computeState, CheckboxState,
} from 'components/Checkbox';
import {
  defaultEvent, STRINGIFY_FIELDS, RESTRICTED_GROUPS, FlatpickrOptions, TimeZoneOptions,
} from './constants';
import { getSessionTree, validateEventForm } from './utils';

const logger = new Logger();

class EventForm extends React.Component {
  static propTypes = {
    event: PropTypes.objectOf(PropTypes.any),
    match: PropTypes.objectOf(PropTypes.any),
  };

  constructor(props) {
    super(props);
    const { slug } = props.match && props.match.params;
    this.state = {
      event: !slug ? defaultEvent : {},
      sessionTree: null,
      sessions: [],
      locations: [],
      submitting: false,
      fetchingSessions: false,
      errors: {},
      fetching: false,
      editMode: false,
      dropDowns: {},
    };
  }

  componentDidMount = () => {
    this.fetchEvent();
    this.getAllSession();
    this.getAllLocations();
  };

  componentWillUnmount() {
    // Make sure to revoke the data uris to avoid memory leaks
    const { image } = this.state.event;
    if (image) URL.revokeObjectURL(image.preview);
  }

  getAllSession = () => {
    this.setState({ fetchingSessions: true });
    SessionService.getAllSession()
      .then((res) => {
        if (res.data) {
          const sessions = res.data.map((session) => ({
            id: session.id,
            title: `${session.name} ${session.program.abbr} ${session.location.abbr}`,
            name: session.name,
            year: session.year,
          }));
          const sessionTree = getSessionTree(sessions);
          const setStateObj = {
            sessions,
            sessionTree,
            fetchingSessions: false,
          };
          const event = { ...this.state.event };
          if (!event.sessions || event.sessions.length === 0) {
            event.sessions = sessions.map((ss) => ss.id);
            setStateObj.event = event;
          }
          this.setState(setStateObj);
        }
      })
      .catch(() => {
        this.setState({ fetchingSessions: false });
        toastr.error('Cannot get the list of sessions');
      });
  };

  getAllLocations = () => {
    EventService.getAllLocations()
      .then((res) => {
        const { results } = res.data;
        const locations = results.map((lc) => ({ label: lc.address, value: lc.id }));
        this.setState({ locations });
      })
      .catch(() => toastr.error('Cannot get the list of locations'));
  };

  fetchEvent() {
    const { slug } = this.props.match && this.props.match.params;
    if (!slug) return;
    this.setState({ fetching: true });
    EventService.getEventDetail(slug).then((res) => {
      if (res.data) {
        const event = res.data;
        // Transform event object
        event.location_id = event.location && event.location.id;

        if (event.cover_image) event.image = { preview: event.cover_image };

        event.start_time = getTimeInTimeZone(event.start_time, 'YYYY-MM-DD HH:mm:ss', event.time_zone);

        event.end_time = getTimeInTimeZone(event.end_time, 'YYYY-MM-DD HH:mm:ss', event.time_zone);

        event.last_rsvp_time = getTimeInTimeZone(event.last_rsvp_time, 'YYYY-MM-DD HH:mm:ss', event.time_zone);

        event.sessions = event.reservation_conditions.session.sort((a, b) => (a < b ? 1 : -1));

        event.restricted_groups = event.restricted_groups || [];

        this.setState({ event, fetching: false, editMode: true });
      } else {
        history.push('/events');
      }
    }).catch((e) => {
      history.push('/events');
      logger.error(e);
    });
  }

  validate(eventStatus) {
    const event = { ...this.state.event };
    const errors = validateEventForm(eventStatus, event);
    this.setState({ errors });
    return Object.keys(errors).length > 0;
  }

  handleSubmitEvent = (eventStatus) => {
    if (this.validate(eventStatus)) return;
    const { event, editMode } = this.state;
    // Create form data
    const data = new FormData();
    Object.keys(event).forEach((key) => {
      // Consider defaultEvent object as a schema
      if (!Object.keys(defaultEvent).includes(key)) return;
      // Ignore null value
      if (!event[key]) {
        data.append(key, '');
        return;
      }
      // Stringify some non-primitive fields
      if (STRINGIFY_FIELDS.includes(key)) {
        data.append(key, JSON.stringify(event[key]));
      } else data.append(key, event[key]);
    });
    data.append('status', eventStatus);

    this.setState({ submitting: true });
    if (!editMode) {
      EventService.createEvent(data)
        .then(() => this.handleSubmitSuccess())
        .catch(this.handleSubmitFailed);
    } else {
      EventService.updateEvent(event.slug, data)
        .then(() => this.handleSubmitSuccess(true))
        .catch(this.handleSubmitFailed);
    }
  };

  handleSubmitSuccess = (editMode) => {
    toastr.success(`The event was ${editMode ? 'updated' : 'created'} successfully`);
    this.setState({ submitting: false });
    history.push('/events');
  };

  handleSubmitFailed = () => this.setState({ submitting: false });

  handleChange = (key, value) => {
    const event = { ...this.state.event };
    event[key] = value;
    this.setState({ event });
  };

  handleInputChange = (e) => {
    this.handleChange(e.target.name, e.target.value);
  };

  handleSelectChange = (key, select) => {
    if (select) this.handleChange(key, select.value);
    else this.handleChange(key, null);
  };

  handleTimeChange = (key, times) => {
    let time = null;
    if (times && times.length > 0) {
      time = format(times[0], 'YYYY-MM-DD HH:mm:ss');
    }
    this.handleChange(key, time);
  };

  handleToggleSessionParent = (type, value, state) => {
    const nextState = computeParentNextState(state);
    const children = this.state.sessions.filter((ss) => String(ss[type]) === value).map((ss) => ss.id);
    const event = { ...this.state.event };
    if (nextState === CheckboxState.CHECKED) {
      event.sessions = [...new Set([...event.sessions, ...children])];
    } else {
      event.sessions = event.sessions.filter((ssId) => !children.includes(ssId));
    }
    this.setState({ event });
  };

  handleToggleSessionItem = (sessionId) => {
    const event = { ...this.state.event };
    if (!event.sessions.includes(sessionId)) event.sessions.push(sessionId);
    else event.sessions = event.sessions.filter((ss) => ss !== sessionId);
    this.setState({ event });
  };

  toggleDropDown = (type, value) => {
    const dropDowns = { ...this.state.dropDowns };
    if (type === 'year' && dropDowns[`${type}_${value}`]) {
      Object.keys(dropDowns).forEach((key) => {
        // IMPORTANT: Apply for this specific case when session names always include the year
        if (key.includes(value)) dropDowns[key] = false;
      });
    } else {
      dropDowns[`${type}_${value}`] = !dropDowns[`${type}_${value}`];
    }
    this.setState({ dropDowns });
  };

  handleDrop = (files, rejectedFiles) => {
    if (!files || !files[0]) {
      toastr.error('File upload errors. Please contact us for more information');
      return;
    }
    if (rejectedFiles && rejectedFiles.length > 0) {
      toastr.error('Unsupported file type. We only support jpg and png.');
      return;
    }
    if (files[0].size > 2000000) {
      toastr.error('File size exceed the limit of 2MB.');
      return;
    }
    const event = { ...this.state.event };
    [event.image] = files;
    event.image.preview = URL.createObjectURL(files[0]);
    this.setState({ event });
  };

  handleRemoveImage = () => {
    const event = { ...this.state.event };
    if (event.image) URL.revokeObjectURL(event.image.preview);
    this.setState({ event: { ...event, image: null } });
  };

  render() {
    const {
      event, fetchingSessions, errors, fetching, sessionTree, dropDowns, sessions,
    } = this.state;
    return (
      <div className="main-page">
        {fetching && <LoadingIndicator />}
        {event && Object.keys(event).length > 0
        && (
        <div className="container" style={{ maxWidth: '700px' }}>
          <div className="create-event-form">
            <div className="form-group">
              <Dropzone
                onDrop={this.handleDrop}
                accept={IMAGE_TYPES}
                multiple={false}
              >
                {({ getRootProps, getInputProps, isDragActive }) => (
                  <div
                    {...getRootProps()}
                    className={clsx('dropzone', { 'dropzone--isActive': isDragActive })}
                  >
                    <div className="upload-file-placholder">
                      {event.image
                        ? (
                          <>
                            <img src={event.image.preview} height="80px" alt="Preview" />
                            {' '}
                            <br />
                            <button
                              className="btn btn-link text-danger p-1 pointer"
                              onClick={this.handleRemoveImage}
                            >
                              Remove
                            </button>
                          </>
                        )
                        : (
                          <>
                            <input {...getInputProps()} />
                            {isDragActive
                              ? <p>Drop the image here...</p>
                              : (
                                <p>
                                  Upload Cover Image
                                  <br />
                                  {' '}
                                  <span>+</span>
                                </p>
                              )}
                          </>
                        )}
                    </div>
                  </div>
                )}
              </Dropzone>
              <div className="ml-2 text-sm">
                Recommended dimension: 1500px by 500px
                {' '}
                <br />
                Maximum size: 2MB
              </div>
            </div>
            <div className="form-group">
              <label className="pl-2 form-control-label">EVENT NAME</label>
              <input
                className="form-control"
                type="text"
                name="name"
                onChange={this.handleInputChange}
                value={event.name}
              />
              {errors.name && <InputErrorMessage>{errors.name}</InputErrorMessage>}
            </div>
            <div className="form-group">
              <i className="fa fa-calendar" aria-hidden="true" />
              {' '}
              DATE & TIME
              <div className="row mt-2" style={{ margin: '0px' }}>
                <span className="mr-2 mt-2">From</span>
                <Flatpickr
                  data-enable-time
                  options={FlatpickrOptions}
                  value={event.start_time}
                  onChange={(time) => this.handleTimeChange('start_time', time)}
                  className="form-control event-date-input"
                />
                <span className="mx-2 mt-2">To</span>
                <Flatpickr
                  data-enable-time
                  options={FlatpickrOptions}
                  value={event.end_time}
                  onChange={(time) => this.handleTimeChange('end_time', time)}
                  className="form-control event-date-input"
                />
                <span className="mr-2" />
                <Select
                  placeholder="Time zone"
                  value={event.time_zone}
                  style={{ width: '135px' }}
                  options={TimeZoneOptions}
                  onChange={(timeZone) => this.handleSelectChange('time_zone', timeZone)}
                  clearable={false}
                />
              </div>
              {errors.date_time && <InputErrorMessage>{errors.date_time}</InputErrorMessage>}
              <div className="row ml-0 mt-3">
                <span className="mr-2 mt-2">Lock RSVP</span>
                <Flatpickr
                  data-enable-time
                  options={FlatpickrOptions}
                  value={event.last_rsvp_time}
                  onChange={(time) => this.handleTimeChange('last_rsvp_time', time)}
                  className="form-control event-date-input"
                />
              </div>
              <div className="text-sm mt-2">
                *Set the date and time when users cannot be able to change their reservation. By default it’ll be the starting time of the event.
              </div>
            </div>
            <div className="form-group">
              <i className="fa fa-map-marker" aria-hidden="true" />
              {' '}
              LOCATION
              <Select
                placeholder=""
                value={event.location_id}
                className="mt-2 width-135"
                options={this.state.locations}
                onChange={(location) => this.handleSelectChange('location_id', location)}
                clearable={false}
              />
              <input
                type="text"
                className="form-control mt-2"
                placeholder="Address"
                name="address"
                value={event.address}
                onChange={this.handleInputChange}
              />
              {errors.location && <InputErrorMessage>{errors.location}</InputErrorMessage>}
            </div>
            <div className="form-group">
              <i className="fa fa-envelope-o" aria-hidden="true" />
              {' '}
              CONTACT
              <input
                className="form-control mt-2"
                placeholder="Email"
                type="text"
                value={event.contact}
                name="contact"
                onChange={this.handleInputChange}
              />
              {errors.contact && <InputErrorMessage>{errors.contact}</InputErrorMessage>}
            </div>
            <div className="form-group">
              <i className="fa fa-user" aria-hidden="true" />
              {' '}
              RESERVATION
              <div className="row" style={{ marginLeft: '0px' }}>
                <input
                  type="number"
                  className="form-control mt-2"
                  style={{ width: '80px', fontSize: !event.space && '0', height: '33.19px' }}
                  name="space"
                  value={event.space || 0}
                  onChange={this.handleInputChange}
                  min={1}
                  disabled={event.space === null}
                />
                <span style={{ margin: '15px 0px 0px 10px' }}>Spaces</span>
                <Checkbox
                  className="ml-5"
                  style={{ marginTop: '1.2rem' }}
                  label="Unlimited"
                  state={computeState(event.space === null)}
                  onChange={() => this.handleChange('space', event.space ? null : 1)}
                />
              </div>
            </div>
            <div className="form-group">
              <i className="fa fa-user" aria-hidden="true" />
              {' '}
              ALLOW GUESTS
              <Checkbox
                className="ml-2"
                style={{ marginTop: '1.2rem' }}
                state={computeState(event.allow_guests)}
                onChange={() => this.handleChange('allow_guests', !event.allow_guests)}
              />
            </div>
            <div className="form-group">
              <i className="fa fa-file-text-o" aria-hidden="true" />
              {' '}
              ABOUT
              <textarea
                className="form-control mt-2"
                name="about"
                value={event.about}
                onChange={this.handleInputChange}
              />
              {errors.about && <InputErrorMessage>{errors.about}</InputErrorMessage>}
            </div>
            <div className="form-group">
              <i className="fa fa-user" aria-hidden="true" />
              {' '}
              AVAILABLE TO
              <div className="available-list-container">
                <div className="available-list mt-3 mb-4" style={{ paddingRight: '40px' }}>
                  {fetchingSessions && <LoadingIndicator />}
                  {sessionTree && Object.keys(sessionTree).map((year) => {
                    // Use == because year value return is a number while it's a string
                    // when we get it as an object key
                    const yearChildren = sessions.filter((ss) => String(ss.year) === year);
                    const yearCheckedChildren = yearChildren.filter((ss) => event.sessions.includes(ss.id));
                    const yearState = computeParentState(yearChildren.length, yearCheckedChildren.length);
                    return (
                      <div className="mb-2" key={year}>
                        <i
                          className={`fa ${dropDowns[`year_${year}`] ? 'fa-caret-down' : 'fa-caret-right'} mr-2 pointer fa-lg`}
                          onClick={() => this.toggleDropDown('year', year)}
                        />
                        <Checkbox
                          label={year}
                          state={yearState}
                          onChange={() => this.handleToggleSessionParent('year', year, yearState)}
                        />
                        {dropDowns[`year_${year}`]
                        && (Object.keys(sessionTree[year]).map((name) => {
                          const nameChildren = sessions.filter((ss) => ss.name === name);
                          const nameCheckedChildren = nameChildren.filter((ss) => event.sessions.includes(ss.id));
                          const nameState = computeParentState(nameChildren.length, nameCheckedChildren.length);
                          return (
                            <div className="ml-3" key={name}>
                              <i
                                className={`fa ${dropDowns[`name_${name}`] ? 'fa-caret-down' : 'fa-caret-right'} mr-2 pointer fa-lg`}
                                onClick={() => this.toggleDropDown('name', name)}
                              />
                              <Checkbox
                                label={name}
                                state={nameState}
                                onChange={() => this.handleToggleSessionParent('name', name, nameState)}
                              />
                              {dropDowns[`name_${name}`]
                                && (
                                <div className="row text-sm ml-3">
                                  {sessionTree[year][name].map((session) => (
                                    <div className="col-6 col-sm-4" key={session.id}>
                                      <Checkbox
                                        label={session.title}
                                        state={computeState(event.sessions && event.sessions.includes(session.id))}
                                        onChange={() => this.handleToggleSessionItem(session.id)}
                                      />
                                    </div>
                                  ))}
                                </div>
                                )}
                            </div>
                          );
                        }))}
                      </div>
                    );
                  })}
                </div>
                <div className="available-group mt-3 mb-4">
                  <Checkbox
                    label="Allow Non-Insight group"
                    style={{ marginTop: '1.2rem' }}
                    state={computeState(JSON.stringify(event.restricted_groups) === JSON.stringify(RESTRICTED_GROUPS))}
                    onChange={() => this.handleChange('restricted_groups', event.restricted_groups.length > 0 ? [] : RESTRICTED_GROUPS)}
                  />
                </div>

              </div>
              {errors.sessions && <InputErrorMessage>{errors.sessions}</InputErrorMessage>}
            </div>
            <div className="form-group text-center">
              <button
                className="btn btn-primary mr-2"
                type="button"
                disabled={this.state.submitting}
                onClick={() => this.handleSubmitEvent(EventStatus.PUBLISHED)}
              >
                PUBLISH
              </button>
              {(!event.status || event.status === EventStatus.DRAFT)
                && (
                <button
                  className="btn save-as-draft-btn"
                  type="button"
                  disabled={this.state.submitting}
                  onClick={() => this.handleSubmitEvent(EventStatus.DRAFT)}
                >
                  SAVE AS DRAFT
                </button>
                )}
            </div>
          </div>
        </div>
        )}
      </div>
    );
  }
}

export default EventForm;
