import * as React from 'react';
import {autobind} from '@redhio/javascript-utilities/decorators';
import {closest} from '@redhio/javascript-utilities/dom';
import {
  focusFirstFocusableNode,
  findFirstFocusableNode,
  focusLastFocusableNode,
} from '@redhio/javascript-utilities/focus';
import {EventListener} from '../../components';

import Focus from './Focus';

export interface Props {
  trapping?: boolean;
  children?: React.ReactNode;
}

export default class TrapFocus extends React.PureComponent<Props, never> {
  private focusTrapWrapper: HTMLElement;

  render() {
    const {children} = this.props;

    return (
      <Focus>
        <div ref={this.setFocusTrapWrapper}>
          <EventListener event="focusout" handler={this.handleBlur} />
          {children}
        </div>
      </Focus>
    );
  }

  @autobind
  private setFocusTrapWrapper(node: HTMLDivElement) {
    this.focusTrapWrapper = node;
  }

  @autobind
  private handleBlur(event: FocusEvent) {
    const {relatedTarget} = event;
    const {focusTrapWrapper} = this;
    const {trapping = true} = this.props;

    if (relatedTarget == null || !trapping) {
      return;
    }

    if (
      focusTrapWrapper &&
      !focusTrapWrapper.contains(relatedTarget as HTMLElement) &&
      !closest(relatedTarget as HTMLElement, '[data-polaris-overlay]')
    ) {
      event.preventDefault();

      if (event.srcElement === findFirstFocusableNode(focusTrapWrapper)) {
        return focusLastFocusableNode(focusTrapWrapper);
      }
      focusFirstFocusableNode(focusTrapWrapper);
    }
  }
}
