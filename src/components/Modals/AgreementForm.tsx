import * as React from 'react';
import { notification, Input, Button } from 'antd';
import clsx from 'clsx';
import ReactHtmlParser from 'react-html-parser';
import { format } from 'markdown';
import { format as formatDate } from 'date-fns';
import AgreementService from 'services/Agreement';
import LoadingIndicator from 'components/LoadingIndicator';
import MessagingModal from '../MessagingModal';
import ProfileService from 'services/Profile';
import userInfo from 'utils/userInfo';
import { SupportFooter } from 'components/SupportFooter';

interface IAgreementProps {
  modalData?: any;
  onModalClose: any;
}

interface IAgreementState {
  agreementId: number;
  document: any;
  loading: boolean;
  submitting: boolean;
  signedName: string;
  metaData: any;
  scrolledToBottom: boolean;
  success: boolean;
}

const initialState = {
  loading: false,
  submitting: false,
  metaData: null,
  scrolledToBottom: false,
};

class AgreementForm extends React.Component<IAgreementProps, IAgreementState> {
  documentContentRef: any;

  constructor(props) {
    super(props);
    this.state = {
      agreementId: props.modalData.agreementId,
      document: null,
      signedName: '',
      success: false,
      ...initialState,
    };
  }

  componentDidMount() {
    this.getDocument();
  }

  async getDocument() {
    this.setState({ loading: true });
    const res = await AgreementService.getAgreementById(this.state.agreementId);
    this.setState(
      {
        document: res.data.document,
        ...initialState,
      },
      () => {
        window.scrollTo(0, this.documentContentRef.offsetTop);
        this.addMetaDataListener();
      }
    );
    // Enable the form after 7s to ensure that scrolling issues won't block the signing
    setTimeout(() => {
      this.setState({ scrolledToBottom: true });
    }, 7000);
  }

  addMetaDataListener() {
    const consentCheckbox = document.getElementById('consent-checkbox');
    if (consentCheckbox) {
      consentCheckbox.addEventListener('change', (e: any) => {
        const metaData = this.state.metaData || {};
        this.setState({
          metaData: {
            ...metaData,
            recording_release_consent: e.target.checked,
          },
        });
      });
    }
  }

  onDocumentContentScroll = (e) => {
    const scrolledToBottom = e.target.scrollHeight - e.target.scrollTop <= (e.target.clientHeight + 20);
    if (scrolledToBottom) this.setState({ scrolledToBottom });
  };

  onNameChange(e) {
    this.setState({ signedName: e.target.value });
  }

  onSubmit = () => {
    const data = {
      signed_name: this.state.signedName,
      meta_data: this.state.metaData,
    };
    this.setState({ submitting: true });
    AgreementService.updateAgreement(this.state.agreementId, data)
      .then(() => {
        ProfileService.getInfo().then((res) => {
          userInfo.setUserInfo(res.data);
          const pendingAgreements = userInfo.data.pending_agreements || [];
          if (pendingAgreements.length === 0) {
            this.setState({ success: true });
          } else {
            this.setState(
              { agreementId: pendingAgreements[0], document: null },
              () => this.getDocument()
            );
          }
        });
      })
      .catch((e) => {
        notification.error({
          message: 'Error',
          description: e,
        });
        this.setState({ submitting: false });
      });
  };

  renderForm = () => {
    const { document, submitting, scrolledToBottom, signedName } = this.state;
    return (
      <div className="document-form">
        <h5 className="text-center text-blue font-weight-bold">
          {document.title}
        </h5>
        <div
          ref={(ref) => (this.documentContentRef = ref)}
          className="document-content"
          onScroll={this.onDocumentContentScroll}
        >
          {ReactHtmlParser(format(document.content, {}, true))}
        </div>
        <div
          className={clsx('px-3 pb-3 document-with-link', {
            'signature-disabled': !scrolledToBottom,
          })}
        >
          {ReactHtmlParser(document.clickwrap_content)}
        </div>
        {document.signable && (
          <div
            className={clsx('px-3', {
              'signature-disabled': !scrolledToBottom,
            })}
          >
            <div className="text-left mb-4">
              <label className="font-weight-bold mr-3">
                Full Name: <span className="text-danger">*</span>{' '}
              </label>
              <Input
                type="text"
                className="form-control d-inline"
                placeholder="Type your name here"
                name="signedName"
                disabled={!scrolledToBottom}
                onChange={(e) => this.onNameChange(e)}
                style={{ width: '250px' }}
              />
            </div>
            <div className="text-left mb-4">
              <label className="font-weight-bold pr-3 mr-5">Date:</label>
              <span>
                {formatDate(new Date().toDateString(), 'MMM DD, YYYY')}
              </span>
            </div>
            <div className="text-center">
              <Button
                id="agreementSubmitButton"
                className="btn btn-primary px-4 mt-2 mx-auto"
                onClick={this.onSubmit}
                disabled={!signedName || signedName === ''}
                loading={submitting}
              >
                Submit
              </Button>
            </div>

            <SupportFooter />
          </div>
        )}
      </div>
    )
  }

  render(): JSX.Element {
    const { loading, document, success } = this.state;
    return (
      <MessagingModal
        id="addMemberCongratulation"
        close={this.props.onModalClose}
        unclosable={!success}
        buttonClose={success}
      >
        <div id="agreementModal">
          {loading && <LoadingIndicator />}
          {!success && document && this.renderForm()}
          {success && (
            <div className="text-center pt-3 pb-5">
              <h2 className="text-blue font-weight-bold mt-3">Thank you!</h2>
            </div>
          )}
        </div>
      </MessagingModal>
    );
  }
}

export default AgreementForm;
