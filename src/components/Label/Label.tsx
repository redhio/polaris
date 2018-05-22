import * as React from 'react';
import {classNames} from '@redhio/react-utilities/styles';

import * as styles from './Label.scss';

export interface Props {
  children?: string;
  id: string;
  hidden?: boolean;
}

export function labelID(id: string) {
  return `${id}Label`;
}

export default function Label({children, id, hidden}: Props) {
  const className = classNames(styles.Label, hidden && styles.hidden);

  return (
    <div className={className}>
      <label id={labelID(id)} htmlFor={id} className={styles.Text}>
        {children}
      </label>
    </div>
  );
}
