import * as React from 'react';
import * as PropTypes from 'prop-types';
import Modal from 'components/Modal';

import MOBILE_BROKEN_IMAGE_URL from '@img/mobile-broken.svg';


class ServerErrorModal extends React.Component {
  static propTypes = {
    code: PropTypes.string,
    size: PropTypes.string,
    isOpen: PropTypes.bool,
    close: PropTypes.func.isRequired,
  };

  static defaultProps = {
    code: '500',
    size: 'xlg',
    isOpen: false,
  };

  handleReloadPage = () => {
    window.location = window.location.pathname;
  };

  render() {
    const {
      isOpen, close, size, code,
    } = this.props;
    return (
      <Modal id="serverErrorModal" isOpen={isOpen} close={close} size={size}>
        <div className="row">
          <div className="col-sm-6">
            <div className="modal-image">
              <img src={MOBILE_BROKEN_IMAGE_URL} alt="Server Error" />
            </div>
          </div>
          <div className="col-sm-6 mt-5 mb-3">
            <h5 className="font-weight-bold mb-3">Well, this is unexpected...</h5>
            <div className="mb-3 error-content">
              <p>
                Error code:
                {code}
              </p>
              <p>
                An error has occurred and we are working to fix the problem! We will be up and running shortly.
                Thanks for you patience!
              </p>
              <p>
                For urgent situations, please contact us at
                {' '}
                <a href="mailto:community-support@insightdatascience.com" target="_blank" rel="noopener noreferrer">community-support@insightdatascience.com</a>
              </p>
            </div>
            <button
              className="btn btn-primary pb-0 px-4"
              onClick={this.handleReloadPage}
            >
              <h6>Reload page</h6>
            </button>
          </div>
        </div>
      </Modal>
    );
  }
}

export default ServerErrorModal;
