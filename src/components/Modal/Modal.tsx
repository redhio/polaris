import * as React from 'react';
import * as PropTypes from 'prop-types';
import {focusFirstFocusableNode} from '@redhio/javascript-utilities/focus';
import {write} from '@redhio/javascript-utilities/fastdom';
import {wrapWithComponent} from '@redhio/react-utilities/components';
import {autobind} from '@redhio/javascript-utilities/decorators';
import {createUniqueIDFactory} from '@redhio/javascript-utilities/other';
import {TransitionGroup} from 'react-transition-group';
import {ComplexAction} from '../../types';
import {
  withAppProvider,
  WithAppProviderProps,
} from '../../components/AppProvider';
import {Scrollable, Spinner, Portal} from '../../components';
import memoizedBind from '../../utilities/memoized-bind';
import Dialog from './components/Dialog';
import Header, {CloseButton} from './components/Header';
import Section from './components/Section';
import Footer, {FooterProps} from './components/Footer';
import * as styles from './Modal.scss';

const IFRAME_LOADING_HEIGHT = 200;

export type Width = 'large' | 'fullwidth';

export interface Props extends FooterProps {
  /** Whether the modal is open or not */
  open: boolean;
  /** The url that will be loaded as the content of the modal */
  src?: string;
  /** The content for the title of the modal (EASDK accepts string) */
  title?: string | React.ReactNode;
  /** The content to display inside modal (Modal use only) */
  children?: React.ReactNode;
  /** Inner content of the footer (Modal use only) */
  footer?: React.ReactNode;
  /** Disable animations and open modal instantly (Modal use only) */
  instant?: boolean;
  /** Automatically adds sections to modal (Modal use only) */
  sectioned?: boolean;
  /** Increases the modal width (Modal use only) */
  large?: boolean;
  /** Limits modal height on large sceens with scrolling (Modal use only) */
  limitHeight?: boolean;
  /** Replaces modal content with a spinner while a background action is being performed (Modal use only) */
  loading?: boolean;
  /** Controls the width of the modal (EASDK use only) */
  width?: Width;
  /** Controls the height of the modal (EASDK use only, in pixels) */
  height?: number;
  /** Callback when the modal is closed */
  onClose(): void;
  /** Callback when iframe has loaded (Modal use only) */
  onIFrameLoad?(evt: React.SyntheticEvent<HTMLIFrameElement>): void;
  /** Callback when modal transition animation has ended (Modal use only) */
  onTransitionEnd?(): void;
}
export type CombinedProps = Props & WithAppProviderProps;

export interface State {
  iframeHeight: number;
}

const getUniqueID = createUniqueIDFactory('modal-header');

export class Modal extends React.Component<CombinedProps, State> {
  static contextTypes = {easdk: PropTypes.object};
  static Dialog = Dialog;
  static Section = Section;
  focusReturnPointNode: HTMLElement;

  state: State = {
    iframeHeight: IFRAME_LOADING_HEIGHT,
  };

  private headerId = getUniqueID();

  componentDidMount() {
    if (this.context.easdk == null) {
      return;
    }

    const {open} = this.props;

    if (open) {
      this.handleEASDKMessaging();
      this.focusReturnPointNode = document.activeElement as HTMLElement;
    }
  }

  componentDidUpdate({open: wasOpen}: Props) {
    if (this.context.easdk == null) {
      return;
    }

    const {open} = this.props;

    if (wasOpen !== open) {
      this.handleEASDKMessaging();
    }

    if (!wasOpen && open) {
      this.focusReturnPointNode = document.activeElement as HTMLElement;
    } else if (
      wasOpen &&
      !open &&
      this.focusReturnPointNode != null &&
      document.contains(this.focusReturnPointNode)
    ) {
      this.focusReturnPointNode.focus();
      this.focusReturnPointNode = null as any;
    }
  }

