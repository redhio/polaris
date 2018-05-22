import * as React from 'react';

import {autobind, debounce} from '@redhio/javascript-utilities/decorators';
import {classNames} from '@redhio/react-utilities/styles';
import {createUniqueIDFactory} from '@redhio/javascript-utilities/other';
import {Button, EventListener, Sticky} from '../';
import Select, {Option} from '../Select';
import EmptySearchResult from '../EmptySearchResult';
import {
  withAppProvider,
  WithAppProviderProps,
} from '../../components/AppProvider';
import CheckableButton from './components/CheckableButton';
import selectIcon from './icons/enable-selection.svg';
import Item from './components/Item';
import FilterControl from './components/FilterControl';
import {contextTypes, SelectedItems, SELECT_ALL_ITEMS} from './types';
import BulkActions, {Props as BulkActionsProps} from './components/BulkActions';

import * as styles from './ResourceList.scss';

const SMALL_SCREEN_WIDTH = 458;

export interface State {
  selectMode: boolean;
  listNode: HTMLElement | null;
}

export interface Props {
  /** Item data; each item is passed to renderItem */
  items: any[];
  filterControl?: React.ReactNode;
  /** Name of the resource, such as customers or products */
  resourceName?: {
    singular: string;
    plural: string;
  };
  /** Up to 2 bulk actions that will be given more prominence */
  promotedBulkActions?: BulkActionsProps['promotedActions'];
  /** Actions available on the currently selected items */
  bulkActions?: BulkActionsProps['actions'];
  /** Collection of IDs for the currently selected items */
  selectedItems?: SelectedItems;
  hasMoreItems?: boolean;
  /** Boolean to show or hide the header */
  showHeader?: boolean;
  /** Current value of the sort control */
  sortValue?: string;
  /** Collection of sort options to choose from */
  sortOptions?: Option[];
  /** Callback when sort option is changed */
  onSortChange?(selected: string, id: string): void;
  /** Callback when selection is changed */
  onSelectionChange?(selectedItems: SelectedItems): void;
  /** Function to render each list item	 */
  renderItem(item: any, id: string): React.ReactNode;
  /** Function to customize the unique ID for each item */
  idForItem?(item: any, index: number): string;
}

export interface Context {
  selectMode: boolean;
  selectable?: boolean;
  selectedItems?: SelectedItems;
  resourceName?: {
    singular: string;
    plural: string;
  };
  onSelectionChange?(selected: boolean, id: string): void;
  subscribe(callback: () => void): void;
  unsubscribe(callback: () => void): void;
}

export type CombinedProps = Props & WithAppProviderProps;

const getUniqueID = createUniqueIDFactory('Select');

export class ResourceList extends React.Component<CombinedProps, State> {
  static Item: typeof Item = Item;
  static FilterControl: typeof FilterControl = FilterControl;
  static childContextTypes = contextTypes;

  state: State = {
    selectMode: false,
    listNode: null,
  };

  private subscriptions: {(): void}[] = [];
  private defaultResourceName: {singular: string; plural: string};

  constructor(props: CombinedProps) {
    super(props);

    const {polaris: {intl}} = props;

    this.defaultResourceName = {
      singular: intl.translate('Polaris.ResourceList.defaultItemSingular'),
      plural: intl.translate('Polaris.ResourceList.defaultItemPlural'),
    };
  }

  private get selectable() {
    const {promotedBulkActions, bulkActions} = this.props;
    return Boolean(
      (promotedBulkActions && promotedBulkActions.length > 0) ||
        (bulkActions && bulkActions.length > 0),
    );
  }

  @autobind
  private get bulkSelectState(): boolean | 'indeterminate' {
    const {selectedItems, items} = this.props;
    let selectState: boolean | 'indeterminate' = 'indeterminate';
    if (
      !selectedItems ||
      (Array.isArray(selectedItems) && selectedItems.length === 0)
    ) {
      selectState = false;
    } else if (
      selectedItems === SELECT_ALL_ITEMS ||
      (Array.isArray(selectedItems) && selectedItems.length === items.length)
    ) {
      selectState = true;
    }
    return selectState;
  }

