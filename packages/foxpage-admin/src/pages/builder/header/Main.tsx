import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { Layout } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/header';
import { getLocationIfo } from '@/utils/location-info';

import { Actions, Catalog, GoBack, Steps, Store } from './components';

import './index.css';

const { Header } = Layout;

const StyledHeader = styled(Header)`
  background: rgb(255, 255, 255) !important;
  border-bottom: 1px solid rgb(242, 242, 242);
  display: flex;
  -webkit-box-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  align-items: center;
  z-index: 100;
  line-height: 48px;
  height: 48px;
  padding: 0;
`;

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
  editStatus: store.builder.main.editStatus,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchCatalog: ACTIONS.fetchCatalog,
  selectContent: ACTIONS.selectContent,
};

type HeaderType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

let _editStatus = false;

const Main: React.FC<HeaderType> = (props) => {
  const { editStatus, clearAll, fetchCatalog, selectContent } = props;
  const { applicationId, folderId, fileId, contentId } = getLocationIfo(useLocation());
  _editStatus = editStatus;

  useEffect(() => {
    return () => {
      clearAll();
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

  // save hint before leave
  useEffect(() => {
    window.addEventListener('beforeunload', (e) => {
      if (_editStatus) {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    return () => {
      window.removeEventListener('beforeunload', (e) => {
        if (_editStatus) {
          e.preventDefault();
          e.returnValue = '';
        }
      });
    };
  }, []);

  return (
    <React.Fragment>
      <StyledHeader>
        <Part>
          <GoBack />
          <Catalog />
        </Part>
        <Part style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Store />
        </Part>
        <Part style={{ flex: 3, justifyContent: 'flex-end' }}>
          <Steps />
        </Part>
        <Part style={{ flex: '2.5', justifyContent: 'flex-end', paddingRight: 12 }}>
          <Actions />
        </Part>
      </StyledHeader>
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
