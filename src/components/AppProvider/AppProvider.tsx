import * as React from 'react';
import EASDK from './EASDK';

import {LinkLikeComponent} from '../UnstyledLink';

import Intl from './Intl';
import Link from './Link';
import StickyManager from './StickyManager';
import {createPolarisContext} from './utils';
import {polarisAppProviderContextTypes, TranslationDictionary} from './types';

export interface Props {
  /** A locale object or array of locale objects that overrides default translations */
  i18n?: TranslationDictionary | TranslationDictionary[];
  /** A custom component to use for all links used by Polaris components */
  linkComponent?: LinkLikeComponent;
  /** The API key for your application from the Partner dashboard */
  apiKey?: string;
  /** The current shop’s origin, provided in the session from the Redhio API */
  shopOrigin?: string;
  /** Forces a redirect to the relative admin path when not rendered in an iframe */
  forceRedirect?: boolean;
  /** Prints logs of each message passed through the EASDK */
  debug?: boolean;
  /** A class used to manage Sticky components elements in a container */
  stickyManager?: StickyManager;
}

export interface Context {
  polaris: {intl: Intl; link: Link; stickyManager: StickyManager};
  easdk?: EASDK;
}

export default class AppProvider extends React.Component<Props> {
  static childContextTypes = polarisAppProviderContextTypes;
  public polarisContext: Context;
  private stickyManager: StickyManager;

  constructor(props: Props) {
    super(props);
    this.stickyManager = new StickyManager();
    this.polarisContext = createPolarisContext({
      ...props,
      stickyManager: this.stickyManager,
    });
  }

  componentDidMount() {
    if (document != null) {
      this.stickyManager.setContainer(document);
    }
  }

  componentWillReceiveProps({
    i18n,
    linkComponent,
    apiKey,
    shopOrigin,
    forceRedirect,
    debug,
  }: Props) {
    if (
      i18n !== this.props.i18n ||
      linkComponent !== this.props.linkComponent ||
      apiKey !== this.props.apiKey ||
      shopOrigin !== this.props.shopOrigin ||
      forceRedirect !== this.props.forceRedirect ||
      debug !== this.props.debug
    ) {
      const stickyManager = this.stickyManager;
      this.polarisContext = createPolarisContext({
        i18n,
        linkComponent,
        apiKey,
        shopOrigin,
        forceRedirect,
        debug,
        stickyManager,
      });
    }
  }

  getChildContext(): Context {
    return this.polarisContext;
  }

  render() {
    return React.Children.only(this.props.children);
  }
}