  render() {
    if (this.context.easdk != null) {
      return null;
    }

    const {
      children,
      onClose,
      title,
      src,
      open,
      instant,
      sectioned,
      loading,
      large,
      limitHeight,
      footer,
      primaryAction,
      secondaryActions,
    } = this.props;

    const {iframeHeight} = this.state;

    const iframeTitle = 'body markup';

    const handleClose = memoizedBind(onClose);

    let dialog: React.ReactNode;
    let backdrop: React.ReactNode;
    if (open) {
      const footerMarkup =
        !footer && !primaryAction && !secondaryActions ? null : (
          <Footer
            primaryAction={primaryAction}
            secondaryActions={secondaryActions}
          >
            {footer}
          </Footer>
        );

      const content = sectioned
        ? wrapWithComponent(children, Section)
        : children;

      const body = loading ? (
        <div className={styles.Spinner}>
          <Spinner />
        </div>
      ) : (
        content
      );

      const bodyMarkup = src ? (
        <iframe
          title={iframeTitle}
          src={src}
          className={styles.IFrame}
          onLoad={this.handleIFrameLoad}
          style={{height: `${iframeHeight}px`}}
        />
      ) : (
        <Scrollable shadow className={styles.Body}>
          {body}
        </Scrollable>
      );

      const headerMarkup = title ? (
        <Header id={this.headerId} onClose={handleClose} testID="ModalHeader">
          {title}
        </Header>
      ) : (
        <CloseButton
          onClick={handleClose}
          title={false}
          testID="ModalCloseButton"
        />
      );

      dialog = (
        <Dialog
          instant={instant}
          labelledBy={this.headerId}
          onClose={handleClose}
          onEntered={this.handleEntered}
          onExited={this.handleExited}
          large={large}
          limitHeight={limitHeight}
        >
          {headerMarkup}
          <div className={styles.BodyWrapper}>{bodyMarkup}</div>
          {footerMarkup}
        </Dialog>
      );

      backdrop = <div className={styles.Backdrop} onClick={handleClose} />;
    }

    const animated = !instant;

    handleWarning('modal', this.props);
    return (
      <Portal idPrefix="modal">
        <TransitionGroup appear={animated} enter={animated} exit={animated}>
          {dialog}
        </TransitionGroup>
        {backdrop}
      </Portal>
    );
  }

  @autobind
  private handleEntered() {
    const {onTransitionEnd} = this.props;
    if (onTransitionEnd) {
      onTransitionEnd();
    }
  }

  @autobind
  private handleExited() {
    this.setState({
      iframeHeight: IFRAME_LOADING_HEIGHT,
    });

    if (this.focusReturnPointNode) {
      write(() => focusFirstFocusableNode(this.focusReturnPointNode, false));
    }
  }

  @autobind
  private handleIFrameLoad(evt: React.SyntheticEvent<HTMLIFrameElement>) {
    const iframe = evt.target as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      this.setState({
        iframeHeight: iframe.contentWindow.document.body.scrollHeight,
      });
    }

    const {onIFrameLoad} = this.props;

    if (onIFrameLoad != null) {
      onIFrameLoad(evt);
    }
  }

  private handleEASDKMessaging() {
    const {easdk} = this.context;
    const {open} = this.props;
    if (easdk == null) {
      return;
    }

    if (open) {
      handleWarning('easdk', this.props);
      easdk.Modal.open(this.props);
    } else {
      easdk.Modal.close();
    }
  }
}

export type Warn = 'easdk' | 'modal';

function handleWarning(type: Warn, props: Props) {
  const reqProps = {
    modal: {
      open: 'open',
      onClose: 'onClose',
    },
    easdk: {
      open: 'open',
      src: 'src',
      onClose: 'onClose',
    },
  };

  const missingProps = Object.keys(reqProps[type]).reduce(
    (acc: string[], key) => {
      if (!props.hasOwnProperty(key)) {
        acc.push(key);
      }
      return acc;
    },
    [],
  );

  if (missingProps.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `These required properties are missing from Modal: ${missingProps.join(
        ', ',
      )}`,
    );
  }

  const actionWarnings = handleActionWanrings(
    props.primaryAction,
    props.secondaryActions,
  );

  if (type === 'easdk' && actionWarnings.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `Modals inside of an embedded app will ignore: ${actionWarnings.join(
        ', ',
      )}`,
    );
  }
}

function handleActionWanrings(
  primary: ComplexAction = {},
  secondary: ComplexAction[] = [],
): string[] {
  const actions = [primary, ...secondary];
  const actionKeysToIgnore = ['icon', 'loading'];
  return actions.reduce((acc: string[], action: ComplexAction | any) => {
    return acc.concat(
      ...actionKeysToIgnore.filter(
        (val: string) => action[val] && acc.indexOf(val) === -1 && val,
      ),
    );
  }, []);
}

export default withAppProvider<Props>()(Modal);
