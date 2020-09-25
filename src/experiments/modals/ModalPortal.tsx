/**
 * Notes:
 * To make this component respond to keyDown event:
 * - include a tabIndex attribute
 * - auto focus when the component is rendered
 */
import React, { Component, ReactNode } from 'react';

import './styles.scss';

interface IModalPortalProps {
  isOpen: boolean;
  className?: string;
  children?: ReactNode;
  tabIndex?: number;
  title?: string;
  onRequestClose?(): void;
}

const CLASS_NAMES = {
  overlay: 'ts-modal__overlay',
  content: 'ts-modal__content',
};

const ESC_KEY = 27;

interface IModalHeaderProps {
  title: string;
  onDismiss?(): void;
}

const ModalHeader: React.SFC<IModalHeaderProps> = ({ title, onDismiss }) => (
  <div className="ts-modal__header">
    <div className="ts-modal__title_wrapper">
      <h1 className="ts-modal__title">{title}</h1>
    </div>
    <div className="ts-modal__dismiss" onClick={onDismiss}>
      <span>x</span>
    </div>
  </div>
);

export class ModalPortal extends Component<IModalPortalProps> {
  static defaultProps: IModalPortalProps = {
    isOpen: false,
    tabIndex: 0,
  };

  overlay = null;

  setOverlayRef = overlay => {
    this.overlay = overlay;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.overlay) {
      this.overlay.focus();
    }
  }

  buildClassName = (which: string, additional: string): string => {
    const base = CLASS_NAMES[which];
    return additional ? `${base} ${additional}` : base;
  }

  handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.keyCode === ESC_KEY) {
      event.stopPropagation();
      this.props.onRequestClose();
    }
  }

  render(): ReactNode {
    const { isOpen, className, tabIndex, title } = this.props;

    if (!isOpen) {
      return null;
    }

    return (
      <div
        ref={this.setOverlayRef}
        className={this.buildClassName('overlay', className)}
        onKeyDown={this.handleKeyDown}
        tabIndex={tabIndex}
      >
        <div
          className={this.buildClassName('content', className)}
        >
          {title ? (
            <ModalHeader
              title={title}
              onDismiss={this.props.onRequestClose}
            />
           ) : null}
          <div className="ts-modal__body">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
