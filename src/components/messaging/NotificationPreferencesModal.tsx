import * as Sentry from '@sentry/react';
import * as React from 'react';
import clsx from 'clsx';
import { notification, Modal, Radio } from 'antd';

import { SYSTEM_NOTIFICATION } from 'constants/common';
import { PUSH_NOTIFICATION_TYPE } from 'utils/enums';
import { TNotificationPreferences } from 'reducers/authUser';

import EmailNotificationOptions from 'components/Modals/EmailNotificationOptions';

function Example({ text }) {
  return (
    <div className="example-notification">
      <div className="example-notification--avatar">
        <img src={SYSTEM_NOTIFICATION} alt="system_avatar" />
      </div>
      <div className="example-notification--information">
        <div className="example-notification--information__title">User</div>
        <div>
          Hi
          {text}
        </div>
      </div>
    </div>
  );
}
function PushNotificationOption({ option, selected, onSelect }) {
  const { header, description, example } = option;

  return (
    <div
      className={clsx('notification-management--description__options--choice', {
        selected,
      })}
      onClick={onSelect}
    >
      <div className="notification-management--description__options--choice__input">
        <Radio checked={selected} />
      </div>
      <div className="notification-management--description__options--choice__description">
        <div className="notification-management--title">{header}</div>
        <div className="notification-management--sub-description">
          {description}
        </div>
      </div>
      {example && (
        <div className="notification-management--description__options--choice__example">
          {example}
        </div>
      )}
    </div>
  );
}

const settings = [
  {
    id: PUSH_NOTIFICATION_TYPE.ALL_MESSAGES,
    header: 'All messages',
    description:
      "You'll be notified whenever there is a new message in your team",
    example: <Example text="everyone!" />,
  },
  {
    id: PUSH_NOTIFICATION_TYPE.DIRECT_MESSAGES,
    header: 'Direct messages or mentions',
    description:
      "You'll be notified when a teammate sends you a direct message, mentions you in a team channel or uses one of your keywords",
    example: <Example text="@user_name" />,
  },
  {
    id: PUSH_NOTIFICATION_TYPE.NO_MESSAGE,
    header: 'No notification',
    description: (
      <span>
        {"You won't receive notifications."}
        <br />
        {'Note: you will still see badges '}
        <span className="badge badge-danger h-50">1</span>
        {' within messaging app'}
      </span>
    ),
  },
];

export type TProps = {
  currentPushNotificationChoice: string;
  currentEmailNotificationChoice: string;
  onCancel: () => void;
  onOk: (data: TNotificationPreferences) => Promise<void>;
};

export class NotificationPreferencesModal extends React.PureComponent<TProps> {
  state = {
    loading: false,
    pushNotificationChoice: null,

    // This is a bit tricky, we have to use the false value here to
    // distinguish between user not changed and explicitly set to 'null'
    emailNotificationChoice: '',
  };

  setPushNotificationChoice = (choice: string) => {
    this.setState({ pushNotificationChoice: choice });
  };

  setEmailNotificationChoice = (choice: string) => {
    this.setState({ emailNotificationChoice: choice });
  };

  onOk = async () => {
    const {
      currentPushNotificationChoice,
      currentEmailNotificationChoice,
      onOk,
      onCancel,
    } = this.props;
    const { pushNotificationChoice, emailNotificationChoice } = this.state;

    this.setState({ loading: true });

    try {
      await onOk({
        pushNotificationChoice:
          pushNotificationChoice || currentPushNotificationChoice,
        emailNotificationChoice:
          emailNotificationChoice === ''
            ? currentEmailNotificationChoice
            : emailNotificationChoice,
      });
      notification.success({
        message: 'Success',
        description: 'Notification preferences updated successfully',
        placement: 'bottomLeft',
        duration: 4,
      });
      onCancel();
    } catch (e) {
      notification.error({
        message: String(e),
        placement: 'bottomLeft',
        duration: 4,
      });
    }

    this.setState({ loading: false });
  };

  render() {
    const {
      currentPushNotificationChoice,
      currentEmailNotificationChoice,
      onCancel,
    } = this.props;

    const {
      loading,
      pushNotificationChoice,
      emailNotificationChoice,
    } = this.state;

    const pushNotificationValue =
      pushNotificationChoice ||
      currentPushNotificationChoice ||
      PUSH_NOTIFICATION_TYPE.DIRECT_MESSAGES;

    const emailNotificationValue =
      emailNotificationChoice === ''
        ? currentEmailNotificationChoice
        : emailNotificationChoice;

    return (
      <Modal
        className="m-modal mt-5"
        width={980}
        closeIcon={<i className="fa fa-times fa-2x close-icon-i" />}
        okText="Save changes"
        onOk={this.onOk}
        onCancel={onCancel}
        destroyOnClose={true}
        confirmLoading={loading}
        centered={true}
        visible={true}
        title={null}
      >
        <h5 className="mb-1 mt-3 m-modal__title">Manage notifications</h5>
        <p className="mb-3">Your chosen settings will apply to all teams</p>
        <div className="notification-management mb-3">
          <div className="notification-management--title">
            Push Notification
          </div>
          <div className="notification-management--description">
            <div className="notification-management--description__detail">
              You will be notified even when the application is closed
            </div>
            <div className="notification-management--description__options">
              {settings.map((option) => (
                <PushNotificationOption
                  key={option.id}
                  option={option}
                  selected={pushNotificationValue === option.id}
                  onSelect={() => this.setPushNotificationChoice(option.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <EmailNotificationOptions
          timeWindow={emailNotificationValue}
          onTimeWindowChanged={this.setEmailNotificationChoice}
        />

        <div className="mb3"></div>
      </Modal>
    );
  }
}
export default Sentry.withProfiler(NotificationPreferencesModal, { name: "NotificationPreferencesModal"});
