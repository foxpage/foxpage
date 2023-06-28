import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { Layout } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as COMPONENT_ACTIONS from '@/actions/builder/components';
import * as ACTIONS from '@/actions/builder/header';
import { History } from '@/pages/components/history';
import { getLocationIfo } from '@/utils/location-info';

import { DeviceToolbar } from './components/device';
import { Actions, Catalog, GoBack, Record, Steps, Store } from './components';

import './index.css';

const { Header } = Layout;

export const StyledIcon = styled.div`
  min-width: 44px;
  font-size: 14px;
  text-align: center;
  position: relative;
  padding: 2px 4px;
  display: flex;
  flex-direction: column;
  height: 100%;
  color: rgb(91, 107, 115);
  border-top: 2px solid transparent;
  background-color: transparent;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  user-select: none;
  > span {
    height: 14px;
  }
  &:hover {
    color: rgb(65, 80, 88);
    background-color: rgb(242, 242, 242);
  }
  &.disabled {
    cursor: not-allowed;
    color: rgb(195, 193, 193);
    background-color: inherit;
  }
  &.selected {
    background-color: rgb(242, 242, 242);
  }
`;

export const IconMsg = styled.p`
  font-size: 12px;
  font-weight: 500;
  margin: 0;
  line-height: 22px;
  user-select: none;
`;

const Part = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .ant-popover-inner-content {
    padding: 0;
  }
`;

const mapStateToProps = (store: RootState) => ({
  editStatus: store.builder.main.editStatus && !!store.record.main.localRecords.length,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchCatalog: ACTIONS.fetchCatalog,
  selectContent: ACTIONS.selectContent,
  clearComponentList: COMPONENT_ACTIONS.pushComponentList,
};

type HeaderType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

let _editStatus = false;

const Main: React.FC<HeaderType> = (props) => {
  const { editStatus, clearAll, fetchCatalog, selectContent, clearComponentList } = props;
  const { applicationId, folderId, fileId, contentId } = getLocationIfo(useLocation());
  _editStatus = editStatus;

  useEffect(() => {
    return () => {
      clearAll();
      clearComponentList([]);
    };
  }, []);

  useEffect(() => {
    selectContent({
      applicationId,
      folderId,
      fileId,
      contentId,
    });
  }, []);

  // fetch catalog
  useEffect(() => {
    if (applicationId && folderId) {
      fetchCatalog({ applicationId, folderId });
    }
  }, [applicationId, folderId]);

  const beforeLeave = (e) => {
    if (_editStatus) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  // save hint before leave
  useEffect(() => {
    window.addEventListener('beforeunload', beforeLeave);

    return () => {
      window.removeEventListener('beforeunload', beforeLeave);
    };
  }, []);

  return (
    <React.Fragment>
      <Header className="foxpage-builder-header">
        <Part style={{ flex: 1, justifyContent: 'flex-start' }}>
          <GoBack />
          <Catalog />
        </Part>
        <Part style={{ flex: 1, justifyContent: 'flex-start' }}>
          <History />
          <Store />
        </Part>
        <Part style={{ flex: 1, justifyContent: 'flex-center' }}>
          <DeviceToolbar />
        </Part>
        <Part style={{ flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ marginRight: 8, display: 'flex' }}>
            <Steps />
          </div>
          <Record />
        </Part>
        <Part style={{ flex: 1, justifyContent: 'flex-end', paddingRight: 12 }}>
          <Actions />
        </Part>
      </Header>
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
