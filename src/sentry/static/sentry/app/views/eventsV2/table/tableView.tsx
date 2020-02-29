import React from 'react';
import styled from '@emotion/styled';
import {Location} from 'history';

import {Organization} from 'app/types';
import {trackAnalyticsEvent} from 'app/utils/analytics';
import GridEditable, {COL_WIDTH_UNDEFINED} from 'app/components/gridEditable';
import {IconEvent, IconStack} from 'app/icons';
import {t} from 'app/locale';
import {assert} from 'app/types/utils';
import BaseLink from 'app/components/links/baseLink';
import Tooltip from 'app/components/tooltip';

import {
  downloadAsCsv,
  getAggregateAlias,
  getFieldRenderer,
  getExpandedResults,
  pushEventViewToLocation,
  explodeField,
  MetaType,
} from '../utils';
import EventView, {pickRelevantLocationQueryStrings} from '../eventView';
import SortLink, {Alignments} from '../sortLink';
import renderTableModalEditColumnFactory from './tableModalEditColumn';
import {TableColumn, TableData, TableDataRow} from './types';
import {ColumnValueType} from '../eventQueryParams';
import DraggableColumns, {
  DRAGGABLE_COLUMN_CLASSNAME_IDENTIFIER,
} from './draggableColumns';
import {generateEventDetailsRoute, generateEventSlug} from '../eventDetails/utils';

export type TableViewProps = {
  location: Location;
  organization: Organization;

  isLoading: boolean;
  error: string | null;

  eventView: EventView;
  tableData: TableData | null | undefined;
  tagKeys: null | string[];
  title: string;
};

/**
 * The `TableView` is marked with leading _ in its method names. It consumes
 * the EventView object given in its props to generate new EventView objects
 * for actions such as creating new columns, updating columns, sorting columns,
 * and re-ordering columns.
 */
class TableView extends React.Component<TableViewProps> {
  /**
   * The entire state of the table view (or event view) is co-located within
   * the EventView object. This object is fed from the props.
   *
   * Attempting to modify the state, and therefore, modifying the given EventView
   * object given from its props, will generate new instances of EventView objects.
   *
   * In most cases, the new EventView object differs from the previous EventView
   * object. The new EventView object is pushed to the location object.
   */
  _createColumn = (
    nextColumn: TableColumn<keyof TableDataRow>,
    insertAt: number | undefined
  ) => {
    const {location, eventView, organization} = this.props;

    let nextEventView: EventView;
    const payload = {
      aggregation: String(nextColumn.aggregation),
      field: String(nextColumn.field),
      fieldname: nextColumn.name,
      width: COL_WIDTH_UNDEFINED,
    };

    if (typeof insertAt === 'number') {
      // create and insert a column at a specific index
      nextEventView = eventView.withNewColumnAt(payload, insertAt);

      // metrics
      trackAnalyticsEvent({
        eventKey: 'discover_v2.add_column',
        eventName: 'Discoverv2: Add a new column at an index',
        insert_at_index: insertAt,
        organization_id: parseInt(organization.id, 10),
        ...payload,
      });
    } else {
      // create and insert a column at the right end of the table
      nextEventView = eventView.withNewColumn(payload);

      // metrics
      trackAnalyticsEvent({
        eventKey: 'discover_v2.add_column.right_end',
        eventName: 'Discoverv2: Add a new column at the right end of the table',
        organization_id: parseInt(organization.id, 10),
        ...payload,
      });
    }

    pushEventViewToLocation({
      location,
      nextEventView,
      extraQuery: pickRelevantLocationQueryStrings(location),
    });
  };

  /**
   * Please read the comment on `_createColumn`
   */
  _updateColumn = (columnIndex: number, nextColumn: TableColumn<keyof TableDataRow>) => {
    const {location, eventView, tableData, organization} = this.props;

    const payload = {
      aggregation: String(nextColumn.aggregation),
      field: String(nextColumn.field),
      width: nextColumn.width ? Number(nextColumn.width) : COL_WIDTH_UNDEFINED,
    };

    const tableMeta = (tableData && tableData.meta) || undefined;
    const nextEventView = eventView.withUpdatedColumn(columnIndex, payload, tableMeta);

    if (nextEventView !== eventView) {
      const changed: string[] = [];

      const prevField = explodeField(eventView.fields[columnIndex]);
      const nextField = explodeField(nextEventView.fields[columnIndex]);

      const aggregationChanged = prevField.aggregation !== nextField.aggregation;
      const fieldChanged = prevField.field !== nextField.field;
      const widthChanged = prevField.width !== nextField.width;

      if (aggregationChanged) {
        changed.push('aggregate');
      }

      if (fieldChanged) {
        changed.push('field');
      }

      if (widthChanged) {
        changed.push('width');
      }

      trackAnalyticsEvent({
        eventKey: 'discover_v2.update_column',
        eventName: 'Discoverv2: A column was updated',
        updated_at_index: columnIndex,
        changed,
        organization_id: parseInt(organization.id, 10),
        ...payload,
      });
    }

    pushEventViewToLocation({
      location,
      nextEventView,
      extraQuery: pickRelevantLocationQueryStrings(location),
    });
  };

