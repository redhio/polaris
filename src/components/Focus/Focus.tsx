import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {focusFirstFocusableNode} from '@redhio/javascript-utilities/focus';
import {write} from '@redhio/javascript-utilities/fastdom';

export interface Props {
  children?: React.ReactNode;
}

export default class Focus extends React.PureComponent<Props, never> {
  componentDidMount() {
    write(() => {
      const root = ReactDOM.findDOMNode(this) as HTMLElement | null;
      if (root) {
        if (!root.querySelector('[autofocus]')) {
          focusFirstFocusableNode(root);
        }
      }
    });
  }

  render() {
    const Fragment = (React as any).Fragment;
    const {children} = this.props;

    return <Fragment>{children}</Fragment>;
  }
}
