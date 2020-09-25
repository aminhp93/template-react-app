import * as Sentry from '@sentry/react';
import * as React from 'react'
import { Button, Modal } from 'antd'
import { CloseModalButton } from './CloseModalButton'

interface IConfirmDialogProps {
  title?: string;
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
  destructive?: boolean;
  children?: React.ReactNode;
  loading?: boolean;
}

const defaultProps: IConfirmDialogProps = {
  title: 'Confirm',
  okText: 'Remove',
  cancelText: 'Back',
  destructive: false,
  loading: false,
}

export function ConfirmDialog(props) {
  return (
    <Modal
      visible
      centered
      closable
      destroyOnClose
      title={props.title}
      footer={null}
      width={360}
      closeIcon={<CloseModalButton />}
      onCancel={props.onCancel}
      className="m-confirm-dialog"
    >
      <div className="m-confirm-dialog__content">
        {props.children}
      </div>

      <div className="m-confirm-dialog__footer">
        <Button
          loading={props.loading}
          onClick={props.onOk}
          type={props.destructive ? 'danger' : 'primary'}
        >
          {props.okText}
        </Button>
        <Button
          disabled={props.loading}
          onClick={props.onCancel}
        >
          {props.cancelText}
        </Button>
      </div>
    </Modal>
  );
}

ConfirmDialog.defaultProps = defaultProps;
export default Sentry.withProfiler(ConfirmDialog, { name: "ConfirmDialog"});
