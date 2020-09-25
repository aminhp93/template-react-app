import * as Sentry from '@sentry/react';
import * as React from 'react';
import clsx from 'clsx';

interface IResendeMessageProps {
  /**
   * Whether the message associated with this plugin is being resent
   */
  isSending?: boolean;

  /**
   * The message associated with this plugin
   */
  messageId?: string | number;

  /**
   * Callback invoked to resend message
   */
  resendMessage?: (messageId: string | number) => Promise<any>;
}

export function ResendMessagePlugin(props) {
  const dispatchResend = () => {
    const { messageId, resendMessage, isSending } = props;
    if (!isSending) {
      resendMessage(messageId);
    }
  };

  return (
    <div className={clsx('text-danger error-message')}>
      <i className="fa fa-exclamation-circle" aria-hidden="true" />
      <span className="error-message--text ml-1" onClick={dispatchResend}>
        {`This message wasn't sent. Check your internet connection and click here to retry.`}
      </span>
    </div>
  );
}
export default Sentry.withProfiler(ResendMessagePlugin, { name: "ResendMessagePlugin"});
