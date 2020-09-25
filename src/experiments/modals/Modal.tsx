import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { ModalPortal } from './ModalPortal';

export interface IModalProps {
  isOpen: boolean;
  role?: string;
  className?: string;
  children?: any;
  title?: string;
  onRequestClose?(): void; 
}

export class Modal extends Component<IModalProps> {
  render(): JSX.Element {
    return ReactDOM.createPortal(
      <ModalPortal {...this.props} />,
      document.body
    );
  }
}
