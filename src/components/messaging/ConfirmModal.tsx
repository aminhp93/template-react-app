import * as Sentry from '@sentry/react';
import * as React from 'react';
import { Button, Modal, notification } from 'antd';
import { TIMEOUT_ERROR, mapMessageSuccess } from '../messaging/utils';
import { ErrorType, SuccessType, ModalView, ModalKey } from 'types';

interface IProps {
  modalKey: ModalKey;
  visible: boolean;

  /**
   * The title of the modal
   */
  title?: string | null;

  /**
   * The text of the confirm button (e.g., 'OK' or 'Submit')
   */
  okText?: string;

  /**
   * The action to be performed once the user agrees
   */
  onOk?: any;

  /**
   * The text of the dismiss button (e.g., 'Cancel' or 'Back')
   */
  cancelText?: string;

  /**
   * The action to be performed once the user cancels (typically dismiss the modal)
   */
  onCancel: any;

  onBack?: any;

  /**
   * Whether the action confirmed by this modal is destructive or not. Examples of
   * destructive actions include deleting a resource, removing a user from a team, etc.
   * Examples of a non-destructive action include making a user the admin of a team, etc.
   */
  destructive?: boolean;

  /**
   * The width (in pixel) of the modal
   */
  width: number;
  disabled: boolean;
  modalView?: ModalView;
  footer: boolean;
  className?: string;
}

/**
 * CofirmModal should be use to make a confirmation with user about an important
 * action to be conducted. Generally, there should only be two options for a confirmation
 * - YES: to proceed executing the action
 * - NO: cancel the current action and dismiss the modal
 *
 * Depending on the nature of the action, the modal can remain loading while the action is
 * being executed or dismissed immediately after the user gives their confirmation. A typical
 * case is that the user answers YES and the modal remains on the screen with loading indicator
 * until the action is finished.
 *
 * This modal is unmounted on close/dimiss
 */

export class ConfirmModal extends React.PureComponent<IProps> {
  static defaultProps: IProps = {
    title: 'Confirm',
    okText: 'OK',
    cancelText: 'Cancel',
    onOk: () => Promise.reject({}),
    onCancel: () => {},
    destructive: false,
    visible: true,
    width: 800,
    disabled: true,
    footer: true,
    modalKey: null,
  };

  state = {
    loading: false,
    error: ErrorType.NONE_ERROR,
    success: SuccessType.NONE_SUCCESS,
  };

  componentWillUnmount() {
    if (this.props.modalKey === ModalKey.DELETE_CHANNEL) {
      this.props.onCancel();
    }
  }

  onOk = async () => {
    const { onOk, onCancel, modalView, modalKey } = this.props;
    if (modalView === ModalView.View1) {
      onOk();
      return;
    }
    try {
      this.setState({ loading: true });
      if (modalKey === ModalKey.CREATE_CHANNEL) {
        // Special case: need to change after rearchitecutre done
        const response = await onOk();
        if (response.status === 201) {
          notification.success({
            message: 'Success!',
            description: SuccessType.CREATE_CHANNEL_SUCCESS,
            placement: 'bottomLeft',
            duration: 5,
          });
          this.setState(
            {
              loading: false,
            },
            () => {
              // setTimeout(() => {
              onCancel();
              // }, TIMEOUT_ERROR);
            }
          );
        } else if (response.status === 200) {
          notification.error({
            message: 'Error!',
            description: ErrorType.CHANNEL_EXISTED_ERROR,
            placement: 'bottomLeft',
            duration: 5,
          });
          this.setState({
            loading: false,
          });
        }
      } else {
        await onOk();
        notification.success({
          message: 'Success!',
          description: mapMessageSuccess(modalKey),
          placement: 'bottomLeft',
          duration: 5,
        });
        this.setState(
          {
            loading: false,
          },
          () => {
            // setTimeout(() => {
            onCancel();
            // }, TIMEOUT_ERROR);
          }
        );
      }
    } catch (e) {
      notification.error({
        message: 'Error!',
        description: String(e),
        placement: 'bottomLeft',
        duration: 5,
      });
      this.setState({
        loading: false,
      });
    }
  };

  render(): React.ReactNode {
    const {
      title,
      okText,
      cancelText,
      onCancel,
      destructive,
      visible,
      width,
      children,
      disabled,
      modalView,
      onBack,
      footer,
      className
    } = this.props;
    const { loading } = this.state;

    return (
      <Modal
        title={null}
        footer={null}
        visible={visible}
        onOk={this.onOk}
        onCancel={onCancel}
        closable={true}
        closeIcon={<i id="modalCloseButton" className="fa fa-times fa-2x" />}
        className={`m-confirm-modal ${className}`}
        destroyOnClose={true}
        width={width}
        centered
      >
        {title ? <div className="m-confirm-modal__title">{title}</div> : null}
        <div className={`m-confirm-modal__content ${footer ? 'with-footer' : ''}`}>{children}</div>
        {footer ? (
          <div className="m-confirm-modal__footer">
            <Button
              disabled={disabled || loading}
              className={`m-button-confirm ${destructive ? 'danger' : ''}`}
              onClick={this.onOk}
              loading={loading}
              type="primary"
            >
              {okText}
            </Button>
            {modalView === ModalView.View1 ? null : (
              <Button
                className="m-button-confirm cancel"
                onClick={modalView === ModalView.View2 ? onBack : onCancel}
              >
                {cancelText}
              </Button>
            )}
          </div>
        ) : null}
      </Modal>
    );
  }
}

export default Sentry.withProfiler(ConfirmModal, { name: "ConfirmModal"});
