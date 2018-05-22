import * as React from 'react';
import {classNames} from '@redhio/react-utilities/styles';
import * as styles from './Layout.scss';

export interface Props {
  children?: React.ReactNode;
  secondary?: boolean;
  fullWidth?: boolean;
}

export default function Section({children, secondary, fullWidth}: Props) {
  const className = classNames(
    styles.Section,
    secondary && styles['Section-secondary'],
    fullWidth && styles['Section-fullWidth'],
  );

  return <div className={className}>{children}</div>;
}
