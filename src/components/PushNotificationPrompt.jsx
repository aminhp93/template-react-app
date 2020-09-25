import * as React from 'react'
import clsx from 'clsx'


const PushNotificationPrompt = ({
  showOtherPrompt,
  showAnotherPrompt,
  handleOpenNotificationRequest,
  storeToLocalStorage,
  closePrompt
}) => (
  <div className="push-notification-prompt">
    {
      !showOtherPrompt ? (
        <React.Fragment>
          <div className="push-notification-prompt__message">
            Insight messaging needs your permission to
            <span onClick={handleOpenNotificationRequest} role="presentation">
              {' enable desktop push notifications'}
            </span>.
          </div>
          <i className="fa fa-times" onClick={showAnotherPrompt} />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div className="push-notification-prompt__message">
            <div>
              {`Don't forget to enable push notification on this device so you won't miss any messages.`}
            </div>
            <div className="prompt-choices">
              <div className="enabled">
                <i className="fa fa-circle" />
                <span
                  onClick={handleOpenNotificationRequest}
                  role="presentation"
                >
                  Enable push notifications
                </span>
              </div>
              <div>
                <i className="fa fa-circle" />
                <span
                  onClick={closePrompt}
                  role="presentation"
                >
                  Ask me later
                </span>
              </div>
              <div className="disabled">
                <i className="fa fa-circle" />
                <span
                  onClick={storeToLocalStorage}
                  role="presentation"
                >
                  {`Don't ask again on this device`}
                </span>
              </div>
            </div>
          </div>
          <i className={clsx('fa fa-times', { 'position-top': showOtherPrompt })} onClick={closePrompt} />
        </React.Fragment>
      )
    }
  </div>
)

export default PushNotificationPrompt;