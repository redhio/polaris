import * as React from 'react';
import {classNames} from '@redhio/react-utilities/styles';
import {Transition, CSSTransition} from 'react-transition-group';
import {KeypressListener} from '../../../../components';
import memoizedBind from '../../../../utilities/memoized-bind';
import {TrapFocus} from '../../../Focus';
import {Duration} from '../../../shared';
import {AnimationProps, Keys} from '../../../../types';
import * as styles from './Dialog.scss';

export interface DialogProps {
  labelledBy: string;
  instant?: boolean;
  children?: React.ReactNode;
  limitHeight?: boolean;
  large?: boolean;
  onClose(): void;
  onEntered?(): void;
  onExited?(): void;
}

export type Props = DialogProps & AnimationProps;

function DialogContainer(props: {children: React.ReactNode}) {
  return <div className={styles.Container}>{props.children}</div>;
}

export default function Dialog({
  instant,
  labelledBy,
  children,
  onClose,
  onExited,
  onEntered,
  large,
  limitHeight,
  ...props
}: Props) {
  const classes = classNames(
    styles.Modal,
    large && styles.sizeLarge,
    limitHeight && styles.limitHeight,
  );
  const handleClose = memoizedBind(onClose);
  const animation = large ? ScaleIn : FadeUp;
  const TransitionChild = instant ? Transition : animation;

  return (
    <TransitionChild
      {...props}
      data-polaris-layer
      data-polaris-overlay
      mountOnEnter
      unmountOnExit
      timeout={Duration.Base}
      onEntered={onEntered}
      onExited={onExited}
    >
      <DialogContainer>
        <TrapFocus>
          <div
            className={classes}
            role="dialog"
            aria-labelledby={labelledBy}
            tabIndex={-1}
          >
            <KeypressListener
              keyCode={Keys.ESCAPE}
              handler={handleClose}
              testID="CloseKeypressListener"
            />
            {children}
          </div>
        </TrapFocus>
      </DialogContainer>
    </TransitionChild>
  );
}

const fadeUpClasses = {
  enter: classNames(styles.animateFadeUp, styles.entering),
  enterActive: classNames(styles.animateFadeUp, styles.entered),
  exit: classNames(styles.animateFadeUp, styles.exiting),
  exitActive: classNames(styles.animateFadeUp, styles.exited),
};

function FadeUp({children, ...props}: any) {
  return (
    <CSSTransition {...props} classNames={fadeUpClasses}>
      {children}
    </CSSTransition>
  );
}

const scaleInClasses = {
  enter: classNames(styles.animateScaleIn, styles.entering),
  enterActive: classNames(styles.animateScaleIn, styles.entered),
  exit: classNames(styles.animateScaleIn, styles.exiting),
  exitActive: classNames(styles.animateScaleIn, styles.exited),
};

function ScaleIn({children, ...props}: any) {
  return (
    <CSSTransition {...props} classNames={scaleInClasses}>
      {children}
    </CSSTransition>
  );
}
