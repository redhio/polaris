import * as React from 'react';
import {classNames, variationName} from '@redhio/react-utilities/styles';
import * as styles from './SkeletonDisplayText.scss';

export type Size = 'small' | 'medium' | 'large' | 'extraLarge';

export interface Props {
  /**
   * Size of the text
   * @default 'medium'
   */
  size?: Size;
}

export default function SkeletonDisplayText({size = 'medium'}: Props) {
  const className = classNames(
    styles.DisplayText,
    size && styles[variationName('size', size)],
  );

  return <div className={className} />;
}
