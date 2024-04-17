import React, { useState, useEffect, useRef, useMemo, createContext } from 'react';
import ResizableTable from '../ResizableTable/ResizableTable';
import DataGrid from 'react-data-grid';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import JsonView from 'react-json-view';
import NoMessageSelected from '../NoMessageSelected/NoMessageSelected';
import { logger } from '../../utils/logger.js';
import { generateColumns } from './rdgHelper';
import { startCapturingIpc, stopCapturingIpc, getIpcMessages, clearIpcMessages } from '../../capturer/ipc';
import { makeMessages, getParsedMessage, getMessageTypes } from './messageHelper';

import './Ipc.scss';
import '../react-tabs.scss';

const INTERVAL = 1000;

const FilterContext = createContext(undefined);

const Ipc = () => {
  const [capturing, setCapturing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [filters, setFilters] = useState({
    channel: '',
    method: '',
    send: '',
    receive: '',
    enabled: false,
  });
  const [selectedRow, setSelectedRow] = useState();
  // 是否倒序排列
  const [reverseOrder, setReverseOrder] = useState(false);
  const timer = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    toggleCapturing();
  }, []);

  const channels = getMessageTypes(messages, 'channel');
  const methods = getMessageTypes(messages, 'method');

  const columns = useMemo(() => {
    return generateColumns(FilterContext, setFilters, channels, methods);
  }, [setFilters, channels.length, methods.length]);

  const filteredRows = useMemo(() => {
    const messageList = messages
      .map((msg, index) => {
        msg.id = index;
        return msg;
      })
      .filter((r) => {
        return (
          (filters.time ? r.time && r.time.includes(filters.time) : true) &&
          (filters.channel ? r.channel && r.channel === filters.channel : true) &&
          (filters.method ? r.method && r.method === filters.method : true) &&
          (filters.send ? r.send && r.send.includes(filters.send) : true) &&
          (filters.receive ? r.receive && r.receive.includes(filters.receive) : true)
        );
      });
    return reverseOrder ? messageList.reverse() : messageList;
  }, [messages, filters, reverseOrder]);

  const addMessages = () => {
    getIpcMessages()
      .then((newRawMessages) => {
        let newMsgs = makeMessages(newRawMessages);

        setMessages(newMsgs);
      })
      .catch((error) => {
        console.error(error.stack || error);
      });
  };

  const clearMessages = () => {
    clearIpcMessages().then(() => {
      setMessages([]);
      setSelectedRow(null);
    });
  };

  const toggleCapturing = () => {
    if (capturing === true) {
      stopCapturingIpc()
        .then(() => {
          setCapturing(false);
          clearInterval(timer.current);
          timer.current = null;
        })
        .catch((error) => {
          console.error(error.stack || error);
        });
    } else {
      startCapturingIpc()
        .then(() => {
          setCapturing(true);
          timer.current = setInterval(() => {
            addMessages();
          }, INTERVAL);
        })
        .catch((error) => {
          console.error(error.stack || error);
        });
    }
  };
  // 切换排序方式
  const toggleReverseOrder = () => {
    setReverseOrder(!reverseOrder);
  };

  const toggleFilters = () => {
    setFilters((filters) => ({
      ...filters,
      enabled: !filters.enabled,
    }));
  };

  const clearFilters = () => {
    setFilters({
      channel: '',
      method: '',
      send: '',
      receive: '',
      enabled: filters.enabled ? true : false,
    });
  };

  const rjvStyles = {
    height: 'calc(100vh - 60px)',
    overflow: 'auto',
    fontSize: '12px',
  };

  return (
    <div>
      <div className='statbar'>
        <div className='toolbar electron'>
          <button className={`ipc-toolbar-button ${capturing ? 'active' : ''}`} onClick={toggleCapturing}>
            <span className='toolbar-icon ipc-icon-record'></span>
            <span className='toolbar-text'>开始</span>
          </button>
          <button className='ipc-toolbar-button' onClick={clearMessages}>
            <span className='toolbar-icon ipc-icon-clear'></span>
            <span className='toolbar-text'>清除</span>
          </button>
          <button className={`ipc-toolbar-button ${reverseOrder ? 'active' : ''}`} onClick={toggleReverseOrder}>
            <span className='toolbar-icon ipc-icon-top'></span>
            <span className='toolbar-text'>倒序</span>
          </button>
          <button className={`ipc-toolbar-button ${filters.enabled ? 'active' : ''}`} onClick={toggleFilters}>
            <span className='toolbar-icon ipc-icon-filter'></span>
            <span className='toolbar-text'>过滤</span>
          </button>
          <button className='ipc-toolbar-button' onClick={clearFilters}>
            <span className='toolbar-icon ipc-icon-reset'></span>
            <span className='toolbar-text'>重置过滤</span>
          </button>
        </div>
      </div>
      <ResizableTable>
        <FilterContext.Provider value={filters}>
          <DataGrid
            className={`rdg-light ${filters.enabled ? 'filter-container' : undefined}`}
            style={{ height: 'calc(100vh - 30px)' }}
            ref={gridRef}
            columns={columns}
            rows={filteredRows}
            // 给选中的行添加类名
            rowClass={(row) => (selectedRow?.id === row.id ? 'rdg-row selected' : 'rdg-row')}
            rowKeyGetter={(row) => row.id}
            headerRowHeight={filters.enabled ? 52 : 25}
            rowHeight={20}
            onRowClick={(row) => {
              setSelectedRow(row);
            }}
          />
        </FilterContext.Provider>
        <div>
          <Tabs forceRenderTabPanel={true}>
            <TabList>
              <Tab>入参</Tab>
              <Tab>出参</Tab>
            </TabList>

            <TabPanel>
              {selectedRow ? (
                <JsonView
                  style={rjvStyles}
                  src={getParsedMessage(selectedRow, 'send')}
                  name={false}
                  collapsed={false}
                  displayDataTypes={false}
                  enableClipboard={false}
                />
              ) : (
                <NoMessageSelected />
              )}
            </TabPanel>
            <TabPanel>
              {selectedRow ? (
                <JsonView
                  style={rjvStyles}
                  src={getParsedMessage(selectedRow, 'receive')}
                  name={false}
                  collapsed={false}
                  displayDataTypes={false}
                  enableClipboard={false}
                />
              ) : (
                <NoMessageSelected />
              )}
            </TabPanel>
          </Tabs>
        </div>
      </ResizableTable>
    </div>
  );
};

export default Ipc;