  @autobind
  private get itemCountText() {
    const {
      resourceName = this.defaultResourceName,
      items,
      polaris: {intl},
    } = this.props;

    const itemsCount = items.length;
    const resource =
      itemsCount === 1 ? resourceName.singular : resourceName.plural;

    return intl.translate('Polaris.ResourceList.showing', {
      itemsCount,
      resource,
    });
  }

  @autobind
  private get bulkActionsLabel() {
    const {selectedItems = [], items, polaris: {intl}} = this.props;

    const selectedItemsCount =
      selectedItems === SELECT_ALL_ITEMS
        ? `${items.length}+`
        : selectedItems.length;

    return intl.translate('Polaris.ResourceList.selected', {
      selectedItemsCount,
    });
  }

  @autobind
  private get bulkActionsAccessibilityLabel() {
    const {
      resourceName = this.defaultResourceName,
      selectedItems = [],
      items,
      polaris: {intl},
    } = this.props;

    const selectedItemsCount = selectedItems.length;
    const totalItemsCount = items.length;
    const allSelected = selectedItemsCount === totalItemsCount;

    if (totalItemsCount === 1 && allSelected) {
      return intl.translate(
        'Polaris.ResourceList.a11yCheckboxDeselectAllSingle',
        {resourceNameSingular: resourceName.singular},
      );
    } else if (totalItemsCount === 1) {
      return intl.translate(
        'Polaris.ResourceList.a11yCheckboxSelectAllSingle',
        {
          resourceNameSingular: resourceName.singular,
        },
      );
    } else if (allSelected) {
      return intl.translate(
        'Polaris.ResourceList.a11yCheckboxDeselectAllMultiple',
        {
          itemsLength: items.length,
          resourceNamePlural: resourceName.plural,
        },
      );
    } else {
      return intl.translate(
        'Polaris.ResourceList.a11yCheckboxSelectAllMultiple',
        {
          itemsLength: items.length,
          resourceNamePlural: resourceName.plural,
        },
      );
    }
  }

  @autobind
  private get paginatedSelectAllText() {
    const {
      hasMoreItems,
      selectedItems,
      items,
      resourceName = this.defaultResourceName,
      polaris: {intl},
    } = this.props;

    if (!this.selectable || !hasMoreItems) {
      return;
    }

    if (selectedItems === SELECT_ALL_ITEMS) {
      return intl.translate('Polaris.ResourceList.allItemsSelected', {
        itemsLength: items.length,
        resourceNamePlural: resourceName.plural,
      });
    }
  }

  @autobind
  private get paginatedSelectAllAction() {
    const {
      hasMoreItems,
      selectedItems,
      items,
      resourceName = this.defaultResourceName,
      polaris: {intl},
    } = this.props;

    if (!this.selectable || !hasMoreItems) {
      return;
    }

    const actionText =
      selectedItems === SELECT_ALL_ITEMS
        ? intl.translate('Polaris.Common.undo')
        : intl.translate('Polaris.ResourceList.selectAllItems', {
            itemsLength: items.length,
            resourceNamePlural: resourceName.plural,
          });

    return {
      content: actionText,
      onAction: this.handleSelectAllItemsInStore,
    };
  }

  private get emptySearchResultText() {
    const {
      polaris: {intl},
      resourceName = this.defaultResourceName,
    } = this.props;

    return {
      title: intl.translate('Polaris.ResourceList.emptySearchResultTitle', {
        resourceNamePlural: resourceName.plural,
      }),
      description: intl.translate(
        'Polaris.ResourceList.emptySearchResultDescription',
      ),
    };
  }