  /**
   * Please read the comment on `_createColumn`
   */
  _deleteColumn = (columnIndex: number) => {
    const {location, eventView, tableData, organization} = this.props;

    const prevField = explodeField(eventView.fields[columnIndex]);

    const tableMeta = (tableData && tableData.meta) || undefined;
    const nextEventView = eventView.withDeletedColumn(columnIndex, tableMeta);

    // metrics
    trackAnalyticsEvent({
      eventKey: 'discover_v2.delete_column',
      eventName: 'Discoverv2: A column was deleted',
      deleted_at_index: columnIndex,
      organization_id: parseInt(organization.id, 10),
      aggregation: prevField.aggregation,
      field: prevField.field,
    });

    pushEventViewToLocation({
      location,
      nextEventView,
      extraQuery: pickRelevantLocationQueryStrings(location),
    });
  };

  /**
   * Please read the comment on `_createColumn`
   */
  _moveColumnCommit = (fromIndex: number, toIndex: number) => {
    const {location, eventView, organization} = this.props;

    const prevField = explodeField(eventView.fields[fromIndex]);
    const nextEventView = eventView.withMovedColumn({fromIndex, toIndex});

    // metrics
    trackAnalyticsEvent({
      eventKey: 'discover_v2.move_column',
      eventName: 'Discoverv2: A column was moved',
      from_index: fromIndex,
      to_index: toIndex,
      organization_id: parseInt(organization.id, 10),
      aggregation: prevField.aggregation,
      field: prevField.field,
    });

    pushEventViewToLocation({
      location,
      nextEventView,
      extraQuery: pickRelevantLocationQueryStrings(location),
    });
  };

  _renderPrependColumns = (
    isHeader: boolean,
    dataRow?: any,
    rowIndex?: number
  ): React.ReactNode[] => {
    const {eventView} = this.props;
    const hasAggregates = eventView.getAggregateFields().length > 0;
    if (isHeader) {
      return [
        <HeaderIcon key="header-icon">
          {hasAggregates ? <IconStack size="sm" /> : <IconEvent size="sm" />}
        </HeaderIcon>,
      ];
    }
    const {organization, location} = this.props;
    const eventSlug = generateEventSlug(dataRow);
    const pathname = generateEventDetailsRoute({
      orgSlug: organization.slug,
      eventSlug,
    });
    const target = {
      pathname,
      query: {...location.query},
    };

    return [
      <Tooltip key={`eventlink${rowIndex}`} title={t('View Details')}>
        <IconLink to={target} data-test-id="view-events">
          {hasAggregates ? <IconStack size="sm" /> : <IconEvent size="sm" />}
        </IconLink>
      </Tooltip>,
    ];
  };

  _renderGridHeaderCell = (column: TableColumn<keyof TableDataRow>): React.ReactNode => {
    const {eventView, location, tableData} = this.props;
    const field = column.eventViewField;

    // establish alignment based on the type
    const alignedTypes: ColumnValueType[] = ['number', 'duration', 'integer'];
    let align: Alignments = alignedTypes.includes(column.type) ? 'right' : 'left';

    if (column.type === 'never' || column.type === '*') {
      // fallback to align the column based on the table metadata
      const maybeType =
        tableData && tableData.meta
          ? tableData.meta[getAggregateAlias(field.field)]
          : undefined;

      if (maybeType === 'integer' || maybeType === 'number') {
        align = 'right';
      }
    }

    return (
      <SortLink
        align={align}
        field={field}
        location={location}
        eventView={eventView}
        /* TODO(leedongwei): Verbosity is due to error in Prettier, fix after
           upgrade to v1.19.1 */
        tableDataMeta={tableData && tableData.meta ? tableData.meta : undefined}
      />
    );
  };

  _renderGridBodyCell = (
    column: TableColumn<keyof TableDataRow>,
    dataRow: TableDataRow
  ): React.ReactNode => {
    const {location, organization, tableData, eventView} = this.props;

    if (!tableData || !tableData.meta) {
      return dataRow[column.key];
    }

    return (
      <ExpandAggregateRow
        eventView={eventView}
        column={column}
        dataRow={dataRow}
        location={location}
        tableMeta={tableData.meta}
      >
        {({willExpand}) => {
          // NOTE: TypeScript cannot detect that tableData.meta is truthy here
          //       since there was a condition guard to handle it whenever it is
          //       falsey. So we assert it here.
          assert(tableData.meta);

          if (!willExpand) {
            const fieldRenderer = getFieldRenderer(String(column.key), tableData.meta);
            return fieldRenderer(dataRow, {organization, location});
          }

          const fieldRenderer = getFieldRenderer(String(column.key), tableData.meta);
          return fieldRenderer(dataRow, {organization, location});
        }}
      </ExpandAggregateRow>
    );
  };

