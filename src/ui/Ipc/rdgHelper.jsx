import React, { useContext } from 'react';
import { useFocusRef } from '../useFocusRef';

const inputStopPropagation = (event) => {
  if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.stopPropagation();
  }
};

const commonColumnProperties = {
  resizable: true,
};

const generateColumns = (FilterContext, setFilters, channels, methods) => {
  const FilterRenderer = ({ isCellSelected, column, children }) => {
    const filters = useContext(FilterContext);
    const { ref, tabIndex } = useFocusRef(isCellSelected);

    return (
      <>
        <div>{column.name}</div>
        {filters.enabled && <div>{children({ ref, tabIndex, filters })}</div>}
      </>
    );
  };

  return [
    {
      key: 'id',
      name: 'ID',
      minWidth: 40,
      width: 50,
      cellClass: 'rdg-body-cell',
      headerCellClass: 'rdg-header-cell',
      frozen: true,
    },
    {
      key: 'time',
      name: '时间',
      minWidth: 80,
      width: 80,
      cellClass: 'rdg-body-cell',
      headerCellClass: 'rdg-header-cell',
    },
    {
      key: 'channel',
      name: '类型',
      width: 160,
      cellClass: 'rdg-body-cell',
      headerCellClass: 'rdg-header-cell filter-cell',
      headerRenderer: (p) => (
        <FilterRenderer {...p}>
          {({ filters, ...rest }) => (
            <select
              {...rest}
              className='filter'
              value={filters.channel}
              onChange={(e) => {
                setFilters({ ...filters, channel: e.target.value });
              }}
            >
              <option value=''>All</option>
              {Array.from(channels)
                .sort()
                .map((m) => (
                  <option title={m} key={m} value={m}>
                    {m}
                  </option>
                ))}
            </select>
          )}
        </FilterRenderer>
      ),
    },
    {
      key: 'method',
      name: '方法名称',
      width: 160,
      cellClass: 'rdg-body-cell',
      headerCellClass: 'rdg-header-cell filter-cell',
      headerRenderer: (p) => (
        <FilterRenderer {...p}>
          {({ filters, ...rest }) => (
            <select
              {...rest}
              className='filter'
              value={filters.method}
              onChange={(e) => {
                setFilters({ ...filters, method: e.target.value });
              }}
            >
              <option value=''>All</option>
              {Array.from(methods)
                .sort()
                .map((m) => (
                  <option title={m} key={m} value={m}>
                    {m}
                  </option>
                ))}
            </select>
          )}
        </FilterRenderer>
      ),
    },
    {
      key: 'send',
      name: '入参',
      cellClass: 'rdg-body-cell',
      headerCellClass: 'rdg-header-cell filter-cell',
      headerRenderer: (p) => (
        <FilterRenderer {...p}>
          {({ filters, ...rest }) => (
            <input
              {...rest}
              className='filter'
              value={filters.send}
              onChange={(e) => {
                setFilters({ ...filters, send: e.target.value });
              }}
              onKeyDown={inputStopPropagation}
            />
          )}
        </FilterRenderer>
      ),
    },
    {
      key: 'receive',
      name: '出参',
      cellClass: 'rdg-body-cell',
      headerCellClass: 'rdg-header-cell filter-cell',
      headerRenderer: (p) => (
        <FilterRenderer {...p}>
          {({ filters, ...rest }) => (
            <input
              {...rest}
              className='filter'
              value={filters.receive}
              onChange={(e) => {
                setFilters({ ...filters, receive: e.target.value });
              }}
              onKeyDown={inputStopPropagation}
            />
          )}
        </FilterRenderer>
      ),
    },
  ].map((c) => ({ ...c, ...commonColumnProperties }));
};

export { generateColumns };
