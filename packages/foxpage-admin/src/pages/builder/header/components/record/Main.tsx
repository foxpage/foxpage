import React, { useContext, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';

import { NotificationOutlined } from '@ant-design/icons';
import { Badge, Empty, Pagination, Popover } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { RecordLog } from '@foxpage/foxpage-client-types';

import { RecordActionType } from '@/constants/record';
import { IconMsg, StyledIcon } from '@/pages/builder/header/Main';
import { GlobalContext } from '@/pages/system';
import * as ACTIONS from '@/store/actions/record';
import { getCachedLogs } from '@/store/sagas/builder/services';
import { getGlobalLocale } from '@/utils/index';

import { TimelineElem } from '../common';

import '../../index.css';

const Counter = styled.span`
  margin-left: 4px;
  font-weight: 500;
  font-size: 12px;
`;

const LogContainer = styled.div<{
  width?: string;
}>`
  width: ${props => props.width || '400px'};
  padding: 0 0 16px 0;
  .ant-timeline {
    padding-left: 8px;
  }
  .ant-timeline-item {
    padding-bottom: 0px;
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
  margin: 10px auto;
`;

const RemoteLine = styled.div`
  padding: 8px;
  font-size: 12px;
  background-color: #f2f2f2;
  color: #f90;
`;

const TextWithDashed: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div style={{ display: 'flex', marginTop: '10px' }}>
      <span style={{ flex: 1, borderTop: 'solid 1px #e5e5e5', transform: 'translateY(56%)' }} />
      <span style={{ color: '#fa6163', fontSize: 12 }}>{content}</span>
      <span style={{ flex: 1, borderTop: 'solid 1px #e5e5e5', transform: 'translateY(56%)' }} />
    </div>
  );
};

const mapStateToProps = (store: RootState) => ({
  applicationId: store.builder.header.applicationId,
  contentId: store.builder.header.contentId,
  list: store.record.main.records,
  localList: store.record.main.localRecords,
  nodeUpdateRecords: store.record.main.nodeUpdateRecords,
  nodeUpdateIndex: store.record.main.nodeUpdateIndex,
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
    nodeUpdateRecords,
    nodeUpdateIndex,
  } = props;
  const { locale } = useContext(GlobalContext);
  const { record } = locale.business;
  const total = localList.length + (pageInfo.total || 0);
  const nodeUpdateStack = nodeUpdateRecords.slice(0, nodeUpdateIndex + 1);

  const localListWithRecoverFlag = useMemo(() => {
    try {
      const latestNodeMap: Record<string, RecordLog> = {};
      nodeUpdateStack.forEach((item) => {
        const nodeId = item.content?.[0]?.id;
        if (nodeId) {
          latestNodeMap[nodeId] = item;
        }
      });
      return localList.map((item) => {
        const nodeId = item.content?.[0]?.id;
        if (nodeId) {
          return {
            ...item,
            reversible:
              item.action === RecordActionType.STRUCTURE_REMOVE &&
              item.id === latestNodeMap[nodeId]?.id
          };
        }
        return item;
      });
    } catch {
      return localList;
    }
  }, [localList, nodeUpdateStack]);

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
        <LogContainer width={getGlobalLocale() === 'en' ? '430px' : '380px'}>
          <RemoteLine>
            {record.changeLogs}
          </RemoteLine>
          {localList.length > 0 && TimelineElem(localListWithRecoverFlag, true)}
          {(localList.length > 0 && list.length > 0) && <TextWithDashed content={record.localTips}/>}
          {list.length > 0 && TimelineElem(list)}
          {
            <LoadMore>
              <Pagination
                simple
                pageSize={PAGE_SIZE}
                size="small"
                hideOnSinglePage={true}
                current={pageNum}
                total={pageInfo.total || 0}
                onChange={updatePageNum}
              />
            </LoadMore>
          }
          {(localList.length === 0 && list.length === 0) && <Empty />}
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
