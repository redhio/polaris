import * as React from 'react';
import {classNames} from '@redhio/react-utilities/styles';
import {noop} from '@redhio/javascript-utilities/other';
import {autobind} from '@redhio/javascript-utilities/decorators';
import {Months, isSameDay} from '@redhio/javascript-utilities/dates';

import * as styles from './DatePicker.scss';

export interface Props {
  focused?: boolean;
  day?: Date;
  selected?: boolean;
  inRange?: boolean;
  inHoveringRange?: boolean;
  disabled?: boolean;
  onClick?(day: Date): void;
  onHover?(day: Date): void;
  onFocus?(day: Date): void;
}

export default class Day extends React.PureComponent<Props, never> {
  private dayNode: HTMLElement | null = null;

  componentDidUpdate() {
    if (this.props.focused && this.dayNode) {
      this.dayNode.focus();
    }
  }

  render() {
    const {
      day,
      focused,
      onClick,
      onHover = noop,
      onFocus = noop,
      selected,
      inRange,
      inHoveringRange,
      disabled,
    } = this.props;

    const handleHover = onHover.bind(null, day);
    if (!day) {
      return <div className={styles.EmptyDay} onMouseOver={handleHover} />;
    }
    const handleClick = onClick && !disabled ? onClick.bind(null, day) : noop;
    const today = isSameDay(new Date(), day);
    const className = classNames(
      styles.Day,
      selected && styles['Day-selected'],
      disabled && styles['Day-disabled'],
      today && styles['Day-today'],
      (inRange || inHoveringRange) && !disabled && styles['Day-inRange'],
    );
    const date = day.getDate();
    const tabIndex =
      (focused || selected || today || date === 1) && !disabled ? 0 : -1;
    const ariaLabel = [
      `${today ? 'Today ' : ''}`,
      `${Months[day.getMonth()]} `,
      `${date} `,
      `${day.getFullYear()}`,
    ].join('');

    return (
      <button
        // eslint-disable-next-line react/jsx-no-bind
        onFocus={onFocus.bind(null, day)}
        ref={this.setNode}
        tabIndex={tabIndex}
        className={className}
        onMouseOver={handleHover}
        onClick={handleClick}
        aria-label={ariaLabel}
        aria-selected={selected}
        aria-disabled={disabled}
        role="gridcell"
      >
        {date}
      </button>
    );
  }

  @autobind
  private setNode(node: HTMLElement | null) {
    this.dayNode = node;
  }
}
