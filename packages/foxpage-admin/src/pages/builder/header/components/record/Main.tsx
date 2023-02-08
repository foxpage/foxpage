import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';

import { InfoCircleOutlined, NotificationOutlined } from '@ant-design/icons';
import { Badge, Pagination, Popover } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { IconMsg, StyledIcon } from '@/pages/builder/header/Main';
import { GlobalContext } from '@/pages/system';
import * as ACTIONS from '@/store/actions/record';
import { getCachedLogs } from '@/store/sagas/builder/services';

import { NoData, TimelineElem } from '../common';

import '../../index.css';

const Counter = styled.span`
  margin-left: 4px;
  font-weight: 500;
  font-size: 12px;
`;

const LogContainer = styled.div`
  width: 400px;
  padding: 0 0 16px 0;
  .ant-timeline {
    padding-left: 8px;
  }
  .ant-timeline-item {
    padding-bottom: 4px;
  }
  .ant-timeline-item-tail {
    top: 24px;
  }
  .ant-timeline-item-head {
    top: 14px;
  }
  .ant-timeline-item-content {
    top: 0;
    margin: 0 0 0 14px;
  }
`;

const LoadMore = styled.div`
  text-align: center;
  width: 250px;
  margin: 0 auto;
`;

const RemoteLine = styled.div`
  padding: 8px;
  font-size: 12px;
  background-color: #f2f2f2;
  color: #f90;
`;

const mapStateToProps = (store: RootState) => ({
  applicationId: store.builder.header.applicationId,
  contentId: store.builder.header.contentId,
  list: store.record.main.records,
  localList: store.record.main.localRecords,
  pageInfo: store.record.main.pageInfo,
  pageNum: store.record.main.pageNum,
});

const mapDispatchToProps = {
  clear: ACTIONS.clearAll,
  fetchUserRecords: ACTIONS.fetchUserRecords,
  updatePageNum: ACTIONS.updatePageNum,
  pushLocalRecords: ACTIONS.pushLocalRecords,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

let recordScheduler: any = null;
const PAGE_SIZE = 10;

const Record: React.FC<IProps> = (props) => {
  const {
    list,
    localList,
    applicationId,
    contentId,
    fetchUserRecords,
    clear,
    pageInfo,
    pageNum,
    updatePageNum,
    pushLocalRecords,
  } = props;
  const { locale } = useContext(GlobalContext);
  const { record } = locale.business;
  const total = localList.length + (pageInfo.total || 0);

  useEffect(() => {
    return () => {
      clear();
      if (recordScheduler) {
        clearInterval(recordScheduler);
        recordScheduler = null;
      }
    };
  }, []);

  useEffect(() => {
    if (contentId) {
      const cached = getCachedLogs(contentId);
      pushLocalRecords(cached || []);
    }
  }, [contentId]);

  useEffect(() => {
    if (applicationId && contentId) {
      fetchUserRecords({ applicationId, contentId, page: pageNum, size: PAGE_SIZE });
      if (recordScheduler) {
        clearInterval(recordScheduler);
      }
      recordScheduler = setInterval(() => {
        fetchUserRecords({ applicationId, contentId, page: pageNum, size: PAGE_SIZE });
      }, 1 * 60 * 1000);
    }
  }, [applicationId, contentId, pageNum]);

  return (
    <Popover
      placement="bottom"
      overlayClassName="foxpage-builder-header_popover foxpage-builder-header_record_popover"
      trigger={['hover']}
      content={
        <LogContainer>
          <RemoteLine>
            <InfoCircleOutlined /> {record.localTips}
          </RemoteLine>
          {localList.length > 0 ? TimelineElem(localList, true) : <NoData>{record.noData}</NoData>}
          <RemoteLine>
            <InfoCircleOutlined /> {record.remote}
          </RemoteLine>
          {list.length > 0 ? TimelineElem(list) : <NoData>{record.noData}</NoData>}
          {
            <LoadMore>
              <Pagination
                simple
                pageSize={PAGE_SIZE}
                hideOnSinglePage={true}
                current={pageNum}
                total={pageInfo.total || 0}
                onChange={updatePageNum}
              />
            </LoadMore>
          }
        </LogContainer>
      }>
      <StyledIcon>
        <div style={{ display: 'flex', lineHeight: '12px' }}>
          <Badge dot showZero={false} count={total}>
            <NotificationOutlined style={{ fontSize: '12px' }} />
          </Badge>
          <Counter>({total || 0})</Counter>
        </div>
        <IconMsg>{record.title}</IconMsg>
      </StyledIcon>
    </Popover>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Record);