  generateColumnOrder = ({
    initialColumnIndex,
    destinationColumnIndex,
  }: {
    initialColumnIndex: undefined | number;
    destinationColumnIndex: undefined | number;
  }) => {
    const {eventView} = this.props;
    const columnOrder = eventView.getColumns();

    if (
      typeof destinationColumnIndex !== 'number' ||
      typeof initialColumnIndex !== 'number'
    ) {
      return columnOrder;
    }

    if (destinationColumnIndex === initialColumnIndex) {
      const currentDraggingColumn: TableColumn<keyof TableDataRow> = {
        ...columnOrder[destinationColumnIndex],
        isDragging: true,
      };

      columnOrder[destinationColumnIndex] = currentDraggingColumn;

      return columnOrder;
    }

    const nextColumnOrder = [...columnOrder];

    nextColumnOrder.splice(
      destinationColumnIndex,
      0,
      nextColumnOrder.splice(initialColumnIndex, 1)[0]
    );

    const currentDraggingColumn: TableColumn<keyof TableDataRow> = {
      ...nextColumnOrder[destinationColumnIndex],
      isDragging: true,
    };
    nextColumnOrder[destinationColumnIndex] = currentDraggingColumn;

    return nextColumnOrder;
  };

  onToggleEdit = (isEditing: boolean) => {
    const {organization} = this.props;

    if (isEditing) {
      // metrics
      trackAnalyticsEvent({
        eventKey: 'discover_v2.table.column_header.edit_mode.enter',
        eventName: 'Discoverv2: Enter column header edit mode',
        organization_id: parseInt(organization.id, 10),
      });
    } else {
      // metrics
      trackAnalyticsEvent({
        eventKey: 'discover_v2.table.column_header.edit_mode.exit',
        eventName: 'Discoverv2: Exit column header edit mode',
        organization_id: parseInt(organization.id, 10),
      });
    }
  };

  render() {
    const {
      organization,
      isLoading,
      error,
      tableData,
      tagKeys,
      eventView,
      title,
    } = this.props;

    const columnOrder = eventView.getColumns();
    const columnSortBy = eventView.getSorts();

    const {
      renderModalBodyWithForm,
      renderModalFooter,
    } = renderTableModalEditColumnFactory(organization, tagKeys, {
      createColumn: this._createColumn,
      updateColumn: this._updateColumn,
    });

    return (
      <DraggableColumns
        columnOrder={columnOrder}
        onDragDone={({draggingColumnIndex, destinationColumnIndex}) => {
          if (
            typeof draggingColumnIndex === 'number' &&
            typeof destinationColumnIndex === 'number' &&
            draggingColumnIndex !== destinationColumnIndex
          ) {
            this._moveColumnCommit(draggingColumnIndex, destinationColumnIndex);
          }
        }}
      >
        {({
          isColumnDragging,
          startColumnDrag,
          draggingColumnIndex,
          destinationColumnIndex,
        }) => {
          return (
            <GridEditable
              editFeatures={['organizations:discover-query']}
              noEditMessage={t('Requires discover query feature.')}
              onToggleEdit={this.onToggleEdit}
              isColumnDragging={isColumnDragging}
              gridHeadCellButtonProps={{className: DRAGGABLE_COLUMN_CLASSNAME_IDENTIFIER}}
              isLoading={isLoading}
              error={error}
              data={tableData ? tableData.data : []}
              columnOrder={this.generateColumnOrder({
                initialColumnIndex: draggingColumnIndex,
                destinationColumnIndex,
              })}
              columnSortBy={columnSortBy}
              grid={{
                renderHeadCell: this._renderGridHeaderCell as any,
                renderBodyCell: this._renderGridBodyCell as any,
                onResizeColumn: this._updateColumn as any,
                renderPrependColumns: this._renderPrependColumns as any,
                prependColumnWidths: ['40px'],
              }}
              modalEditColumn={{
                renderBodyWithForm: renderModalBodyWithForm as any,
                renderFooter: renderModalFooter,
              }}
              actions={{
                deleteColumn: this._deleteColumn,
                moveColumnCommit: this._moveColumnCommit,
                onDragStart: startColumnDrag,
                downloadAsCsv: () => downloadAsCsv(tableData, columnOrder, title),
              }}
            />
          );
        }}
      </DraggableColumns>
    );
  }
}

const ExpandAggregateRow = (props: {
  children: ({willExpand: boolean}) => React.ReactNode;
  eventView: EventView;
  column: TableColumn<keyof TableDataRow>;
  dataRow: TableDataRow;
  location: Location;
  tableMeta: MetaType;
}) => {
  const {children, column, dataRow, eventView, location} = props;
  const {eventViewField} = column;

  const exploded = explodeField(eventViewField);
  const {aggregation} = exploded;

  if (aggregation === 'count') {
    const nextView = getExpandedResults(eventView, {}, dataRow);

    const target = {
      pathname: location.pathname,
      query: nextView.generateQueryStringObject(),
    };

    return <BaseLink to={target}>{children({willExpand: true})}</BaseLink>;
  }

  return <React.Fragment>{children({willExpand: false})}</React.Fragment>;
};

const HeaderIcon = styled('span')`
  & > svg {
    vertical-align: top;
    color: ${p => p.theme.gray3};
  }
`;

// Fudge the icon down so it is center aligned with the table contents.
const IconLink = styled(BaseLink)`
  position: relative;
  display: inline-block;
  top: 3px;
`;

export default TableView;
