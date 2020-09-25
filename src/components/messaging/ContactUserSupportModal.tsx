import * as Sentry from '@sentry/react';
import * as React from 'react';
import { Button, Modal } from 'antd';

import BETA_PERIOD_NOTICE_URL from '@img/notice-beta-period.svg';


interface IProps {
  closeModal: any;
}

export function ContactUserSupportModal({ closeModal }) {
  return (
    <Modal
      visible={true}
      title={null}
      footer={null}
      closable={false}
      destroyOnClose={true}
      centered={true}
      width={800}
      className="contact-support-modal m-modal"
    >
      <div className="row">
        <div className="col-sm-4 mt-5 mb-3">

          <img src={BETA_PERIOD_NOTICE_URL} alt="Notice Beta Period" />
        </div>
        <div className="col-sm-8 mt-5 mb-3">
          <h5 className="font-weight-bold mb-3">The Insight Community messaging system is in beta period.</h5>
          <div className="mb-4">
            There might be bugs and missing features. If you have any issues or suggestions feel free to email us at &nbsp;
            <a href="mailto:community-support@insightdatascience.com" className="text-blue">
              community-support@insightdatascience.com
            </a> or send us a message in user support channel. We normally reply within a few hours.
          </div>
          <Button size="large" onClick={closeModal} >Continue</Button>
        </div>
      </div>
    </Modal>
  );
}
export default Sentry.withProfiler(ContactUserSupportModal, { name: "ContactUserSupportModal"});
