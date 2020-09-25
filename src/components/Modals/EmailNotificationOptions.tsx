import * as React from 'react';
import { Checkbox, Radio } from 'antd';

type TTimeWindow = {
  value: number,
  text: string,
};

/* Three default values for our system */
export const EN_TIME_WINDOWS: TTimeWindow[] = [
  { value: 15, text: 'Once every 15 minutes' },
  { value: 120, text: 'Once every 2 hours' },
  { value: 300, text: 'Once every 5 hours' },
];

interface ITimeWindowOptionProps {
  value: number;
  text?: string;
  onChange?: any;
  checked?: boolean;
  disabled: boolean;
}

const TimeWindowOption: React.SFC<ITimeWindowOptionProps> = props => (
  <div className={`insight-radio ${props.checked ? 'insight-radio-checked' : ''}`}>
    {/* <input type="radio" name="timeWindow" className="radio-input" {...props} /> */}
    <Radio defaultChecked={props.checked} name="timeWindow" {...props}>
      <span>{props.text}</span>
    </Radio>
  </div>
);

interface IEmailNotificationSettingsProps {
  timeWindow?: number | null;
  onTimeWindowChanged: any;
}

class EmailNotificationSettings extends React.PureComponent<IEmailNotificationSettingsProps> {

  private handleNotificationChanged = (tw: number | null) => {
    if (tw === null) {
      this.props.onTimeWindowChanged(EN_TIME_WINDOWS[0].value);
    } else {
      this.props.onTimeWindowChanged(null);
    }
  }

  render(): JSX.Element {
    const {
      timeWindow, onTimeWindowChanged,
    } = this.props;
    const checked = timeWindow !== null;

    return (
      <div className="notification-management">
        <div className="notification-management--title">
          Email Notification
        </div>
        <div className="notification-management--description">
          <div className="notification-management--description__detail">
            Email notification alerts are sent to you when you are not active on desktop...
          </div>
          <label>
            <Checkbox
              defaultChecked={checked}
              onChange={() => this.handleNotificationChanged(timeWindow)}
            >
              Send me email notifications for mentions and direct mesages
            </Checkbox>
          </label>
          <div>
            {
            EN_TIME_WINDOWS.map((window, index) => (
              <TimeWindowOption
                key={index}
                value={window.value}
                text={window.text}
                disabled={timeWindow === null}
                checked={timeWindow !== null && timeWindow === window.value}
                onChange={() => onTimeWindowChanged(window.value)}
              />
            ))
          }
          </div>
        </div>
      </div>
    );
  }
}

export default EmailNotificationSettings;
