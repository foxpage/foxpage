import React, { useContext, useMemo } from 'react';
import { connect } from 'react-redux';

import { Button, Drawer as AntdDrawer, Empty } from 'antd';
import groupBy from 'lodash/groupBy';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { GlobalContext } from '@/pages/system';
import * as ACTIONS from '@/store/actions/history';

import { TimeLineWithVersion } from '../../builder/header/components/common';

const LoadPrevious = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const StyledHistory = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const StyledHistories = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 8px;
  .ant-timeline-item {
    padding-bottom: 8px;
  }
  .ant-timeline-item-head-custom {
    padding: 0;
    height: 14px;
    line-height: unset;
  }
`;

const mapStateToProps = (store: RootState) => ({
  historiesRecords: store.history.main.historyRecords,
  historyLoading: store.history.main.loading,
  versionsList: store.history.main.versionsList,
});

const mapDispatchToProps = {
  fetchHistoriesByVersion: ACTIONS.fetchHistoriesByVersion,
};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    visible: boolean;
    applicationId: string;
    contentId: string;
    inPreview: boolean;
    versionListIndex: number;
    onClose: () => void;
    onNextVersion: (v: number) => void;
  };

const Drawer = ({
  applicationId,
  contentId,
  historiesRecords,
  historyLoading,
  inPreview,
  versionsList,
  visible,
  versionListIndex,
  fetchHistoriesByVersion,
  onClose,
  onNextVersion,
}: IProps) => {
  const { locale } = useContext(GlobalContext);
  const { historyRecord } = locale.business;

  const versionMap = useMemo(() => {
    return groupBy(versionsList, 'version');
  }, [versionsList]);

  return (
    <AntdDrawer open={visible} onClose={handleClose} title={historyRecord.title} width={400}>
      <StyledHistory>
        <StyledHistories>
          {historiesRecords.length > 0 ? (
            TimeLineWithVersion(historiesRecords, versionMap, historyLoading)
          ) : (
            <Empty />
          )}
        </StyledHistories>
        {!inPreview && historiesRecords.length + 1 < versionsList.length && (
          <LoadPrevious>
            <Button block loading={historyLoading} onClick={handleNextVersion}>
              {historyRecord.loadPrevious}
            </Button>
          </LoadPrevious>
        )}
      </StyledHistory>
    </AntdDrawer>
  );

  function handleNextVersion(e: React.MouseEvent) {
    e.preventDefault();
    if (applicationId && contentId) {
      const newVersion = versionsList[versionListIndex + 1];
      fetchHistoriesByVersion({ applicationId, contentId, versionId: newVersion.id }, newVersion);
      onNextVersion(versionListIndex + 1);
    }
  }

  function handleClose(e: React.MouseEvent | React.KeyboardEvent) {
    e.preventDefault();
    onNextVersion(1);
    onClose();
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Drawer);
