import * as React from 'react';
import {autobind} from '@redhio/javascript-utilities/decorators';
import {
  addEventListener,
  removeEventListener,
} from '@redhio/javascript-utilities/events';
import {Keys} from '../../types';

export interface Props {
  keyCode: Keys;
  handler(event: KeyboardEvent): void;
}

export default class KeypressListener extends React.Component<Props, never> {
  componentDidMount() {
    addEventListener(document, 'keyup', this.handleKeyEvent);
  }

  componentWillUnmount() {
    removeEventListener(document, 'keyup', this.handleKeyEvent);
  }

  render() {
    return null;
  }

  @autobind
  private handleKeyEvent(event: KeyboardEvent) {
    const {keyCode, handler} = this.props;

    if (event.keyCode === keyCode) {
      handler(event);
    }
  }
}
