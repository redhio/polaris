import * as React from 'react';
import {SVGSource} from '@redhio/images';
import {classNames, variationName} from '@redhio/react-utilities/styles';

import {
  add,
  alert,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  arrowUpDown,
  calendar,
  cancel,
  cancelSmall,
  caretDown,
  caretUp,
  checkmark,
  chevronDown,
  chevronLeft,
  chevronRight,
  chevronUp,
  circleCancel,
  circleChevronDown,
  circleChevronLeft,
  circleChevronRight,
  circleChevronUp,
  circlePlus,
  conversation,
  delete as deleteIcon,
  disable,
  dispute,
  duplicate,
  embed,
  export as exportIcon,
  external,
  help,
  horizontalDots,
  import as importIcon,
  notes,
  notification,
  print,
  refresh,
  risk,
  save,
  search,
  subtract,
  view,
} from '../../icons';

import * as styles from './Icon.scss';

export type Color =
  | 'white'
  | 'black'
  | 'skyLighter'
  | 'skyLight'
  | 'sky'
  | 'skyDark'
  | 'inkLightest'
  | 'inkLighter'
  | 'inkLight'
  | 'ink'
  | 'blueLighter'
  | 'blueLight'
  | 'blue'
  | 'blueDark'
  | 'blueDarker'
  | 'indigoLighter'
  | 'indigoLight'
  | 'indigo'
  | 'indigoDark'
  | 'indigoDarker'
  | 'tealLighter'
  | 'tealLight'
  | 'teal'
  | 'tealDark'
  | 'tealDarker'
  | 'greenLighter'
  | 'green'
  | 'greenDark'
  | 'yellowLighter'
  | 'yellow'
  | 'yellowDark'
  | 'orange'
  | 'redLighter'
  | 'red'
  | 'redDark'
  | 'purple';

export const BUNDLED_ICONS = {
  add,
  alert,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  arrowUpDown,
  calendar,
  cancel,
  cancelSmall,
  caretDown,
  caretUp,
  checkmark,
  chevronDown,
  chevronLeft,
  chevronRight,
  chevronUp,
  circleCancel,
  circleChevronDown,
  circleChevronLeft,
  circleChevronRight,
  circleChevronUp,
  circlePlus,
  conversation,
  delete: deleteIcon,
  disable,
  dispute,
  duplicate,
  embed,
  export: exportIcon,
  external,
  help,
  horizontalDots,
  import: importIcon,
  notes,
  notification,
  print,
  refresh,
  risk,
  save,
  search,
  subtract,
  view,
};

const COLORS_WITH_BACKDROPS = [
  'teal',
  'tealDark',
  'greenDark',
  'redDark',
  'yellowDark',
  'ink',
  'inkLighter',
];

export type IconSource = SVGSource | 'placeholder' | keyof typeof BUNDLED_ICONS;
export interface Props {
  /** The SVG contents to display in the icon */
  source: IconSource;
  /** Sets the color for the SVG fill */
  color?: Color;
  /** Show a backdrop behind the icon */
  backdrop?: boolean;
  /** Descriptive text to be read to screenreaders */
  accessibilityLabel?: string;
}

export default function Icon({
  source,
  color,
  backdrop,
  accessibilityLabel,
}: Props) {
  if (color && backdrop && COLORS_WITH_BACKDROPS.indexOf(color) < 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `The ${color} icon doesn’t accept backdrops. The icon colors that have backdrops are: ${COLORS_WITH_BACKDROPS.join(
        ', ',
      )}`,
    );
  }

  const className = classNames(
    styles.Icon,
    color && styles[variationName('color', color)],
    color && color !== 'white' && styles.isColored,
    backdrop && styles.hasBackdrop,
  );

  let contentMarkup: React.ReactNode;

  if (source === 'placeholder') {
    contentMarkup = <div className={styles.Placeholder} />;
  } else {
    const iconSource =
      typeof source === 'string' ? BUNDLED_ICONS[source] : source;
    contentMarkup = (
      <svg
        className={styles.Svg}
        viewBox={iconSource.viewBox}
        dangerouslySetInnerHTML={{__html: iconSource.body}}
        focusable="false"
        aria-hidden="true"
      />
    );
  }

  return (
    <span className={className} aria-label={accessibilityLabel}>
      {contentMarkup}
    </span>
  );
}
