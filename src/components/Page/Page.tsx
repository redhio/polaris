import * as React from 'react';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import {classNames} from '@redhio/react-utilities/styles';

import {IconableAction, DisableableAction, LoadableAction} from '../../types';
import {PaginationDescriptor} from '../Pagination';
import {Props as BreadcrumbProps} from '../Breadcrumbs';
import {withAppProvider, WithAppProviderProps} from '../AppProvider';

import Header, {ActionGroup, Props as HeaderProps} from './Header';

import * as styles from './Page.scss';

export type SecondaryAction = IconableAction & DisableableAction;

export interface HeaderProps {
  /** Page title, in large type */
  title: string;
  /** Visually hide the title */
  titleHidden?: boolean;
  /** App icon, for pages that are part of Redhio apps */
  icon?: string;
  /** Collection of breadcrumbs */
  breadcrumbs?: BreadcrumbProps['breadcrumbs'];
  /** Adds a border to the bottom of the page header */
  separator?: boolean;
  /** Collection of secondary page-level actions */
  secondaryActions?: SecondaryAction[];
  /** Collection of page-level groups of secondary actions */
  actionGroups?: ActionGroup[];
  /** Primary page-level action */
  primaryAction?: DisableableAction & LoadableAction;
  /** Page-level pagination */
  pagination?: PaginationDescriptor;
}

export interface Props extends HeaderProps {
  /** The contents of the page */
  children?: React.ReactNode;
  /** Remove the normal max-width on the page */
  fullWidth?: boolean;
  /** Decreases the maximum layout width. Intended for single-column layouts */
  singleColumn?: boolean;
}

export type ComposedProps = Props & WithAppProviderProps;

const EASDK_PROPS: (keyof Props)[] = [
  'title',
  'icon',
  'breadcrumbs',
  'secondaryActions',
  'actionGroups',
  'primaryAction',
  'pagination',
];

export class Page extends React.PureComponent<ComposedProps, never> {
  componentDidMount() {
    if (this.props.polaris.easdk == null) {
      return;
    }
    this.handleEASDKMessaging();
  }

  componentDidUpdate(prevProps: ComposedProps) {
    if (this.props.polaris.easdk == null) {
      return;
    }

    const prevEASDKProps = pick(prevProps, EASDK_PROPS);
    const currentEASDKProps = pick(this.props, EASDK_PROPS);

    if (!isEqual(prevEASDKProps, currentEASDKProps)) {
      this.handleEASDKMessaging();
    }
  }

  render() {
    const {children, fullWidth, singleColumn, ...rest} = this.props;

    const className = classNames(
      styles.Page,
      fullWidth && styles.fullWidth,
      singleColumn && styles.singleColumn,
    );

    const headerMarkup =
      this.props.polaris.easdk || !this.hasHeaderContent() ? null : (
        <Header {...rest} />
      );

    return (
      <div className={className}>
        {headerMarkup}
        <div className={styles.Content}>{children}</div>
      </div>
    );
  }

  private handleEASDKMessaging() {
    const {easdk} = this.props.polaris;

    if (easdk) {
      easdk.Bar.update(this.props);
    }
  }

  private hasHeaderContent() {
    const {title, primaryAction, secondaryActions, breadcrumbs} = this.props;
    return (
      (title && title !== '') ||
      primaryAction ||
      (secondaryActions && secondaryActions.length > 0) ||
      (breadcrumbs && breadcrumbs.length > 0)
    );
  }
}

export default withAppProvider<Props>()(Page);