  getChildContext(): Context {
    const {selectedItems, resourceName = this.defaultResourceName} = this.props;
    const {selectMode} = this.state;
    return {
      selectable: this.selectable,
      selectedItems,
      selectMode,
      resourceName,
      onSelectionChange: this.handleSelectionChange,
      subscribe: this.subscribe,
      unsubscribe: this.unsubscribe,
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    const {selectedItems} = this.props;

    this.subscriptions.forEach((subscriberCallback) => subscriberCallback());
    if (
      selectedItems &&
      selectedItems.length > 0 &&
      (!nextProps.selectedItems || nextProps.selectedItems.length === 0) &&
      !isSmallScreen()
    ) {
      this.setState({selectMode: false});
    }
  }

  render() {
    const {
      items,
      promotedBulkActions,
      bulkActions,
      filterControl,
      showHeader = false,
      sortOptions,
      sortValue,
      onSortChange,
      polaris: {intl},
    } = this.props;
    const {selectMode, listNode = null} = this.state;
    const itemsExist = items.length > 0;

    const filterControlMarkup = filterControl ? (
      <div className={styles.FiltersWrapper}>{filterControl}</div>
    ) : null;

    const bulkActionsMarkup = this.selectable ? (
      <div className={styles.BulkActionsWrapper}>
        <BulkActions
          label={this.bulkActionsLabel}
          accessibilityLabel={this.bulkActionsAccessibilityLabel}
          selected={this.bulkSelectState}
          onToggleAll={this.handleToggleAll}
          selectMode={selectMode}
          onSelectModeToggle={this.handleSelectMode}
          promotedActions={promotedBulkActions}
          paginatedSelectAllAction={this.paginatedSelectAllAction}
          paginatedSelectAllText={this.paginatedSelectAllText}
          actions={bulkActions}
        />
        <EventListener event="resize" handler={this.handleResize} />
      </div>
    ) : null;

    const selectId = getUniqueID();

    const sortingLabelMarkup = (
      <label className={styles.SortLabel} htmlFor={selectId}>
        {intl.translate('Polaris.ResourceList.sortingLabel')}
      </label>
    );

    const sortingSelectMarkup =
      sortOptions && sortOptions.length > 0 ? (
        <div className={styles.SortWrapper}>
          {sortingLabelMarkup}
          <Select
            label={intl.translate('Polaris.ResourceList.sortingLabel')}
            labelHidden
            options={sortOptions}
            onChange={onSortChange}
            value={sortValue}
            disabled={selectMode}
          />
        </div>
      ) : null;

    const itemCountTextMarkup = (
      <div
        className={styles.ItemCountTextWrapper}
        testID="ItemCountTextWrapper"
      >
        {this.itemCountText}
      </div>
    );

    const selectButtonMarkup = this.selectable ? (
      <div className={styles.SelectButtonWrapper}>
        <Button
          disabled={selectMode}
          icon={selectIcon}
          // eslint-disable-next-line react/jsx-no-bind
          onClick={this.handleSelectMode.bind(this, true)}
        >
          {intl.translate('Polaris.ResourceList.selectButtonText')}
        </Button>
      </div>
    ) : null;

    const checkableButtonMarkup = this.selectable ? (
      <div className={styles.CheckableButtonWrapper}>
        <CheckableButton
          accessibilityLabel={this.bulkActionsAccessibilityLabel}
          label={this.itemCountText}
          onToggleAll={this.handleToggleAll}
          plain
        />
      </div>
    ) : null;

    const needsHeader =
      this.selectable || (sortOptions && sortOptions.length > 0);

    const headerMarkup = (showHeader || needsHeader) &&
      listNode &&
      itemsExist && (
        <div className={styles.HeaderOuterWrapper}>
          <Sticky boundingElement={listNode}>
            {(isSticky: boolean) => {
              const headerClassName = classNames(
                styles.HeaderWrapper,
                sortOptions &&
                  sortOptions.length > 0 &&
                  styles['HeaderWrapper-hasSort'],
                this.selectable && styles['HeaderWrapper-hasSelect'],
                this.selectable &&
                  selectMode &&
                  styles['HeaderWrapper-inSelectMode'],
                isSticky && styles['HeaderWrapper-isSticky'],
              );
              return (
                <div className={headerClassName} testID="ResourceList-Header">
                  <div className={styles.HeaderContentWrapper}>
                    {itemCountTextMarkup}
                    {checkableButtonMarkup}
                    {sortingSelectMarkup}
                    {selectButtonMarkup}
                  </div>
                  {bulkActionsMarkup}
                </div>
              );
            }}
          </Sticky>
        </div>
      );

    const emptyStateMarkup =
      filterControl && !itemsExist ? (
        <div className={styles.EmptySearchResultWrapper}>
          <EmptySearchResult {...this.emptySearchResultText} withIllustration />
        </div>
      ) : null;

    const listMarkup = itemsExist ? (
      <ul
        className={styles.ResourceList}
        ref={this.setListNode}
        aria-live="polite"
      >
        {items.map(this.renderItem)}
      </ul>
    ) : (
      emptyStateMarkup
    );

    return (
      <div className={styles.ResourceListWrapper}>
        {filterControlMarkup}
        {headerMarkup}
        {listMarkup}
      </div>
    );
  }

  @autobind
  subscribe(callback: () => void) {
    this.subscriptions.push(callback);
  }

  @autobind
  unsubscribe(callback: () => void) {
    this.subscriptions = this.subscriptions.filter(
      (subscription) => subscription !== callback,
    );
  }

  @debounce(50)
  @autobind
  private handleResize() {
    const {selectedItems} = this.props;
    const {selectMode} = this.state;

    if (
      selectedItems &&
      selectedItems.length === 0 &&
      selectMode &&
      !isSmallScreen()
    ) {
      this.handleSelectMode(false);
    }
  }

  @autobind
  private setListNode(node: HTMLElement | null) {
    if (node != null) {
      this.setState({listNode: node});
    }
  }

  @autobind
  private handleSelectAllItemsInStore() {
    const {
      onSelectionChange,
      selectedItems,
      items,
      idForItem = defaultIdForItem,
    } = this.props;

    const newlySelectedItems =
      selectedItems === SELECT_ALL_ITEMS
        ? getAllItemsOnPage(items, idForItem)
        : SELECT_ALL_ITEMS;

    if (onSelectionChange) {
      onSelectionChange(newlySelectedItems);
    }
  }

  @autobind
  private renderItem(item: any, index: number) {
    const {renderItem, idForItem = defaultIdForItem} = this.props;
    const id = idForItem(item, index);

    return (
      <li key={id} className={styles.ItemWrapper}>
        {renderItem(item, id)}
      </li>
    );
  }

  @autobind
  private handleSelectionChange(selected: boolean, id: string) {
    const {
      onSelectionChange,
      selectedItems,
      items,
      idForItem = defaultIdForItem,
    } = this.props;

    if (selectedItems == null || onSelectionChange == null) {
      return;
    }

    const newlySelectedItems =
      selectedItems === SELECT_ALL_ITEMS
        ? getAllItemsOnPage(items, idForItem)
        : [...selectedItems];

    if (selected) {
      newlySelectedItems.push(id);
    } else {
      newlySelectedItems.splice(newlySelectedItems.indexOf(id), 1);
    }

    if (newlySelectedItems.length === 0 && !isSmallScreen()) {
      this.handleSelectMode(false);
    } else if (newlySelectedItems.length > 0) {
      this.handleSelectMode(true);
    }

    if (onSelectionChange) {
      onSelectionChange(newlySelectedItems);
    }
  }

  @autobind
  private handleSelectMode(selectMode: boolean) {
    const {onSelectionChange} = this.props;
    this.setState({selectMode});
    if (!selectMode && onSelectionChange) {
      onSelectionChange([]);
    }
  }

  @autobind
  private handleToggleAll() {
    const {
      onSelectionChange,
      selectedItems,
      items,
      idForItem = defaultIdForItem,
    } = this.props;

    let newlySelectedItems: string[] = [];

    if (
      (Array.isArray(selectedItems) && selectedItems.length === items.length) ||
      selectedItems === SELECT_ALL_ITEMS
    ) {
      newlySelectedItems = [];
    } else {
      newlySelectedItems = items.map((item, index) => {
        const id = idForItem(item, index);
        return id;
      });
    }

    if (newlySelectedItems.length === 0 && !isSmallScreen()) {
      this.handleSelectMode(false);
    } else if (newlySelectedItems.length > 0) {
      this.handleSelectMode(true);
    }

    if (onSelectionChange) {
      onSelectionChange(newlySelectedItems);
    }
  }
}

function getAllItemsOnPage(
  items: any,
  idForItem: (item: any, index: number) => string,
) {
  return items.map((item: any, index: number) => {
    return idForItem(item, index);
  });
}

function defaultIdForItem(item: any, index: number) {
  return item.hasOwnProperty('id') ? item.id : index.toString();
}

function isSmallScreen() {
  return typeof window === 'undefined'
    ? false
    : window.innerWidth <= SMALL_SCREEN_WIDTH;
}

export default withAppProvider<Props>()(ResourceList);
