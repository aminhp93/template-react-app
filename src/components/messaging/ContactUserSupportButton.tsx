import * as Sentry from '@sentry/react';
import * as React from 'react';
import { Tooltip } from 'antd';

import { ContactUserSupportModal } from './ContactUserSupportModal';

import USER_SUPPORT_ICON_URL from '@img/contactusersupport.svg';


export class ContactUserSupportButton extends React.Component {
  state = {
    showModal: false,
  };

  closeModal = () => {
    this.setState({ showModal: false })
  };

  render(): React.ReactNode {
    const { showModal } = this.state
    return (
      <>
        <Tooltip placement="right" title="Contact user support">
          <div
            className="meta-button contact-user-support-button"
            onClick={() => this.setState({ showModal: true })}
          >
            <img src={USER_SUPPORT_ICON_URL} alt="user support icon" />
          </div>
        </Tooltip>
        {showModal && <ContactUserSupportModal closeModal={this.closeModal} />}
      </>
    );
  }
}
export default Sentry.withProfiler(ContactUserSupportButton, { name: "ContactUserSupportButton"});
